import mongoose, { Document, Schema } from 'mongoose';

export interface IAiMemoryDoc extends Document {
    businessId: string;
    contextType: 'SUPPORT_HISTORY' | 'SALES_PREFERENCE' | 'BUSINESS_INFO' | 'VIP_PARTY_LIST';
    content: string; // The raw fact or vector embedding representation (stubbed as text for MVP)
    relevanceScore: number;
    lastRecalledAt?: Date;
    createdAt: Date;
}

const aiMemorySchema = new Schema<IAiMemoryDoc>({
    businessId: { type: String, required: true, index: true },
    contextType: { type: String, required: true },
    content: { type: String, required: true },
    relevanceScore: { type: Number, default: 1 },
    lastRecalledAt: { type: Date }
}, { timestamps: true });

export const AiMemory = mongoose.model<IAiMemoryDoc>('AiMemory', aiMemorySchema);
