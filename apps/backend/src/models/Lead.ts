import mongoose, { Schema, Document } from 'mongoose';
import type { ILead } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Lead Model — potential buyers, wholesalers, retailers etc
// ═══════════════════════════════════════════════════════════════

export interface LeadDocument extends Omit<ILead, '_id'>, Document { }

const leadSchema = new Schema<LeadDocument>(
    {
        businessId: { type: String, required: true, index: true },
        leadNumber: { type: String, required: true, unique: true },
        companyName: { type: String, required: true, trim: true, maxlength: 150 },
        contactPerson: { type: String, required: true, trim: true, maxlength: 100 },
        phone: { type: String, required: true, trim: true },
        whatsapp: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true, default: 'India' },
        gstin: { type: String, uppercase: true, trim: true, sparse: true },

        leadType: { type: String, required: true },
        source: { type: String, required: true },

        interestedQualities: [{ type: String, trim: true }],
        monthlyRequirementMeters: { type: Number, min: 0 },
        estimatedMonthlyValue: { type: Number, min: 0 },
        currentSupplier: { type: String, trim: true },
        notes: { type: String, trim: true, maxlength: 2000 },
        tags: [{ type: String, trim: true, maxlength: 30 }],

        temperature: { type: String, required: true, default: 'COLD' },
        pipelineStage: { type: String, required: true, default: 'NEW' },
        probabilityPercent: { type: Number, min: 0, max: 100, default: 0 },
        expectedCloseDate: { type: Date },

        assignedToUserId: { type: String, index: true },
        nextFollowUpAt: { type: Date, index: true },
        lastInteractionAt: { type: Date },
        wonAt: { type: Date },
        lostReason: { type: String, trim: true, maxlength: 1000 },

        createdBy: { type: String, required: true },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) { ret.id = ret._id; delete ret.__v; },
        },
    }
);

// Indexes
// Unique phone per business for easy identification
leadSchema.index({ businessId: 1, phone: 1 }, { unique: true });
// Fast lookup by assigned user
leadSchema.index({ businessId: 1, assignedToUserId: 1 });
// Queries filtering on stage and temperature
leadSchema.index({ businessId: 1, pipelineStage: 1 });
leadSchema.index({ businessId: 1, temperature: 1 });
// Filtering by city
leadSchema.index({ businessId: 1, city: 1 });

// Text search
leadSchema.index(
    { companyName: 'text', contactPerson: 'text', phone: 'text', city: 'text' },
    { weights: { companyName: 10, contactPerson: 8, phone: 5, city: 3 } }
);

export const Lead = mongoose.model<LeadDocument>('Lead', leadSchema);
