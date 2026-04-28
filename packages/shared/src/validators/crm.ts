import { z } from 'zod';
import { LeadType, LeadSource, LeadTemperature, PipelineStage } from '../types/crm';

const leadTypeValues = Object.values(LeadType) as [string, ...string[]];
const sourceValues = Object.values(LeadSource) as [string, ...string[]];
const tempValues = Object.values(LeadTemperature) as [string, ...string[]];
const stageValues = Object.values(PipelineStage) as [string, ...string[]];

export const createLeadSchema = z.object({
    companyName: z.string().min(2, 'Company name too short').max(150),
    contactPerson: z.string().min(2, 'Contact person name too short').max(100),
    phone: z.string().min(10, 'Invalid phone number'),
    whatsapp: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().default('India'),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),

    leadType: z.enum(leadTypeValues),
    source: z.enum(sourceValues),

    interestedQualities: z.array(z.string()).default([]),
    monthlyRequirementMeters: z.number().min(0).optional(),
    estimatedMonthlyValue: z.number().min(0).optional(),
    currentSupplier: z.string().optional(),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string()).default([]),

    temperature: z.enum(tempValues).default('COLD'),
    pipelineStage: z.enum(stageValues).default('NEW'),
    probabilityPercent: z.number().min(0).max(100).default(0),
    expectedCloseDate: z.string().datetime().optional(),

    assignedToUserId: z.string().optional(),
    nextFollowUpAt: z.string().datetime().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadFilterSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
    search: z.string().optional(),
    stage: z.enum(stageValues).optional(),
    temperature: z.enum(tempValues).optional(),
    source: z.enum(sourceValues).optional(),
    city: z.string().optional(),
    assignedToUserId: z.string().optional(),
    followupOverdue: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    sortBy: z.enum(['createdAt', 'expectedCloseDate', 'estimatedMonthlyValue']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const changeStageSchema = z.object({
    stage: z.enum(stageValues),
});

export const addNoteSchema = z.object({
    note: z.string().min(1, 'Note cannot be empty'),
});

export const addFollowupSchema = z.object({
    date: z.string().datetime(),
    note: z.string().optional(),
});

export const assignUserSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
});

export const markWonSchema = z.object({
    partyId: z.string().optional(), // if linking to existing party
    remarks: z.string().optional(),
});

export const markLostSchema = z.object({
    lostReason: z.string().min(3, 'Lost reason must be provided'),
});
