import { ITrip } from '../models/Trip.model';
import { ClientSession } from 'mongoose';

export interface ITripRepository {
    create(data: Partial<ITrip>, session?: ClientSession): Promise<ITrip>;
    findByUserId(userId: string): Promise<ITrip[]>;
    findById(id: string): Promise<ITrip | null>;
    update(id: string, data: Partial<ITrip>, session?: ClientSession): Promise<ITrip | null>;
    delete(id: string, session?: ClientSession): Promise<boolean>;
}
   