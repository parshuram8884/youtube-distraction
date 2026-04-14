import { useState, useEffect, useRef, useCallback } from 'react';

export function useAttentiveMode() {
    const [attentiveMode, setAttentiveMode] = useState(false);
    const [attentiveDuration, setAttentiveDuration] = useState(5);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showAttentiveOverlay, setShowAttentiveOverlay] = useState(false);
    const [attentivePassword, setAttentivePassword] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const timerRef = useRef(null);

    // Timer countdown
    useEffect(() => {
        if (showAttentiveOverlay && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showAttentiveOverlay, timeRemaining]);

    const startAttentiveMode = useCallback((videoId, password, duration) => {
        setAttentiveMode(true);
        setAttentivePassword(password);
        setShowAttentiveOverlay(true);
        setTimeRemaining(duration * 60);
        setTempPassword("");
        setPasswordError("");
    }, []);

    const exitAttentiveMode = useCallback(() => {
        setShowAttentiveOverlay(false);
        setTimeRemaining(0);
        setShowPasswordPopup(false);
        setAttentivePassword("");
        setAttentiveMode(false);

        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const checkPassword = useCallback((input) => {
        return input === attentivePassword;
    }, [attentivePassword]);

    return {
        // State
        attentiveMode,
        attentiveDuration,
        setAttentiveDuration,
        timeRemaining,
        showAttentiveOverlay,
        setShowAttentiveOverlay,
        attentivePassword,
        tempPassword,
        setTempPassword,
        showPasswordPopup,
        setShowPasswordPopup,
        passwordError,
        setPasswordError,

        // Actions
        startAttentiveMode,
        exitAttentiveMode,
        verifyPassword: checkPassword
    };
}