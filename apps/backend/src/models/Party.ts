import mongoose, { Schema, Document } from 'mongoose';
import type { IParty } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Party Model — buyers, brokers, and combined parties
// ═══════════════════════════════════════════════════════════════

export interface PartyDocument extends Omit<IParty, '_id'>, Document {}

const partySchema = new Schema<PartyDocument>(
  {
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    shortCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 6 },
    partyType: { type: String, required: true, enum: ['BUYER', 'BROKER', 'BOTH'] },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    altPhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true, default: 'Surat' },
      state: { type: String, required: true, trim: true, default: 'Gujarat' },
      pincode: { type: String, required: true, trim: true },
    },
    gstin: { type: String, uppercase: true, trim: true, sparse: true },
    panNumber: { type: String, uppercase: true, trim: true },
    creditLimit: { type: Number, default: 0, min: 0 },
    creditDays: { type: Number, default: 30, min: 0 },
    openingBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ['DR', 'CR'], default: 'DR' },
    transporterName: { type: String, trim: true },
    remarks: { type: String, trim: true, maxlength: 1000 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
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

// Unique phone per business
partySchema.index({ businessId: 1, phone: 1 }, { unique: true });
// Unique shortCode per business
partySchema.index({ businessId: 1, shortCode: 1 }, { unique: true });
// Common query patterns
partySchema.index({ businessId: 1, isActive: 1, partyType: 1 });
partySchema.index({ businessId: 1, 'address.city': 1 });
partySchema.index({ businessId: 1, tags: 1 });
partySchema.index({ businessId: 1, gstin: 1 });

// Text search
partySchema.index(
  { name: 'text', shortCode: 'text', phone: 'text', 'address.city': 'text' },
  { weights: { name: 10, shortCode: 8, phone: 5, 'address.city': 3 } }
);

export const Party = mongoose.model<PartyDocument>('Party', partySchema);
