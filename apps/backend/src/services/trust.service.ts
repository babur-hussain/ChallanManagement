import { PublicBusinessProfile } from '../models/PublicBusinessProfile.js';
import { Inquiry } from '../models/Inquiry.js';
import mongoose from 'mongoose';

export class TrustService {
    /**
     * Recalculates the Trust Score for a business based on:
     * Verification, Platform Usage, Dispute History
     */
    static async recalculateTrustScore(businessId: string) {
        const profile = await PublicBusinessProfile.findOne({ businessId });
        if (!profile) return 0;

        let score = 0;
        const badges = new Set<string>();

        // 1. Core Profile Verifications (Max 40)
        if (profile.isVerified) {
            score += 20;
            badges.add('Verified');
        }
        if (profile.gstVerified) {
            score += 10;
            badges.add('GST Verified');
        }
        if (profile.yearsInBusiness > 5) score += 10;

        // 2. Platform Usage & Inquiries (Max 60)
        const stats: any[] = await Inquiry.aggregate([
            { $match: { sellerBusinessId: new mongoose.Types.ObjectId(businessId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    won: { $sum: { $cond: [{ $eq: ['$status', 'WON'] }, 1, 0] } },
                    responded: { $sum: { $cond: [{ $in: ['$status', ['RESPONDED', 'NEGOTIATING', 'WON']] }, 1, 0] } }
                }
            }
        ]);

        const stat = stats[0] || { total: 0, won: 0, responded: 0 };

        if (stat.total > 0) {
            const responseRate = stat.responded / stat.total;
            score += Math.min(30, responseRate * 30);
            if (responseRate > 0.9) badges.add('Fast Responder');

            const conversionRate = stat.won / stat.total;
            score += Math.min(30, conversionRate * 80); // higher weight on won conversions

            if (stat.won > 50) badges.add('Top Supplier');
        }

        // Assign final score & badges
        profile.trustScore = Math.floor(Math.min(100, Math.max(0, score)));
        if (profile.businessType === 'MANUFACTURER' || profile.businessType === 'MILL') badges.add('Direct Manufacturer');

        // Add Export Ready if dealing internationally
        if (profile.shippingRegions.includes('International')) badges.add('Export Ready');

        profile.badges = Array.from(badges);
        await profile.save();

        return profile.trustScore;
    }
}
