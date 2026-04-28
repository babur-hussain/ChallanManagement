import mongoose, { Schema, Document } from 'mongoose';
import type { IBroker } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Broker Model — middlemen earning commission on deals
// ═══════════════════════════════════════════════════════════════

export interface BrokerDocument extends Omit<IBroker, '_id'>, Document {}

const brokerSchema = new Schema<BrokerDocument>(
  {
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    partyId: { type: String, index: true }, // optional link to Party master
    commissionType: {
      type: String,
      required: true,
      enum: ['PERCENTAGE', 'FIXED_PER_METER', 'FIXED_PER_CHALLAN'],
    },
    commissionRate: { type: Number, required: true, min: 0 },
    paymentCycle: { type: String, enum: ['WEEKLY', 'MONTHLY', 'ON_DEMAND'], default: 'MONTHLY' },
    currentCommissionDue: { type: Number, default: 0 },
    bankDetails: {
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, trim: true, uppercase: true },
      bankName: { type: String, trim: true },
    },
    remarks: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) { ret.id = ret._id; delete ret.__v; },
    },
  }
);

brokerSchema.index({ businessId: 1, phone: 1 }, { unique: true });
brokerSchema.index({ businessId: 1, isActive: 1 });
brokerSchema.index({ businessId: 1, partyId: 1 });

export const Broker = mongoose.model<BrokerDocument>('Broker', brokerSchema);
