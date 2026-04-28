import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// Quotation Zod Validators
// ═══════════════════════════════════════════════════════════════

const quotationItemSchema = z.object({
    itemId: z.string().min(1),
    itemName: z.string().min(1),
    itemCode: z.string().min(1),
    hsnCode: z.string().optional(),
    quantityMeters: z.number().positive(),
    minimumOrderQty: z.number().optional(),
    ratePerMeter: z.number().positive(),
    discountType: z.enum(['NONE', 'PERCENT', 'FIXED']).default('NONE'),
    discountValue: z.number().min(0).default(0),
    finalRate: z.number().min(0),
    lineAmount: z.number().min(0),
});

const customerSnapshotSchema = z.object({
    companyName: z.string().min(1),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    gstin: z.string().optional(),
});

const negotiationNoteSchema = z.object({
    text: z.string().min(1),
});

export const CreateQuotationSchema = z.object({
    date: z.string().or(z.date()),
    validTillDate: z.string().or(z.date()),
    partyId: z.string().optional(),
    leadId: z.string().optional(),
    customerSnapshot: customerSnapshotSchema,
    items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
    freightTerms: z.string().optional(),
    packingTerms: z.string().optional(),
    gstMode: z.enum(['EXTRA', 'INCLUDED']).default('EXTRA'),
    paymentTerms: z.string().optional(),
    dispatchTime: z.string().optional(),
    remarks: z.string().optional(),
    subtotal: z.number().min(0),
    totalDiscount: z.number().min(0).default(0),
    taxableAmount: z.number().min(0),
    estimatedGst: z.number().min(0).default(0),
    grandTotal: z.number().min(0),
    expectedMarginAmount: z.number().optional(),
    expectedMarginPercent: z.number().optional(),
    status: z.enum(['DRAFT', 'SENT']).optional().default('DRAFT'),
});

export const UpdateQuotationSchema = CreateQuotationSchema.partial();

export const AddNegotiationNoteSchema = negotiationNoteSchema;

export const RejectQuotationSchema = z.object({
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof UpdateQuotationSchema>;
