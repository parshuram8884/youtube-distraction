import React from 'react';

export default function EndedOverlay({ onReplay }) {
    return (
        <div className="ended-overlay fade-in">
            <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" style={{ width: 52 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: "0.9rem" }}>
                Video ended
            </p>
            <button className="replay-btn" onClick={onReplay}>
                ↺ Replay
            </button>
        </div>
    );
}