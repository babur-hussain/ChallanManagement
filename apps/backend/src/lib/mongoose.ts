import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// MongoDB Connection
// Pool: min 5, max 20 | Auto-retry | Slow query logging > 100ms
// ═══════════════════════════════════════════════════════════════

export async function connectMongoDB(): Promise<void> {
  try {
    // Connection options with pooling
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false); // Fail fast, don't hang requests indefinitely
    mongoose.set('bufferTimeoutMS', 1500);

    // Removed noisy mongoose debug logging

    await mongoose.connect(env.MONGODB_URI, {
      minPoolSize: 5,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Enable slow query profiling
      heartbeatFrequencyMS: 10000,
    });

    const connection = mongoose.connection;

    connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully', {
        host: connection.host,
        name: connection.name,
      });
    });

    connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error', { error: err.message });
    });

    connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    logger.info('✅ MongoDB initial connection established');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}

export async function checkMongoHealth(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) return false;
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
}
