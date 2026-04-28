import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaignDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    name: string;
    templateId: mongoose.Types.ObjectId;
    audienceFilters: {
        tags?: string[];
        cities?: string[];
        partyType?: string;
        hasOutstanding?: boolean;
        dormantDays?: number;
    };
    recipientCount: number;
    scheduledAt?: Date;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    repliedCount: number;
    failedCount: number;
    status: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const campaignSchema = new Schema<ICampaignDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'MessageTemplate', required: true },
    audienceFilters: {
        tags: [String],
        cities: [String],
        partyType: String,
        hasOutstanding: Boolean,
        dormantDays: Number,
    },
    recipientCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    repliedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'CANCELLED'], default: 'DRAFT', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Campaign = mongoose.model<ICampaignDoc>('Campaign', campaignSchema);
