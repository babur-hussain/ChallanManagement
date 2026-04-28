import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { DeveloperService } from '../services/developer.service.js';
import { Invoice } from '../models/Invoice.js';
import { Document as ChallanModel } from '../models/Document.js';
import { AppError } from '../lib/errors.js';

export const publicV1Router = Router();

// Middleware: API Key Authentication
publicV1Router.use(async (req, res, next) => {
    const apiKeyRaw = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKeyRaw || typeof apiKeyRaw !== 'string') {
        return next(new AppError('Unauthorized: Missing x-api-key header', 401));
    }

    const keyDoc = await DeveloperService.validateKey(apiKeyRaw);
    if (!keyDoc) {
        return next(new AppError('Unauthorized: Invalid or revoked API Key', 401));
    }

    // Attach business context
    req.auth = {
        userId: 'API_KEY_CALLER',
        businessId: keyDoc.businessId,
        role: 'OWNER', // Grants read/write to its own business
        permissions: keyDoc.scopes // Using scopes directly 
    };

    next();
});

// Helper for Scopes
const requireScope = (scope: string) => {
    return (req: any, res: any, next: any) => {
        if (!req.auth?.permissions?.includes(scope)) {
            return next(new AppError(`Forbidden: Missing required scope: ${scope}`, 403));
        }
        next();
    }
}

// ─── ENDPOINTS ──────────────────────────────────────────────────

publicV1Router.get('/invoices', requireScope('read:invoices'), handleRequest(async (req) => {
    // Return all invoices for this business (paginated in real implementation)
    const limit = Number(req.query.limit) || 50;
    return await Invoice.find({ businessId: req.auth!.businessId }).limit(limit).lean();
}));

publicV1Router.get('/challans', requireScope('read:challans'), handleRequest(async (req) => {
    const limit = Number(req.query.limit) || 50;
    return await ChallanModel.find({ businessId: req.auth!.businessId, type: 'DELIVERY_CHALLAN' }).limit(limit).lean();
}));
