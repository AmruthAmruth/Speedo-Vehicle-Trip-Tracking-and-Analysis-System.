import { useState, useEffect, useMemo, useCallback } from 'react';
import { tripApi } from '../services/tripApi';
import { Trip } from '../types/trip.types';
import { calculateTripDuration } from '../utils/tripUtils';
import { toast } from 'react-toastify';

export const useDashboardData = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const loadTrips = useCallback(async () => {
        try {
            setLoading(true);
            const response = await tripApi.getUserTrips();
            setTrips(response.trips);
        } catch (error) {
            console.error('Failed to load trips:', error);
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const stats = useMemo(() => {
        const totalTrips = trips.length;
        const totalDistance = trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);
        const totalDuration = trips.reduce((sum, trip) =>
            sum + calculateTripDuration(trip.startTime, trip.endTime), 0
        );
        const activeTripsCount = trips.filter(t => t.isActive).length;

        return {
            totalTrips,
            totalDistance,
            totalDuration,
            activeTripsCount
        };
    }, [trips]);

    const sortedTrips = useMemo(() => {
        return [...trips].sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
    }, [trips]);

    const startLiveTrip = async () => {
        try {
            const response = await tripApi.startLiveTrip();
            setActiveTripId(response.trip._id);
            setQrModalOpen(true);
            toast.success('Live trip started! Scan the QR code to link your phone.');
            loadTrips();
        } catch (error) {
            console.error('Failed to start live trip:', error);
            toast.error('Failed to start live trip');
        }
    };

    return {
        trips: sortedTrips,
        loading,
        stats,
        activeTripId,
        qrModalOpen,
        setQrModalOpen,
        startLiveTrip,
        reload: loadTrips
    };
};
