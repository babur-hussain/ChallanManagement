import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformEventDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    eventType:
    | 'SIGNUP_COMPLETED'
    | 'FIRST_CHALLAN_CREATED'
    | 'FIRST_INVOICE_GENERATED'
    | 'FIRST_PAYMENT_RECORDED'
    | 'WHATSAPP_CONNECTED'
    | 'AI_ASSISTANT_USED'
    | 'OCR_DOCUMENT_SCANNED'
    | 'SUBSCRIPTION_UPGRADED'
    | 'CHURNED';
    metadata: Record<string, any>; // JSON payload for redshift / bigquery
    createdAt: Date;
}

const platformEventSchema = new Schema<IPlatformEventDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventType: {
        type: String,
        required: true,
        index: true
    },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Useful for Data Warehousing pulls
platformEventSchema.index({ eventType: 1, createdAt: -1 });

export const PlatformEvent = mongoose.model<IPlatformEventDoc>('PlatformEvent', platformEventSchema);
