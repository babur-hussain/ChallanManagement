import { Request, Response, NextFunction } from 'express';
import { Subscription } from '../models/Subscription.js';

export const requirePlan = (requiredPlan: 'GROWTH' | 'PRO' | 'ENTERPRISE') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const businessId = (req as any).businessId;
            if (!businessId) return res.status(400).json({ error: 'Business scope missing' });

            const sub = await Subscription.findOne({ businessId });
            if (!sub) return res.status(403).json({ error: 'No active subscription. Please upgrade to use this feature.' });

            if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') {
                return res.status(403).json({ error: `Subscription ${sub.status}. Please renew.` });
            }

            // Hierarchy: STARTER < GROWTH < PRO < ENTERPRISE
            const tiers = ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'];
            const userLevel = tiers.indexOf(sub.currentPlan);
            const reqLevel = tiers.indexOf(requiredPlan);

            if (userLevel < reqLevel) {
                return res.status(403).json({
                    error: `Feature Lock`,
                    message: `This feature requires the ${requiredPlan} plan. You are on ${sub.currentPlan}.`,
                    upgradeUrl: '/app/settings/billing'
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};
