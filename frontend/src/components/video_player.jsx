import { useState, useEffect, useRef, useCallback } from "react";

const CDN =
    "https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css";

const STATES = { IDLE: "idle", PLAYING: "playing", PAUSED: "paused", ENDED: "ended" };

const ATTENTIVE_DURATIONS = [
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
];

function extractVideoId(input) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = input.match(p);
        if (m?.[1]) return m[1];
    }
    return null;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoPlayer() {
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState("");
    const [error, setError] = useState("");
    const [playerState, setPlayerState] = useState(STATES.IDLE);
    const [apiReady, setApiReady] = useState(false);

    // Mode selection popup
    const [showModePopup, setShowModePopup] = useState(false);
    const [pendingVideoId, setPendingVideoId] = useState("");

    // Super Attentive Mode states
    const [attentiveMode, setAttentiveMode] = useState(false);
    const [attentiveDuration, setAttentiveDuration] = useState(5);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showAttentiveOverlay, setShowAttentiveOverlay] = useState(false);
    const [attentivePassword, setAttentivePassword] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [showExitHint, setShowExitHint] = useState(false);

    // Player refs - single player instance that gets moved between containers
    const playerRef = useRef(null);
    const normalContainerRef = useRef(null);
    const attentiveContainerRef = useRef(null);
    const timerRef = useRef(null);
    const escPressedRef = useRef(false);
    const wasFullscreenRef = useRef(false);
    const playerCreatedRef = useRef(false);
    const currentVideoIdRef = useRef("");

    /* ── Load YouTube IFrame API ── */
    useEffect(() => {
        if (window.YT?.Player) {
            setApiReady(true);
            return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => {
            setApiReady(true);
        };
        return () => { window.onYouTubeIframeAPIReady = null; };
    }, []);

    const handleStateChange = useCallback((e) => {
        const S = window.YT.PlayerState;
        if (e.data === S.PLAYING || e.data === S.BUFFERING) {
            setPlayerState(STATES.PLAYING);
        }
        else if (e.data === S.PAUSED) setPlayerState(STATES.PAUSED);
        else if (e.data === S.ENDED) setPlayerState(STATES.ENDED);
    }, []);

    /* ── Create Player in specific container ── */
    const createPlayer = useCallback((containerRef, videoIdToLoad) => {
        if (!apiReady || !containerRef.current || playerCreatedRef.current) {
            // If player already exists, just load new video
            if (playerRef.current && playerRef.current.loadVideoById && videoIdToLoad) {
                playerRef.current.loadVideoById(videoIdToLoad);
                return;
            }
            return;
        }

        const div = document.createElement("div");
        div.id = "yt-player-instance";
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(div);

        try {
            playerRef.current = new window.YT.Player(div.id, {
                videoId: videoIdToLoad || "",
                width: "100%",
                height: "100%",
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    autohide: 1,
                    fs: 1,
                    disablekb: 0,
                    enablejsapi: 1,
                    autoplay: 1
                },
                events: {
                    onReady: (e) => {
                        playerCreatedRef.current = true;
                        if (videoIdToLoad) {
                            e.target.playVideo();
                        }
                    },
                    onError: (e) => {
                        const errorMessages = {
                            2: "Invalid parameter",
                            5: "HTML5 player error",
                            100: "Video not found",
                            101: "Video not allowed to be played embedded",
                            150: "Same as 101"
                        };
                        setError(errorMessages[e.data] || "Failed to load video");
                    },
                    onStateChange: handleStateChange,
                },
            });
        } catch (err) {
            setError("Failed to initialize video player");
        }
    }, [apiReady, handleStateChange]);

    /* ── Destroy player ── */
    const destroyPlayer = () => {
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) { }
            playerRef.current = null;
            playerCreatedRef.current = false;
        }
        if (normalContainerRef.current) {
            normalContainerRef.current.innerHTML = "";
        }
        if (attentiveContainerRef.current) {
            attentiveContainerRef.current.innerHTML = "";
        }
    };

    /* ── Move player between containers ── */
    const movePlayerToContainer = (targetContainerRef) => {
        if (!playerRef.current || !playerCreatedRef.current) return;

        const iframe = playerRef.current.getIframe();
        if (iframe && targetContainerRef.current) {
            targetContainerRef.current.innerHTML = "";
            targetContainerRef.current.appendChild(iframe);
        }
    };

    /* ── Timer countdown for attentive mode ── */
    useEffect(() => {
        if (showAttentiveOverlay && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        exitAttentiveMode();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showAttentiveOverlay, timeRemaining]);

    // Track fullscreen changes
    // Track fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);

            if (wasFullscreenRef.current && !isFullscreen && showAttentiveOverlay && !showPasswordPopup) {
                // User exited fullscreen (ESC or button) - show password popup AND re-enter fullscreen
                setTimeout(() => {
                    requestFullscreen(); // <-- ADD THIS LINE
                    setShowPasswordPopup(true);
                    setPasswordInput("");
                    setPasswordError("");
                }, 50);
            }

            wasFullscreenRef.current = isFullscreen;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, [showAttentiveOverlay, showPasswordPopup]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showAttentiveOverlay && !escPressedRef.current) {
                e.preventDefault();
                e.stopPropagation();

                if (!showPasswordPopup) {
                    escPressedRef.current = true;
                    setShowPasswordPopup(true);
                    setPasswordInput("");
                    setPasswordError("");

                    setTimeout(() => {
                        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
                        if (!isFullscreen) {
                            requestFullscreen();
                        }
                        escPressedRef.current = false;
                    }, 100);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [showAttentiveOverlay, showPasswordPopup]);

    const requestFullscreen = () => {
        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) return elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
            else if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    const exitFullscreen = () => {
        try {
            if (document.exitFullscreen) return document.exitFullscreen();
            else if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
            else if (document.msExitFullscreen) return document.msExitFullscreen();
            else if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        } catch (err) {
            console.error("Exit fullscreen error:", err);
        }
    };

    const startNormalMode = () => {
        const id = pendingVideoId;
        currentVideoIdRef.current = id;
        setAttentiveMode(false);
        setVideoId(id);
        setShowModePopup(false);
        setPendingVideoId("");
        setPlayerState(STATES.IDLE);

        // Destroy any existing player and create new one in normal container
        destroyPlayer();
        setTimeout(() => {
            createPlayer(normalContainerRef, id);
        }, 100);
    };

    const startAttentiveMode = () => {
        if (!tempPassword || tempPassword.length < 4) {
            setPasswordError("Password must be at least 4 characters");
            return;
        }

        const id = pendingVideoId;
        currentVideoIdRef.current = id;
        setAttentiveMode(true);
        setAttentivePassword(tempPassword);
        setVideoId(id);
        setShowModePopup(false);
        setPendingVideoId("");
        setTempPassword("");
        setPasswordError("");

        setShowAttentiveOverlay(true);
        setTimeRemaining(attentiveDuration * 60);

        // Destroy any existing player and create new one in attentive container
        destroyPlayer();
        setTimeout(() => {
            createPlayer(attentiveContainerRef, id);
            setTimeout(() => {
                requestFullscreen();
                wasFullscreenRef.current = true;
            }, 500);
        }, 100);
    };

    const exitAttentiveMode = () => {
        setShowAttentiveOverlay(false);
        setTimeRemaining(0);
        setShowPasswordPopup(false);
        setPasswordInput("");
        setPasswordError("");
        setAttentivePassword("");
        setAttentiveMode(false);
        wasFullscreenRef.current = false;

        exitFullscreen();

        // Destroy attentive player and recreate in normal container
        const currentId = currentVideoIdRef.current;
        destroyPlayer();

        setTimeout(() => {
            if (currentId) {
                createPlayer(normalContainerRef, currentId);
            }
        }, 300);

        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handlePasswordSubmit = () => {
        if (passwordInput === attentivePassword) {
            exitAttentiveMode();
        } else {
            setPasswordError("Incorrect password!");
            setPasswordInput("");
        }
    };

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePasswordSubmit();
        }
    };

    const handleSubmit = useCallback(() => {
        setError("");
        if (!url.trim()) { setError("Please enter a YouTube URL"); return; }
        const id = extractVideoId(url.trim());
        if (id) {
            setPendingVideoId(id);
            setShowModePopup(true);
            setTempPassword("");
            setPasswordError("");
        } else {
            setError("Invalid YouTube URL. Please try again.");
            setVideoId("");
        }
    }, [url]);

    const handleClear = () => {
        setUrl("");
        setVideoId("");
        setError("");
        setPlayerState(STATES.IDLE);
        setAttentiveMode(false);
        setShowModePopup(false);
        setPendingVideoId("");
        currentVideoIdRef.current = "";

        destroyPlayer();
        exitAttentiveMode();
    };

    const isActive = playerState === STATES.PLAYING || playerState === STATES.PAUSED;
    const isEnded = playerState === STATES.ENDED;
    const showSuggestions = !isActive && !isEnded && !showModePopup && !showAttentiveOverlay && !videoId;

    return (
        <>
            <link rel="stylesheet" href={CDN} />
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap"
                rel="stylesheet"
            />
            <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        .grain::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
        }

        .pill-input { outline: none; }
        .pill-input::placeholder { color: rgba(255,255,255,0.25); }

        .play-btn {
          background: #ff2d2d;
          transition: background 0.2s, transform 0.15s;
        }
        .play-btn:hover { background: #d00; transform: translateY(-2px); }
        .play-btn:active { transform: translateY(0); }

        .card-glow {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.5);
        }

        .tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.05em;
        }
        .tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff2d2d; }

        .sug-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 18px;
          transition: background 0.2s, border-color 0.2s;
        }
        .sug-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.15);
        }

        .fade-in { animation: fadeIn 0.4s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

        .player-wrapper {
          position: relative; width: 100%; padding-bottom: 56.25%;
          background: #000; border-radius: 16px; overflow: hidden;
        }
        .player-wrapper iframe {
          position: absolute; inset: 0; width: 100% !important; height: 100% !important; border: none;
        }

        .ended-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(0,0,0,0.82);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 16px;
        }
        .replay-btn {
          background: #ff2d2d; color: #fff;
          border: none; cursor: pointer;
          border-radius: 100px; padding: 13px 30px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          transition: background 0.2s, transform 0.15s;
        }
        .replay-btn:hover { background:#d00; transform:scale(1.04); }

        /* Popup Styles */
        .popup-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .popup-card {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 25px 80px rgba(0,0,0,0.6);
        }

        .mode-btn {
          width: 100%; padding: 16px 20px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #fff; cursor: pointer;
          transition: all 0.2s; margin-bottom: 12px;
          display: flex; align-items: center; gap: 12px;
        }
        .mode-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }
        .mode-btn.attentive {
          border-color: rgba(255,45,45,0.4);
          background: rgba(255,45,45,0.08);
        }
        .mode-btn.attentive:hover {
          background: rgba(255,45,45,0.15);
          border-color: rgba(255,45,45,0.6);
        }

        .duration-select {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px; padding: 12px 14px;
          color: #fff; font-size: 0.9rem;
          cursor: pointer; outline: none; margin: 12px 0;
        }
        .duration-select option {
          background: #1a1a2e; color: #fff;
        }

        .password-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px; padding: 12px 14px;
          color: #fff; font-size: 0.9rem;
          outline: none; margin: 8px 0;
        }
        .password-input:focus {
          border-color: rgba(255,45,45,0.5);
        }

        .popup-btn {
          width: 100%; padding: 14px;
          border-radius: 10px; border: none;
          background: #ff2d2d; color: #fff;
          font-weight: 600; cursor: pointer;
          transition: all 0.2s; margin-top: 12px;
        }
        .popup-btn:hover { background: #d00; transform: translateY(-1px); }
        .popup-btn:disabled {
          opacity: 0.5; cursor: not-allowed; transform: none;
        }

        .popup-btn.secondary {
          background: rgba(255,255,255,0.1);
        }
        .popup-btn.secondary:hover { background: rgba(255,255,255,0.15); }

        /* Attentive Overlay - Full Screen */
        .attentive-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: #000;
          display: flex; flex-direction: column;
          width: 100vw;
          height: 100vh;
        }

        .attentive-content {
          flex: 1; 
          position: relative;
          display: flex;
          overflow: hidden;
        }

        .attentive-player-container {
          flex: 1; 
          position: relative;
          background: #000; 
          overflow: hidden;
        }

        .attentive-player-container iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }

        /* FLOATING TIMER */
        .floating-timer {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          background: rgba(255,45,45,0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(255,45,45,0.3);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .floating-timer:hover {
          background: rgba(255,45,45,1);
          transform: scale(1.05);
        }

        .timer-display {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .timer-label {
          color: rgba(255,255,255,0.8);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .exit-hint {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 10000;
          background: rgba(0,0,0,0.8);
          color: rgba(255,255,255,0.7);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          animation: fadeIn 0.3s ease;
        }

        .password-popup-overlay {
          position: fixed; inset: 0; z-index: 10001;
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .error-text {
          color: #ff7070; font-size: 0.85rem; margin-top: 4px;
        }

        .hint-text {
          color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 8px;
        }

        @media (max-width: 520px) {
          .input-row { flex-direction: column !important; }
          .play-btn-wrap { width: 100%; }
          .play-btn-wrap button { width: 100% !important; justify-content: center; }
          .floating-timer {
            top: 10px;
            right: 10px;
            padding: 10px 16px;
          }
          .timer-display { font-size: 1.3rem; }
        }
      `}</style>

            <div
                className="grain font-body min-h-screen relative"
                style={{ background: "linear-gradient(140deg,#0d0d0d 0%,#1a0808 45%,#0a0a1a 100%)" }}
            >
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

                    {/* ── Header ── */}
                    <header className="mb-10 fade-in">
                        <div className="tag mb-5">
                            <span className="tag-dot"></span> Distraction-free viewing
                        </div>
                        <h1
                            className="font-display text-white mb-2"
                            style={{ fontSize: "clamp(2.2rem,6vw,3.8rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
                        >
                            Clean<span style={{ color: "#ff2d2d" }}>Player</span>
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "1rem", marginTop: 8 }}>
                            Paste any YouTube link — watch without the noise.
                        </p>
                    </header>

                    {/* ── Input row ── */}
                    <div className="input-row flex gap-3 mb-3 fade-in" style={{ animationDelay: "0.08s" }}>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                placeholder="https://youtube.com/watch?v= ..."
                                className="pill-input w-full font-body"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 12, padding: "15px 44px 15px 18px",
                                    color: "#fff", fontSize: "0.95rem",
                                    width: "100%",
                                }}
                            />
                            {url && (
                                <button
                                    onClick={handleClear}
                                    style={{
                                        position: "absolute", right: 10, top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "rgba(255,255,255,0.35)", fontSize: 22, lineHeight: 1, padding: "0 4px",
                                    }}
                                >×</button>
                            )}
                        </div>
                        <div className="play-btn-wrap flex-shrink-0">
                            <button
                                onClick={handleSubmit}
                                className="play-btn font-body font-medium text-white flex items-center gap-2"
                                style={{ padding: "15px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: "0.95rem", whiteSpace: "nowrap" }}
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                                    <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                                </svg>
                                Play
                            </button>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div
                            className="fade-in mb-5"
                            style={{
                                background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.22)",
                                color: "#ff7070", borderRadius: 10, padding: "12px 16px", fontSize: "0.88rem",
                            }}
                        >
                            ⚠ {error}
                        </div>
                    )}

                    {/* ── Normal Player Container ── */}
                    {videoId && !showAttentiveOverlay && (
                        <div className="fade-in mb-10" style={{ position: "relative" }}>
                            <div className="player-wrapper card-glow">
                                <div ref={normalContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                                {isEnded && (
                                    <div className="ended-overlay fade-in">
                                        <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" style={{ width: 52 }}>
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                        </svg>
                                        <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: "0.9rem" }}>
                                            Video ended
                                        </p>
                                        <button
                                            className="replay-btn"
                                            onClick={() => {
                                                if (playerRef.current && playerRef.current.seekTo) {
                                                    playerRef.current.seekTo(0);
                                                    playerRef.current.playVideo();
                                                }
                                                setPlayerState(STATES.PLAYING);
                                            }}
                                        >↺ Replay</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Mode Selection Popup ── */}
                    {showModePopup && (
                        <div className="popup-overlay fade-in">
                            <div className="popup-card">
                                <h2 className="font-display text-white mb-2" style={{ fontSize: "1.5rem" }}>
                                    Choose Watch Mode
                                </h2>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: "24px" }}>
                                    How would you like to watch this video?
                                </p>

                                <button className="mode-btn" onClick={startNormalMode}>
                                    <span style={{ fontSize: "1.4rem" }}>📺</span>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>Normal Mode</div>
                                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                                            Standard viewing with full controls
                                        </div>
                                    </div>
                                </button>

                                <div style={{ margin: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}></div>

                                <button className="mode-btn attentive" onClick={() => { }} style={{ marginBottom: 0 }}>
                                    <span style={{ fontSize: "1.4rem" }}>🔒</span>
                                    <div style={{ textAlign: "left", flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>Super Attentive Mode</div>
                                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                                            Fullscreen lock, password protected exit
                                        </div>
                                    </div>
                                </button>

                                <select
                                    className="duration-select"
                                    value={attentiveDuration}
                                    onChange={(e) => setAttentiveDuration(Number(e.target.value))}
                                >
                                    {ATTENTIVE_DURATIONS.map(d => (
                                        <option key={d.value} value={d.value}>{d.label} focus time</option>
                                    ))}
                                </select>

                                <input
                                    type="password"
                                    className="password-input"
                                    placeholder="Set exit password (min 4 chars)"
                                    value={tempPassword}
                                    onChange={(e) => {
                                        setTempPassword(e.target.value);
                                        setPasswordError("");
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && startAttentiveMode()}
                                />
                                {passwordError && <div className="error-text">{passwordError}</div>}

                                <button
                                    className="popup-btn"
                                    onClick={startAttentiveMode}
                                    disabled={!tempPassword || tempPassword.length < 4}
                                >
                                    🔒 Start Locked Mode
                                </button>

                                <div className="hint-text">
                                    💡 Tip: Press ESC or click timer to exit (password required)
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Super Attentive Mode Overlay ── */}
                    {showAttentiveOverlay && (
                        <div className="attentive-overlay">
                            {/* Video takes full screen */}
                            <div className="attentive-content">
                                <div className="attentive-player-container" ref={attentiveContainerRef}>
                                    {/* Attentive player is created here */}
                                </div>
                            </div>

                            {/* FLOATING TIMER - Click to exit */}
                           

                            {/* Exit hint on hover */}
                            {showExitHint && (
                                <div className="exit-hint">
                                    Press ESC or click timer to exit
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Password Entry Popup ── */}
                    {showPasswordPopup && (
                        <div className="password-popup-overlay fade-in">
                            <div className="popup-card" style={{ maxWidth: "360px" }}>
                                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🔐</div>
                                    <h2 className="font-display text-white" style={{ fontSize: "1.3rem" }}>
                                        Enter Exit Password
                                    </h2>
                                </div>

                                <input
                                    type="password"
                                    className="password-input"
                                    placeholder="Enter password to exit"
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value);
                                        setPasswordError("");
                                    }}
                                    onKeyDown={handlePasswordKeyDown}
                                    autoFocus
                                />
                                {passwordError && <div className="error-text" style={{ textAlign: "center" }}>{passwordError}</div>}

                                <button className="popup-btn" onClick={handlePasswordSubmit}>
                                    Unlock
                                </button>
                                <button
                                    className="popup-btn secondary"
                                    onClick={() => {
                                        setShowPasswordPopup(false);
                                        setPasswordInput("");
                                        setPasswordError("");
                                        // Re-enter fullscreen if we're still in attentive mode
                                        if (showAttentiveOverlay) {
                                            requestFullscreen();
                                        }
                                    }}
                                >
                                    Cancel
                                </button>

                                <div className="hint-text" style={{ textAlign: "center" }}>
                                    Time remaining: {formatTime(timeRemaining)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Idle placeholder ── */}
                    {showSuggestions && (
                        <div
                            className="fade-in mb-10 flex flex-col items-center justify-center"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px dashed rgba(255,255,255,0.09)",
                                borderRadius: 20, padding: "56px 20px", textAlign: "center",
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,45,45,0.45)" strokeWidth="1.4"
                                style={{ width: 60, marginBottom: 14 }}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                            </svg>
                            <p style={{ color: "rgba(255,255,255,0.3)", margin: 0, fontSize: "0.9rem" }}>
                                Paste a YouTube link above to begin
                            </p>
                        </div>
                    )}

                    {/* ── Suggestions ── */}
                    {showSuggestions && (
                        <div className="fade-in" style={{ animationDelay: "0.15s" }}>
                            <p
                                className="font-display mb-4"
                                style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}
                            >
                                Supported formats
                            </p>
                            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                                {[
                                    { label: "Full URL", eg: "youtube.com/watch?v=…", icon: "🔗" },
                                    { label: "Short link", eg: "youtu.be/dQw4w9WgXcQ", icon: "✂️" },
                                    { label: "Embed URL", eg: "youtube.com/embed/…", icon: "📦" },
                                    { label: "Video ID", eg: "dQw4w9WgXcQ", icon: "🔑" },
                                ].map(({ label, eg, icon }) => (
                                    <div key={label} className="sug-card">
                                        <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                                        <div style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: "0.88rem", marginBottom: 4 }}>{label}</div>
                                        <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.75rem", fontFamily: "monospace" }}>{eg}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <footer className="mt-14 text-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.78rem" }}>
                        CleanPlayer — no ads, no recommended videos
                    </footer>
                </div>
            </div>
        </>
    );
}