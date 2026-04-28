import { MarketplaceListing } from '../models/MarketplaceListing.js';
import { Inquiry } from '../models/Inquiry.js';
import { logger } from '../lib/logger.js';

export class MarketplaceAutomationService {

    /**
     * Recommend better pricing on high-view/low-inquiry listings
     * Runs via cron daily
     */
    static async analyzeListingPerformance() {
        const poorPerformers = await MarketplaceListing.find({
            views: { $gt: 50 },
            inquiries: { $lt: 2 },
            active: true
        });

        for (const listing of poorPerformers) {
            logger.info(`[Automation] Recommendation for ${listing.title} (${listing.businessId}): High views but no inquiries. Consider adding a video or optimizing price.`);
            // In real app: create a notification model entry
        }
    }

    /**
     * Alert seller on unanswered inquiry
     * Runs via cron hourly
     */
    static async alertUnansweredInquiries() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const neglected = await Inquiry.find({
            status: 'NEW',
            createdAt: { $lte: oneHourAgo }
        });

        for (const inquiry of neglected) {
            logger.warn(`[Automation] Alert to Seller ${inquiry.sellerBusinessId}: Pending inquiry from ${inquiry.buyerBusinessId} needs attention!`);
            // In real app: Push Notification / WhatsApp Ping
        }
    }

}
