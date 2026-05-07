"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate required environment variables
const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
requiredEnv.forEach((env) => {
    if (!process.env[env]) {
        console.error(`❌ CRITICAL ERROR: Environment variable ${env} is missing!`);
        process.exit(1);
    }
});
const dns_1 = __importDefault(require("dns"));
// Force use of Google DNS to bypass local SRV resolution issues
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const container_1 = require("./di/container");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./shared/config/db");
const http_1 = require("http");
const gps_worker_1 = require("./workers/gps.worker");
const PORT = process.env.PORT || 7000;
const httpServer = (0, http_1.createServer)(app_1.default);
// Initialize Socket.IO via SocketService
const socketService = container_1.container.resolve('SocketService');
socketService.initialize(httpServer);
// Initialize GPS Worker (BullMQ Consumer)
container_1.container.resolve(gps_worker_1.GPSWorker);
const startServer = async () => {
    await (0, db_1.connectDB)();
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
};
startServer();
