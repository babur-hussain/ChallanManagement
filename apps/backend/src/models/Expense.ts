import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    expenseNumber: string;
    date: Date;
    category: string; // Matches Chart of Accounts expense groups e.g. 'Rent', 'Electricity'
    vendor?: string;
    vendorGstIn?: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    placeOfSupply?: string;
    hsnSacCode?: string;
    amount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    gstAmount: number; // total tax
    totalAmount: number; // amount + gstAmount
    itcEligibility: boolean;
    reverseCharge: boolean;
    paymentMode: 'CASH' | 'BANK' | 'CREDIT';
    bankAccountId?: string; // If paid via bank
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
    billDocumentId?: mongoose.Types.ObjectId;
    notes?: string;
    approvedBy?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpenseDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    expenseNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true, index: true },
    vendor: { type: String },
    vendorGstIn: { type: String },
    invoiceNumber: { type: String },
    invoiceDate: { type: Date },
    placeOfSupply: { type: String },
    hsnSacCode: { type: String },
    amount: { type: Number, required: true, min: 0 },
    cgstAmount: { type: Number, default: 0, min: 0 },
    sgstAmount: { type: Number, default: 0, min: 0 },
    igstAmount: { type: Number, default: 0, min: 0 },
    cessAmount: { type: Number, default: 0, min: 0 },
    gstAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    itcEligibility: { type: Boolean, default: false },
    reverseCharge: { type: Boolean, default: false },
    paymentMode: { type: String, enum: ['CASH', 'BANK', 'CREDIT'], required: true },
    bankAccountId: { type: String },
    status: { type: String, enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'], default: 'PENDING_APPROVAL' },
    billDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' }, // Links to OCR bill parse
    notes: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Expense = mongoose.model<IExpenseDoc>('Expense', expenseSchema);
