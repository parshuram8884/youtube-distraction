import { useState, useEffect, useRef, useCallback } from 'react';
import { STATES } from '../utils/constants';

export function useYouTubePlayer(onStateChangeCallback) {
    const [apiReady, setApiReady] = useState(false);
    const playerRef = useRef(null);
    const playerCreatedRef = useRef(false);
    const [playerState, setPlayerState] = useState(STATES.IDLE);

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT?.Player) {
            setApiReady(true);
            return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => {
            setApiReady(true);
        };
        return () => { window.onYouTubeIframeAPIReady = null; };
    }, []);

    const handleStateChange = useCallback((e) => {
        const S = window.YT.PlayerState;
        if (e.data === S.PLAYING || e.data === S.BUFFERING) {
            setPlayerState(STATES.PLAYING);
        }
        else if (e.data === S.PAUSED) setPlayerState(STATES.PAUSED);
        else if (e.data === S.ENDED) setPlayerState(STATES.ENDED);

        if (onStateChangeCallback) {
            onStateChangeCallback(e);
        }
    }, [onStateChangeCallback]);

    const createPlayer = useCallback((containerRef, videoIdToLoad, onReady) => {
        if (!apiReady || !containerRef.current || playerCreatedRef.current) {
            if (playerRef.current && playerRef.current.loadVideoById && videoIdToLoad) {
                playerRef.current.loadVideoById(videoIdToLoad);
                return;
            }
            return;
        }

        const div = document.createElement("div");
        div.id = "yt-player-instance";
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(div);

        try {
            playerRef.current = new window.YT.Player(div.id, {
                videoId: videoIdToLoad || "",
                width: "100%",
                height: "100%",
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    autohide: 1,
                    fs: 1,
                    disablekb: 0,
                    enablejsapi: 1,
                    autoplay: 1
                },
                events: {
                    onReady: (e) => {
                        playerCreatedRef.current = true;
                        if (videoIdToLoad) {
                            e.target.playVideo();
                        }
                        if (onReady) onReady(e);
                    },
                    onError: (e) => {
                        const errorMessages = {
                            2: "Invalid parameter",
                            5: "HTML5 player error",
                            100: "Video not found",
                            101: "Video not allowed to be played embedded",
                            150: "Same as 101"
                        };
                        return errorMessages[e.data] || "Failed to load video";
                    },
                    onStateChange: handleStateChange,
                },
            });
        } catch (err) {
            return "Failed to initialize video player";
        }
    }, [apiReady, handleStateChange]);

    const destroyPlayer = useCallback(() => {
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) { }
            playerRef.current = null;
            playerCreatedRef.current = false;
        }
    }, []);

    const movePlayerToContainer = useCallback((targetContainerRef) => {
        if (!playerRef.current || !playerCreatedRef.current) return;

        const iframe = playerRef.current.getIframe();
        if (iframe && targetContainerRef.current) {
            targetContainerRef.current.innerHTML = "";
            targetContainerRef.current.appendChild(iframe);
        }
    }, []);

    const seekTo = useCallback((seconds) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seconds);
        }
    }, []);

    const playVideo = useCallback(() => {
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
        }
    }, []);

    return {
        apiReady,
        playerRef,
        playerState,
        setPlayerState,
        createPlayer,
        destroyPlayer,
        movePlayerToContainer,
        seekTo,
        playVideo
    };
}