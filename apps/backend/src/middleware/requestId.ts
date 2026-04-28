import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════════════════════════
// Request ID Middleware
// Assigns a unique UUID v4 to every incoming request
// ═══════════════════════════════════════════════════════════════

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'] as string | undefined;
  req.id = existingId || uuidv4();
  _res.setHeader('X-Request-Id', req.id);
  next();
}
