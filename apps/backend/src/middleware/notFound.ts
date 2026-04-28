import { Request, Response } from 'express';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// 404 Handler — catches all unmatched routes
// ═══════════════════════════════════════════════════════════════

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  };
  res.status(404).json(response);
}
