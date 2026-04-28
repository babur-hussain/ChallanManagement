import { MarketplaceListing } from '../models/MarketplaceListing.js';
import { PublicBusinessProfile } from '../models/PublicBusinessProfile.js';
import { logger } from '../lib/logger.js';

export class MarketplaceSearchService {

    /**
     * Search marketplace listings
     */
    static async searchListings(filters: any, sortStr: string = 'trusted') {
        const query: any = { active: true };

        if (filters.query) {
            query.$text = { $search: filters.query };
        }
        if (filters.category) query.category = filters.category;
        if (filters.moqMax) query.MOQ = { $lte: Number(filters.moqMax) };
        if (filters.readyStock) query.stockStatus = 'IN_STOCK';
        if (filters.priceMax) {
            query.$or = [
                { priceTo: { $lte: Number(filters.priceMax) } },
                { priceFrom: { $lte: Number(filters.priceMax) } }
            ];
        }

        let sort: any = { createdAt: -1 };
        if (sortStr === 'newest') sort = { createdAt: -1 };
        else if (sortStr === 'best_match' && filters.query) sort = { score: { $meta: 'textScore' } };
        else if (sortStr === 'most_viewed') sort = { views: -1 };

        let listings = await MarketplaceListing.find(query)
            .sort(sort)
            .limit(50)
            .populate('businessId', 'name')
            .lean();

        // Attach trust score to results
        const businessIds = [...new Set(listings.map((l: any) => l.businessId._id.toString()))];
        const profiles = await PublicBusinessProfile.find({ businessId: { $in: businessIds } }).lean();
        const profileMap = new Map(profiles.map((p: any) => [p.businessId.toString(), p]));

        const profileRefs = new Map<string, any>();
        listings = listings.map((l: any) => {
            const p: any = profileMap.get(l.businessId._id.toString());
            profileRefs.set(l._id.toString(), p);
            // Inject business profile metadata onto the listing object
            return {
                ...l,
                trustScore: p?.trustScore || 0,
                badges: p?.badges || [],
                businessCity: p?.city
            };
        });

        // ─── Network Visibility Enforcement Laws ───
        listings = listings.filter((l: any) => {
            const p = profileRefs.get(l._id.toString());
            if (!p) return false; // Hard block orphaned listings
            if (p.isActiveInMarketplace === false) return false; // General kill switch
            if (p.businessVisibility === 'private') return false; // Extreme stealth mode
            if (p.catalogVisibility === 'hidden') return false; // Hidden catalog mode
            return true;
        });

        // Handle sorts that require populated profile data
        if (sortStr === 'trusted') {
            listings.sort((a: any, b: any) => b.trustScore - a.trustScore);
        }

        // Filter out if city filter applied
        if (filters.city) {
            listings = listings.filter((l: any) => l.businessCity?.toLowerCase() === filters.city.toLowerCase());
        }

        return listings;
    }
}
