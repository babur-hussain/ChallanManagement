import mongoose, { Document, Schema } from 'mongoose';

export interface IConversationDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    phone: string;
    linkedPartyId?: mongoose.Types.ObjectId;
    linkedLeadId?: mongoose.Types.ObjectId;
    contactName: string;
    city?: string;
    tags: string[];
    status: string;
    assignedToUserId?: mongoose.Types.ObjectId;
    isStarred: boolean;
    isPinned: boolean;
    lastMessage?: {
        text: string;
        type: string;
        direction: string;
        sentAt: Date;
    };
    unreadCount: number;
    lastSeenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversationDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    phone: { type: String, required: true, index: true },
    linkedPartyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    linkedLeadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    contactName: { type: String, required: true },
    city: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['OPEN', 'PENDING', 'CLOSED', 'SNOOZED'], default: 'OPEN', index: true },
    assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isStarred: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    lastMessage: {
        text: String,
        type: String,
        direction: { type: String, enum: ['INBOUND', 'OUTBOUND'] },
        sentAt: Date,
    },
    unreadCount: { type: Number, default: 0 },
    lastSeenAt: { type: Date },
}, { timestamps: true });

conversationSchema.index({ businessId: 1, phone: 1 }, { unique: true });
conversationSchema.index({ businessId: 1, status: 1, updatedAt: -1 });
conversationSchema.index({ businessId: 1, assignedToUserId: 1, status: 1 });
conversationSchema.index({ businessId: 1, isPinned: -1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversationDoc>('Conversation', conversationSchema);
