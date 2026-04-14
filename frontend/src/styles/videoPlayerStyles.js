export const globalStyles = `
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

    /* Password popup inside attentive overlay */
.password-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Ensure attentive overlay has proper stacking */
.attentive-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

/* Hide timer when password popup is open */
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

`;