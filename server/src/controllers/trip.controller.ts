import { Response } from 'express';
import { ITripUploadService } from '../interfaces/ITripUploadService';
import { ITripService } from '../interfaces/ITripService';
import { IGPSPointRepository } from '../interfaces/IGPSPointRepository';
import { AuthRequest } from '../middleware/auth.middleware';
import { HTTP_STATUS, HTTP_MESSAGES } from '../shared/constants/http.constants';
import { asyncHandler } from '../shared/utils/asyncHandler';
import {
  UnauthorizedError,
  BadRequestError,
  InternalServerError,
  CSVValidationError
} from '../shared/types/errors';
import { injectable, inject } from 'tsyringe';
import { SimulationService } from '../services/simulation.service';
import { IGPSQueueService } from '../interfaces/IGPSQueueService';

@injectable()
export class TripController {
  constructor(
    @inject('ITripUploadService') private _uploadService: ITripUploadService,
    @inject('ITripService') private _tripService: ITripService,
    @inject('IGPSPointRepository') private _gpsRepo: IGPSPointRepository,
    @inject('SimulationService') private _simulationService: SimulationService,
    @inject('IGPSQueueService') private _gpsQueue: IGPSQueueService
  ) { }

  startLiveTrip = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { name, metadata } = req.body;
    const trip = await this._tripService.startLiveTrip(req.user.userId, name, metadata);

    res.status(HTTP_STATUS.CREATED).json({
      message: HTTP_MESSAGES.TRIP.LIVE_TRIP_STARTED,
      trip
    });
  });

  /** Batch HTTP fallback — accepts an array of GPS points (used by background sync) */
  batchLocations = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { id } = req.params;
    const { points } = req.body;

    if (!Array.isArray(points) || points.length === 0) {
      throw new BadRequestError('points must be a non-empty array');
    }

    // Verify trip ownership
    await this._tripService.getTripById(req.user.userId, id as string);

    // Enqueue every point through the existing GPS queue (same path as socket)
    for (const point of points) {
      await this._gpsQueue.addGPSJob(id as string, point);
    }

    res.status(HTTP_STATUS.OK).json({
      message: `${points.length} points queued successfully`,
      count: points.length
    });
  });

  stopLiveTrip = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { id } = req.params;
    const updatedTrip = await this._tripService.stopLiveTrip(req.user.userId, id as string);

    res.status(HTTP_STATUS.OK).json({
      message: HTTP_MESSAGES.TRIP.LIVE_TRIP_STOPPED,
      trip: updatedTrip
    });
  });

  startSimulation = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    const { id } = req.params;
    
    this._simulationService.startSimulation(id as string);

    res.status(HTTP_STATUS.OK).json({
      message: HTTP_MESSAGES.SIMULATION.STARTED
    });
  });

  stopSimulation = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    const { id } = req.params;
    
    this._simulationService.stopSimulation(id as string);

    res.status(HTTP_STATUS.OK).json({
      message: HTTP_MESSAGES.SIMULATION.STOPPED
    });
  });

  uploadTrip = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    if (!req.file) {
      throw new BadRequestError(HTTP_MESSAGES.TRIP.NO_FILE_UPLOADED);
    }

    const { name } = req.body;

    try {
      const result = await this._uploadService.uploadTrip(
        req.user.userId,
        req.file.buffer,
        name
      );

      res.status(HTTP_STATUS.CREATED).json({
        message: HTTP_MESSAGES.TRIP.TRIP_UPLOADED_SUCCESSFULLY,
        tripId: result.trip._id,
        startTime: result.trip.startTime,
        endTime: result.trip.endTime,
        gpsPointsProcessed: result.pointsCount
      });
    } catch (error) {
      if (error instanceof CSVValidationError) {
        throw new CSVValidationError(error.message);
      }

      if (error instanceof Error && error.message?.includes('Invalid file type')) {
        throw new BadRequestError(HTTP_MESSAGES.TRIP.INVALID_FILE_TYPE);
      }

      throw new InternalServerError(HTTP_MESSAGES.TRIP.FAILED_TO_UPLOAD_TRIP);
    }
  });

  getUserTrips = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const trips = await this._tripService.getUserTrips(req.user.userId);

    res.status(HTTP_STATUS.OK).json({
      trips,
      count: trips.length
    });
  });

  getTripById = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { id } = req.params;
    const trip = await this._tripService.getTripById(req.user.userId, id as string);

    res.status(HTTP_STATUS.OK).json(trip);
  });

  getTripGPSPoints = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { id } = req.params;

    // Use service to verify access before fetching points
    await this._tripService.getTripById(req.user.userId, id as string);
    const gpsPoints = await this._gpsRepo.findByTripId(id as string);

    res.status(HTTP_STATUS.OK).json({
      gpsPoints,
      count: gpsPoints.length
    });
  });

  deleteTrip = asyncHandler(async (
    req: AuthRequest,
    res: Response
  ) => {
    if (!req.user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const { id } = req.params;
    await this._tripService.deleteTrip(req.user.userId, id as string);

    res.status(HTTP_STATUS.OK).json({
      message: HTTP_MESSAGES.TRIP.TRIP_DELETED
    });
  });
}
