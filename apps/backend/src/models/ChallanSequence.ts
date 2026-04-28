import mongoose, { Document, Schema } from 'mongoose';

export interface IChallanSequenceDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  financialYear: string; // e.g. "2425"
  lastNumber: number;
}

const challanSequenceSchema = new Schema<IChallanSequenceDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  financialYear: { type: String, required: true },
  lastNumber: { type: Number, required: true, default: 0 },
});

// Compound index to ensure 1 document per business per FY
challanSequenceSchema.index({ businessId: 1, financialYear: 1 }, { unique: true });

export const ChallanSequence = mongoose.model<IChallanSequenceDoc>('ChallanSequence', challanSequenceSchema);
