import React, { useState, useRef, useCallback, useEffect } from "react";
import { CDN, STATES } from "../../utils/constants";
import { extractVideoId } from "../../utils/helpers";
import { globalStyles } from "../../styles/videoPlayerStyles";

// Hooks
import { useYouTubePlayer } from "../../hooks/useYouTubePlayer";
import { useAttentiveMode } from "../../hooks/useAttentiveMode";
import { useFullscreen } from "../../hooks/useFullscreen";

// Components
import Header from "../common/Header";
import InputRow from "../common/InputRow";
import NormalPlayer from "./NormalPlayer";
import ModeSelectionPopup from "./ModeSelectionPopup";
import AttentiveOverlay from "./AttentiveOverlay";
import PasswordPopup from "./PasswordPopup";
import Suggestions from "../common/Suggestions";


export default function VideoPlayer() {
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState("");
    const [error, setError] = useState("");
    const [showModePopup, setShowModePopup] = useState(false);
    const [pendingVideoId, setPendingVideoId] = useState("");
    const [showExitHint, setShowExitHint] = useState(false);

    // Refs
    const normalContainerRef = useRef(null);
    const attentiveContainerRef = useRef(null);
    const currentVideoIdRef = useRef("");

    // Hooks
    const {
        playerState,
        setPlayerState,
        createPlayer,
        destroyPlayer,
        movePlayerToContainer,
        seekTo,
        playVideo
    } = useYouTubePlayer();

    const {
        attentiveDuration,
        setAttentiveDuration,
        timeRemaining,
        showAttentiveOverlay,
        setShowAttentiveOverlay,
        tempPassword,
        setTempPassword,
        showPasswordPopup,
        setShowPasswordPopup,
        passwordError,
        setPasswordError,
        startAttentiveMode,
        exitAttentiveMode,
        verifyPassword
    } = useAttentiveMode();

    const { requestFullscreen, exitFullscreen, wasFullscreenRef } = useFullscreen();

    // Handle fullscreen exit detection
    // Handle fullscreen exit detection - ONLY when password popup is NOT showing
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);

            // Only auto-show password popup if user exits fullscreen manually
            // AND we're in attentive mode AND popup isn't already showing
            if (!isFullscreen && showAttentiveOverlay && !showPasswordPopup) {
                setShowPasswordPopup(true);
                setTempPassword("");
                setPasswordError("");
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

    // Timer expiration effect
    useEffect(() => {
        if (showAttentiveOverlay && timeRemaining === 0) {
            handleExitAttentive();
        }
    }, [timeRemaining, showAttentiveOverlay]);

    const handleSubmit = useCallback(() => {
        setError("");
        if (!url.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }
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
    }, [url, setTempPassword, setPasswordError]);

    const handleClear = () => {
        setUrl("");
        setVideoId("");
        setError("");
        setPlayerState(STATES.IDLE);
        setShowModePopup(false);
        setPendingVideoId("");
        currentVideoIdRef.current = "";

        destroyPlayer();
        if (showAttentiveOverlay) {
            handleExitAttentive();
        }
    };

    const startNormalMode = () => {
        const id = pendingVideoId;
        currentVideoIdRef.current = id;
        setVideoId(id);
        setShowModePopup(false);
        setPendingVideoId("");
        setPlayerState(STATES.IDLE);

        destroyPlayer();
        setTimeout(() => {
            createPlayer(normalContainerRef, id);
        }, 100);
    };

    const handleStartAttentive = () => {
        if (!tempPassword || tempPassword.length < 4) {
            setPasswordError("Password must be at least 4 characters");
            return;
        }

        const id = pendingVideoId;
        currentVideoIdRef.current = id;
        setVideoId(id);
        setShowModePopup(false);
        setPendingVideoId("");

        startAttentiveMode(id, tempPassword, attentiveDuration);

        destroyPlayer();
        setTimeout(() => {
            createPlayer(attentiveContainerRef, id);
            setTimeout(() => {
                requestFullscreen();
                wasFullscreenRef.current = true;
            }, 500);
        }, 100);
    };

    const handleExitAttentive = () => {
        exitAttentiveMode();
        wasFullscreenRef.current = false;
        exitFullscreen();

        const currentId = currentVideoIdRef.current;
        destroyPlayer();

        setTimeout(() => {
            if (currentId) {
                createPlayer(normalContainerRef, currentId);
            }
        }, 300);
    };

    const handlePasswordVerify = (input) => {
        if (verifyPassword(input)) {
            handleExitAttentive();
            return true;
        }
        return false;
    };

    const handleReplay = () => {
        seekTo(0);
        playVideo();
        setPlayerState(STATES.PLAYING);
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
            <style>{globalStyles}</style>

            <div
                className="grain font-body min-h-screen relative"
                style={{ background: "linear-gradient(140deg,#0d0d0d 0%,#1a0808 45%,#0a0a1a 100%)" }}
            >
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

                    <Header />

                    <InputRow
                        url={url}
                        setUrl={setUrl}
                        onSubmit={handleSubmit}
                        onClear={handleClear}
                    />

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

                    {videoId && !showAttentiveOverlay && (
                        <NormalPlayer
                            normalContainerRef={normalContainerRef}
                            playerState={playerState}
                            setPlayerState={setPlayerState}
                            onReplay={handleReplay}
                        />
                    )}

                    {showModePopup && (
                        <ModeSelectionPopup
                            onStartNormal={startNormalMode}
                            onStartAttentive={handleStartAttentive}
                            attentiveDuration={attentiveDuration}
                            setAttentiveDuration={setAttentiveDuration}
                            tempPassword={tempPassword}
                            setTempPassword={setTempPassword}
                            passwordError={passwordError}
                            setPasswordError={setPasswordError}
                        />
                    )}

                    {showAttentiveOverlay && (
                        <AttentiveOverlay
                            attentiveContainerRef={attentiveContainerRef}
                            timeRemaining={timeRemaining}
                            onVerify={verifyPassword}
                            onExit={handleExitAttentive}
                            showExitHint={showExitHint}
                            setShowExitHint={setShowExitHint}
                            requestFullscreen={requestFullscreen}
                        />
                    )}

                    {showPasswordPopup && (
                        <PasswordPopup
                            timeRemaining={timeRemaining}
                            onVerify={handlePasswordVerify}
                            onCancel={() => {
                                setShowPasswordPopup(false);
                                setTempPassword("");
                                setPasswordError("");
                            }}
                            requestFullscreen={requestFullscreen}
                            showAttentiveOverlay={showAttentiveOverlay}
                        />
                    )}

                    <Suggestions showIdlePlaceholder={showSuggestions} />

                    
                </div>
            </div>
        </>
    );
}
