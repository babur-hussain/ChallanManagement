import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { BillingService } from '../services/billing.service.js';

export const webhooksRouter = Router();

/**
 * Simulates a webhook from Razorpay/Stripe indicating a successful subscription charge
 */
webhooksRouter.post('/payment-success', handleRequest(async (req) => {
    // In production, verify crypto signature (e.g. razorpay_signature)

    const { businessId, plan, amountPaid, cycle } = req.body;

    if (!businessId || !plan) throw new Error('Invalid webhook payload');

    return await BillingService.handleSuccessfulPayment(
        businessId,
        plan as 'STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE',
        Number(amountPaid),
        cycle as 'MONTHLY' | 'YEARLY'
    );
}));
