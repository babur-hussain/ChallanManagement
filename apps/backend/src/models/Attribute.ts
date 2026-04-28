import mongoose, { Schema, Document } from 'mongoose';
import type { IAttribute } from '@textilepro/shared';

export interface AttributeDocument extends Omit<IAttribute, '_id'>, Document {}

const schema = new Schema<AttributeDocument>({
  businessId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  options: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(_d, ret) { ret.id = ret._id; delete (ret as any).__v; } } });

schema.index({ businessId: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const Attribute = mongoose.model<AttributeDocument>('Attribute', schema);
