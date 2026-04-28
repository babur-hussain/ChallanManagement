import { Request, Response, NextFunction } from 'express';

// In-memory cache store representation (can be swapped for Redis client)
const mockRedisCache = new Map<string, { value: any, expiresAt: number }>();

export const cacheMiddleware = (durationSeconds: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;
        const cached = mockRedisCache.get(key);

        if (cached && cached.expiresAt > Date.now()) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.value);
        }

        // Overwrite res.json to capture response
        const originalJson = res.json;
        res.json = (body: any): Response => {
            mockRedisCache.set(key, {
                value: body,
                expiresAt: Date.now() + (durationSeconds * 1000)
            });
            res.setHeader('X-Cache', 'MISS');
            return originalJson.call(res, body);
        };

        next();
    };
};
