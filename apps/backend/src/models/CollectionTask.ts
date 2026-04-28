import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectionTaskDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    partyId: mongoose.Types.ObjectId;
    invoiceId?: mongoose.Types.ObjectId;
    assignedToUserId: mongoose.Types.ObjectId;
    priority: string;
    reason: string;
    dueAt: Date;
    status: string;
    actionTaken?: string;
    amountCollected?: number;
    createdAt: Date;
    updatedAt: Date;
}

const collectionTaskSchema = new Schema<ICollectionTaskDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    reason: { type: String, enum: ['DUE_TODAY', 'OVERDUE', 'BROKEN_PROMISE', 'OVER_LIMIT', 'MANUAL'], required: true },
    dueAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ['OPEN', 'DONE', 'MISSED', 'CANCELLED'], default: 'OPEN', index: true },
    actionTaken: { type: String },
    amountCollected: { type: Number },
}, { timestamps: true });

collectionTaskSchema.index({ businessId: 1, assignedToUserId: 1, status: 1 });
collectionTaskSchema.index({ businessId: 1, partyId: 1, status: 1 });
collectionTaskSchema.index({ businessId: 1, dueAt: 1, status: 1 });

export const CollectionTask = mongoose.model<ICollectionTaskDoc>('CollectionTask', collectionTaskSchema);
