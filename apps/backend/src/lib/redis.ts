import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// Redis Connection
// Retry strategy: max 3 retries with exponential backoff
// ═══════════════════════════════════════════════════════════════

let redis: Redis | null = null;

export function createRedisClient(): Redis {
  if (redis) return redis;

  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 3) {
        logger.error('❌ Redis: max retries exceeded, giving up');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 500, 3000); // Exponential backoff, max 3s
      logger.warn(`⚠️ Redis: retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    lazyConnect: false,
    enableReadyCheck: true,
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redis.on('ready', () => {
    logger.info('✅ Redis ready to accept commands');
  });

  redis.on('error', (err) => {
    logger.error('❌ Redis error', { error: err.message });
  });

  redis.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
  });

  redis.on('reconnecting', () => {
    logger.info('🔄 Redis reconnecting...');
  });

  return redis;
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis client not initialized. Call createRedisClient() first.');
  }
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis disconnected gracefully');
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redis) return false;
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}
