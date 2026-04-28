import { WebhookSubscription } from '../models/WebhookSubscription.js';
import crypto from 'crypto';

export class WebhookEngine {

    /**
     * The core dispatcher. Fire this whenever an event happens internally.
     * E.g. WebhookEngine.dispatch('bus_123', 'invoice.created', { invoiceId: 5 })
     */
    static async dispatch(businessId: string, eventName: string, payload: any) {
        // 1. Find all active subscriptions for this business that care about this event
        const subscriptions = await WebhookSubscription.find({
            businessId,
            isActive: true,
            events: eventName
        });

        if (subscriptions.length === 0) return;

        console.log(`[WEBHOOK ENGINE] Found ${subscriptions.length} endpoints for event ${eventName}. Dispatching...`);

        const requestBody = JSON.stringify({
            event: eventName,
            timestamp: new Date().toISOString(),
            data: payload
        });

        for (const sub of subscriptions) {
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'TextilePro-Webhook/1.0'
                };

                // Attach HMAC signature if secret is provided for security
                if (sub.secretToken) {
                    headers['x-textilepro-signature'] = crypto
                        .createHmac('sha256', sub.secretToken)
                        .update(requestBody)
                        .digest('hex');
                }

                // In production, user node-fetch or axios. Stubbed here.
                console.log(`POSTing to ${sub.targetUrl}... Payload: ${requestBody}`);

                // If successful:
                sub.lastSuccessAt = new Date();
                sub.failureCount = 0;
                await sub.save();

            } catch (error) {
                console.error(`[WEBHOOK ENGINE] Delivery failed to ${sub.targetUrl}`);
                sub.failureCount += 1;
                sub.lastFailureAt = new Date();

                // Auto-disable if it fails consistently
                if (sub.failureCount >= 5) {
                    sub.isActive = false;
                    console.log(`[WEBHOOK ENGINE] Auto-disabled subscription ${sub._id} due to 5 consecutive failures.`);
                }

                await sub.save();
            }
        }
    }
}
