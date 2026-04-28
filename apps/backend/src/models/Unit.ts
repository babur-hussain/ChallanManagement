import mongoose, { Schema, Document } from 'mongoose';
import type { IUnit } from '@textilepro/shared';

export interface UnitDocument extends Omit<IUnit, '_id'>, Document {}

const schema = new Schema<UnitDocument>({
  businessId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  shortCode: { type: String, required: true, trim: true, uppercase: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(_d, ret) { ret.id = ret._id; delete (ret as any).__v; } } });

schema.index({ businessId: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const Unit = mongoose.model<UnitDocument>('Unit', schema);
