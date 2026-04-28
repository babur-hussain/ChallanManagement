import mongoose, { Schema, Document } from 'mongoose';
import type { IVisit } from '@textilepro/shared';

export type VisitDocument = Document & Omit<IVisit, '_id'> & { _id: mongoose.Types.ObjectId };

const visitSchema = new Schema<VisitDocument>(
    {
        businessId: { type: String, required: true },
        userId: { type: String, required: true },
        partyId: { type: String },
        leadId: { type: String },

        checkInAt: { type: Date, required: true },
        checkOutAt: { type: Date },
        durationMinutes: { type: Number },

        gpsStart: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            accuracy: { type: Number },
        },
        gpsEnd: {
            latitude: { type: Number },
            longitude: { type: Number },
            accuracy: { type: Number },
        },

        notes: { type: String },
        photos: [{ type: String }],

        visitOutcome: {
            type: String,
            enum: ['MET_OWNER', 'RATE_SHARED', 'SAMPLE_REQUIRED', 'ORDER_EXPECTED', 'NO_RESPONSE', 'CLOSED']
        },

        nextAction: { type: String },
        nextFollowUpAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Indices for geographic map lookups and timesheet tracking
visitSchema.index({ businessId: 1, userId: 1, checkInAt: -1 });
visitSchema.index({ businessId: 1, partyId: 1 });
visitSchema.index({ businessId: 1, leadId: 1 });

export const Visit = mongoose.model<VisitDocument>('Visit', visitSchema);
