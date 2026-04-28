import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationSequenceDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    financialYear: string;
    lastNumber: number;
}

const quotationSequenceSchema = new Schema<IQuotationSequenceDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    financialYear: { type: String, required: true },
    lastNumber: { type: Number, required: true, default: 0 },
});

quotationSequenceSchema.index({ businessId: 1, financialYear: 1 }, { unique: true });

export const QuotationSequence = mongoose.model<IQuotationSequenceDoc>('QuotationSequence', quotationSequenceSchema);
