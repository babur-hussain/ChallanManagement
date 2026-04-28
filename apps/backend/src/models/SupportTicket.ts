import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicketDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    raisedBy: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    channel: 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PHONE';
    assignedTo?: mongoose.Types.ObjectId; // TextilePro Staff User
    firstResponseAt?: Date;
    resolvedAt?: Date;
    csatScore?: number; // 1-5
    createdAt: Date;
    updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicketDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN',
        index: true
    },
    channel: {
        type: String,
        enum: ['IN_APP', 'EMAIL', 'WHATSAPP', 'PHONE'],
        default: 'IN_APP'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    firstResponseAt: { type: Date },
    resolvedAt: { type: Date },
    csatScore: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

export const SupportTicket = mongoose.model<ISupportTicketDoc>('SupportTicket', supportTicketSchema);
