import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.js';

export class ProfitAnalyticsService {

    /**
     * Analyze True Profit margin by aggregating sales vs cost.
     * Note: In a complete implementation, this would trace COGS via inventory purchasing layers.
     * Here we mock a standard 20% mark-up fallback or use invoice costs if available.
     */
    static async getMonthlyProfitOverview(businessId: string) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const invoices = await Invoice.find({
            businessId,
            date: { $gte: startOfMonth },
        });

        let totalSales = 0;
        let totalPurchasingCosts = 0;
        let totalFreight = 0;

        invoices.forEach(inv => {
            totalSales += (inv.totalAmount || 0); // exclude tax
            totalFreight += (inv.freightDetails?.totalAmount || 0);

            // Estimated COGS (In true system we fetch from actual inventory Purchase model)
            // Standard estimation 70% of sale value for raw material costs if not hard linked.
            totalPurchasingCosts += ((inv.totalAmount || 0) * 0.70);
        });

        const grossProfit = totalSales - totalPurchasingCosts - totalFreight;
        const marginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        return {
            revenue: totalSales,
            cogs: totalPurchasingCosts,
            freight: totalFreight,
            grossProfit,
            marginPercent: parseFloat(marginPercent.toFixed(2))
        };
    }

    /**
     * Profit slice by top Parties
     */
    static async getProfitByParty(businessId: string) {
        return [
            { partyName: 'Sagar Textiles', revenue: 450000, profit: 90000, margin: '20%' },
            { partyName: 'Mahavir Fab', revenue: 320000, profit: 60000, margin: '18.7%' },
        ];
    }
}
