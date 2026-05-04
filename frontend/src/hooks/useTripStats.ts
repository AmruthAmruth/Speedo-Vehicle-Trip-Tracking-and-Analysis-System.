import { useMemo } from 'react';
import { getDistance } from 'geolib';
import { GPSPoint } from '../types/trip.types';
import { calculateTripDuration } from '../utils/tripUtils';
import { detectOverspeedSections, detectIdlingPoints } from '../utils/mapUtils';

export const useTripStats = (gpsPoints: GPSPoint[], replayIndex: number | null, speedLimit: number) => {
    const activePoints = useMemo(() => {
        if (replayIndex === null) return gpsPoints;
        return gpsPoints.slice(0, replayIndex + 1);
    }, [gpsPoints, replayIndex]);

    const stats = useMemo(() => {
        if (activePoints.length === 0) return { 
            distance: 0, 
            avgSpeed: 0, 
            maxSpeed: 0, 
            idling: 0, 
            stoppage: 0,
            duration: 0
        };

        let distance = 0;
        let idling = 0;
        let stoppage = 0;
        let maxSpeed = 0;

        for (let i = 1; i < activePoints.length; i++) {
            const prev = activePoints[i - 1];
            const curr = activePoints[i];

            const d = getDistance(
                { latitude: prev.latitude, longitude: prev.longitude },
                { latitude: curr.latitude, longitude: curr.longitude }
            );
            distance += d;

            const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
            if (timeDiff > 0) {
                if (curr.speed > maxSpeed) maxSpeed = curr.speed;
                
                if (prev.ignition && curr.ignition && curr.speed < 1) {
                    idling += timeDiff;
                } else if (!prev.ignition && !curr.ignition) {
                    stoppage += timeDiff;
                }
            }
        }

        const duration = activePoints.length > 1 ? calculateTripDuration(
            activePoints[0].timestamp, 
            activePoints[activePoints.length - 1].timestamp
        ) : 0;
        
        const avgSpeed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;

        return { 
            distance, 
            avgSpeed, 
            maxSpeed, 
            idling, 
            stoppage,
            duration
        };
    }, [activePoints]);

    const driverInsight = useMemo(() => {
        if (activePoints.length < 2) return { 
            score: 100, 
            breakdown: { overspeed: 0, idling: 0, harshBraking: 0, harshBrakingCount: 0 }, 
            isPlaceholder: true 
        };

        let overspeedPenalty = 0;
        let idlingPenalty = 0;
        let harshBrakingPenalty = 0;
        let harshBrakingCount = 0;

        const overspeedSections = detectOverspeedSections(activePoints, speedLimit);
        overspeedPenalty = overspeedSections.length * 5;

        const idlingPoints = detectIdlingPoints(activePoints);
        const totalIdlingSeconds = idlingPoints.reduce((acc, curr) => acc + curr.duration, 0);
        idlingPenalty = Math.floor(totalIdlingSeconds / 300) * 2;

        for (let i = 1; i < activePoints.length; i++) {
            const prev = activePoints[i - 1];
            const curr = activePoints[i];
            
            const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
            if (timeDiff >= 0.5 && timeDiff < 10) {
                const speedDiff = prev.speed - curr.speed;
                if (speedDiff > 0) {
                    const deceleration = (speedDiff * 0.277778) / timeDiff; // m/s^2
                    if (deceleration > 3.0 && deceleration < 20.0) {
                        harshBrakingCount++;
                    }
                }
            }
        }
        harshBrakingPenalty = harshBrakingCount * 4;

        const totalPenalty = overspeedPenalty + idlingPenalty + harshBrakingPenalty;
        const score = Math.max(0, 100 - totalPenalty);

        return {
            score,
            breakdown: {
                overspeed: overspeedPenalty,
                idling: idlingPenalty,
                harshBraking: harshBrakingPenalty,
                harshBrakingCount
            },
            isPlaceholder: false
        };
    }, [activePoints, speedLimit]);

    return { stats, driverInsight };
};
