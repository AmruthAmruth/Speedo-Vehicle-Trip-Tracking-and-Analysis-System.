import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { IGPSQueueService } from '../interfaces/IGPSQueueService';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { HTTP_STATUS, HTTP_MESSAGES } from '../shared/constants/http.constants';
import { injectable, inject } from 'tsyringe';

@injectable()
export class GPSController {
  constructor(
    @inject('IGPSQueueService') private _queueService: IGPSQueueService
  ) {}

  ingestPoint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { tripId } = req.params;
    const gpsPoint = req.body;

    // 1. Quick Validation
    if (!gpsPoint.latitude || !gpsPoint.longitude) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: HTTP_MESSAGES.GPS.INVALID_DATA,
      });
    }

    // 2. Add to Queue (Producer)
    await this._queueService.addGPSJob(tripId as string, gpsPoint);

    // 3. Respond immediately (202 Accepted)
    res.status(HTTP_STATUS.ACCEPTED).json({
      message: HTTP_MESSAGES.GPS.ACCEPTED,
      tripId,
    });
  });
}
