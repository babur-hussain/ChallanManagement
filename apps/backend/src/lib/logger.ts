import winston from 'winston';
import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════════
// Winston Logger
// JSON in production, pretty colors in development
// All logs include: timestamp, level, requestId, businessId, userId
// ═══════════════════════════════════════════════════════════════

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom format for development: colorful and readable
const devFormat = printf(({ level, message, timestamp, requestId, businessId, userId, ...meta }) => {
  const reqId = requestId ? `[${requestId}]` : '';
  const biz = businessId ? `[biz:${businessId}]` : '';
  const usr = userId ? `[usr:${userId}]` : '';
  const metaStr = Object.keys(meta).length > 0
    ? `\n  ${JSON.stringify(meta, null, 2)}`
    : '';
  return `${timestamp} ${level} ${reqId}${biz}${usr} ${message}${metaStr}`;
});

// Production format: structured JSON for log aggregation
const prodFormat = combine(
  timestamp({ format: 'ISO' }),
  errors({ stack: true }),
  json()
);

// Development format: colorful and human-readable
const developmentFormat = combine(
  timestamp({ format: 'HH:mm:ss.SSS' }),
  errors({ stack: true }),
  colorize({ all: true }),
  devFormat
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'textilepro-api' },
  format: env.NODE_ENV === 'production' ? prodFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Prevent unhandled exceptions from crashing the process
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
});

// Morgan stream adapter — pipes HTTP logs through Winston
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
