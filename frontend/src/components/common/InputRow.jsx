import React from 'react';

export default function InputRow({ url, setUrl, onSubmit, onClear }) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") onSubmit();
    };

    return (
        <div className="input-row flex gap-3 mb-3 fade-in" style={{ animationDelay: "0.08s" }}>
            <div className="relative flex-1">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                        onClick={onClear}
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
                    onClick={onSubmit}
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
    );
}