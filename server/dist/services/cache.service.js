"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis_config_1 = require("../shared/config/redis.config");
const tsyringe_1 = require("tsyringe");
let RedisCacheService = class RedisCacheService {
    constructor() {
        this.redis = null;
        this.memoryCache = new Map();
        this.useMemoryOnly = false;
        try {
            this.redis = new ioredis_1.default({
                host: redis_config_1.redisConfig.host,
                port: redis_config_1.redisConfig.port,
                password: redis_config_1.redisConfig.password,
                tls: redis_config_1.redisConfig.tls ? {} : undefined,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.warn('⚠️ Redis connection failed multiple times. Falling back to in-memory cache.');
                        this.useMemoryOnly = true;
                        return null; // Stop retrying
                    }
                    return Math.min(times * 100, 3000);
                }
            });
            this.redis.on('connect', () => {
                console.log('🚀 Redis Cache Service Connected');
                this.useMemoryOnly = false;
            });
            this.redis.on('error', (err) => {
                console.warn('🚨 Redis Cache Error:', err.message);
                this.useMemoryOnly = true;
            });
        }
        catch (e) {
            console.error('Failed to initialize Redis:', e);
            this.useMemoryOnly = true;
        }
    }
    async set(key, value, ttlSeconds) {
        const stringValue = JSON.stringify(value);
        // 1. Try Memory (Always update memory as second-level cache or fallback)
        const expires = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.memoryCache.set(key, { value: stringValue, expires });
        // 2. Try Redis if available
        if (this.redis && !this.useMemoryOnly) {
            try {
                if (ttlSeconds) {
                    await this.redis.setex(key, ttlSeconds, stringValue);
                }
                else {
                    await this.redis.set(key, stringValue);
                }
            }
            catch (e) {
                console.warn('Redis SET failed, using memory fallback');
            }
        }
    }
    async get(key) {
        let data = null;
        // 1. Try Redis first if available
        if (this.redis && !this.useMemoryOnly) {
            try {
                data = await this.redis.get(key);
            }
            catch (e) {
                console.warn('Redis GET failed, trying memory');
            }
        }
        // 2. Try Memory fallback
        if (!data) {
            const entry = this.memoryCache.get(key);
            if (entry) {
                if (entry.expires && entry.expires < Date.now()) {
                    this.memoryCache.delete(key);
                }
                else {
                    data = entry.value;
                }
            }
        }
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
    async del(key) {
        this.memoryCache.delete(key);
        if (this.redis && !this.useMemoryOnly) {
            try {
                await this.redis.del(key);
            }
            catch (e) {
                // Silently fail
            }
        }
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], RedisCacheService);
