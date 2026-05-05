import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { ITripService } from '../interfaces/ITripService';
import { ITripRepository } from '../interfaces/ITripRepository';
import { IGPSPointRepository } from '../interfaces/IGPSPointRepository';
import { ITrip } from '../models/Trip.model';
import { NotFoundError, ForbiddenError } from '../shared/types/errors';
import { HTTP_MESSAGES } from '../shared/constants/http.constants';

@injectable()
export class TripService implements ITripService {
    constructor(
        @inject('ITripRepository') private _tripRepo: ITripRepository,
        @inject('IGPSPointRepository') private _gpsRepo: IGPSPointRepository
    ) { }

    async startLiveTrip(userId: string, name?: string, metadata?: any): Promise<ITrip> {
        return this._tripRepo.create({
            userId: userId as any,
            name: name || `Live Trip ${new Date().toLocaleString()}`,
            startTime: new Date(),
            isActive: true,
            metadata: metadata || {}
        });
    }

    async stopLiveTrip(userId: string, tripId: string): Promise<ITrip> {
        const trip = await this._getAndAuthorizeTrip(userId, tripId);

        return this._tripRepo.update(tripId, {
            isActive: false,
            endTime: new Date()
        }) as Promise<ITrip>;
    }

    async deleteTrip(userId: string, tripId: string): Promise<void> {
        await this._getAndAuthorizeTrip(userId, tripId);

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            await this._gpsRepo.deleteByTripId(tripId, session);
            await this._tripRepo.delete(tripId, session);
            
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getUserTrips(userId: string): Promise<ITrip[]> {
        return this._tripRepo.findByUserId(userId);
    }

    async getTripById(userId: string, tripId: string): Promise<ITrip> {
        return this._getAndAuthorizeTrip(userId, tripId);
    }

    private async _getAndAuthorizeTrip(userId: string, tripId: string): Promise<ITrip> {
        const trip = await this._tripRepo.findById(tripId);

        if (!trip) {
            throw new NotFoundError(HTTP_MESSAGES.TRIP.TRIP_NOT_FOUND);
        }

        if (trip.userId.toString() !== userId) {
            throw new ForbiddenError(HTTP_MESSAGES.TRIP.ACCESS_DENIED);
        }

        return trip;
    }
}
