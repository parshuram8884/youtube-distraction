import { useState, useEffect, useRef, useCallback } from "react";

const CDN =
    "https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css";

const STATES = { IDLE: "idle", PLAYING: "playing", PAUSED: "paused", ENDED: "ended" };

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

export default function VideoPlayer() {
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState("");
    const [error, setError] = useState("");
    const [playerState, setPlayerState] = useState(STATES.IDLE);
    const [apiReady, setApiReady] = useState(false);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    /* ── Load YouTube IFrame API ── */
    useEffect(() => {
        if (window.YT?.Player) { setApiReady(true); return; }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
        return () => { window.onYouTubeIframeAPIReady = null; };
    }, []);

    /* ── Create / recreate player when videoId changes ── */
    useEffect(() => {
        if (!videoId || !apiReady || !containerRef.current) return;

        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }

        const div = document.createElement("div");
        div.id = "yt-player-target-" + Date.now();
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(div);

        playerRef.current = new window.YT.Player(div.id, {
            videoId,
            playerVars: { rel: 0, modestbranding: 1, showinfo: 0, autohide: 1 },
            events: {
                onStateChange: (e) => {
                    const S = window.YT.PlayerState;
                    if (e.data === S.PLAYING || e.data === S.BUFFERING) setPlayerState(STATES.PLAYING);
                    else if (e.data === S.PAUSED) setPlayerState(STATES.PAUSED);
                    else if (e.data === S.ENDED) setPlayerState(STATES.ENDED);
                },
            },
        });
    }, [videoId, apiReady]);

    const handleSubmit = useCallback(() => {
        setError("");
        if (!url.trim()) { setError("Please enter a YouTube URL"); return; }
        const id = extractVideoId(url.trim());
        if (id) {
            setVideoId(id);
            setPlayerState(STATES.IDLE);
        } else {
            setError("Invalid YouTube URL. Please try again.");
            setVideoId("");
        }
    }, [url]);

    const handleClear = () => {
        setUrl(""); setVideoId(""); setError(""); setPlayerState(STATES.IDLE);
        if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
        if (containerRef.current) containerRef.current.innerHTML = "";
    };

    const isActive = playerState === STATES.PLAYING || playerState === STATES.PAUSED;
    const isEnded = playerState === STATES.ENDED;
    /* Suggestions + placeholder hide when video is active or ended */
    const showSuggestions = !isActive && !isEnded;

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
        .player-wrapper > div,
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

        @media (max-width: 520px) {
          .input-row { flex-direction: column !important; }
          .play-btn-wrap { width: 100%; }
          .play-btn-wrap button { width: 100% !important; justify-content: center; }
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
                                placeholder="https://youtube.com/watch?v=…"
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

                    {/* ── Player ── */}
                    {videoId && (
                        <div className="fade-in mb-10" style={{ position: "relative" }}>
                            <div className="player-wrapper card-glow">
                                <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
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
                                                playerRef.current?.seekTo(0);
                                                playerRef.current?.playVideo();
                                                setPlayerState(STATES.PLAYING);
                                            }}
                                        >↺ Replay</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Idle placeholder — hidden when video is active/ended ── */}
                    {!videoId && showSuggestions && (
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

                    {/* ── Suggestions — hidden during play / pause / end ── */}
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