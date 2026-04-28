import mongoose, { Schema, Document } from 'mongoose';
import type { IItem } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Item Model — master reference for all products
// ═══════════════════════════════════════════════════════════════

export interface ItemDocument extends Omit<IItem, '_id'>, Document { }

const itemSchema = new Schema<ItemDocument>(
  {
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    shortCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 6 },
    hsnCode: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    defaultRate: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0, max: 100, default: 5 },
    unit: { type: String, enum: ['METERS', 'KILOGRAMS'], default: 'METERS' },
    composition: { type: String, trim: true, maxlength: 200 },
    width: { type: Number, min: 1, max: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) { ret.id = ret._id; delete (ret as any).__v; },
    },
  }
);

// Compound unique indexes: name and shortCode unique per business (case-insensitive)
itemSchema.index(
  { businessId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);
itemSchema.index(
  { businessId: 1, shortCode: 1 },
  { unique: true }
);

// Search index
itemSchema.index({ businessId: 1, isActive: 1, category: 1 });
itemSchema.index({ businessId: 1, hsnCode: 1 });

// Text search
itemSchema.index(
  { name: 'text', shortCode: 'text', hsnCode: 'text' },
  { weights: { name: 10, shortCode: 5, hsnCode: 3 } }
);

export const Item = mongoose.model<ItemDocument>('Item', itemSchema);
