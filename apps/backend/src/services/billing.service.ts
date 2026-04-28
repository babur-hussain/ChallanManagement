import { Subscription } from '../models/Subscription.js';
import { logger } from '../lib/logger.js';

export class BillingService {

    /**
     * Called via Payment Gateway Webhook (Razorpay/Stripe)
     */
    static async handleSuccessfulPayment(businessId: string, plan: 'STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE', amountPaid: number, cycle: 'MONTHLY' | 'YEARLY') {
        let sub = await Subscription.findOne({ businessId });

        if (!sub) {
            sub = new Subscription({ businessId });
        }

        sub.currentPlan = plan;
        sub.status = 'ACTIVE';
        sub.amount = amountPaid;
        sub.billingCycle = cycle;
        sub.startDate = new Date();

        // Set renewal
        const nextDate = new Date();
        if (cycle === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
        else nextDate.setFullYear(nextDate.getFullYear() + 1);

        sub.renewalDate = nextDate;

        // Allocate resources
        sub.seatsAllowed = plan === 'STARTER' ? 2 : plan === 'GROWTH' ? 5 : plan === 'PRO' ? 15 : 999;
        sub.aiCredits = plan === 'PRO' || plan === 'ENTERPRISE' ? 1000 : 0;
        sub.whatsappCredits = plan === 'GROWTH' ? 500 : plan === 'PRO' ? 2000 : 0;

        await sub.save();
        logger.info(`Subscription upgraded for ${businessId} to ${plan}`);
        return sub;
    }

    /**
     * Daily cron logic for Dunning / Suspensions
     */
    static async runDailyBillingChecks() {
        const today = new Date();
        // Suspend expired active plans
        await Subscription.updateMany(
            { status: 'ACTIVE', renewalDate: { $lt: today }, autoRenew: false },
            { $set: { status: 'EXPIRED' } }
        );
        // Mark as PAST_DUE if auto renew failed 
        // In real env, this triggers emails "Payment Failed - Card Expired"
    }
}
