// ═══════════════════════════════════════════════════════════════
// WhatsApp Commerce Hub — Types
// ═══════════════════════════════════════════════════════════════

// ─── WhatsApp Config ────────────────────────────────────────

export type WAProvider = 'WATI' | 'META_CLOUD_API' | 'TWILIO';

export interface IWhatsAppConfig {
    _id: string;
    businessId: string;
    provider: WAProvider;
    businessPhoneNumber: string;
    displayName: string;
    accessToken: string;
    webhookSecret?: string;
    approvedTemplates: string[];
    isConnected: boolean;
    connectedAt?: string;
    lastSyncAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Conversation ───────────────────────────────────────────

export type ConversationStatus = 'OPEN' | 'PENDING' | 'CLOSED' | 'SNOOZED';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';

export interface IConversation {
    _id: string;
    businessId: string;
    phone: string;
    linkedPartyId?: string;
    linkedLeadId?: string;
    contactName: string;
    city?: string;
    tags: string[];
    status: ConversationStatus;
    assignedToUserId?: string;
    isStarred: boolean;
    isPinned: boolean;

    lastMessage?: {
        text: string;
        type: string;
        direction: MessageDirection;
        sentAt: string;
    };

    unreadCount: number;
    lastSeenAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Message ────────────────────────────────────────────────

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'TEMPLATE' | 'NOTE';
export type DeliveryStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface IChatMessage {
    _id: string;
    businessId: string;
    conversationId: string;
    providerMessageId?: string;
    direction: MessageDirection;
    type: ChatMessageType;
    body: string;
    mediaUrl?: string;
    deliveryStatus?: DeliveryStatus;
    isInternalNote: boolean;
    isStarred: boolean;
    sentByUserId?: string;
    createdAt: string;
}

// ─── Template ───────────────────────────────────────────────

export type TemplateCategory = 'SALES' | 'OPERATIONS' | 'COLLECTIONS' | 'SUPPORT';

export interface IMessageTemplate {
    _id: string;
    businessId: string;
    name: string;
    category: TemplateCategory;
    bodyEn: string;
    bodyHi: string;
    placeholders: string[];
    isApproved: boolean;
    usageCount: number;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Campaign ───────────────────────────────────────────────

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'CANCELLED';

export interface ICampaign {
    _id: string;
    businessId: string;
    name: string;
    templateId: string;
    audienceFilters: {
        tags?: string[];
        cities?: string[];
        partyType?: string;
        hasOutstanding?: boolean;
        dormantDays?: number;
    };
    recipientCount: number;
    scheduledAt?: string;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    repliedCount: number;
    failedCount: number;
    status: CampaignStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// ─── AI Bot ─────────────────────────────────────────────────

export interface IAIBotResponse {
    reply: string;
    confidence: number;
    action?: string;
    actionData?: any;
    assignToHuman: boolean;
}

// ─── Analytics ──────────────────────────────────────────────

export interface IWhatsAppAnalytics {
    avgResponseTimeMinutes: number;
    totalConversations: number;
    unreadChats: number;
    messagesSentToday: number;
    messagesReceivedToday: number;
    conversionsFromWA: number;
    collectionsViaWA: number;
    busiestHour: number;
    chatsBySalesman: Array<{ userId: string; userName: string; count: number }>;
    topInquiryQualities: Array<{ quality: string; count: number }>;
}

// ─── Customer Context ───────────────────────────────────────

export interface IChatCustomerContext {
    party?: any;
    lead?: any;
    outstanding: number;
    recentChallans: any[];
    recentInvoices: any[];
    lastOrderDate?: string;
    pendingQuotations: number;
    riskScore: number;
    creditGrade: string;
    tags: string[];
}
