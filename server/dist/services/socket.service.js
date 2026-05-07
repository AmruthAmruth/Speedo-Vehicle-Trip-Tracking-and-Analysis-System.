"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const redis_config_1 = require("../shared/config/redis.config");
const tsyringe_1 = require("tsyringe");
const container_1 = require("../di/container");
let SocketService = class SocketService {
    constructor() {
        this._io = null;
    }
    initialize(httpServer) {
        this._io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        // Configure Redis Adapter for horizontal scaling
        const protocol = redis_config_1.redisConfig.tls ? 'rediss' : 'redis';
        const clientOptions = {
            url: `${protocol}://${redis_config_1.redisConfig.password ? `:${redis_config_1.redisConfig.password}@` : ''}${redis_config_1.redisConfig.host}:${redis_config_1.redisConfig.port}`,
        };
        if (redis_config_1.redisConfig.tls) {
            clientOptions.socket = {
                tls: true,
                rejectUnauthorized: false
            };
        }
        const pubClient = (0, redis_1.createClient)(clientOptions);
        const subClient = pubClient.duplicate();
        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            this._io?.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            console.log('🔄 Socket.IO Redis Adapter linked');
        }).catch(err => {
            console.error('🚨 Failed to connect Redis Adapter:', err);
        });
        this._io.on('connection', (socket) => {
            console.log('📱 New client connected:', socket.id);
            socket.on('joinTrip', (tripId) => {
                socket.join(tripId);
                console.log(`📡 Client ${socket.id} joined trip room: ${tripId}`);
            });
            socket.on('locationUpdate', async (data) => {
                const { tripId, point } = data;
                console.log(`📥 Received live point for trip ${tripId}`);
                // Add to queue for processing and broadcasting
                const queueService = container_1.container.resolve('IGPSQueueService');
                await queueService.addGPSJob(tripId, point);
            });
            socket.on('disconnect', () => {
                console.log('❌ Client disconnected:', socket.id);
            });
        });
        console.log('📡 WebSocket server initialized');
    }
    get io() {
        if (!this._io) {
            throw new Error('Socket.io not initialized. Call initialize() first.');
        }
        return this._io;
    }
    emitToRoom(room, event, data) {
        if (this._io) {
            console.log(`[SocketService] Emitting ${event} to room ${room}`);
            // Emit to the specific room
            this._io.to(room).emit(event, data);
            // ALSO emit globally as a fallback test
            this._io.emit(event, data);
        }
        else {
            console.error('🚨 [SocketService] CRITICAL ERROR: _io is NULL during emitToRoom!');
        }
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)()
], SocketService);
