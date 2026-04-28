import { AiOrchestrator, PromptPayload } from './ai/AiOrchestrator.service.js';
import { getRedis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { Invoice } from '../models/Invoice.js';
import { StockSummary } from '../models/StockSummary.js';

export async function generateSystemQuote(businessId?: string): Promise<string> {
    try {
        const redis = getRedis();
        const cacheKey = businessId ? `quote:biz:${businessId}` : 'global:hourly_quote';

        let metricsContext = "No critical issues detected.";
        if (businessId) {
            try {
                const now = new Date();
                const [overdueInvoice, lowStock] = await Promise.all([
                    Invoice.findOne({ 
                        businessId, 
                        paymentStatus: { $ne: 'PAID' }, 
                        dueDate: { $lt: now } 
                    }).sort({ balanceDue: -1 }), // Highest balance
                    
                    StockSummary.findOne({ 
                        businessId, 
                        isLowStock: true 
                    }).sort({ availableStock: 1 }) // Lowest stock
                ]);

                const insights: string[] = [];
                if (overdueInvoice) {
                    const days = Math.floor((now.getTime() - overdueInvoice.dueDate.getTime()) / (1000 * 3600 * 24));
                    insights.push(`Overdue Invoice: ${overdueInvoice.partySnapshot.name} owes ₹${overdueInvoice.balanceDue} (${days} days overdue).`);
                }
                if (lowStock) {
                    insights.push(`Low Stock: ${lowStock.itemName} only has ${lowStock.availableStock} left (minimum is ${lowStock.lowStockThreshold}).`);
                }
                
                if (insights.length > 0) {
                    metricsContext = insights.join(' ');
                }
            } catch (e) {
                logger.warn('Failed to fetch actionable metrics for AI quote', e);
            }
        }

        const payload: PromptPayload = {
            systemString: `You are an operations assistant. Review these business alerts: "${metricsContext}". Pick ONE alert and generate a 5 to 7 word actionable tip. Example: 'Collect ₹50k from Acme Corp immediately' or 'Restock Denim, inventory is critically low'. No quotes, no extra text.`,
            userQuery: "Give me the actionable tip.",
            temperature: 0.3
        };

        const quote = await AiOrchestrator.execute(payload, 'google/gemma-4-26b-a4b-it:free');
        const cleanQuote = quote.replace(/["']/g, '').trim();

        // Store the quote for 2 hours
        await redis.set(cacheKey, cleanQuote, 'EX', 7200);

        logger.info(`Generated new AI Tip for ${businessId || 'global'}: ${cleanQuote}`);
        return cleanQuote;

    } catch (error) {
        logger.error('Failed to generate AI Quote', error);
        return "Focus on progress, not perfection.";
    }
}
