import mongoose, { Schema, Document } from 'mongoose';
import type { IFollowUpTask } from '@textilepro/shared';

export type FollowUpTaskDocument = Document & Omit<IFollowUpTask, '_id'> & { _id: mongoose.Types.ObjectId };

const followUpTaskSchema = new Schema<FollowUpTaskDocument>(
    {
        businessId: { type: String, required: true },
        relatedType: { type: String, enum: ['LEAD', 'PARTY', 'INVOICE', 'GENERAL'], required: true },
        relatedId: { type: String },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        assignedToUserId: { type: String, required: true },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], required: true },
        dueAt: { type: Date, required: true },
        reminderAt: { type: Date },
        status: { type: String, enum: ['PENDING', 'DONE', 'MISSED', 'CANCELLED'], default: 'PENDING' },
        completedAt: { type: Date },
        completedNotes: { type: String },
        createdBy: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Optimize for common queries
followUpTaskSchema.index({ businessId: 1, assignedToUserId: 1, status: 1 });
followUpTaskSchema.index({ businessId: 1, dueAt: 1, status: 1 });
followUpTaskSchema.index({ businessId: 1, relatedType: 1, relatedId: 1 });

export const FollowUpTask = mongoose.model<FollowUpTaskDocument>('FollowUpTask', followUpTaskSchema);
