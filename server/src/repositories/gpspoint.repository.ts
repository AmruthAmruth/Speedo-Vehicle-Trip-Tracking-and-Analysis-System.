import { GPSPointModel, IGPSPoint } from '../models/GPSPoint.model';
import { IGPSPointRepository } from '../interfaces/IGPSPointRepository';
import { ClientSession } from 'mongoose';
import { injectable } from 'tsyringe';

@injectable()
export class GPSPointRepository implements IGPSPointRepository {
  async create(point: Partial<IGPSPoint>): Promise<IGPSPoint> {
    const newPoint = new GPSPointModel(point);
    return await newPoint.save();
  }

  async bulkCreate(points: Partial<IGPSPoint>[], session?: ClientSession): Promise<IGPSPoint[]> {
    let result;
    if (session) {
      result = await GPSPointModel.insertMany(points, { session });
    } else {
      result = await GPSPointModel.insertMany(points);
    }
    return result as unknown as IGPSPoint[];
  }

  async findByTripId(tripId: string) {
    return GPSPointModel.find({ tripId })
      .sort({ timestamp: 1 })
      .lean();
  }

  async deleteByTripId(tripId: string, session?: ClientSession) {
    await GPSPointModel.deleteMany({ tripId }, { session });
  }
}