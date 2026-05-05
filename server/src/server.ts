import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnv = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`❌ CRITICAL ERROR: Environment variable ${env} is missing!`);
    process.exit(1);
  }
});

import dns from 'dns';

// Force use of Google DNS to bypass local SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { container } from './di/container';
import app from './app';
import { connectDB } from './shared/config/db';
import { createServer } from 'http';
import { SocketService } from './services/socket.service';
import { GPSWorker } from './workers/gps.worker';

const PORT = process.env.PORT || 7000;
const httpServer = createServer(app);

// Initialize Socket.IO via SocketService
const socketService = container.resolve<SocketService>('SocketService');
socketService.initialize(httpServer);

// Initialize GPS Worker (BullMQ Consumer)
container.resolve<GPSWorker>(GPSWorker);

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer(); 