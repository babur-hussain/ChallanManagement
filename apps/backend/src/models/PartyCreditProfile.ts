import mongoose, { Document, Schema } from 'mongoose';

export interface IPartyCreditProfileDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    partyId: mongoose.Types.ObjectId;

    creditLimitAmount: number;
    creditDays: number;

    avgDelayDays: number;
    maxDelayDays: number;
    onTimePaymentPercent: number;
    bouncedPaymentsCount: number;
    totalLifetimeSales: number;
    totalLifetimePayments: number;
    currentOutstanding: number;
    highestOutstandingEver: number;

    chronicLatePayer: boolean;
    chequeBounceRisk: boolean;
    inactiveButOutstanding: boolean;
    overLimitNow: boolean;
    overdueNow: boolean;

    creditScore: number;
    creditGrade: string;
    riskLevel: string;
    recommendation: string;
    aiSuggestions: string[];

    isBlocked: boolean;
    blockedAt?: Date;
    blockedBy?: mongoose.Types.ObjectId;
    blockedReason?: string;
    unblockedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const partyCreditProfileSchema = new Schema<IPartyCreditProfileDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },

    creditLimitAmount: { type: Number, default: 100000 },
    creditDays: { type: Number, default: 30 },

    avgDelayDays: { type: Number, default: 0 },
    maxDelayDays: { type: Number, default: 0 },
    onTimePaymentPercent: { type: Number, default: 100 },
    bouncedPaymentsCount: { type: Number, default: 0 },
    totalLifetimeSales: { type: Number, default: 0 },
    totalLifetimePayments: { type: Number, default: 0 },
    currentOutstanding: { type: Number, default: 0 },
    highestOutstandingEver: { type: Number, default: 0 },

    chronicLatePayer: { type: Boolean, default: false },
    chequeBounceRisk: { type: Boolean, default: false },
    inactiveButOutstanding: { type: Boolean, default: false },
    overLimitNow: { type: Boolean, default: false },
    overdueNow: { type: Boolean, default: false },

    creditScore: { type: Number, default: 75, min: 0, max: 100 },
    creditGrade: { type: String, enum: ['A+', 'A', 'B', 'C', 'D', 'HIGH_RISK'], default: 'B' },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    recommendation: { type: String, enum: ['INCREASE_LIMIT', 'MAINTAIN', 'REDUCE_LIMIT', 'BLOCK_NEW_DISPATCH'], default: 'MAINTAIN' },
    aiSuggestions: { type: [String], default: [] },

    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    blockedReason: { type: String },
    unblockedAt: { type: Date },
}, { timestamps: true });

partyCreditProfileSchema.index({ businessId: 1, partyId: 1 }, { unique: true });
partyCreditProfileSchema.index({ businessId: 1, creditGrade: 1 });
partyCreditProfileSchema.index({ businessId: 1, riskLevel: 1 });
partyCreditProfileSchema.index({ businessId: 1, isBlocked: 1 });
partyCreditProfileSchema.index({ businessId: 1, currentOutstanding: -1 });

export const PartyCreditProfile = mongoose.model<IPartyCreditProfileDoc>('PartyCreditProfile', partyCreditProfileSchema);
