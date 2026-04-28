import { Router } from 'express';
import { getRedis } from '../lib/redis.js';
import { authenticate } from '../middleware/auth.js';
import { generateSystemQuote } from '../services/aiQuote.service.js';

export const systemRouter = Router();

systemRouter.get('/quote', authenticate, async (req, res) => {
    try {
        const businessId = req.auth?.businessId;
        const cacheKey = businessId ? `quote:biz:${businessId}` : 'global:hourly_quote';
        
        const redis = getRedis();
        let quote = await redis.get(cacheKey);
        
        if (!quote) {
            // Generate immediately for this specific client
            quote = await generateSystemQuote(businessId);
        }
        
        res.json({ success: true, data: { quote } });
    } catch (error) {
        res.json({ success: true, data: { quote: "Empowering your business journey today." } });
    }
});
