import { useState, useEffect, useMemo, useCallback } from 'react';
import { tripApi } from '../services/tripApi';
import { Trip } from '../types/trip.types';
import { formatDate } from '../utils/tripUtils';
import { toast } from 'react-toastify';

export const useTripList = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

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

    const filteredTrips = useMemo(() => {
        if (!searchQuery.trim()) return trips;

        const query = searchQuery.toLowerCase();
        return trips.filter(
            (trip) =>
                trip.name.toLowerCase().includes(query) ||
                formatDate(trip.startTime).toLowerCase().includes(query)
        );
    }, [searchQuery, trips]);

    const deleteTrip = async (id: string) => {
        setIsDeleting(true);
        try {
            await tripApi.deleteTrip(id);
            setTrips(prev => prev.filter(t => t._id !== id));
            toast.success('Trip deleted successfully');
            return true;
        } catch (error) {
            console.error('Failed to delete trip:', error);
            toast.error('Failed to delete trip');
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        trips: filteredTrips,
        allTrips: trips,
        loading,
        searchQuery,
        setSearchQuery,
        isDeleting,
        deleteTrip,
        reload: loadTrips
    };
};
