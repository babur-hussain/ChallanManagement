import mongoose, { Schema, Document } from 'mongoose';
import type { ILeadActivity } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// LeadActivity Model — timeline events for leads
// ═══════════════════════════════════════════════════════════════

export interface LeadActivityDocument extends Omit<ILeadActivity, '_id'>, Document { }

const leadActivitySchema = new Schema<LeadActivityDocument>(
    {
        businessId: { type: String, required: true, index: true },
        leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
        type: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        performedBy: { type: String, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) { ret.id = ret._id; delete ret.__v; },
        },
    }
);

// We often query activities for a specific lead, ordered by timestamp
leadActivitySchema.index({ businessId: 1, leadId: 1, createdAt: -1 });

export const LeadActivity = mongoose.model<LeadActivityDocument>('LeadActivity', leadActivitySchema);
