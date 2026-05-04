import { useState, useEffect, useCallback } from 'react';

export const useTripPlayback = (totalPoints: number) => {
    const [replayIndex, setReplayIndex] = useState<number | null>(null);
    const [isReplaying, setIsReplaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Initialize to last point when data loaded
    useEffect(() => {
        if (totalPoints > 0 && replayIndex === null) {
            setReplayIndex(totalPoints - 1);
        }
    }, [totalPoints, replayIndex]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isReplaying && replayIndex !== null && replayIndex < totalPoints - 1) {
            interval = setInterval(() => {
                setReplayIndex(prev => {
                    if (prev !== null && prev < totalPoints - 1) {
                        return prev + 1;
                    }
                    setIsReplaying(false);
                    return prev;
                });
            }, 1000 / playbackSpeed);
        } else if (replayIndex === totalPoints - 1) {
            setIsReplaying(false);
        }
        return () => clearInterval(interval);
    }, [isReplaying, replayIndex, playbackSpeed, totalPoints]);

    const startReplay = useCallback(() => setIsReplaying(true), []);
    const pauseReplay = useCallback(() => setIsReplaying(false), []);
    const toggleReplay = useCallback(() => setIsReplaying(prev => !prev), []);
    const seekTo = useCallback((index: number) => {
        setReplayIndex(index);
        setIsReplaying(false);
    }, []);

    return {
        replayIndex,
        setReplayIndex,
        isReplaying,
        setIsReplaying,
        playbackSpeed,
        setPlaybackSpeed,
        startReplay,
        pauseReplay,
        toggleReplay,
        seekTo
    };
};
