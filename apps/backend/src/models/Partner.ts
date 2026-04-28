import mongoose, { Document, Schema } from 'mongoose';

export interface IPartnerDoc extends Document {
    userId: mongoose.Types.ObjectId; // User Account of the Partner
    partnerCode: string; // E.g. "SHARMA20"
    companyName: string;
    city: string;
    state: string;
    contactPerson: string;
    commissionType: 'FLAT' | 'PERCENTAGE_MRR';
    commissionRate: number;
    payoutCycle: 'MONTHLY' | 'QUARTERLY';
    activeClientsCount: number;
    monthlyMRRGenerated: number;
    pendingPayout: number;
    totalPaidOut: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const partnerSchema = new Schema<IPartnerDoc>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partnerCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    contactPerson: { type: String, required: true },
    commissionType: {
        type: String,
        enum: ['FLAT', 'PERCENTAGE_MRR'],
        default: 'PERCENTAGE_MRR'
    },
    commissionRate: { type: Number, default: 20 }, // 20% default
    payoutCycle: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY'],
        default: 'MONTHLY'
    },
    activeClientsCount: { type: Number, default: 0 },
    monthlyMRRGenerated: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    totalPaidOut: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Partner = mongoose.model<IPartnerDoc>('Partner', partnerSchema);
