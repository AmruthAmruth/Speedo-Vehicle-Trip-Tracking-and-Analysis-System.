import { TripModel, ITrip } from '../models/Trip.model';
import { ITripRepository } from '../interfaces/ITripRepository';
import { ClientSession } from 'mongoose';
import { injectable } from 'tsyringe';

@injectable()
export class TripRepository implements ITripRepository {
  async create(data: Partial<ITrip>, session?: ClientSession) {
    if (session) {
      return TripModel.create([data], { session }).then(trips => trips[0]);
    }
    return TripModel.create(data);
  }

  async findByUserId(userId: string) {
    return TripModel.find({ userId })
      .sort({ startTime: -1 })
      .lean();
  }

  async findById(id: string) {
    return TripModel.findById(id).lean();
  }

  async update(id: string, data: Partial<ITrip>, session?: ClientSession) {
    return TripModel.findByIdAndUpdate(id, data, { new: true, session }).lean();
  }

  async delete(id: string, session?: ClientSession) {
    const result = await TripModel.deleteOne({ _id: id }, { session });
    return result.deletedCount > 0;
  }
}