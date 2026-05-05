import { ICsvService } from '../interfaces/ICsvService';
import { ITripUploadService } from '../interfaces/ITripUploadService';
import { ITripRepository } from '../interfaces/ITripRepository';
import { IGPSPointRepository } from '../interfaces/IGPSPointRepository';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { getDistance } from 'geolib';
import { HTTP_MESSAGES } from '../shared/constants/http.constants';
import { injectable, inject } from 'tsyringe';

@injectable()
export class TripUploadService implements ITripUploadService {
  constructor(
    @inject('ITripRepository') private _tripRepo: ITripRepository,
    @inject('IGPSPointRepository') private _gpsRepo: IGPSPointRepository,
    @inject('ICsvService') private _csvService: ICsvService
  ) { }

  async uploadTrip(
    userId: string,
    fileBuffer: Buffer,
    name?: string
  ) {
    // 1. Parse CSV
    const rawRows = await this._csvService.parseCSV(fileBuffer);

    // 2. Sort rows chronologically (FIX: Sorting issue)
    const rows = [...rawRows].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 3. Basic validation
    const MIN_GPS_POINTS = 2;
    if (rows.length < MIN_GPS_POINTS) {
      throw new Error(
        HTTP_MESSAGES.GENERIC.INSUFFICIENT_GPS_POINTS(MIN_GPS_POINTS, rows.length)
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. Create Trip
      const trip = await this._tripRepo.create({
        userId: new Types.ObjectId(userId),
        name: name || 'Uploaded Trip',
        startTime: new Date(rows[0].timestamp),
        endTime: new Date(rows[rows.length - 1].timestamp)
      }, session);

      // 5. Prepare GPS Points and calculate metrics
      let totalDistance = 0;
      let totalIdlingTime = 0;
      let totalStoppageTime = 0;
      
      const gpsPoints = rows.map(row => ({
        tripId: trip._id,
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: new Date(row.timestamp),
        ignition: row.ignition === 'ON',
        speed: 0
      }));

      // 6. Loop to calculate segments and aggregate analytics
      for (let i = 1; i < gpsPoints.length; i++) {
        const prev = gpsPoints[i - 1];
        const curr = gpsPoints[i];

        const distance = getDistance(
          { latitude: prev.latitude, longitude: prev.longitude },
          { latitude: curr.latitude, longitude: curr.longitude }
        );

        const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;

        if (timeDiff > 0) {
          curr.speed = (distance / timeDiff) * 3.6;
          totalDistance += distance;

          // Aggregation Logic (FIX: Missing analytics)
          if (prev.ignition && curr.ignition && curr.speed < 1) { // Speed < 1km/h as threshold for idling
            totalIdlingTime += timeDiff;
          } else if (!prev.ignition && !curr.ignition) {
            totalStoppageTime += timeDiff;
          }
        }
      }

      // 7. Bulk create points
      await this._gpsRepo.bulkCreate(gpsPoints, session);

      // 8. Update Trip with aggregated metrics (FIX: Dead analytics)
      const updatedTrip = await this._tripRepo.update(trip._id.toString(), {
        totalDistance,
        totalIdlingTime,
        totalStoppageTime
      }, session);

      await session.commitTransaction();

      return {
        trip: updatedTrip || trip,
        pointsCount: gpsPoints.length
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
