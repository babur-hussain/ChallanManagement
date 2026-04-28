import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookSubscriptionDoc extends Document {
    businessId: string;
    targetUrl: string;
    events: ('invoice.created' | 'challan.created' | 'payment.received' | 'stock.low' | 'lead.created')[];
    secretToken?: string; // For generating HMAC signatures so the recipient can verify payload authenticity
    isActive: boolean;
    failureCount: number;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
    createdAt: Date;
}

const webhookSubscriptionSchema = new Schema<IWebhookSubscriptionDoc>({
    businessId: { type: String, required: true, index: true },
    targetUrl: { type: String, required: true },
    events: [{ type: String, required: true }],
    secretToken: { type: String },
    isActive: { type: Boolean, default: true },
    failureCount: { type: Number, default: 0 },
    lastSuccessAt: { type: Date },
    lastFailureAt: { type: Date },
}, { timestamps: true });

export const WebhookSubscription = mongoose.model<IWebhookSubscriptionDoc>('WebhookSubscription', webhookSubscriptionSchema);
