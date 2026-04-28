import { PublicBusinessProfile } from '../models/PublicBusinessProfile.js';
import { MarketplaceListing } from '../models/MarketplaceListing.js';

export class DiscoveryService {
    /**
     * Recommend buyers likely to be interested in a supplier's catalog.
     */
    static async recommendBuyers(sellerBusinessId: string) {
        const profile = await PublicBusinessProfile.findOne({ businessId: sellerBusinessId }).lean();
        if (!profile) throw new Error('Seller profile not found');

        const specialties = profile.specialties || [];
        const fabrics = profile.fabricsDealtIn || [];

        const keywords = [...specialties, ...fabrics].map(k => k.toLowerCase());

        // Basic heuristic: find buyers whose search queries or profiles match the keywords
        // For now, querying Retailers, Traders in different cities matching fabrics
        const potentialBuyers = await PublicBusinessProfile.find({
            businessType: { $in: ['RETAILER', 'TRADER', 'WHOLESALER', 'EXPORTER'] },
            isActiveInMarketplace: true,
            businessId: { $ne: sellerBusinessId }
        }).limit(20).lean();

        return potentialBuyers.map((buyer: any) => {
            // Calculate overlap score
            const buyerFabrics = (buyer.fabricsDealtIn || []).map((f: string) => f.toLowerCase());
            const overlap = buyerFabrics.filter((f: string) => keywords.includes(f)).length;

            let demandScore = Math.min(100, Math.max(10, overlap * 25)); // Simple mock scoring

            return {
                _id: buyer._id,
                businessId: buyer.businessId,
                name: buyer.displayName,
                city: buyer.city,
                type: buyer.businessType,
                demandScore,
                matchReason: overlap > 0 ? `Matches ${overlap} fabrics in your catalog` : 'Active in your region'
            };
        }).sort((a, b) => b.demandScore - a.demandScore);
    }
}
