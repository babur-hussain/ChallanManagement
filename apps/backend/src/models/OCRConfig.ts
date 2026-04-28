import mongoose, { Document, Schema } from 'mongoose';

export interface IOCRConfigDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    defaultProvider: string;
    providerSettings: Map<string, any>;
    taskRouting: {
        textOCR: string;
        handwriting: string;
        tableExtraction: string;
        invoiceParsing: string;
        visitingCards: string;
        statements: string;
    };
    confidenceThresholds: {
        autoApprove: number;
        reviewRequired: number;
    };
}

const ocrConfigSchema = new Schema<IOCRConfigDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    defaultProvider: {
        type: String,
        enum: ['GOOGLE_VISION', 'AWS_TEXTRACT', 'AZURE_OCR', 'OPENROUTER', 'GEMINI_VISION', 'CLAUDE_VISION', 'TESSERACT'],
        default: 'CLAUDE_VISION',
    },
    providerSettings: { type: Map, of: Schema.Types.Mixed, default: {} },
    taskRouting: {
        textOCR: { type: String, default: 'CLAUDE_VISION' },
        handwriting: { type: String, default: 'CLAUDE_VISION' },
        tableExtraction: { type: String, default: 'CLAUDE_VISION' },
        invoiceParsing: { type: String, default: 'CLAUDE_VISION' },
        visitingCards: { type: String, default: 'CLAUDE_VISION' },
        statements: { type: String, default: 'CLAUDE_VISION' },
    },
    confidenceThresholds: {
        autoApprove: { type: Number, default: 90 },
        reviewRequired: { type: Number, default: 60 },
    },
}, { timestamps: true });

export const OCRConfig = mongoose.model<IOCRConfigDoc>('OCRConfig', ocrConfigSchema);
