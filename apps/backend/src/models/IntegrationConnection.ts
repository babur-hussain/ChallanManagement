import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegrationConnectionDoc extends Document {
    businessId: string;
    appName: 'TALLY' | 'SHOPIFY' | 'SHIPROCKET' | 'RAZORPAY' | 'EWAY_BILL' | 'CLEAR_TAX';
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'NEEDS_REAUTH';
    encryptedCredentials?: string; // Storing OAuth refresh tokens or API secrets
    syncMode: 'ONE_WAY' | 'TWO_WAY' | 'MANUAL';
    lastSyncAt?: Date;
    lastError?: string;
    configOptions: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const integrationConnectionSchema = new Schema<IIntegrationConnectionDoc>({
    businessId: { type: String, required: true, index: true },
    appName: { type: String, required: true, enum: ['TALLY', 'SHOPIFY', 'SHIPROCKET', 'RAZORPAY', 'EWAY_BILL', 'CLEAR_TAX'] },
    status: { type: String, required: true, default: 'DISCONNECTED', enum: ['CONNECTED', 'DISCONNECTED', 'ERROR', 'NEEDS_REAUTH'] },
    encryptedCredentials: { type: String },
    syncMode: { type: String, required: true, default: 'ONE_WAY', enum: ['ONE_WAY', 'TWO_WAY', 'MANUAL'] },
    lastSyncAt: { type: Date },
    lastError: { type: String },
    configOptions: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// A business can only have one active connection per app
integrationConnectionSchema.index({ businessId: 1, appName: 1 }, { unique: true });

export const IntegrationConnection = mongoose.model<IIntegrationConnectionDoc>('IntegrationConnection', integrationConnectionSchema);
