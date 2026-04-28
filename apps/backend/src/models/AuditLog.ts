import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLogDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'APPROVE' | 'AI_ACTION';
    module: string; // e.g. 'INVOICE', 'CHALLAN', 'AUTH', 'BANKING'
    entityId?: mongoose.Types.ObjectId;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    // Field-level diffing or payload snapshot
    oldValue?: any;
    newValue?: any;
    createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'APPROVE', 'AI_ACTION'],
        required: true
    },
    module: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable, no updates allowed
    capped: { size: 104857600, max: 1000000 } // Keep max 100MB of audit logs per collection partition in production
});

export const AuditLog = mongoose.model<IAuditLogDoc>('AuditLog', auditLogSchema);
