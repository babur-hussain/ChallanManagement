import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * A stub handleRequest wrapper for the dummy endpoints created during the vertical OS mockups.
 * This satisfies the Express router contract and handles any unexpected async errors.
 */
export const handleRequest = (handler: AsyncHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await handler(req, res, next);
            if (!res.headersSent) {
                res.status(200).json({ success: true, data: result });
            }
        } catch (error) {
            next(error);
        }
    };
};
