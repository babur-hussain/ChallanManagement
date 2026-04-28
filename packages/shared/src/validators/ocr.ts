import { z } from 'zod';

// ─── Upload Document ────────────────────────────────────────

export const UploadDocumentSchema = z.object({
    source: z.enum(['UPLOAD', 'WHATSAPP', 'EMAIL', 'CAMERA', 'SYSTEM']).optional().default('UPLOAD'),
    typeHint: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;

// ─── Review / Approve ───────────────────────────────────────

export const ReviewDocumentSchema = z.object({
    extractedData: z.any(),
    typeDetected: z.string().optional(),
    reviewNotes: z.string().optional(),
});

export type ReviewDocumentInput = z.infer<typeof ReviewDocumentSchema>;

// ─── OCR Config ─────────────────────────────────────────────

export const OCRConfigSchema = z.object({
    defaultProvider: z.enum(['GOOGLE_VISION', 'AWS_TEXTRACT', 'AZURE_OCR', 'OPENROUTER', 'GEMINI_VISION', 'CLAUDE_VISION', 'TESSERACT']),
    confidenceThresholds: z.object({
        autoApprove: z.number().min(0).max(100).optional().default(90),
        reviewRequired: z.number().min(0).max(100).optional().default(60),
    }).optional(),
    taskRouting: z.record(z.string()).optional(),
});

export type OCRConfigInput = z.infer<typeof OCRConfigSchema>;

// ─── Search ─────────────────────────────────────────────────

export const SearchDocumentsSchema = z.object({
    query: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    linkedEntityType: z.string().optional(),
});

export type SearchDocumentsInput = z.infer<typeof SearchDocumentsSchema>;

// ─── Convert Actions ────────────────────────────────────────

export const ConvertDocumentSchema = z.object({
    documentId: z.string().min(1),
    action: z.enum(['CREATE_CHALLAN', 'CREATE_PURCHASE', 'RECORD_PAYMENT', 'CREATE_LEAD', 'CREATE_RATE_ENTRIES', 'RECONCILE_STATEMENT']),
    overrideData: z.any().optional(),
});

export type ConvertDocumentInput = z.infer<typeof ConvertDocumentSchema>;
