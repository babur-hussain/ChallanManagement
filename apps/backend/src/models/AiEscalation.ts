import mongoose, { Document, Schema } from 'mongoose';

export interface IAiEscalationDoc extends Document {
    businessId: string;
    agentName: string; // e.g. 'SALES_REP', 'COLLECTIONS_AGENT'
    actionType: 'ISSUE_DISCOUNT' | 'SEND_BULK_EMAIL' | 'CHANGE_PLAN' | 'MARK_BAD_DEBT';
    proposedPayload: any;
    justification: string;
    confidenceScore: number;
    status: 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED';
    reviewedByUserId?: Schema.Types.ObjectId;
    createdAt: Date;
}

const aiEscalationSchema = new Schema<IAiEscalationDoc>({
    businessId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    actionType: { type: String, required: true },
    proposedPayload: { type: Schema.Types.Mixed },
    justification: { type: String, required: true },
    confidenceScore: { type: Number, required: true },
    status: { type: String, default: 'PENDING_HUMAN', enum: ['PENDING_HUMAN', 'APPROVED', 'REJECTED'] },
    reviewedByUserId: { type: Schema.Types.ObjectId }
}, { timestamps: true });

export const AiEscalation = mongoose.model<IAiEscalationDoc>('AiEscalation', aiEscalationSchema);
