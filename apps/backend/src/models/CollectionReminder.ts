import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectionReminderDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    partyId: mongoose.Types.ObjectId;
    invoiceId: mongoose.Types.ObjectId;
    stage: string;
    messageHi: string;
    messageEn: string;
    sentAt?: Date;
    delivered?: boolean;
    read?: boolean;
    replied?: boolean;
    createdAt: Date;
}

const collectionReminderSchema = new Schema<ICollectionReminderDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    stage: { type: String, enum: ['DAY_0', 'DAY_7', 'DAY_15', 'DAY_30', 'DAY_45', 'DAY_60_PLUS'], required: true },
    messageHi: { type: String, required: true },
    messageEn: { type: String, required: true },
    sentAt: { type: Date },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
}, { timestamps: true });

collectionReminderSchema.index({ businessId: 1, partyId: 1, invoiceId: 1, stage: 1 });

export const CollectionReminder = mongoose.model<ICollectionReminderDoc>('CollectionReminder', collectionReminderSchema);
