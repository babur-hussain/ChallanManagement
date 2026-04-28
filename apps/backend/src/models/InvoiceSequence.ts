import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceSequenceDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  financialYear: string; // e.g. "2425"
  lastNumber: number;
}

const invoiceSequenceSchema = new Schema<IInvoiceSequenceDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  financialYear: { type: String, required: true },
  lastNumber: { type: Number, required: true, default: 0 },
});

// Compound index to ensure 1 document per business per FY
invoiceSequenceSchema.index({ businessId: 1, financialYear: 1 }, { unique: true });

export const InvoiceSequence = mongoose.model<IInvoiceSequenceDoc>('InvoiceSequence', invoiceSequenceSchema);
