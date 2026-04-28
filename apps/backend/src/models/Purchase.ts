import mongoose, { Document, Schema } from 'mongoose';
import { IPurchase, IPurchaseItem } from '@textilepro/shared';

export interface IPurchaseDoc extends Omit<IPurchase, '_id' | 'businessId' | 'createdBy' | 'items'>, Document {
  businessId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  items: (Omit<IPurchaseItem, 'itemId'> & { itemId: mongoose.Types.ObjectId })[];
}

const purchaseItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  meters: { type: Number, required: true },
  rollCount: { type: Number },
  ratePerMeter: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const purchaseSchema = new Schema<IPurchaseDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  purchaseNumber: { type: String, required: true },
  date: { type: Date, required: true },
  
  supplierName: { type: String, required: true },
  supplierPhone: { type: String },
  supplierGstin: { type: String },
  
  items: [purchaseItemSchema],
  
  totalMeters: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  billNumber: { type: String },
  remarks: { type: String },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: true 
});

purchaseSchema.index({ businessId: 1, purchaseNumber: 1 }, { unique: true });

export const Purchase = mongoose.model<IPurchaseDoc>('Purchase', purchaseSchema);
