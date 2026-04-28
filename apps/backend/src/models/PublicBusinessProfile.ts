import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicBusinessProfileDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    displayName: string;
    logo?: string;
    bannerImage?: string;
    city: string;
    state: string;
    country: string;
    businessType: 'MANUFACTURER' | 'WHOLESALER' | 'TRADER' | 'EXPORTER' | 'RETAILER' | 'BROKER' | 'JOB_WORK' | 'MILL';
    yearsInBusiness: number;
    specialties: string[];
    fabricsDealtIn: string[];
    MOQ?: string;
    shippingRegions: string[];
    languages: string[];
    gstVerified: boolean;
    trustScore: number; // 0 to 100
    avgResponseTime?: string;
    ratingSummary?: string;
    catalogCount: number;
    isVerified: boolean;
    publicPhone?: string;
    whatsapp?: string;
    aboutText?: string;
    badges: string[];
    isActiveInMarketplace: boolean;
    businessVisibility: string;
    catalogVisibility: string;
    createdAt: Date;
    updatedAt: Date;
}

const publicBusinessProfileSchema = new Schema<IPublicBusinessProfileDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    displayName: { type: String, required: true },
    logo: { type: String },
    bannerImage: { type: String },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    businessType: {
        type: String,
        enum: ['MANUFACTURER', 'WHOLESALER', 'TRADER', 'EXPORTER', 'RETAILER', 'BROKER', 'JOB_WORK', 'MILL'],
        required: true,
        index: true
    },
    yearsInBusiness: { type: Number, default: 0 },
    specialties: [{ type: String }],
    fabricsDealtIn: [{ type: String }],
    MOQ: { type: String },
    shippingRegions: [{ type: String }],
    languages: [{ type: String }],
    gstVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    avgResponseTime: { type: String },
    ratingSummary: { type: String },
    catalogCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    publicPhone: { type: String },
    whatsapp: { type: String },
    aboutText: { type: String },
    badges: [{ type: String }], // 'Verified', 'Trusted Seller', 'Fast Responder', 'Top Supplier', 'Export Ready'
    isActiveInMarketplace: { type: Boolean, default: false, index: true }, // The network mode opt-in
    businessVisibility: { type: String, enum: ['private', 'verified', 'public'], default: 'public' },
    catalogVisibility: { type: String, enum: ['hidden', 'partial', 'full'], default: 'full' },
}, { timestamps: true });

publicBusinessProfileSchema.index({ displayName: 'text', specialties: 'text', fabricsDealtIn: 'text' });

export const PublicBusinessProfile = mongoose.model<IPublicBusinessProfileDoc>('PublicBusinessProfile', publicBusinessProfileSchema);
