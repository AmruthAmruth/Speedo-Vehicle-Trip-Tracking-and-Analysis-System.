import { container } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { TripRepository } from '../repositories/trip.repository';
import { GPSPointRepository } from '../repositories/gpspoint.repository';
import { DeviceRepository } from '../repositories/device.repository';
import { AuthService } from '../services/auth.service';
import { TripUploadService } from '../services/tripUpload.service';
import { CsvService } from '../services/csv.service';
import { SimulationService } from '../services/simulation.service';
import { TripService } from '../services/trip.service';
import { SocketService } from '../services/socket.service';
import { GPSQueueService } from '../services/gpsQueue.service';
import { RedisCacheService } from '../services/cache.service';
import { GPSWorker } from '../workers/gps.worker';

 
container.register('IUserRepository', { useClass: UserRepository });
container.register('ITripRepository', { useClass: TripRepository });
container.register('IGPSPointRepository', { useClass: GPSPointRepository });
container.register('IDeviceRepository', { useClass: DeviceRepository });


container.register('IAuthService', { useClass: AuthService });
container.register('ITripService', { useClass: TripService });
container.register('ITripUploadService', { useClass: TripUploadService });
container.register('ICsvService', { useClass: CsvService });
container.registerSingleton('SimulationService', SimulationService);
container.registerSingleton('SocketService', SocketService);
container.registerSingleton('IGPSQueueService', GPSQueueService);
container.registerSingleton('ICacheService', RedisCacheService);
container.registerSingleton('GPSWorker', GPSWorker);

export { container };
