// ═══════════════════════════════════════════════════════════════
// OCR Document Intelligence — Types
// ═══════════════════════════════════════════════════════════════

// ─── OCR Providers ──────────────────────────────────────────

export type OCRProvider = 'GOOGLE_VISION' | 'AWS_TEXTRACT' | 'AZURE_OCR' | 'OPENROUTER' | 'GEMINI_VISION' | 'CLAUDE_VISION' | 'TESSERACT';

export interface IOCRConfig {
    _id: string;
    businessId: string;
    defaultProvider: OCRProvider;
    providerSettings: Record<string, { apiKey?: string; endpoint?: string; enabled: boolean }>;
    taskRouting: {
        textOCR: OCRProvider;
        handwriting: OCRProvider;
        tableExtraction: OCRProvider;
        invoiceParsing: OCRProvider;
        visitingCards: OCRProvider;
        statements: OCRProvider;
    };
    confidenceThresholds: {
        autoApprove: number;
        reviewRequired: number;
    };
    createdAt: string;
    updatedAt: string;
}

// ─── Document ───────────────────────────────────────────────

export type DocumentSource = 'UPLOAD' | 'WHATSAPP' | 'EMAIL' | 'CAMERA' | 'SYSTEM';
export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'COMPLETED' | 'FAILED';

export type DocumentType =
    | 'DELIVERY_CHALLAN' | 'GST_INVOICE' | 'PURCHASE_BILL' | 'TRANSPORT_LR'
    | 'PAYMENT_SCREENSHOT' | 'PARTY_LEDGER' | 'VISITING_CARD' | 'RATE_LIST'
    | 'FABRIC_CATALOG' | 'STOCK_SHEET' | 'HANDWRITTEN_NOTE' | 'CHEQUE_IMAGE'
    | 'BANK_STATEMENT' | 'EXPENSE_BILL' | 'GST_RETURN' | 'UNKNOWN';

export type LinkedEntityType = 'PARTY' | 'CHALLAN' | 'INVOICE' | 'PAYMENT' | 'PURCHASE' | 'EXPENSE' | 'LEAD' | 'OTHER';

export interface IDocument {
    _id: string;
    businessId: string;
    documentNumber: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageUrl: string;
    thumbnailUrl?: string;
    source: DocumentSource;
    typeDetected: DocumentType;
    confidenceScore: number;
    languageDetected: string;
    pagesCount: number;
    status: DocumentStatus;
    extractedText?: string;
    extractedData?: any;
    fieldConfidences?: Record<string, number>;
    linkedEntityType?: LinkedEntityType;
    linkedEntityId?: string;
    reviewNotes?: string;
    processedAt?: string;
    processingTimeMs?: number;
    ocrProvider?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Extracted Data Shapes ──────────────────────────────────

export interface IChallanExtract {
    challanNumber?: string;
    date?: string;
    supplierName?: string;
    buyerName?: string;
    partyPhone?: string;
    items: Array<{
        itemName?: string;
        rollCount?: number;
        meters?: number;
        rate?: number;
        amount?: number;
    }>;
    totalMeters?: number;
    totalAmount?: number;
    vehicleNumber?: string;
    remarks?: string;
}

export interface IInvoiceExtract {
    vendorName?: string;
    gstin?: string;
    invoiceNumber?: string;
    date?: string;
    items: Array<{
        description?: string;
        quantity?: number;
        rate?: number;
        taxPercent?: number;
        amount?: number;
    }>;
    subtotal?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    totalTax?: number;
    grandTotal?: number;
}

export interface IPaymentExtract {
    payerName?: string;
    receiverName?: string;
    amount?: number;
    date?: string;
    utrNumber?: string;
    transactionId?: string;
    bankName?: string;
    appName?: string;
    status?: string;
}

export interface IVisitingCardExtract {
    companyName?: string;
    personName?: string;
    designation?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    city?: string;
    address?: string;
    website?: string;
}

export interface IRateListExtract {
    supplierName?: string;
    date?: string;
    items: Array<{
        itemName?: string;
        rate?: number;
        moq?: number;
        notes?: string;
    }>;
}

export interface IBankStatementExtract {
    accountNumber?: string;
    bankName?: string;
    periodFrom?: string;
    periodTo?: string;
    entries: Array<{
        date?: string;
        narration?: string;
        debit?: number;
        credit?: number;
        balance?: number;
    }>;
}

// ─── Analytics ──────────────────────────────────────────────

export interface IOCRAnalytics {
    docsProcessedToday: number;
    docsProcessedTotal: number;
    typingHoursSaved: number;
    autoAccuracyPercent: number;
    paymentScreenshotsConverted: number;
    pendingReview: number;
    failedCount: number;
    byType: Array<{ type: string; count: number }>;
    byUser: Array<{ userId: string; userName: string; count: number }>;
}
