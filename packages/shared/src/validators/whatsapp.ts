import { z } from 'zod';

// ─── WhatsApp Config ────────────────────────────────────────

export const WhatsAppConfigSchema = z.object({
    provider: z.enum(['WATI', 'META_CLOUD_API', 'TWILIO']),
    businessPhoneNumber: z.string().min(10),
    displayName: z.string().min(1),
    accessToken: z.string().min(1),
    webhookSecret: z.string().optional(),
});

export type WhatsAppConfigInput = z.infer<typeof WhatsAppConfigSchema>;

// ─── Send Message ───────────────────────────────────────────

export const SendMessageSchema = z.object({
    conversationId: z.string().min(1),
    type: z.enum(['TEXT', 'IMAGE', 'PDF', 'AUDIO', 'VIDEO', 'DOCUMENT', 'TEMPLATE', 'NOTE']),
    body: z.string().min(1),
    mediaUrl: z.string().optional(),
    isInternalNote: z.boolean().optional().default(false),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

// ─── Template ───────────────────────────────────────────────

export const CreateTemplateSchema = z.object({
    name: z.string().min(1),
    category: z.enum(['SALES', 'OPERATIONS', 'COLLECTIONS', 'SUPPORT']),
    bodyEn: z.string().min(1),
    bodyHi: z.string().min(1),
    placeholders: z.array(z.string()).optional().default([]),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;

// ─── Campaign ───────────────────────────────────────────────

export const CreateCampaignSchema = z.object({
    name: z.string().min(1),
    templateId: z.string().min(1),
    audienceFilters: z.object({
        tags: z.array(z.string()).optional(),
        cities: z.array(z.string()).optional(),
        partyType: z.string().optional(),
        hasOutstanding: z.boolean().optional(),
        dormantDays: z.number().optional(),
    }).optional().default({}),
    scheduledAt: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

// ─── Conversation Actions ───────────────────────────────────

export const AssignChatSchema = z.object({
    conversationId: z.string().min(1),
    assignToUserId: z.string().min(1),
});

export type AssignChatInput = z.infer<typeof AssignChatSchema>;

export const UpdateConversationSchema = z.object({
    status: z.enum(['OPEN', 'PENDING', 'CLOSED', 'SNOOZED']).optional(),
    tags: z.array(z.string()).optional(),
    isStarred: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    linkedPartyId: z.string().optional(),
    linkedLeadId: z.string().optional(),
});

export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;
