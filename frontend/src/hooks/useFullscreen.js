import { useRef, useEffect, useCallback } from 'react';

export function useFullscreen() {
    const wasFullscreenRef = useRef(false);

    const requestFullscreen = useCallback(() => {
        const elem = document.documentElement;
        try {
            if (elem.requestFullscreen) return elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
            else if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        try {
            if (document.exitFullscreen) return document.exitFullscreen();
            else if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
            else if (document.msExitFullscreen) return document.msExitFullscreen();
            else if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        } catch (err) {
            console.error("Exit fullscreen error:", err);
        }
    }, []);

    const isFullscreen = useCallback(() => {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            wasFullscreenRef.current = isFullscreen();
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, [isFullscreen]);

    return {
        requestFullscreen,
        exitFullscreen,
        isFullscreen,
        wasFullscreenRef
    };
}