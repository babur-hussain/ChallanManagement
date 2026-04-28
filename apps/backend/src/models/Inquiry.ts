import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiryDoc extends Document {
    buyerBusinessId: mongoose.Types.ObjectId;
    sellerBusinessId: mongoose.Types.ObjectId;
    listingId?: mongoose.Types.ObjectId; // Optional if inquiry is general to the profile
    quantityNeeded?: number;
    targetRate?: number;
    city: string;
    notes?: string;
    status: 'NEW' | 'RESPONDED' | 'NEGOTIATING' | 'WON' | 'LOST' | 'CLOSED';
    isSampleRequest: boolean;
    sampleStatus?: 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CONVERTED';
    createdAt: Date;
    updatedAt: Date;
}

const inquirySchema = new Schema<IInquiryDoc>({
    buyerBusinessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    sellerBusinessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing' },
    quantityNeeded: { type: Number },
    targetRate: { type: Number },
    city: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['NEW', 'RESPONDED', 'NEGOTIATING', 'WON', 'LOST', 'CLOSED'], default: 'NEW', index: true },
    isSampleRequest: { type: Boolean, default: false },
    sampleStatus: { type: String, enum: ['REQUESTED', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'CONVERTED'] },
}, { timestamps: true });

export const Inquiry = mongoose.model<IInquiryDoc>('Inquiry', inquirySchema);
