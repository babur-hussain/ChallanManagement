import mongoose, { Schema, Document } from 'mongoose';
import type { ISalesPerformance } from '@textilepro/shared';

export type SalesPerformanceDocument = Document & Omit<ISalesPerformance, '_id'> & { _id: mongoose.Types.ObjectId };

const salesPerformanceSchema = new Schema<SalesPerformanceDocument>(
    {
        businessId: { type: String, required: true },
        userId: { type: String, required: true },
        date: { type: Date, required: true },

        callsMade: { type: Number, default: 0 },
        leadsContacted: { type: Number, default: 0 },
        followupsCompleted: { type: Number, default: 0 },
        meetingsDone: { type: Number, default: 0 },
        quotationsSent: { type: Number, default: 0 },
        leadsWon: { type: Number, default: 0 },
        challansCreated: { type: Number, default: 0 },
        invoiceValueGenerated: { type: Number, default: 0 },
        paymentsCollected: { type: Number, default: 0 },
        kilometersTravelled: { type: Number, default: 0 },
        activeMinutesInApp: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Compound index for querying daily performance quickly per user/business
salesPerformanceSchema.index({ businessId: 1, date: -1 });
salesPerformanceSchema.index({ businessId: 1, userId: 1, date: -1 }, { unique: true });

export const SalesPerformance = mongoose.model<SalesPerformanceDocument>('SalesPerformance', salesPerformanceSchema);
