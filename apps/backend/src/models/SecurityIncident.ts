import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityIncidentDoc extends Document {
    incidentType:
    | 'BRUTE_FORCE_LOGIN'
    | 'SUSPICIOUS_IP_ACCESS'
    | 'UNUSUAL_DATA_EXPORT'
    | 'API_RATE_LIMIT_EXCEEDED'
    | 'SPAM_WHATSAPP';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    businessId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    ipAddress: string;
    description: string;
    isResolved: boolean;
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const securityIncidentSchema = new Schema<ISecurityIncidentDoc>({
    incidentType: { type: String, required: true, index: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String, required: true },
    description: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Ops Admin who managed it
    resolvedAt: { type: Date }
}, { timestamps: true });

export const SecurityIncident = mongoose.model<ISecurityIncidentDoc>('SecurityIncident', securityIncidentSchema);
