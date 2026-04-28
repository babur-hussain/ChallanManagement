// ═══════════════════════════════════════════════════════════════
// @textilepro/shared — Quotation Types
// ═══════════════════════════════════════════════════════════════

export const QuotationStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    VIEWED: 'VIEWED',
    NEGOTIATION: 'NEGOTIATION',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED',
    CONVERTED: 'CONVERTED',
} as const;

export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus];

export const DiscountType = {
    NONE: 'NONE',
    PERCENT: 'PERCENT',
    FIXED: 'FIXED',
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const GstMode = {
    EXTRA: 'EXTRA',
    INCLUDED: 'INCLUDED',
} as const;

export type GstMode = (typeof GstMode)[keyof typeof GstMode];

// ─── Customer Snapshot ──────────────────────────────────────

export interface ICustomerSnapshot {
    companyName: string;
    contactPerson?: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    state?: string;
    gstin?: string;
}

// ─── Quotation Item ─────────────────────────────────────────

export interface IQuotationItem {
    itemId: string;
    itemName: string;
    itemCode: string;
    hsnCode?: string;
    quantityMeters: number;
    minimumOrderQty?: number;
    ratePerMeter: number;
    discountType: DiscountType;
    discountValue: number;
    finalRate: number;
    lineAmount: number;
}

// ─── Negotiation Note ───────────────────────────────────────

export interface INegotiationNote {
    _id?: string;
    text: string;
    createdBy: string;
    createdByName?: string;
    createdAt: Date;
}

// ─── Quotation ──────────────────────────────────────────────

export interface IQuotation {
    _id: string;
    businessId: string;
    quotationNumber: string;

    date: Date;
    validTillDate: Date;
    status: QuotationStatus;

    partyId?: string;
    leadId?: string;
    customerSnapshot: ICustomerSnapshot;

    items: IQuotationItem[];

    freightTerms?: string;
    packingTerms?: string;
    gstMode: GstMode;
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
    convertedToChallanId?: string;
    convertedToInvoiceId?: string;

    // Negotiation
    negotiationNotes?: INegotiationNote[];

    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Rate Intelligence ──────────────────────────────────────

export interface IRateHistory {
    _id: string;
    businessId: string;
    itemId: string;
    date: Date;
    purchaseRate?: number;
    standardSellRate?: number;
    lowestAllowedRate?: number;
    marketRate?: number;
    competitorRate?: number;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRateIntelligence {
    itemId: string;
    lastSoldRate?: number;
    avg30DayRate?: number;
    bestMarginRate?: number;
    minimumSafeRate?: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    warnings: Array<{ level: 'RED' | 'AMBER'; message: string }>;
}
