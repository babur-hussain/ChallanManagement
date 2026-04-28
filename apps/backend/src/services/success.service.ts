import { Subscription } from '../models/Subscription.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { User } from '../models/User.js';
import { Invoice } from '../models/Invoice.js';
import { Document as ChallanModel } from '../models/Document.js';
import { Business } from '../models/Business.js';

export class CustomerSuccessService {

    /**
     * Calculates a live health score indicating churn risk
     */
    static async evaluateHealthScore(businessId: string) {
        let score = 100;

        // 1. Check if they have open critical tickets
        const openIssues = await SupportTicket.countDocuments({ businessId, priority: { $in: ['HIGH', 'CRITICAL'] }, status: 'OPEN' });
        score -= (openIssues * 15);

        // 2. Check billing status
        const sub = await Subscription.findOne({ businessId });
        if (sub?.status === 'PAST_DUE') score -= 30;

        // 3. (Mock) Login frequency: if nobody from business logged in > 3 days, -10 points

        return {
            businessId,
            score: Math.max(0, score),
            state: score > 80 ? 'HEALTHY' : score > 50 ? 'AT_RISK' : 'CHURN_RISK',
            negativeSignals: openIssues > 0 ? [`${openIssues} unresolved critical tickets`] : []
        };
    }

    /**
     * Generates a Boolean flag asserting whether this business achieved 
     * its "AHA" moment (First value point within 24 hours of signup).
     */
    static async verifyOnboardingVelocity(businessId: string): Promise<boolean> {
        const business = await Business.findById(businessId);
        if (!business) return false;

        const hasInvoices = await Invoice.exists({ businessId });
        const hasChallan = await ChallanModel.exists({ businessId });

        // AHA Moment = They created an invoice or challan.
        if (hasInvoices || hasChallan) {
            return true;
        }

        // If older than 24 hours without value - Trigger retention engine
        const ageHours = (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60);
        if (ageHours > 24) {
            console.warn(`[RETENTION ENGINE] Business ${businessId} has not activated after 24h. Signaling success rep!`);
        }

        return false;
    }
}
