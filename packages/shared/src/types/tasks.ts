export type FollowUpRelatedType = 'LEAD' | 'PARTY' | 'INVOICE' | 'GENERAL';
export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FollowUpStatus = 'PENDING' | 'DONE' | 'MISSED' | 'CANCELLED';

export interface IFollowUpTask {
    _id: string;
    businessId: string;
    relatedType: FollowUpRelatedType;
    relatedId?: string;
    title: string;
    description?: string;
    assignedToUserId: string;
    priority: FollowUpPriority;
    dueAt: Date;
    reminderAt?: Date;
    status: FollowUpStatus;
    completedAt?: Date;
    completedNotes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISalesPerformance {
    _id: string;
    businessId: string;
    userId: string;
    date: Date;
    callsMade: number;
    leadsContacted: number;
    followupsCompleted: number;
    meetingsDone: number;
    quotationsSent: number;
    leadsWon: number;
    challansCreated: number;
    invoiceValueGenerated: number;
    paymentsCollected: number;
    kilometersTravelled: number;
    activeMinutesInApp: number;
    createdAt: Date;
    updatedAt: Date;
}

export type VisitOutcomeType = 'MET_OWNER' | 'RATE_SHARED' | 'SAMPLE_REQUIRED' | 'ORDER_EXPECTED' | 'NO_RESPONSE' | 'CLOSED';

export interface IVisitGPS {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

export interface IVisit {
    _id: string;
    businessId: string;
    userId: string;
    partyId?: string;
    leadId?: string;
    checkInAt: Date;
    checkOutAt?: Date;
    durationMinutes?: number;
    gpsStart: IVisitGPS;
    gpsEnd?: IVisitGPS;
    notes?: string;
    photos?: string[];
    visitOutcome?: VisitOutcomeType;
    nextAction?: string;
    nextFollowUpAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
