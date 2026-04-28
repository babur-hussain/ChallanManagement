import mongoose, { Schema, Document } from 'mongoose';
import type { ITaxCode } from '@textilepro/shared';

export interface TaxCodeDocument extends Omit<ITaxCode, '_id'>, Document {}

const schema = new Schema<TaxCodeDocument>({
  businessId: { type: String, required: true, index: true },
  
  code: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  rate: { type: Number, required: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(_d, ret) { ret.id = ret._id; delete (ret as any).__v; } } });

schema.index({ businessId: 1, code: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const TaxCode = mongoose.model<TaxCodeDocument>('TaxCode', schema);
