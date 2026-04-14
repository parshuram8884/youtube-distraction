import React from 'react';
import { STATES } from '../../utils/constants';
import EndedOverlay from './EndedOverlay';

export default function NormalPlayer({
    normalContainerRef,
    playerState,
    setPlayerState,
    onReplay
}) {
    const isEnded = playerState === STATES.ENDED;

    return (
        <div className="fade-in mb-10" style={{ position: "relative" }}>
            <div className="player-wrapper card-glow">
                <div
                    ref={normalContainerRef}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
                {isEnded && (
                    <EndedOverlay onReplay={onReplay} />
                )}
            </div>
        </div>
    );
}