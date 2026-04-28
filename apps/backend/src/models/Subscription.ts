import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    currentPlan: 'STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
    startDate: Date;
    renewalDate: Date;
    amount: number;
    couponCode?: string;
    paymentMethod: 'CREDIT_CARD' | 'UPI' | 'BANK_TRANSFER' | 'MANUAL';
    autoRenew: boolean;

    // Usage Limits Enforced by Feature Gate
    seatsAllowed: number;
    branchesAllowed: number;
    aiCredits: number;
    whatsappCredits: number;
    ocrCredits: number;

    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    currentPlan: {
        type: String,
        enum: ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'],
        default: 'STARTER'
    },
    billingCycle: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
        default: 'MONTHLY'
    },
    status: {
        type: String,
        enum: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
        default: 'TRIAL'
    },
    startDate: { type: Date, default: Date.now },
    renewalDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: {
        type: String,
        enum: ['CREDIT_CARD', 'UPI', 'BANK_TRANSFER', 'MANUAL'],
        default: 'UPI'
    },
    autoRenew: { type: Boolean, default: true },

    // Gating thresholds
    seatsAllowed: { type: Number, default: 2 },
    branchesAllowed: { type: Number, default: 1 },
    aiCredits: { type: Number, default: 0 },
    whatsappCredits: { type: Number, default: 50 },
    ocrCredits: { type: Number, default: 10 }
}, { timestamps: true });

export const Subscription = mongoose.model<ISubscriptionDoc>('Subscription', subscriptionSchema);
