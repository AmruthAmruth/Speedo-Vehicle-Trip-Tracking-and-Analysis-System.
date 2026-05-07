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
        this.redis = new ioredis_1.default({
            host: redis_config_1.redisConfig.host,
            port: redis_config_1.redisConfig.port,
            password: redis_config_1.redisConfig.password,
            tls: redis_config_1.redisConfig.tls ? {} : undefined,
        });
        this.redis.on('connect', () => {
            console.log('🚀 Redis Cache Service Connected');
        });
        this.redis.on('error', (err) => {
            console.error('🚨 Redis Cache Error:', err);
        });
    }
    async set(key, value, ttlSeconds) {
        const stringValue = JSON.stringify(value);
        if (ttlSeconds) {
            await this.redis.setex(key, ttlSeconds, stringValue);
        }
        else {
            await this.redis.set(key, stringValue);
        }
    }
    async get(key) {
        const data = await this.redis.get(key);
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
        await this.redis.del(key);
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], RedisCacheService);
