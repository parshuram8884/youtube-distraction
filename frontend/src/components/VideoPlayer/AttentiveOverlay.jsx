import React, { useEffect, useRef, useState } from 'react';
import { formatTime } from '../../utils/helpers';

export default function AttentiveOverlay({
    attentiveContainerRef,
    timeRemaining,
    onVerify,
    onExit,
    showExitHint,
    setShowExitHint,
    requestFullscreen
}) {
    const escHandledRef = useRef(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Keep fullscreen active when popup opens
    useEffect(() => {
        if (showPasswordPopup) {
            // Ensure we're in fullscreen when popup shows
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
            if (!isFullscreen) {
                requestFullscreen();
            }
        }
    }, [showPasswordPopup, requestFullscreen]);

    // Handle ESC key - prevent default to keep fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !escHandledRef.current) {
                // Prevent default ESC behavior (which exits fullscreen)
                e.preventDefault();
                e.stopPropagation();

                if (!showPasswordPopup) {
                    escHandledRef.current = true;

                    // Show password popup while keeping fullscreen
                    setShowPasswordPopup(true);
                    setPasswordInput("");
                    setPasswordError("");

                    setTimeout(() => {
                        escHandledRef.current = false;
                    }, 100);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [showPasswordPopup]);

    // Handle fullscreen change - re-enter if user exits manually
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);

            // If fullscreen exited and password popup should be showing, re-enter fullscreen
            if (!isFullscreen && showPasswordPopup) {
                requestFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, [showPasswordPopup, requestFullscreen]);

    const handleTimerClick = () => {
        setShowPasswordPopup(true);
        setPasswordInput("");
        setPasswordError("");
    };

    const handlePasswordSubmit = () => {
        if (onVerify(passwordInput)) {
            onExit();
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

    const handleCancel = () => {
        setShowPasswordPopup(false);
        setPasswordInput("");
        setPasswordError("");
        // Ensure fullscreen stays active when canceling
        requestFullscreen();
    };

    return (
        <div className="attentive-overlay">
            {/* Video takes full screen */}
            <div className="attentive-content">
                <div className="attentive-player-container" ref={attentiveContainerRef} />
            </div>

            {/* FLOATING TIMER - Click to exit */}
           

            {/* Exit hint on hover */}
            {showExitHint && !showPasswordPopup && (
                <div className="exit-hint">
                    Press ESC or click timer to exit
                </div>
            )}

            {/* PASSWORD POPUP - Inside fullscreen overlay */}
            {showPasswordPopup && (
                <div
                    className="password-popup-overlay fade-in"
                    style={{
                        zIndex: 10002,
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="popup-card" style={{ maxWidth: "380px", width: '90%' }}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🔐</div>
                            <h2 className="font-display text-white" style={{ fontSize: "1.4rem" }}>
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
                        {passwordError && (
                            <div className="error-text" style={{ textAlign: "center", marginTop: '8px' }}>
                                {passwordError}
                            </div>
                        )}

                        <button className="popup-btn" onClick={handlePasswordSubmit} style={{ marginTop: '16px' }}>
                            Unlock
                        </button>
                        <button className="popup-btn secondary" onClick={handleCancel}>
                            Cancel
                        </button>

                        <div className="hint-text" style={{ textAlign: "center", marginTop: '12px' }}>
                            Time remaining: {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}