import mongoose, { Document, Schema } from 'mongoose';
import { IInvoice, IInvoiceItem, IPaymentEntry } from '@textilepro/shared';

export interface IInvoiceDoc extends Omit<IInvoice, '_id' | 'businessId' | 'partyId' | 'challanIds' | 'originalInvoiceId' | 'createdBy' | 'updatedBy' | 'items' | 'payments'>, Document {
  businessId: mongoose.Types.ObjectId;
  partyId: mongoose.Types.ObjectId;
  challanIds: mongoose.Types.ObjectId[];
  originalInvoiceId?: mongoose.Types.ObjectId;
  orderNumber?: string;
  shippingCharges?: number;
  adjustment?: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;

  items: (Omit<IInvoiceItem, 'itemId'> & { itemId: mongoose.Types.ObjectId })[];
  payments: IPaymentEntry[];
}

const invoiceItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  itemCode: { type: String },
  hsnCode: { type: String, required: true },

  quantity: { type: Number, required: true },
  unit: { type: String, required: true, default: 'MTR' },
  ratePerUnit: { type: Number, required: true },
  amount: { type: Number, required: true },

  gstRate: { type: Number, required: true },
  cgstRate: { type: Number, required: true, default: 0 },
  sgstRate: { type: Number, required: true, default: 0 },
  igstRate: { type: Number, required: true, default: 0 },

  cgstAmount: { type: Number, required: true, default: 0 },
  sgstAmount: { type: Number, required: true, default: 0 },
  igstAmount: { type: Number, required: true, default: 0 },
  taxableAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
}, { _id: true });

const paymentEntrySchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  mode: { type: String, enum: ['CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'OTHER'], required: true },
  reference: { type: String },
  bank: { type: String },
  notes: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recordedAt: { type: Date, default: Date.now },
}, { _id: true });

const invoiceSchema = new Schema<IInvoiceDoc>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

  invoiceNumber: { type: String, required: true },
  orderNumber: { type: String },
  invoiceDate: { type: Date, required: true, index: true },
  dueDate: { type: Date, required: true, index: true },

  partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
  partySnapshot: {
    name: { type: String, required: true },
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

  businessSnapshot: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    gstin: { type: String },
  },

  challanIds: [{ type: Schema.Types.ObjectId, ref: 'Challan', required: true }],
  challanNumbers: [{ type: String, required: true }],

  supplyType: { type: String, enum: ['INTRA_STATE', 'INTER_STATE'], required: true },
  items: { type: [invoiceItemSchema], required: true },

  subtotal: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalCgst: { type: Number, required: true, default: 0 },
  totalSgst: { type: Number, required: true, default: 0 },
  totalIgst: { type: Number, required: true, default: 0 },
  totalGst: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  roundOff: { type: Number, required: true, default: 0 },
  finalAmount: { type: Number, required: true },
  amountInWords: { type: String, required: true },

  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'UNPAID', index: true },
  payments: [paymentEntrySchema],
  totalPaid: { type: Number, required: true, default: 0 },
  balanceDue: { type: Number, required: true, index: true },
  paidAt: { type: Date },

  irnNumber: { type: String },
  eInvoiceStatus: { type: String, enum: ['NOT_GENERATED', 'GENERATED', 'CANCELLED'], default: 'NOT_GENERATED' },
  ackNumber: { type: String },
  ackDate: { type: Date },

  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
  emailSentAt: { type: Date },
  whatsappSentAt: { type: Date },

  notes: { type: String },
  termsAndConditions: { type: String },

  isAmended: { type: Boolean, default: false },
  originalInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'DRAFT'], default: 'ACTIVE', index: true },

  cancelledAt: { type: Date },
  cancellationReason: { type: String },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Unique index for atomic invoice numbers
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
// Search index
invoiceSchema.index({ invoiceNumber: 'text', 'partySnapshot.name': 'text' });

export const Invoice = mongoose.model<IInvoiceDoc>('Invoice', invoiceSchema);
