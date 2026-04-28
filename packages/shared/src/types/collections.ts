// ═══════════════════════════════════════════════════════════════
// Collections Recovery System — Types
// ═══════════════════════════════════════════════════════════════

// ─── Credit Profile ─────────────────────────────────────────

export type CreditGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'HIGH_RISK';
export type CreditRecommendation = 'INCREASE_LIMIT' | 'MAINTAIN' | 'REDUCE_LIMIT' | 'BLOCK_NEW_DISPATCH';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IPartyCreditProfile {
    _id: string;
    businessId: string;
    partyId: string;

    // Limits
    creditLimitAmount: number;
    creditDays: number;

    // Behavior Metrics
    avgDelayDays: number;
    maxDelayDays: number;
    onTimePaymentPercent: number;
    bouncedPaymentsCount: number;
    totalLifetimeSales: number;
    totalLifetimePayments: number;
    currentOutstanding: number;
    highestOutstandingEver: number;

    // Risk Flags
    chronicLatePayer: boolean;
    chequeBounceRisk: boolean;
    inactiveButOutstanding: boolean;
    overLimitNow: boolean;
    overdueNow: boolean;

    // Score & Grade
    creditScore: number; // 0-100
    creditGrade: CreditGrade;
    riskLevel: RiskLevel;
    recommendation: CreditRecommendation;

    // AI recommendations
    aiSuggestions: string[];

    // Block
    isBlocked: boolean;
    blockedAt?: string;
    blockedBy?: string;
    blockedReason?: string;
    unblockedAt?: string;

    updatedAt: string;
    createdAt: string;
}

// ─── Promise to Pay ─────────────────────────────────────────

export type PromiseStatus = 'ACTIVE' | 'FULFILLED' | 'BROKEN' | 'CANCELLED';
export type CommunicationMode = 'CALL' | 'WHATSAPP' | 'VISIT' | 'EMAIL';

export interface IPromiseToPay {
    _id: string;
    businessId: string;
    partyId: string;
    invoiceId?: string;
    promisedAmount: number;
    promisedDate: string;
    promisedByName: string;
    communicationMode: CommunicationMode;
    notes?: string;
    status: PromiseStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Collection Task ────────────────────────────────────────

export type CollectionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CollectionReason = 'DUE_TODAY' | 'OVERDUE' | 'BROKEN_PROMISE' | 'OVER_LIMIT' | 'MANUAL';
export type CollectionTaskStatus = 'OPEN' | 'DONE' | 'MISSED' | 'CANCELLED';

export interface ICollectionTask {
    _id: string;
    businessId: string;
    partyId: string;
    invoiceId?: string;
    assignedToUserId: string;
    priority: CollectionPriority;
    reason: CollectionReason;
    dueAt: string;
    status: CollectionTaskStatus;
    actionTaken?: string;
    amountCollected?: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Collection Reminder ────────────────────────────────────

export type ReminderStage = 'DAY_0' | 'DAY_7' | 'DAY_15' | 'DAY_30' | 'DAY_45' | 'DAY_60_PLUS';

export interface ICollectionReminder {
    _id: string;
    businessId: string;
    partyId: string;
    invoiceId: string;
    stage: ReminderStage;
    messageHi: string;
    messageEn: string;
    sentAt?: string;
    delivered?: boolean;
    read?: boolean;
    replied?: boolean;
    createdAt: string;
}

// ─── Dashboard & Report Types ───────────────────────────────

export interface ICollectionDashboard {
    totalOutstanding: number;
    dueToday: number;
    overdueTotal: number;
    highRiskAccounts: number;
    collectedToday: number;
    promisesPending: number;
    brokenPromises: number;
}

export interface IAgingBucket {
    label: string;
    min: number;
    max: number;
    amount: number;
    count: number;
}

export interface ICollectorPerformance {
    userId: string;
    userName: string;
    amountAssigned: number;
    amountRecovered: number;
    promisesTaken: number;
    promisesFulfilled: number;
    callsMade: number;
    recoveryPercent: number;
}

export interface IPartyCollectionHistory {
    party: any;
    creditProfile: IPartyCreditProfile;
    unpaidInvoices: any[];
    remindersSent: ICollectionReminder[];
    promises: IPromiseToPay[];
    tasks: ICollectionTask[];
}

// ─── Credit Check Result ────────────────────────────────────

export interface ICreditCheckResult {
    allowed: boolean;
    warnings: Array<{ level: 'RED' | 'AMBER' | 'GREEN'; message: string }>;
    profile?: IPartyCreditProfile;
    requiresOverride: boolean;
    overrideReason?: string;
}
