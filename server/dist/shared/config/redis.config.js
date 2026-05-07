"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
// If we are using Upstash or a managed Redis, we need TLS (SSL)
const useTls = process.env.REDIS_HOST && !process.env.REDIS_HOST.includes('127.0.0.1');
exports.redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: useTls ? {} : undefined, // Enable TLS for cloud providers like Upstash
    maxRetriesPerRequest: null, // Required by BullMQ
};
