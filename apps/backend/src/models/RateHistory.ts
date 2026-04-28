import mongoose, { Document, Schema } from 'mongoose';

export interface IRateHistoryDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    date: Date;
    purchaseRate?: number;
    standardSellRate?: number;
    lowestAllowedRate?: number;
    marketRate?: number;
    competitorRate?: number;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const rateHistorySchema = new Schema<IRateHistoryDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    date: { type: Date, required: true, index: true },
    purchaseRate: { type: Number },
    standardSellRate: { type: Number },
    lowestAllowedRate: { type: Number },
    marketRate: { type: Number },
    competitorRate: { type: Number },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

rateHistorySchema.index({ businessId: 1, itemId: 1, date: -1 });
rateHistorySchema.index({ businessId: 1, date: -1 });

export const RateHistory = mongoose.model<IRateHistoryDoc>('RateHistory', rateHistorySchema);
