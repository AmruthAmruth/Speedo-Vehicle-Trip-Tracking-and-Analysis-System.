import api from './api';
import { TripUploadResponse, GetTripsResponse, Trip, GetGPSPointsResponse } from '../types/trip.types';
import { API_ROUTES } from '../constants/api';

export const tripApi = {
    // Upload a trip CSV file
    uploadTrip: async (file: File, name?: string): Promise<TripUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (name) {
            formData.append('name', name);
        }

        const response = await api.post<TripUploadResponse>(API_ROUTES.TRIP.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },


    getUserTrips: async (): Promise<GetTripsResponse> => {
        const response = await api.get<GetTripsResponse>(API_ROUTES.TRIP.USER_TRIPS);
        return response.data;
    },

    getActiveTrips: async (): Promise<Trip[]> => {
        const response = await api.get<GetTripsResponse>(API_ROUTES.TRIP.USER_TRIPS);
        return response.data.trips.filter((trip: Trip) => trip.isActive);
    },

    getTripById: async (id: string): Promise<Trip> => {
        const response = await api.get<Trip>(API_ROUTES.TRIP.GET_BY_ID(id));
        return response.data;
    },

    getTripGPSPoints: async (id: string): Promise<GetGPSPointsResponse> => {
        const response = await api.get<GetGPSPointsResponse>(API_ROUTES.TRIP.GET_GPS_POINTS(id));
        return response.data;
    },

    startSimulation: async (id: string): Promise<void> => {
        await api.post(`/trip/${id}/simulate`);
    },

    stopSimulation: async (id: string): Promise<void> => {
        await api.post(`/trip/${id}/simulate/stop`);
    },
    
    startLiveTrip: async (name?: string, metadata?: any): Promise<{ trip: Trip }> => {
        const response = await api.post<{ trip: Trip }>(API_ROUTES.TRIP.START_LIVE, { name, metadata });
        return response.data;
    },

    stopLiveTrip: async (id: string): Promise<void> => {
        await api.post(API_ROUTES.TRIP.STOP_LIVE(id));
    },

    deleteTrip: async (id: string): Promise<void> => {
        await api.delete(`/trip/${id}`);
    }
};
