import { useState, useEffect, useCallback } from 'react';
import { tripApi } from '../services/tripApi';
import { Trip, GPSPoint } from '../types/trip.types';
import { socketService } from '../services/socketService';

export const useTripData = (id: string | undefined) => {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTripData = useCallback(async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const [tripData, gpsData] = await Promise.all([
                tripApi.getTripById(id),
                tripApi.getTripGPSPoints(id),
            ]);
            setTrip(tripData);
            setGpsPoints(gpsData.gpsPoints);
            setError(null);
        } catch (err) {
            console.error('Failed to load trip data:', err);
            setError('Failed to load trip data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTripData();
    }, [loadTripData]);

    return { trip, gpsPoints, setGpsPoints, loading, error, reload: loadTripData };
};

export const useRealTimeTrip = (id: string | undefined, onPointReceived?: (point: GPSPoint) => void) => {
    useEffect(() => {
        if (!id) return;

        const socket = socketService.connect();
        socketService.joinTrip(id);

        const handleLocationUpdate = (newPoint: GPSPoint) => {
            if (onPointReceived) {
                onPointReceived(newPoint);
            }
        };

        socket.on('locationUpdate', handleLocationUpdate);

        return () => {
            socket.off('locationUpdate', handleLocationUpdate);
            socketService.disconnect();
        };
    }, [id, onPointReceived]);
};
