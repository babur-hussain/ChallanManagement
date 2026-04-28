import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformLeadDoc extends Document {
    businessName: string;
    contactName: string;
    phone: string;
    email?: string;
    city: string;
    source: 'WEBSITE' | 'WHATSAPP_ADS' | 'FACEBOOK_ADS' | 'PARTNER_REFERRAL' | 'COLD_OUTBOUND';
    stage: 'LEAD' | 'CONTACTED' | 'DEMO_BOOKED' | 'DEMO_DONE' | 'TRIAL_STARTED' | 'ACTIVE_TRIAL' | 'NEGOTIATION' | 'WON' | 'LOST';
    lossReason?: 'PRICE' | 'USING_EXCEL' | 'USING_TALLY_ONLY' | 'NO_URGENCY' | 'COMPETITOR' | 'TRUST_ISSUE' | 'TEAM_RESISTANCE';
    demoAssignedTo?: mongoose.Types.ObjectId;
    demoScheduledAt?: Date;
    demoScore?: 'HOT' | 'MEDIUM' | 'COLD';
    objectionsTracker: string[];
    partnerId?: mongoose.Types.ObjectId;
    businessId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const platformLeadSchema = new Schema<IPlatformLeadDoc>({
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    city: { type: String, required: true, index: true },
    source: { type: String, required: true },
    stage: { type: String, default: 'LEAD', index: true },
    lossReason: { type: String },
    demoAssignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    demoScheduledAt: { type: Date },
    demoScore: { type: String, enum: ['HOT', 'MEDIUM', 'COLD'] },
    objectionsTracker: [{ type: String }],
    partnerId: { type: Schema.Types.ObjectId, ref: 'Partner' },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' }
}, { timestamps: true });

export const PlatformLead = mongoose.model<IPlatformLeadDoc>('PlatformLead', platformLeadSchema);
