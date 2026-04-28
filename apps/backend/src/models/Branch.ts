import mongoose, { Document, Schema } from 'mongoose';

export interface IBranchDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    branchCode: string;
    branchName: string;
    type: 'HEAD_OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SALES_OFFICE' | 'RETAIL_STORE';
    address: string;
    city: string;
    state: string;
    country: string;
    gstin?: string;
    phone?: string;
    managerUserId?: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const branchSchema = new Schema<IBranchDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    branchCode: { type: String, required: true },
    branchName: { type: String, required: true },
    type: {
        type: String,
        enum: ['HEAD_OFFICE', 'WAREHOUSE', 'FACTORY', 'SALES_OFFICE', 'RETAIL_STORE'],
        required: true
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    gstin: { type: String },
    phone: { type: String },
    managerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to ensure branch code is unique per business
branchSchema.index({ businessId: 1, branchCode: 1 }, { unique: true });

export const Branch = mongoose.model<IBranchDoc>('Branch', branchSchema);
