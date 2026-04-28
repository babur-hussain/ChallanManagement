import mongoose, { Document, Schema } from 'mongoose';

export interface IWhiteLabelTenantDoc extends Document {
    partnerId: mongoose.Types.ObjectId;
    domain: string; // e.g. "erp.sagartech.com"
    appName: string;
    themeColors: {
        primary: string;
        secondary: string;
        success: string;
    };
    logoUrl?: string;
    supportEmail: string;
    supportPhone: string;
    billingOwner: 'PARTNER' | 'TEXTILEPRO'; // Determines who collects payment
    hiddenModules: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const whiteLabelTenantSchema = new Schema<IWhiteLabelTenantDoc>({
    partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', required: true, unique: true },
    domain: { type: String, required: true, unique: true },
    appName: { type: String, required: true, default: 'TextilePro' },
    themeColors: {
        primary: { type: String, default: '#000000' },
        secondary: { type: String, default: '#333333' },
        success: { type: String, default: '#10B981' }
    },
    logoUrl: { type: String },
    supportEmail: { type: String, required: true },
    supportPhone: { type: String, required: true },
    billingOwner: {
        type: String,
        enum: ['PARTNER', 'TEXTILEPRO'],
        default: 'TEXTILEPRO'
    },
    hiddenModules: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const WhiteLabelTenant = mongoose.model<IWhiteLabelTenantDoc>('WhiteLabelTenant', whiteLabelTenantSchema);
