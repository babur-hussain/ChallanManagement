import mongoose, { Document, Schema } from 'mongoose';
import { IChallan, IChallanItem } from '@textilepro/shared';

// We omit the literal types from IChallan that are populated or managed differently in Mongoose typing
export interface IChallanDoc extends Omit<IChallan, '_id' | 'businessId' | 'partyId' | 'brokerId' | 'deliveryBoyId' | 'invoiceId' | 'createdBy' | 'updatedBy' | 'items'>, Document {
  businessId: mongoose.Types.ObjectId;
  partyId: mongoose.Types.ObjectId;
  brokerId?: mongoose.Types.ObjectId;
  deliveryBoyId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  items: (Omit<IChallanItem, 'itemId'> & { itemId: mongoose.Types.ObjectId })[];
}

const challanItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  itemCode: { type: String },
  hsnCode: { type: String, required: true },
  rollNumbers: [{ type: String }],
  meters: [{ type: Number, required: true }],
  totalMeters: { type: Number, required: true },
  ratePerMeter: { type: Number, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, enum: ['METERS', 'KILOGRAMS'], default: 'METERS' },
  remarks: { type: String },

  // Zoho-style: discount & tax per line item
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
}, { _id: true }); // Keep _id on embedded items for easy updates/tracking

const challanSchema = new Schema<IChallanDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

  challanNumber: { type: String, required: true },
  date: { type: Date, required: true, index: true },

  partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
  partySnapshot: {
    name: { type: String, required: true },
    shortCode: { type: String },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    phone: { type: String, required: true },
    gstin: { type: String },
  },

  brokerId: { type: Schema.Types.ObjectId, ref: 'Broker', index: true },
  brokerSnapshot: {
    name: { type: String },
    commissionRate: { type: Number },
    commissionType: { type: String, enum: ['PERCENTAGE', 'FIXED_PER_METER', 'FIXED_PER_CHALLAN'] },
  },

  vehicleNumber: { type: String },
  deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'User' },
  transporterName: { type: String },

  // Zoho-style: new header fields
  referenceNumber: { type: String },
  challanType: { type: String, enum: ['JOB_WORK', 'SUPPLY_ON_APPROVAL', 'OTHERS'], default: 'SUPPLY_ON_APPROVAL' },
  placeOfSupply: { type: String },
  supplyType: { type: String, enum: ['INTRA_STATE', 'INTER_STATE'] },

  items: { type: [challanItemSchema], required: true },

  totalItems: { type: Number, required: true },
  totalRolls: { type: Number, required: true },
  totalMeters: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  // Zoho-style: totals breakdown
  subTotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  adjustment: {
    label: { type: String, default: 'Adjustment' },
    amount: { type: Number, default: 0 },
  },
  roundOff: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'DELIVERED', 'BILLED', 'CANCELLED'],
    default: 'DRAFT',
    required: true,
    index: true
  },

  remarks: { type: String },
  internalNotes: { type: String },
  paperSize: { type: String, enum: ['A4', 'A5'], default: 'A4' },

  // Zoho-style: notes & terms
  customerNotes: { type: String },
  termsAndConditions: { type: String },

  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },

  whatsappSentAt: { type: Date },
  whatsappSentTo: { type: String },
  whatsappMessageId: { type: String },

  deliveredAt: { type: Date },
  deliveryLatLng: {
    lat: { type: Number },
    lng: { type: Number },
  },

  cancelledAt: { type: Date },
  cancellationReason: { type: String },

  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },

  brokerCommissionAmount: { type: Number },
  brokerCommissionPaid: { type: Boolean, default: false },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Indexes for fast lookup and reporting
challanSchema.index({ businessId: 1, challanNumber: 1 }, { unique: true });
challanSchema.index({ businessId: 1, partyId: 1, date: -1 });

// Text index for search
challanSchema.index({
  challanNumber: 'text',
  'partySnapshot.name': 'text',
  vehicleNumber: 'text'
});

export const Challan = mongoose.model<IChallanDoc>('Challan', challanSchema);
