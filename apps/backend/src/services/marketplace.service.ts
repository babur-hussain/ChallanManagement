import { PublicBusinessProfile } from '../models/PublicBusinessProfile.js';
import { MarketplaceListing } from '../models/MarketplaceListing.js';
import { Inquiry } from '../models/Inquiry.js';
import { TrustService } from './trust.service.js';

export class MarketplaceService {
    // Toggle profile visibility
    static async toggleVisibility(businessId: string, isActive: boolean) {
        const profile = await PublicBusinessProfile.findOneAndUpdate(
            { businessId },
            { isActiveInMarketplace: isActive },
            { new: true, upsert: true } // Creates placeholder if missing
        );
        return profile;
    }

    // Update profile
    static async updateProfile(businessId: string, data: any) {
        const profile = await PublicBusinessProfile.findOneAndUpdate(
            { businessId },
            { $set: data },
            { new: true, upsert: true }
        );
        // Recalculate trust async
        TrustService.recalculateTrustScore(businessId).catch(() => { });
        return profile;
    }

    // Create Listing
    static async createListing(businessId: string, data: any) {
        const count = await MarketplaceListing.countDocuments({ businessId });
        const listing = await MarketplaceListing.create({
            ...data,
            businessId,
            listingNumber: `LST-${Date.now().toString().slice(-6)}-${count + 1}`,
        });
        return listing;
    }

    // Submit Inquiry
    static async submitInquiry(buyerBusinessId: string, payload: any) {
        const inquiry = await Inquiry.create({
            buyerBusinessId,
            sellerBusinessId: payload.sellerBusinessId,
            listingId: payload.listingId,
            quantityNeeded: payload.quantityNeeded,
            targetRate: payload.targetRate,
            city: payload.city,
            notes: payload.notes,
            status: 'NEW',
        });

        if (payload.listingId) {
            await MarketplaceListing.findByIdAndUpdate(payload.listingId, { $inc: { inquiries: 1 } });
        }

        return inquiry;
    }
}
