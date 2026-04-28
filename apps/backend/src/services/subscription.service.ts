import { Subscription } from '../models/Subscription.js';
import { PublicBusinessProfile } from '../models/PublicBusinessProfile.js';

export class SubscriptionService {
    /**
     * Ensure business has access to feature based on plan
     */
    static async checkFeatureAccess(businessId: string, featureKey: 'canUseMarketplace' | 'canViewBulkLeads' | 'apiAccess') {
        let sub = await Subscription.findOne({ businessId });
        if (!sub) {
            sub = await Subscription.create({ businessId, plan: 'FREE' });
        }

        if (sub.status !== 'ACTIVE') {
            return false;
        }

        return sub.features[featureKey] === true;
    }

    /**
     * Premium gate for bulk leads
     */
    static async getBulkBuyerLeads(businessId: string) {
        const hasAccess = await this.checkFeatureAccess(businessId, 'canViewBulkLeads');
        if (!hasAccess) {
            throw new Error('Upgrade to PREMIUM required to view Bulk Buyer Leads.');
        }

        // Return dummy premium leads
        return await PublicBusinessProfile.find({
            businessType: { $in: ['RETAILER', 'WHOLESALER'] }
        }).limit(100).lean();
    }
}
