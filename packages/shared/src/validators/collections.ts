import { z } from 'zod';

// ─── Credit Profile ─────────────────────────────────────────

export const UpdateCreditProfileSchema = z.object({
    creditLimitAmount: z.number().min(0).optional(),
    creditDays: z.number().min(0).optional(),
});

export type UpdateCreditProfileInput = z.infer<typeof UpdateCreditProfileSchema>;

// ─── Promise to Pay ─────────────────────────────────────────

export const CreatePromiseSchema = z.object({
    partyId: z.string().min(1),
    invoiceId: z.string().optional(),
    promisedAmount: z.number().min(1),
    promisedDate: z.string().min(1),
    promisedByName: z.string().min(1),
    communicationMode: z.enum(['CALL', 'WHATSAPP', 'VISIT', 'EMAIL']),
    notes: z.string().optional(),
});

export type CreatePromiseInput = z.infer<typeof CreatePromiseSchema>;

// ─── Collection Task ────────────────────────────────────────

export const CreateCollectionTaskSchema = z.object({
    partyId: z.string().min(1),
    invoiceId: z.string().optional(),
    assignedToUserId: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    reason: z.enum(['DUE_TODAY', 'OVERDUE', 'BROKEN_PROMISE', 'OVER_LIMIT', 'MANUAL']),
    dueAt: z.string().min(1),
});

export type CreateCollectionTaskInput = z.infer<typeof CreateCollectionTaskSchema>;

export const CompleteCollectionTaskSchema = z.object({
    actionTaken: z.string().min(1),
    amountCollected: z.number().min(0).optional(),
});

export type CompleteCollectionTaskInput = z.infer<typeof CompleteCollectionTaskSchema>;

// ─── Block / Unblock ────────────────────────────────────────

export const BlockPartySchema = z.object({
    reason: z.string().min(1),
});

export type BlockPartyInput = z.infer<typeof BlockPartySchema>;

// ─── Break Promise ──────────────────────────────────────────

export const BreakPromiseSchema = z.object({
    promiseId: z.string().min(1),
    reason: z.string().optional(),
});

export type BreakPromiseInput = z.infer<typeof BreakPromiseSchema>;
