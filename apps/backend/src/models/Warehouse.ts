import mongoose, { Schema, Document } from 'mongoose';
import type { IWarehouse } from '@textilepro/shared';

export interface WarehouseDocument extends Omit<IWarehouse, '_id'>, Document {}

const schema = new Schema<WarehouseDocument>({
  businessId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(_d, ret) { ret.id = ret._id; delete (ret as any).__v; } } });

schema.index({ businessId: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
schema.index({ businessId: 1, code: 1 }, { unique: true });
export const Warehouse = mongoose.model<WarehouseDocument>('Warehouse', schema);
