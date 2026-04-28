import mongoose, { Document, Schema } from 'mongoose';
import { IStockSummary } from '@textilepro/shared';

export interface IStockSummaryDoc extends Omit<IStockSummary, '_id'>, Document {}

const stockSummarySchema = new Schema<IStockSummaryDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  
  itemName: { type: String, required: true },
  itemCode: { type: String },
  
  currentStock: { type: Number, required: true, default: 0 },
  reservedStock: { type: Number, required: true, default: 0 },
  availableStock: { type: Number, required: true, default: 0 },
  
  averageCost: { type: Number, required: true, default: 0 },
  
  lowStockThreshold: { type: Number, required: true, default: 100 },
  isLowStock: { type: Boolean, required: true, default: false },
  
  lastMovementAt: { type: Date },
  lastMovementType: { type: String, enum: ['IN', 'OUT', 'ADJUST'] },
}, { 
  timestamps: true 
});

stockSummarySchema.index({ businessId: 1, itemId: 1 }, { unique: true });

export const StockSummary = mongoose.model<IStockSummaryDoc>('StockSummary', stockSummarySchema);
