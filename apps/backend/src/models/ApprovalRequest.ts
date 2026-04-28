import mongoose, { Document, Schema } from 'mongoose';

export interface IApprovalRequestDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    module: 'EXPENSE' | 'QUOTATION' | 'INVOICE' | 'PAYROLL' | 'STOCK_ADJUSTMENT';
    referenceId?: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    requiredRole: 'OWNER' | 'DIRECTOR' | 'FINANCE_HEAD' | 'MANAGER';
    payload: any; // Frozen snapshot of the action waiting to be executed
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    actionedBy?: mongoose.Types.ObjectId;
    actionedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const approvalRequestSchema = new Schema<IApprovalRequestDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    module: {
        type: String,
        enum: ['EXPENSE', 'QUOTATION', 'INVOICE', 'PAYROLL', 'STOCK_ADJUSTMENT'],
        required: true
    },
    referenceId: { type: Schema.Types.ObjectId },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requiredRole: {
        type: String,
        enum: ['OWNER', 'DIRECTOR', 'FINANCE_HEAD', 'MANAGER'],
        required: true
    },
    payload: { type: Schema.Types.Mixed }, // Payload injected to the execution engine after approval
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
        default: 'PENDING'
    },
    actionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    actionedAt: { type: Date },
    rejectionReason: { type: String }
}, { timestamps: true });

export const ApprovalRequest = mongoose.model<IApprovalRequestDoc>('ApprovalRequest', approvalRequestSchema);
