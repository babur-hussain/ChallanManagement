import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { IntegrationConnection } from '../models/IntegrationConnection.js';
import { ApiKey } from '../models/ApiKey.js';
import { WebhookSubscription } from '../models/WebhookSubscription.js';
import { IntegrationsService } from '../services/integrations.service.js';
import { DeveloperService } from '../services/developer.service.js';

export const integrationsRouter = Router();

integrationsRouter.use(authenticate);

// ─── INTERNAL MARKETPLACE (MANAGING APPS) ─────────────────────────

integrationsRouter.get('/apps', handleRequest(async (req) => {
    return await IntegrationConnection.find({ businessId: req.auth!.businessId });
}));

integrationsRouter.post('/apps/:appName/connect', handleRequest(async (req) => {
    const { appName } = req.params;
    let conn = await IntegrationConnection.findOne({ businessId: req.auth!.businessId, appName });
    if (!conn) {
        conn = new IntegrationConnection({
            businessId: req.auth!.businessId,
            appName,
            status: 'CONNECTED',
            configOptions: req.body.config || {}
        });
    } else {
        conn.status = 'CONNECTED';
        conn.configOptions = { ...conn.configOptions, ...req.body.config };
    }
    await conn.save();
    return { success: true, app: conn };
}));

integrationsRouter.post('/apps/tally/sync', handleRequest(async (req) => {
    return await IntegrationsService.syncToTally(req.auth!.businessId, req.body.dummyData);
}));

// ─── DEVELOPER PORTAL (API KEYS) ──────────────────────────────────

integrationsRouter.get('/keys', handleRequest(async (req) => {
    return await ApiKey.find({ businessId: req.auth!.businessId }).select('-hashedKey');
}));

integrationsRouter.post('/keys', handleRequest(async (req) => {
    const { name, scopes } = req.body;
    // Will return the unhashed token once
    return await DeveloperService.generateKey(req.auth!.businessId, name, scopes);
}));

integrationsRouter.delete('/keys/:id', handleRequest(async (req) => {
    await ApiKey.findOneAndDelete({ _id: req.params.id, businessId: req.auth!.businessId });
    return { success: true };
}));

// ─── WEBHOOKS PORTAL ──────────────────────────────────────────────

integrationsRouter.get('/webhooks', handleRequest(async (req) => {
    return await WebhookSubscription.find({ businessId: req.auth!.businessId });
}));

integrationsRouter.post('/webhooks', handleRequest(async (req) => {
    const { targetUrl, events, secretToken } = req.body;
    const hook = new WebhookSubscription({
        businessId: req.auth!.businessId,
        targetUrl,
        events,
        secretToken
    });
    await hook.save();
    return { success: true, hook };
}));
