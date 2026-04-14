import React from 'react';
import { ATTENTIVE_DURATIONS } from '../../utils/constants';

export default function ModeSelectionPopup({
    onStartNormal,
    onStartAttentive,
    attentiveDuration,
    setAttentiveDuration,
    tempPassword,
    setTempPassword,
    passwordError,
    setPasswordError
}) {
    const handleAttentiveClick = () => {
        if (!tempPassword || tempPassword.length < 4) {
            setPasswordError("Password must be at least 4 characters");
            return;
        }
        onStartAttentive();
    };

    return (
        <div className="popup-overlay fade-in">
            <div className="popup-card">
                <h2 className="font-display text-white mb-2" style={{ fontSize: "1.5rem" }}>
                    Choose Watch Mode
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: "24px" }}>
                    How would you like to watch this video?
                </p>

                <button className="mode-btn" onClick={onStartNormal}>
                    <span style={{ fontSize: "1.4rem" }}>📺</span>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>Normal Mode</div>
                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                            Standard viewing with full controls
                        </div>
                    </div>
                </button>

                <div style={{ margin: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}></div>

                <button className="mode-btn attentive" style={{ marginBottom: 0 }}>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleAttentiveClick()}
                />
                {passwordError && <div className="error-text">{passwordError}</div>}

                <button
                    className="popup-btn"
                    onClick={handleAttentiveClick}
                    disabled={!tempPassword || tempPassword.length < 4}
                >
                    🔒 Start Locked Mode
                </button>

                <div className="hint-text">
                    💡 Tip: Press ESC or click timer to exit (password required)
                </div>
            </div>
        </div>
    );
}