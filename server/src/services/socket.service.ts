import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { redisConfig } from '../shared/config/redis.config';
import { injectable, singleton } from 'tsyringe';
import { container } from '../di/container';
import { IGPSQueueService } from '../interfaces/IGPSQueueService';

@singleton()
@injectable()
export class SocketService {
    private _io: SocketServer | null = null;

    initialize(httpServer: HttpServer) {
        this._io = new SocketServer(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        // Configure Redis Adapter for horizontal scaling
        const protocol = redisConfig.tls ? 'rediss' : 'redis';
        const clientOptions: any = {
            url: `${protocol}://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${redisConfig.port}`,
        };

        if (redisConfig.tls) {
            clientOptions.socket = {
                tls: true,
                rejectUnauthorized: false
            };
        }

        const pubClient = createClient(clientOptions);
        const subClient = pubClient.duplicate();

        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            this._io?.adapter(createAdapter(pubClient, subClient));
            console.log('🔄 Socket.IO Redis Adapter linked');
        }).catch(err => {
            console.error('🚨 Failed to connect Redis Adapter:', err);
        });

        this._io.on('connection', (socket) => {
            console.log('📱 New client connected:', socket.id);

            socket.on('joinTrip', (tripId: string) => {
                socket.join(tripId);
                console.log(`📡 Client ${socket.id} joined trip room: ${tripId}`);
            });

            socket.on('locationUpdate', async (data: { tripId: string, point: any }) => {
                const { tripId, point } = data;
                console.log(`📥 Received live point for trip ${tripId}`);

                // Add to queue for processing and broadcasting
                const queueService = container.resolve<IGPSQueueService>('IGPSQueueService');
                await queueService.addGPSJob(tripId, point);
            });

            socket.on('disconnect', () => {
                console.log('❌ Client disconnected:', socket.id);
            });
        });

        console.log('📡 WebSocket server initialized');
    }

    get io(): SocketServer {
        if (!this._io) {
            throw new Error('Socket.io not initialized. Call initialize() first.');
        }
        return this._io;
    }

    emitToRoom(room: string, event: string, data: any) {
        if (this._io) {
            console.log(`[SocketService] Emitting ${event} to room ${room}`);
            // Emit to the specific room
            this._io.to(room).emit(event, data);
            // ALSO emit globally as a fallback test
            this._io.emit(event, data);
        } else {
            console.error('🚨 [SocketService] CRITICAL ERROR: _io is NULL during emitToRoom!');
        }
    }
}
