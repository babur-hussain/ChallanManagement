import http from 'http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { connectMongoDB, disconnectMongoDB } from './lib/mongoose.js';
import { createRedisClient, disconnectRedis } from './lib/redis.js';
import { initializeFirebase } from './lib/firebase.js';
import { createS3Client, ensureBucket } from './lib/s3.js';


// ═══════════════════════════════════════════════════════════════
// Server Bootstrap
// 1. Validate env  2. Connect DB  3. Connect Redis
// 4. Init Firebase  5. Init S3  6. Start Express
// 7. Graceful shutdown on SIGTERM/SIGINT
// ═══════════════════════════════════════════════════════════════

async function bootstrap(): Promise<void> {
  logger.info('🚀 Starting TextilePro API server...');
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Port: ${env.PORT}`);

  // 1. Connect to MongoDB
  logger.info('📦 Connecting to MongoDB...');
  await connectMongoDB();

  // 2. Connect to Redis
  logger.info('📦 Connecting to Redis...');
  const redis = createRedisClient();

  // 3. Initialize Firebase
  logger.info('🔥 Initializing Firebase...');
  initializeFirebase();

  // 4. Initialize S3
  logger.info('☁️ Initializing S3...');
  createS3Client();
  try {
    await ensureBucket();
  } catch (error) {
    logger.warn('⚠️ S3 bucket check failed (non-critical in dev)', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }

  // 5. Start Background Workers
  const { startWorkers } = await import('./workers/index.js');
  startWorkers();

  // ─── 4. REGISTER CRON JOBS ─────────────
  try {
    const { Queue } = await import('bullmq');

    // Register Low Stock Cron (every hour)
    const stockCronQueue = new Queue('stock-cron', { connection: redis });
    await stockCronQueue.add('check-low-stock', {}, {
      repeat: { pattern: '0 * * * *' } // Top of every hour
    });

    // Register Overdue Reminders (every day at 9 AM)
    const overdueCronQueue = new Queue('overdue-cron', { connection: redis });
    await overdueCronQueue.add('daily-reminders', {}, {
      repeat: { pattern: '0 9 * * *' }
    });

    logger.info('⏰ Repeatable Cron Jobs Registered (Stock, Reminders)');
  } catch (err: any) {
    logger.warn(`Failed to register Crons (Redis might be skipping): ${err.message}`);
  }

  // 5. Create and start Express
  const { createApp } = await import('./app.js');
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`✅ TextilePro API running on http://localhost:${env.PORT}`);
    logger.info(`   Health check: http://localhost:${env.PORT}/api/health`);
  });

  // 6. Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Disconnect all services
        await Promise.allSettled([
          disconnectMongoDB(),
          disconnectRedis(),
        ]);
        logger.info('All connections closed. Goodbye! 👋');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
        process.exit(1);
      }
    });

    // Force kill after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
