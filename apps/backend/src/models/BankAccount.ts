import mongoose, { Document, Schema } from 'mongoose';

export interface IBankAccountDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    accountId: string; // The Chart of Accounts system ID e.g., 'BANK_HDFC_001'
    bankName: string;
    accountName: string;
    maskedAccountNumber: string;
    ifsc?: string;
    accountType: 'CURRENT' | 'SAVINGS' | 'CC' | 'OD';
    openingBalance: number;
    currentBalance: number;
    lastSyncedAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bankAccountSchema = new Schema<IBankAccountDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    accountId: { type: String, required: true, unique: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    maskedAccountNumber: { type: String, required: true },
    ifsc: { type: String },
    accountType: { type: String, enum: ['CURRENT', 'SAVINGS', 'CC', 'OD'], default: 'CURRENT' },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    lastSyncedAt: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const BankAccount = mongoose.model<IBankAccountDoc>('BankAccount', bankAccountSchema);
