import Redis from 'ioredis';
import { redisConfig } from '../shared/config/redis.config';
import { ICacheService } from '../interfaces/ICacheService';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class RedisCacheService implements ICacheService {
    private redis: Redis | null = null;
    private memoryCache = new Map<string, { value: string; expires: number | null }>();
    private useMemoryOnly = false;

    constructor() {
        try {
            this.redis = new Redis({
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.password,
                tls: redisConfig.tls ? {} : undefined,
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
        } catch (e) {
            console.error('Failed to initialize Redis:', e);
            this.useMemoryOnly = true;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const stringValue = JSON.stringify(value);
        
        // 1. Try Memory (Always update memory as second-level cache or fallback)
        const expires = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.memoryCache.set(key, { value: stringValue, expires });

        // 2. Try Redis if available
        if (this.redis && !this.useMemoryOnly) {
            try {
                if (ttlSeconds) {
                    await this.redis.setex(key, ttlSeconds, stringValue);
                } else {
                    await this.redis.set(key, stringValue);
                }
            } catch (e) {
                console.warn('Redis SET failed, using memory fallback');
            }
        }
    }

    async get<T>(key: string): Promise<T | null> {
        let data: string | null = null;

        // 1. Try Redis first if available
        if (this.redis && !this.useMemoryOnly) {
            try {
                data = await this.redis.get(key);
            } catch (e) {
                console.warn('Redis GET failed, trying memory');
            }
        }

        // 2. Try Memory fallback
        if (!data) {
            const entry = this.memoryCache.get(key);
            if (entry) {
                if (entry.expires && entry.expires < Date.now()) {
                    this.memoryCache.delete(key);
                } else {
                    data = entry.value;
                }
            }
        }

        if (!data) return null;
        
        try {
            return JSON.parse(data) as T;
        } catch (e) {
            return data as unknown as T;
        }
    }

    async del(key: string): Promise<void> {
        this.memoryCache.delete(key);
        if (this.redis && !this.useMemoryOnly) {
            try {
                await this.redis.del(key);
            } catch (e) {
                // Silently fail
            }
        }
    }
}
