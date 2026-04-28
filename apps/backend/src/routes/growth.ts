import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate, restrictToRole } from '../middleware/auth.js';
import { PlatformLead } from '../models/PlatformLead.js';
import { GrowthService } from '../services/growth.service.js';

export const growthRouter = Router();

// ─── PUBLIC LEAD INGESTION (Webhooks & Ads) ─────────────

growthRouter.post('/leads/capture', handleRequest(async (req) => {
    // Auto deduplicate by phone
    const existing = await PlatformLead.findOne({ phone: req.body.phone });
    if (existing) {
        return { message: 'Updated existing lead', lead: existing };
    }

    // Auto assignment logic could be added here
    const lead = new PlatformLead({
        ...req.body,
        stage: 'LEAD',
        demoScore: 'MEDIUM'
    });
    await lead.save();
    return { message: 'Lead captured successfully', lead };
}));


// ─── INTERNAL FOUNDER DASHBOARD ROUTES ──────────────────

growthRouter.use(authenticate);
growthRouter.use(restrictToRole(['OWNER', 'REGIONAL_MANAGER']));

growthRouter.get('/dashboard', handleRequest(async (req) => {
    return await GrowthService.getDailyHypergrowthMetrics();
}));

growthRouter.get('/cities/leaderboard', handleRequest(async (req) => {
    return await GrowthService.getCityExpansionLeaderboard();
}));

growthRouter.get('/pipeline', handleRequest(async (req) => {
    const leads = await PlatformLead.find().sort('-createdAt').limit(200);

    // Group them for Kanban Web UI
    const pipeline = {
        LEAD: leads.filter(l => l.stage === 'LEAD'),
        DEMO_BOOKED: leads.filter(l => l.stage === 'DEMO_BOOKED'),
        TRIAL_STARTED: leads.filter(l => l.stage === 'TRIAL_STARTED'),
        NEGOTIATION: leads.filter(l => l.stage === 'NEGOTIATION'),
        WON: leads.filter(l => l.stage === 'WON'),
        LOST: leads.filter(l => l.stage === 'LOST'),
    };

    return pipeline;
}));

// Quick API for the Founder Mobile App to approve 20% discounts
growthRouter.post('/pipeline/:id/approve-discount', handleRequest(async (req) => {
    const lead = await PlatformLead.findById(req.params.id);
    if (!lead) throw new Error('Lead not found');

    lead.objectionsTracker.push('DISCOUNT_APPROVED_BY_FOUNDER');
    await lead.save();

    return { success: true };
}));
