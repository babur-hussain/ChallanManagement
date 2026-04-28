import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationItemDoc {
    itemId: mongoose.Types.ObjectId;
    itemName: string;
    itemCode: string;
    hsnCode?: string;
    quantityMeters: number;
    minimumOrderQty?: number;
    ratePerMeter: number;
    discountType: 'NONE' | 'PERCENT' | 'FIXED';
    discountValue: number;
    finalRate: number;
    lineAmount: number;
}

export interface INegotiationNoteDoc {
    text: string;
    createdBy: mongoose.Types.ObjectId;
    createdByName?: string;
    createdAt: Date;
}

export interface IQuotationDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    quotationNumber: string;
    date: Date;
    validTillDate: Date;
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';

    partyId?: mongoose.Types.ObjectId;
    leadId?: mongoose.Types.ObjectId;
    customerSnapshot: {
        companyName: string;
        contactPerson?: string;
        phone?: string;
        whatsapp?: string;
        city?: string;
        state?: string;
        gstin?: string;
    };

    items: IQuotationItemDoc[];

    freightTerms?: string;
    packingTerms?: string;
    gstMode: 'EXTRA' | 'INCLUDED';
    paymentTerms?: string;
    dispatchTime?: string;
    remarks?: string;

    // Totals
    subtotal: number;
    totalDiscount: number;
    taxableAmount: number;
    estimatedGst: number;
    grandTotal: number;

    // Commercial
    expectedMarginAmount?: number;
    expectedMarginPercent?: number;

    // Tracking
    sentAt?: Date;
    viewedAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    convertedToChallanId?: mongoose.Types.ObjectId;
    convertedToInvoiceId?: mongoose.Types.ObjectId;

    // Negotiation
    negotiationNotes: INegotiationNoteDoc[];

    // Auto-followup tracking
    followupSentCount: number;
    lastFollowupAt?: Date;

    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const quotationItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true },
    itemCode: { type: String, required: true },
    hsnCode: { type: String },
    quantityMeters: { type: Number, required: true },
    minimumOrderQty: { type: Number },
    ratePerMeter: { type: Number, required: true },
    discountType: { type: String, enum: ['NONE', 'PERCENT', 'FIXED'], default: 'NONE' },
    discountValue: { type: Number, default: 0 },
    finalRate: { type: Number, required: true },
    lineAmount: { type: Number, required: true },
}, { _id: true });

const negotiationNoteSchema = new Schema({
    text: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });

const quotationSchema = new Schema<IQuotationDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    quotationNumber: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    validTillDate: { type: Date, required: true, index: true },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'],
        default: 'DRAFT',
        required: true,
        index: true,
    },

    partyId: { type: Schema.Types.ObjectId, ref: 'Party', index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    customerSnapshot: {
        companyName: { type: String, required: true },
        contactPerson: { type: String },
        phone: { type: String },
        whatsapp: { type: String },
        city: { type: String },
        state: { type: String },
        gstin: { type: String },
    },

    items: { type: [quotationItemSchema], required: true },

    freightTerms: { type: String },
    packingTerms: { type: String },
    gstMode: { type: String, enum: ['EXTRA', 'INCLUDED'], default: 'EXTRA' },
    paymentTerms: { type: String },
    dispatchTime: { type: String },
    remarks: { type: String },

    // Totals
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    estimatedGst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Commercial
    expectedMarginAmount: { type: Number },
    expectedMarginPercent: { type: Number },

    // Tracking
    sentAt: { type: Date },
    viewedAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    convertedToChallanId: { type: Schema.Types.ObjectId, ref: 'Challan' },
    convertedToInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },

    // Negotiation
    negotiationNotes: { type: [negotiationNoteSchema], default: [] },

    // Auto-followup
    followupSentCount: { type: Number, default: 0 },
    lastFollowupAt: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

// Indexes
quotationSchema.index({ businessId: 1, quotationNumber: 1 }, { unique: true });
quotationSchema.index({ businessId: 1, status: 1, validTillDate: 1 });
quotationSchema.index({ businessId: 1, partyId: 1, date: -1 });
quotationSchema.index({ businessId: 1, createdBy: 1, date: -1 });

// Text search
quotationSchema.index({
    quotationNumber: 'text',
    'customerSnapshot.companyName': 'text',
    'customerSnapshot.contactPerson': 'text',
});

export const Quotation = mongoose.model<IQuotationDoc>('Quotation', quotationSchema);
