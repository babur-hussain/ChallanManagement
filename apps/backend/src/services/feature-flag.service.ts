import { FeatureFlag } from '../models/FeatureFlag.js';
import { Subscription } from '../models/Subscription.js';
import mongoose from 'mongoose';

export class FeatureFlagService {
    /**
     * Determine if a specific business/user should have access to an experimental feature
     */
    static async isEnabled(key: string, businessId: string): Promise<boolean> {
        const flag = await FeatureFlag.findOne({ key: key.toUpperCase() });

        if (!flag || !flag.isActive) return false;

        // 1. Direct Business Targeting (e.g., enable for specific beta testers)
        if (flag.targetedBusinesses && flag.targetedBusinesses.length > 0) {
            if (flag.targetedBusinesses.some(id => id.toString() === businessId)) return true;
        }

        // 2. Plan Level Scoping (e.g., roll out only to ENTERPRISE)
        if (flag.targetedPlans && flag.targetedPlans.length > 0) {
            const sub = await Subscription.findOne({ businessId });
            if (sub && flag.targetedPlans.includes(sub.currentPlan)) return true;
        }

        // 3. Percentage Rollout (e.g., 20% of users get the new UI)
        if (flag.rolloutPercentage > 0) {
            // Predictable pseudo-random distribution based on BusinessID
            const hash = this.hashString(businessId + key);
            if ((hash % 100) < flag.rolloutPercentage) return true;
        }

        return false;
    }

    private static hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    }
}
