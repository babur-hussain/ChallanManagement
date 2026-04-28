import { Partner } from '../models/Partner.js';

export class PartnerService {

    /**
     * Called whenever a client upgrades their subscription, adding MRR to the referring partner
     */
    static async attributeCommission(partnerCode: string, subAmount: number) {
        const partner = await Partner.findOne({ partnerCode, isActive: true });
        if (!partner) return; // No partner loop

        if (partner.commissionType === 'PERCENTAGE_MRR') {
            const mrrShare = (subAmount * partner.commissionRate) / 100;
            partner.pendingPayout += mrrShare;
            partner.monthlyMRRGenerated += subAmount;
            await partner.save();
        }
    }

    static async onboardClientRegistration(partnerCode: string) {
        await Partner.findOneAndUpdate(
            { partnerCode },
            { $inc: { activeClientsCount: 1 } }
        );
    }
}
