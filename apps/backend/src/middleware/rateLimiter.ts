import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../lib/redis.js';
import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════════
// Rate Limiters
// All backed by Redis for cross-instance persistence
// Returns X-RateLimit-* headers on every response
// ═══════════════════════════════════════════════════════════════

function createRedisStore(prefix: string) {
  return new RedisStore({
    // Using ioredis sendCommand, defer getRedis() to inside sendCommand
    sendCommand: (...args: string[]) => {
      const redis = getRedis();
      return redis.call(args[0]!, ...args.slice(1)) as any;
    },
    prefix: `rl:${prefix}:`,
  });
}

/**
 * Global rate limiter: 1000 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MS,
  max: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: true,   // Return `X-RateLimit-*` headers
  store: createRedisStore('global'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * Auth rate limiter: 20 requests per 15 minutes per IP
 */
export const authLimiter = env.NODE_ENV === 'development'
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
    windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
    max: env.RATE_LIMIT_AUTH_MAX,
    standardHeaders: true,
    legacyHeaders: true,
    store: createRedisStore('auth'),
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many authentication attempts. Please try again later.',
      },
    },
  });

/**
 * PDF generation rate limiter: 50 per hour per business
 */
export const pdfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req) => req.auth?.businessId || req.ip || 'unknown',
  store: createRedisStore('pdf'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'PDF generation limit exceeded. Please try again later.',
    },
  },
});

/**
 * WhatsApp send rate limiter: 100 per hour per business
 */
export const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req) => req.auth?.businessId || req.ip || 'unknown',
  store: createRedisStore('whatsapp'),
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'WhatsApp message limit exceeded. Please try again later.',
    },
  },
});
