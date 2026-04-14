import React from 'react';

const SUGGESTIONS = [
    { label: "Full URL", eg: "youtube.com/watch?v=…", icon: "🔗" },
    { label: "Short link", eg: "youtu.be/dQw4w9WgXcQ", icon: "✂️" },
    { label: "Embed URL", eg: "youtube.com/embed/…", icon: "📦" },
    { label: "Video ID", eg: "dQw4w9WgXcQ", icon: "🔑" },
];

export default function Suggestions({ showIdlePlaceholder }) {
    return (
        <>
            {/* Idle placeholder */}
            {showIdlePlaceholder && (
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

            {/* Suggestions grid */}
            <div className="fade-in" style={{ animationDelay: "0.15s" }}>
                <p
                    className="font-display mb-4"
                    style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}
                >
                    Supported formats
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                    {SUGGESTIONS.map(({ label, eg, icon }) => (
                        <div key={label} className="sug-card">
                            <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                            <div style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: "0.88rem", marginBottom: 4 }}>{label}</div>
                            <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.75rem", fontFamily: "monospace" }}>{eg}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}