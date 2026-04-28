import mongoose, { Schema, Document } from 'mongoose';
import type { IBusiness, Plan } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Business Model — represents a tenant (textile business)
// ═══════════════════════════════════════════════════════════════

export interface BusinessDocument extends Omit<IBusiness, '_id'>, Document { }

const businessSettingsSchema = new Schema(
  {
    // Global Context
    baseCurrency: { type: String, default: 'INR', enum: ['INR', 'USD', 'AED', 'BDT', 'PKR', 'GBP', 'EUR'] },
    timezone: { type: String, default: 'Asia/Kolkata' },
    defaultLocale: { type: String, default: 'en-IN' },
    taxSystem: { type: String, default: 'GST', enum: ['GST', 'VAT', 'SALES_TAX', 'NONE'] },
    industryKey: { type: String, default: 'TEXTILE_TRADING' },

    currency: { type: String, default: 'INR' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    challanPrefix: { type: String, default: 'DC' },
    challanNumberLength: { type: Number, default: 5 },
    autoGenerateChallanNumber: { type: Boolean, default: true },
    defaultPaymentTerms: { type: Number, default: 30 },
    gstEnabled: { type: Boolean, default: true },
    defaultGstRate: { type: Number, default: 5 },
    printHeader: { type: String },
    printFooter: { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String, required: true, default: 'Surat' },
    state: { type: String, required: true, default: 'Gujarat' },
    pincode: { type: String },
  },
  { _id: false }
);

const businessSchema = new Schema<BusinessDocument>(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 100,
    },
    gstin: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['BASIC', 'STANDARD', 'PROFESSIONAL', 'ENTERPRISE'] satisfies Plan[],
      default: 'BASIC',
    },
    address: {
      type: addressSchema,
      default: () => ({
        line1: '',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '',
      }),
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    logo: { type: String },
    settings: {
      type: businessSettingsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trialEndsAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

// Indexes
businessSchema.index({ email: 1 });
businessSchema.index({ isActive: 1, plan: 1 });

export const Business = mongoose.model<BusinessDocument>('Business', businessSchema);
