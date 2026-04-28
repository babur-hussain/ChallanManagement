import mongoose from 'mongoose';
import { RateHistory } from '../models/RateHistory.js';
import { Quotation } from '../models/Quotation.js';
import { logger } from '../lib/logger.js';

export class RateIntelligenceService {

    // ─── Create / Update Rate Entry ───────────────────────────

    static async upsertRate(businessId: string, userId: string, data: any) {
        const date = data.date ? new Date(data.date) : new Date();
        // One entry per fabric per day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await RateHistory.findOne({
            businessId,
            itemId: data.itemId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existing) {
            Object.assign(existing, {
                purchaseRate: data.purchaseRate ?? existing.purchaseRate,
                standardSellRate: data.standardSellRate ?? existing.standardSellRate,
                lowestAllowedRate: data.lowestAllowedRate ?? existing.lowestAllowedRate,
                marketRate: data.marketRate ?? existing.marketRate,
                competitorRate: data.competitorRate ?? existing.competitorRate,
                updatedBy: userId,
            });
            await existing.save();
            return existing;
        }

        return RateHistory.create({
            businessId,
            itemId: data.itemId,
            date,
            purchaseRate: data.purchaseRate,
            standardSellRate: data.standardSellRate,
            lowestAllowedRate: data.lowestAllowedRate,
            marketRate: data.marketRate,
            competitorRate: data.competitorRate,
            updatedBy: userId,
        });
    }

    // ─── Get Rate History ─────────────────────────────────────

    static async getHistory(businessId: string, itemId: string, days: number = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return RateHistory.find({
            businessId,
            itemId,
            date: { $gte: since },
        })
            .sort({ date: -1 })
            .lean();
    }

    // ─── Rate Intelligence for a Fabric ───────────────────────

    static async getIntelligence(businessId: string, itemId: string) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get recent rate history
        const history = await RateHistory.find({
            businessId,
            itemId,
            date: { $gte: thirtyDaysAgo },
        }).sort({ date: -1 }).lean();

        // Get last sold rate from quotations
        const lastQuotation = await Quotation.findOne({
            businessId,
            'items.itemId': new mongoose.Types.ObjectId(itemId),
            status: { $in: ['ACCEPTED', 'CONVERTED'] },
        })
            .sort({ acceptedAt: -1 })
            .lean();

        let lastSoldRate: number | undefined;
        if (lastQuotation) {
            const item = lastQuotation.items.find(
                (i: any) => i.itemId.toString() === itemId
            );
            lastSoldRate = item?.finalRate;
        }

        // Compute averages
        const sellRates = history.filter(h => h.standardSellRate).map(h => h.standardSellRate!);
        const avg30DayRate = sellRates.length > 0
            ? sellRates.reduce((a, b) => a + b, 0) / sellRates.length
            : undefined;

        const purchaseRates = history.filter(h => h.purchaseRate).map(h => h.purchaseRate!);
        const avgPurchaseRate = purchaseRates.length > 0
            ? purchaseRates.reduce((a, b) => a + b, 0) / purchaseRates.length
            : undefined;

        // Best margin rate = sell rate that gives highest margin above purchase
        const bestMarginRate = avgPurchaseRate && avg30DayRate
            ? Math.max(avg30DayRate, avgPurchaseRate * 1.15)
            : avg30DayRate;

        // Minimum safe rate = lowest allowed or purchase + 5%
        const latestRate = history[0];
        const minimumSafeRate = latestRate?.lowestAllowedRate
            || (avgPurchaseRate ? avgPurchaseRate * 1.05 : undefined);

        // Trend calculation
        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (history.length >= 2) {
            const recentRates = history.slice(0, Math.min(5, history.length));
            const olderRates = history.slice(Math.min(5, history.length));
            if (recentRates.length > 0 && olderRates.length > 0) {
                const recentAvg = recentRates
                    .filter(h => h.marketRate || h.standardSellRate)
                    .map(h => h.marketRate || h.standardSellRate!)
                    .reduce((a, b) => a + b, 0) / recentRates.length;
                const olderAvg = olderRates
                    .filter(h => h.marketRate || h.standardSellRate)
                    .map(h => h.marketRate || h.standardSellRate!)
                    .reduce((a, b) => a + b, 0) / olderRates.length;
                if (recentAvg > olderAvg * 1.02) trend = 'UP';
                else if (recentAvg < olderAvg * 0.98) trend = 'DOWN';
            }
        }

        // Warnings
        const warnings: Array<{ level: 'RED' | 'AMBER'; message: string }> = [];

        return {
            itemId,
            lastSoldRate,
            avg30DayRate: avg30DayRate ? Math.round(avg30DayRate * 100) / 100 : undefined,
            bestMarginRate: bestMarginRate ? Math.round(bestMarginRate * 100) / 100 : undefined,
            minimumSafeRate: minimumSafeRate ? Math.round(minimumSafeRate * 100) / 100 : undefined,
            trend,
            warnings,
            latestMarketRate: latestRate?.marketRate,
            latestPurchaseRate: latestRate?.purchaseRate,
        };
    }

    // ─── Check Rate Warnings ──────────────────────────────────

    static async checkRateWarnings(businessId: string, itemId: string, proposedRate: number) {
        const intel = await this.getIntelligence(businessId, itemId);
        const warnings: Array<{ level: 'RED' | 'AMBER'; message: string }> = [];

        if (intel.minimumSafeRate && proposedRate < intel.minimumSafeRate) {
            warnings.push({
                level: 'RED',
                message: `Rate ₹${proposedRate} is below minimum safe rate ₹${intel.minimumSafeRate}`,
            });
        }

        if (intel.latestMarketRate && proposedRate > intel.latestMarketRate * 1.2) {
            warnings.push({
                level: 'AMBER',
                message: `Rate ₹${proposedRate} is 20%+ above current market rate ₹${intel.latestMarketRate}`,
            });
        }

        if (intel.avg30DayRate && proposedRate < intel.avg30DayRate * 0.85) {
            warnings.push({
                level: 'AMBER',
                message: `Rate ₹${proposedRate} is 15%+ below 30-day avg ₹${intel.avg30DayRate}`,
            });
        }

        return { ...intel, warnings };
    }
}
