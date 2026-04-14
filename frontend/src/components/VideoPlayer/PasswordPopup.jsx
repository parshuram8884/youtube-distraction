import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils/helpers';

export default function PasswordPopup({
    timeRemaining,
    onVerify,
    onCancel,
    requestFullscreen,
    showAttentiveOverlay
}) {
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState("");

    // Re-enter fullscreen when popup opens
    useEffect(() => {
        if (showAttentiveOverlay) {
            requestFullscreen();
        }
    }, [showAttentiveOverlay, requestFullscreen]);

    const handleSubmit = () => {
        if (onVerify(passwordInput)) {
            // Password correct - parent handles exit
        } else {
            setError("Incorrect password!");
            setPasswordInput("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleCancel = () => {
        setPasswordInput("");
        setError("");
        onCancel();

        // Always re-enter fullscreen when canceling
        setTimeout(() => {
            requestFullscreen();
        }, 50);
    };

    return (
        <div className="password-popup-overlay fade-in" onClick={(e) => e.stopPropagation()}>
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
                        setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}

                <button className="popup-btn" onClick={handleSubmit}>
                    Unlock
                </button>
                <button className="popup-btn secondary" onClick={handleCancel}>
                    Cancel
                </button>

                <div className="hint-text" style={{ textAlign: "center" }}>
                    Time remaining: {formatTime(timeRemaining)}
                </div>
            </div>
        </div>
    );
}