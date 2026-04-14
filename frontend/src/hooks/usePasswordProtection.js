import { useState, useCallback } from 'react';

export function usePasswordProtection() {
    const [password, setPassword] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);

    const setNewPassword = useCallback((newPassword) => {
        setPassword(newPassword);
    }, []);

    const verifyPassword = useCallback((inputPassword) => {
        return inputPassword === password;
    }, [password]);

    const clearPassword = useCallback(() => {
        setPassword("");
        setTempPassword("");
        setPasswordError("");
    }, []);

    const validatePassword = useCallback((pwd, minLength = 4) => {
        if (!pwd || pwd.length < minLength) {
            setPasswordError(`Password must be at least ${minLength} characters`);
            return false;
        }
        setPasswordError("");
        return true;
    }, []);

    const openPasswordPopup = useCallback(() => {
        setShowPasswordPopup(true);
        setTempPassword("");
        setPasswordError("");
    }, []);

    const closePasswordPopup = useCallback(() => {
        setShowPasswordPopup(false);
        setTempPassword("");
        setPasswordError("");
    }, []);

    return {
        // State
        password,
        tempPassword,
        setTempPassword,
        passwordError,
        setPasswordError,
        showPasswordPopup,

        // Actions
        setNewPassword,
        verifyPassword,
        clearPassword,
        validatePassword,
        openPasswordPopup,
        closePasswordPopup,
        setShowPasswordPopup
    };
}