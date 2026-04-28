import mongoose, { Document, Schema } from 'mongoose';
import { IStockLedger } from '@textilepro/shared';

export interface IStockLedgerDoc extends Omit<IStockLedger, '_id' | 'createdBy'>, Document {
  createdBy: mongoose.Types.ObjectId;
}

const stockLedgerSchema = new Schema<IStockLedgerDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },

  date: { type: Date, required: true },
  movementType: { type: String, enum: ['PURCHASE_IN', 'CHALLAN_OUT', 'CHALLAN_CANCEL_IN', 'MANUAL_ADJUST', 'OPENING_STOCK', 'TRANSFER_IN', 'TRANSFER_OUT'], required: true },
  meters: { type: Number, required: true },
  direction: { type: String, enum: ['IN', 'OUT'], required: true },

  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },

  referenceId: { type: String, index: true },
  referenceNumber: { type: String },
  notes: { type: String },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

stockLedgerSchema.index({ businessId: 1, itemId: 1, date: -1 });

export const StockLedger = mongoose.model<IStockLedgerDoc>('StockLedger', stockLedgerSchema);
