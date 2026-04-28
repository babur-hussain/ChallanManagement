import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsAppConfigDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    provider: string;
    businessPhoneNumber: string;
    displayName: string;
    accessToken: string;
    webhookSecret?: string;
    approvedTemplates: string[];
    isConnected: boolean;
    connectedAt?: Date;
    lastSyncAt?: Date;
}

const whatsAppConfigSchema = new Schema<IWhatsAppConfigDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    provider: { type: String, enum: ['WATI', 'META_CLOUD_API', 'TWILIO'], required: true },
    businessPhoneNumber: { type: String, required: true },
    displayName: { type: String, required: true },
    accessToken: { type: String, required: true },
    webhookSecret: { type: String },
    approvedTemplates: { type: [String], default: [] },
    isConnected: { type: Boolean, default: false },
    connectedAt: { type: Date },
    lastSyncAt: { type: Date },
}, { timestamps: true });

export const WhatsAppConfig = mongoose.model<IWhatsAppConfigDoc>('WhatsAppConfig', whatsAppConfigSchema);
