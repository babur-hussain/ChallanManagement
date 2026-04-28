import { Queue } from 'bullmq';
import { getRedis } from './redis.js';

// Setup connection config reusing our existing ioredis client
const connection = getRedis();

// Queues
export const pdfQueue = new Queue('pdf-generation', { connection });
export const whatsappQueue = new Queue('whatsapp-messaging', { connection });
export const stockSyncQueue = new Queue('stock-sync', { connection });
export const automationQueue = new Queue('crm-automation', { connection });

console.log('📦 Background queues initialized');
