import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKeyDoc extends Document {
    businessId: string;
    name: string;
    hashedKey: string;
    prefix: string; // The first 8 characters for identifying it in the UI (e.g. txt_live_1234abcd...)
    scopes: ('read:invoices' | 'write:invoices' | 'read:challans' | 'write:challans' | 'read:inventory' | 'write:inventory')[];
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
}

const apiKeySchema = new Schema<IApiKeyDoc>({
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, default: 'Default API Key' },
    hashedKey: { type: String, required: true, select: false }, // Only return hash during validation
    prefix: { type: String, required: true },
    scopes: [{ type: String, required: true }],
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ApiKey = mongoose.model<IApiKeyDoc>('ApiKey', apiKeySchema);
