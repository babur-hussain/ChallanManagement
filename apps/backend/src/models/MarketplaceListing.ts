import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceListingDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    listingNumber: string;
    title: string;
    itemName: string;
    category: string;
    photos: string[];
    video?: string;
    gsm?: string;
    width?: string;
    composition?: string;
    colorsAvailable: string[];
    MOQ: number;
    priceVisibility: 'HIDDEN' | 'RANGE' | 'EXACT';
    priceFrom?: number;
    priceTo?: number;
    stockStatus: 'IN_STOCK' | 'LIMITED' | 'MADE_TO_ORDER';
    dispatchDays?: number;
    tags: string[];
    featured: boolean;
    active: boolean;
    views: number;
    inquiries: number;
    createdAt: Date;
    updatedAt: Date;
}

const marketplaceListingSchema = new Schema<IMarketplaceListingDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    listingNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true, index: true },
    photos: [{ type: String }],
    video: { type: String },
    gsm: { type: String },
    width: { type: String },
    composition: { type: String },
    colorsAvailable: [{ type: String }],
    MOQ: { type: Number, default: 0 },
    priceVisibility: { type: String, enum: ['HIDDEN', 'RANGE', 'EXACT'], default: 'HIDDEN' },
    priceFrom: { type: Number },
    priceTo: { type: Number },
    stockStatus: { type: String, enum: ['IN_STOCK', 'LIMITED', 'MADE_TO_ORDER'], default: 'MADE_TO_ORDER' },
    dispatchDays: { type: Number },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
}, { timestamps: true });

marketplaceListingSchema.index({ title: 'text', itemName: 'text', category: 'text', tags: 'text' });

export const MarketplaceListing = mongoose.model<IMarketplaceListingDoc>('MarketplaceListing', marketplaceListingSchema);
