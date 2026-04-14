import React from 'react';

export default function Header() {
    return (
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
    );
}