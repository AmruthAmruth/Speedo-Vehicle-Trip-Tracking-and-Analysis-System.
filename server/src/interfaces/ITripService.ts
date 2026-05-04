import { ITrip } from '../models/Trip.model';

export interface ITripService {
    startLiveTrip(userId: string, name?: string): Promise<ITrip>;
    stopLiveTrip(userId: string, tripId: string): Promise<ITrip>;
    deleteTrip(userId: string, tripId: string): Promise<void>;
    getUserTrips(userId: string): Promise<ITrip[]>;
    getTripById(userId: string, tripId: string): Promise<ITrip>;
}
