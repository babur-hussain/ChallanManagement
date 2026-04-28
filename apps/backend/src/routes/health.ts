import { Router, Request, Response } from 'express';
import { checkMongoHealth } from '../lib/mongoose.js';
import { checkRedisHealth } from '../lib/redis.js';
import { checkFirebaseHealth } from '../lib/firebase.js';
import { checkS3Health } from '../lib/s3.js';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Health Check Routes
// GET /api/health — returns status of all service connections
// ═══════════════════════════════════════════════════════════════

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const [mongo, redis, firebase, s3] = await Promise.allSettled([
    checkMongoHealth(),
    checkRedisHealth(),
    checkFirebaseHealth(),
    checkS3Health(),
  ]);

  const services = {
    mongodb: mongo.status === 'fulfilled' && mongo.value,
    redis: redis.status === 'fulfilled' && redis.value,
    firebase: firebase.status === 'fulfilled' && firebase.value,
    s3: s3.status === 'fulfilled' && s3.value,
  };

  const allHealthy = Object.values(services).every(Boolean);

  const response: ApiResponse = {
    success: allHealthy,
    data: {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    },
  };

  res.status(allHealthy ? 200 : 503).json(response);
});

export default router;
