import { IGPSPoint } from '../models/GPSPoint.model';
import { ClientSession } from 'mongoose';

export interface IGPSPointRepository {
    create(point: Partial<IGPSPoint>): Promise<IGPSPoint>;
    bulkCreate(points: Partial<IGPSPoint>[], session?: ClientSession): Promise<IGPSPoint[]>;
    findByTripId(tripId: string): Promise<IGPSPoint[]>;
    deleteByTripId(tripId: string, session?: ClientSession): Promise<void>;
}