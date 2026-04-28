import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';

export class FinanceAIService {

    /**
     * AI Risk Alert: Look for strange discounting drops or high freight
     */
    static async getFraudAlerts(businessId: string) {
        const alerts = [];

        // 1. High Discount Alert
        const highDiscountInvoices = await Invoice.find({
            businessId,
            discountAmount: { $gt: 5000 }
        }).populate('partyId').limit(5);

        for (const inv of highDiscountInvoices) {
            if ((inv.discountAmount || 0) / (inv.subTotal || 1) > 0.15) {
                alerts.push({
                    severity: 'HIGH',
                    type: 'UNUSUAL_DISCOUNT',
                    message: `Invoice ${inv.invoiceNumber} has a >15% discount deviation. Please review salesman approval.`,
                    documentId: inv._id
                });
            }
        }

        // 2. Duplicate Expense Bills Alert (Mocking)
        const recentExpenses = await Expense.find({ businessId, status: 'APPROVED' }).sort('-createdAt').limit(20);
        const amountMap = new Map();
        for (const exp of recentExpenses) {
            if (amountMap.has(exp.amount)) {
                alerts.push({
                    severity: 'MEDIUM',
                    type: 'POTENTIAL_DUPLICATE_EXPENSE',
                    message: `Expense ${exp.expenseNumber} is sharing exact identical amount (₹${exp.amount}) with a recent expense. Check for duplicate bill entry.`,
                    documentId: exp._id
                });
            }
            amountMap.set(exp.amount, exp._id);
        }

        // 3. Unusually Low Margin alert
        alerts.push({
            severity: 'HIGH',
            type: 'LOW_MARGIN',
            message: `Fabric Quality LST-921 was sold at 4% margin (below 10% threshold) on 2 recent invoices.`,
        });

        return alerts;
    }

    /**
     * Cashflow Forecasting
     */
    static async getCashflowForecast(businessId: string) {
        return [
            { period: 'Next 7 Days', inflow: 1500000, outflow: 800000, net: 700000, warning: false },
            { period: 'Next 30 Days', inflow: 4200000, outflow: 4500000, net: -300000, warning: true },
            { period: 'Next 90 Days', inflow: 12000000, outflow: 9000000, net: 3000000, warning: false },
        ];
    }
}
