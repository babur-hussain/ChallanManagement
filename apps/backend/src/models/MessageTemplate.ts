import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageTemplateDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    name: string;
    category: string;
    bodyEn: string;
    bodyHi: string;
    placeholders: string[];
    isApproved: boolean;
    usageCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplateDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['SALES', 'OPERATIONS', 'COLLECTIONS', 'SUPPORT'], required: true },
    bodyEn: { type: String, required: true },
    bodyHi: { type: String, required: true },
    placeholders: { type: [String], default: [] },
    isApproved: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
}, { timestamps: true });

messageTemplateSchema.index({ businessId: 1, category: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplateDoc>('MessageTemplate', messageTemplateSchema);
