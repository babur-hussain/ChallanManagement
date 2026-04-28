import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate, restrictToRole } from '../middleware/auth.js';
import { TelemetryService } from '../services/telemetry.service.js';
import { FeatureFlag } from '../models/FeatureFlag.js';
import { PlatformEvent } from '../models/PlatformEvent.js';
import { SecurityIncident } from '../models/SecurityIncident.js';

export const opsRouter = Router();

// Highly Restricted to internal SaaS Operations Team
opsRouter.use(authenticate);
opsRouter.use(restrictToRole(['OWNER'])); // Founders / SuperAdmins only

// ─── TELEMETRY & INFRA ─────────────────────────────────

opsRouter.get('/health', handleRequest(async (req) => {
    return await TelemetryService.getSystemHealth();
}));

opsRouter.get('/realtime', handleRequest(async (req) => {
    return await TelemetryService.getRealTimeTraffic();
}));

// ─── FEATURE FLAGS ─────────────────────────────────────

opsRouter.get('/feature-flags', handleRequest(async (req) => {
    return await FeatureFlag.find().sort('-createdAt');
}));

opsRouter.post('/feature-flags', handleRequest(async (req) => {
    const flag = new FeatureFlag(req.body);
    await flag.save();
    return flag;
}));

opsRouter.put('/feature-flags/:id', handleRequest(async (req) => {
    return await FeatureFlag.findByIdAndUpdate(req.params.id, req.body, { new: true });
}));

// ─── SECURITY OPS ──────────────────────────────────────

opsRouter.get('/security/incidents', handleRequest(async (req) => {
    return await SecurityIncident.find({ isResolved: false }).populate('businessId userId', 'name email').sort('-createdAt');
}));

// ─── DATA PLATFORM ─────────────────────────────────────

opsRouter.get('/events', handleRequest(async (req) => {
    // Allows BI Analyst views
    const limit = Number(req.query.limit) || 100;
    return await PlatformEvent.find().sort('-createdAt').limit(limit).populate('businessId', 'name');
}));
