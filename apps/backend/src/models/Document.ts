import mongoose, { Document as MDocument, Schema } from 'mongoose';

export interface IDocumentDoc extends MDocument {
    businessId: mongoose.Types.ObjectId;
    documentNumber: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageUrl: string;
    thumbnailUrl?: string;
    source: string;
    typeDetected: string;
    confidenceScore: number;
    languageDetected: string;
    pagesCount: number;
    status: string;
    extractedText?: string;
    extractedData?: any;
    fieldConfidences?: Map<string, number>;
    linkedEntityType?: string;
    linkedEntityId?: mongoose.Types.ObjectId;
    reviewNotes?: string;
    processedAt?: Date;
    processingTimeMs?: number;
    ocrProvider?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocumentDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    documentNumber: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, required: true },
    storageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    source: { type: String, enum: ['UPLOAD', 'WHATSAPP', 'EMAIL', 'CAMERA', 'SYSTEM'], default: 'UPLOAD' },
    typeDetected: {
        type: String,
        enum: [
            'DELIVERY_CHALLAN', 'GST_INVOICE', 'PURCHASE_BILL', 'TRANSPORT_LR',
            'PAYMENT_SCREENSHOT', 'PARTY_LEDGER', 'VISITING_CARD', 'RATE_LIST',
            'FABRIC_CATALOG', 'STOCK_SHEET', 'HANDWRITTEN_NOTE', 'CHEQUE_IMAGE',
            'BANK_STATEMENT', 'EXPENSE_BILL', 'GST_RETURN', 'UNKNOWN',
        ],
        default: 'UNKNOWN',
    },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    languageDetected: { type: String, default: 'en' },
    pagesCount: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['UPLOADED', 'PROCESSING', 'REVIEW_REQUIRED', 'COMPLETED', 'FAILED'],
        default: 'UPLOADED',
        index: true,
    },
    extractedText: { type: String },
    extractedData: { type: Schema.Types.Mixed },
    fieldConfidences: { type: Map, of: Number },
    linkedEntityType: { type: String, enum: ['PARTY', 'CHALLAN', 'INVOICE', 'PAYMENT', 'PURCHASE', 'EXPENSE', 'LEAD', 'OTHER'] },
    linkedEntityId: { type: Schema.Types.ObjectId },
    reviewNotes: { type: String },
    processedAt: { type: Date },
    processingTimeMs: { type: Number },
    ocrProvider: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

documentSchema.index({ businessId: 1, status: 1, createdAt: -1 });
documentSchema.index({ businessId: 1, typeDetected: 1 });
documentSchema.index({ businessId: 1, linkedEntityType: 1, linkedEntityId: 1 });
documentSchema.index({ extractedText: 'text' });

export const OCRDocument = mongoose.model<IDocumentDoc>('Document', documentSchema);
