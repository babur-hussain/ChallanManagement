import { z } from 'zod';

export const FollowUpRelatedTypeSchema = z.enum(['LEAD', 'PARTY', 'INVOICE', 'GENERAL']);
export const FollowUpPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const FollowUpStatusSchema = z.enum(['PENDING', 'DONE', 'MISSED', 'CANCELLED']);

export const CreateFollowUpTaskSchema = z.object({
    relatedType: FollowUpRelatedTypeSchema,
    relatedId: z.string().optional(),
    title: z.string().min(3),
    description: z.string().optional(),
    assignedToUserId: z.string(),
    priority: FollowUpPrioritySchema,
    dueAt: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
    reminderAt: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional()
});

export const UpdateFollowUpTaskSchema = CreateFollowUpTaskSchema.partial();

export const VisitOutcomeSchema = z.enum(['MET_OWNER', 'RATE_SHARED', 'SAMPLE_REQUIRED', 'ORDER_EXPECTED', 'NO_RESPONSE', 'CLOSED']);

export const GPSCoordinatesSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional()
});

export const CheckInVisitSchema = z.object({
    partyId: z.string().optional(),
    leadId: z.string().optional(),
    gpsStart: GPSCoordinatesSchema,
}).refine(data => data.partyId || data.leadId, {
    message: "Either partyId or leadId must be provided"
});

export const CheckOutVisitSchema = z.object({
    gpsEnd: GPSCoordinatesSchema.optional(),
    notes: z.string().optional(),
    photos: z.array(z.string()).optional(),
    visitOutcome: VisitOutcomeSchema.optional(),
    nextAction: z.string().optional(),
    nextFollowUpAt: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional()
});
