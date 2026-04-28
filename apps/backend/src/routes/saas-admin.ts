import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate, restrictToRole } from '../middleware/auth.js';
import { Subscription } from '../models/Subscription.js';
import { Partner } from '../models/Partner.js';
import { CustomerSuccessService } from '../services/success.service.js';

export const adminRouter = Router();

// Only Super Admins (Platform Owners) 
adminRouter.use(authenticate);
adminRouter.use(restrictToRole(['OWNER'])); // Represents SaaS Owner

// ─── SUBSCRIPTIONS & BILLING ─────────────────────────────────

adminRouter.get('/subscriptions', handleRequest(async (req) => {
    return await Subscription.find().populate('businessId', 'name email').sort('-createdAt');
}));

adminRouter.post('/subscriptions/:id/suspend', handleRequest(async (req) => {
    return await Subscription.findByIdAndUpdate(req.params.id, { status: 'PAST_DUE' }, { new: true });
}));

// ─── HIGH LEVEL METRICS ──────────────────────────────────────

adminRouter.get('/metrics', handleRequest(async (req) => {
    const totalMRR = await Subscription.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeClients = await Subscription.countDocuments({ status: 'ACTIVE' });
    const churnedClients = await Subscription.countDocuments({ status: { $in: ['CANCELLED', 'EXPIRED'] } });

    return {
        mrr: totalMRR[0]?.total || 0,
        activeClients,
        churnRate: churnedClients / (activeClients + churnedClients) * 100 || 0
    };
}));

// ─── CUSTOMER SUCCESS (CHURN RISK) ───────────────────────────

adminRouter.get('/health', handleRequest(async (req) => {
    const subs = await Subscription.find({ status: 'ACTIVE' });
    const scores = [];
    for (const sub of subs) {
        const health = await CustomerSuccessService.evaluateHealthScore(sub.businessId.toString());
        scores.push(health);
    }
    return scores.sort((a, b) => a.score - b.score); // Riskiest first
}));
