import { Router } from 'express';

import { upload } from '../middleware/upload.middleware';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { container } from 'tsyringe';

const tripRouter = Router();
const tripController = container.resolve(TripController);

tripRouter.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  tripController.uploadTrip
);

tripRouter.post(
  '/live/start',
  authMiddleware,
  tripController.startLiveTrip
);

tripRouter.post(
  '/:id/live/stop',
  authMiddleware,
  tripController.stopLiveTrip
);

tripRouter.get(
  '/user',
  authMiddleware,
  tripController.getUserTrips
);

tripRouter.get(
  '/:id',
  authMiddleware,
  tripController.getTripById
);

tripRouter.get(
  '/:id/gpspoints',
  authMiddleware,
  tripController.getTripGPSPoints
);

tripRouter.post(
  '/:id/simulate',
  authMiddleware,
  tripController.startSimulation
);

tripRouter.post(
  '/:id/simulate/stop',
  authMiddleware,
  tripController.stopSimulation
);

tripRouter.delete(
  '/:id',
  authMiddleware,
  tripController.deleteTrip
);

export default tripRouter;
