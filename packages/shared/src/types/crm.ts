// ═══════════════════════════════════════════════════════════════

export const LeadType = {
    RETAILER: 'RETAILER',
    WHOLESALER: 'WHOLESALER',
    DISTRIBUTOR: 'DISTRIBUTOR',
    EXPORTER: 'EXPORTER',
    BOUTIQUE: 'BOUTIQUE',
    MANUFACTURER: 'MANUFACTURER',
    BROKER: 'BROKER',
    OTHER: 'OTHER',
} as const;

export type LeadType = (typeof LeadType)[keyof typeof LeadType];

export const LeadSource = {
    MANUAL: 'MANUAL',
    REFERRAL: 'REFERRAL',
    WHATSAPP: 'WHATSAPP',
    WEBSITE: 'WEBSITE',
    INDIA_MART: 'INDIA_MART',
    TRADE_FAIR: 'TRADE_FAIR',
    INSTAGRAM: 'INSTAGRAM',
    FACEBOOK: 'FACEBOOK',
    WALK_IN: 'WALK_IN',
    CALL: 'CALL',
    OTHER: 'OTHER',
} as const;

export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const LeadTemperature = {
    HOT: 'HOT',
    WARM: 'WARM',
    COLD: 'COLD',
} as const;

export type LeadTemperature = (typeof LeadTemperature)[keyof typeof LeadTemperature];

export const PipelineStage = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    FOLLOWUP: 'FOLLOWUP',
    SAMPLE_SENT: 'SAMPLE_SENT',
    RATE_SHARED: 'RATE_SHARED',
    NEGOTIATION: 'NEGOTIATION',
    WON: 'WON',
    LOST: 'LOST',
    DORMANT: 'DORMANT',
} as const;

export type PipelineStage = (typeof PipelineStage)[keyof typeof PipelineStage];

export const LeadActivityType = {
    CREATED: 'CREATED',
    CALL: 'CALL',
    WHATSAPP: 'WHATSAPP',
    NOTE: 'NOTE',
    FOLLOWUP_SET: 'FOLLOWUP_SET',
    STAGE_CHANGED: 'STAGE_CHANGED',
    ASSIGNED: 'ASSIGNED',
    WON: 'WON',
    LOST: 'LOST',
    EMAIL: 'EMAIL',
} as const;

export type LeadActivityType = (typeof LeadActivityType)[keyof typeof LeadActivityType];

export interface ILead {
    _id: string;
    businessId: string;
    leadNumber: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    city: string;
    state: string;
    country: string;
    gstin?: string;
    leadType: LeadType;
    source: LeadSource;
    interestedQualities: string[];
    monthlyRequirementMeters?: number;
    estimatedMonthlyValue?: number;
    currentSupplier?: string;
    notes?: string;
    tags: string[];
    temperature: LeadTemperature;
    pipelineStage: PipelineStage;
    probabilityPercent: number;
    expectedCloseDate?: Date;
    assignedToUserId?: string;
    nextFollowUpAt?: Date;
    lastInteractionAt?: Date;
    wonAt?: Date;
    lostReason?: string;
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    timeline?: ILeadActivity[];
}

export interface LeadQueryFilters {
    page?: number;
    limit?: number;
    search?: string;
    stage?: PipelineStage;
    leadType?: LeadType;
    source?: LeadSource;
    temperature?: LeadTemperature;
    assignedToUserId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateLeadInput {
    companyName: string;
    contactPerson?: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    city: string;
    state?: string;
    country?: string;
    gstin?: string;
    leadType: LeadType;
    source: LeadSource;
    interestedQualities?: string[];
    monthlyRequirementMeters?: number;
    estimatedMonthlyValue?: number;
    currentSupplier?: string;
    notes?: string;
    tags?: string[];
    temperature?: LeadTemperature;
    pipelineStage?: PipelineStage;
    probabilityPercent?: number;
    expectedCloseDate?: Date;
    assignedToUserId?: string;
    nextFollowUpAt?: Date;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;

export interface ILeadActivity {
    _id: string;
    businessId: string;
    leadId: string;
    type: LeadActivityType;
    title: string;
    description?: string;
    performedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
