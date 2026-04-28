import type { IAuthPayload } from '@textilepro/shared';

declare global {
  namespace Express {
    interface Request {
      /** Unique request ID (UUID v4) */
      id: string;
      /** Authenticated user payload (set by auth middleware) */
      auth?: IAuthPayload;
    }
  }
}

export {};
