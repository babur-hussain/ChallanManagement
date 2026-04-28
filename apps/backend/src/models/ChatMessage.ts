import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessageDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    providerMessageId?: string;
    direction: string;
    type: string;
    body: string;
    mediaUrl?: string;
    deliveryStatus?: string;
    isInternalNote: boolean;
    isStarred: boolean;
    sentByUserId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    providerMessageId: { type: String },
    direction: { type: String, enum: ['INBOUND', 'OUTBOUND'], required: true },
    type: { type: String, enum: ['TEXT', 'IMAGE', 'PDF', 'AUDIO', 'VIDEO', 'DOCUMENT', 'TEMPLATE', 'NOTE'], default: 'TEXT' },
    body: { type: String, required: true },
    mediaUrl: { type: String },
    deliveryStatus: { type: String, enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'] },
    isInternalNote: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    sentByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ businessId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessageDoc>('ChatMessage', chatMessageSchema);
