import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Global Error Handler
// Catches all unhandled errors, returns consistent JSON format
// Never exposes stack traces in production
// ═══════════════════════════════════════════════════════════════

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Common error factories
export const Errors = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(message, 400, 'BAD_REQUEST', details),
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),
  tooManyRequests: (message = 'Too many requests') =>
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  internal: (message = 'Internal server error') =>
    new AppError(message, 500, 'INTERNAL_ERROR', undefined, false),
};

export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError' && (err as Record<string, unknown>).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with this value already exists';
  }

  // Log the error
  const logPayload = {
    statusCode,
    code,
    requestId: req.id,
    businessId: req.auth?.businessId,
    userId: req.auth?.userId,
    method: req.method,
    path: req.path,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    logger.error(`${message}`, logPayload);
  } else {
    logger.warn(`${message}`, logPayload);
  }

  // Build response — never expose stack traces in production
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
}
