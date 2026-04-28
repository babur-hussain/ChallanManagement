import { Router } from 'express';
import { MarketplaceService } from '../services/marketplace.service.js';
import { MarketplaceSearchService } from '../services/marketplace-search.service.js';
import { DiscoveryService } from '../services/discovery.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = Router();

// Publicly accessible Search API
router.get('/listings/search', async (req, res) => {
    try {
        const filters = {
            query: req.query.query,
            category: req.query.category,
            moqMax: req.query.moqMax,
            city: req.query.city,
            priceMax: req.query.priceMax,
            readyStock: req.query.readyStock === 'true'
        };
        const sort = req.query.sort as string || 'trusted';
        const results = await MarketplaceSearchService.searchListings(filters, sort);
        res.json({ success: true, data: results });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Profile Management (Requires Auth)
router.use(authenticate, tenantIsolation);

router.post('/profile/toggle', async (req: any, res: any) => {
    try {
        const { isActive } = req.body;
        const profile = await MarketplaceService.toggleVisibility(req.businessId, isActive);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/profile', async (req: any, res: any) => {
    try {
        const profile = await MarketplaceService.updateProfile(req.businessId, req.body);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/listings', async (req: any, res: any) => {
    try {
        const listing = await MarketplaceService.createListing(req.businessId, req.body);
        res.json({ success: true, data: listing });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/inquiries', async (req: any, res: any) => {
    try {
        const inquiry = await MarketplaceService.submitInquiry(req.businessId, req.body);
        res.json({ success: true, data: inquiry });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/recommendations/buyers', async (req: any, res: any) => {
    try {
        const buyers = await DiscoveryService.recommendBuyers(req.businessId);
        res.json({ success: true, data: buyers });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
