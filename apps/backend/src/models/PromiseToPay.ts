import mongoose, { Document, Schema } from 'mongoose';

export interface IPromiseToPayDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    partyId: mongoose.Types.ObjectId;
    invoiceId?: mongoose.Types.ObjectId;
    promisedAmount: number;
    promisedDate: Date;
    promisedByName: string;
    communicationMode: string;
    notes?: string;
    status: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const promiseToPaySchema = new Schema<IPromiseToPayDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    promisedAmount: { type: Number, required: true },
    promisedDate: { type: Date, required: true, index: true },
    promisedByName: { type: String, required: true },
    communicationMode: { type: String, enum: ['CALL', 'WHATSAPP', 'VISIT', 'EMAIL'], required: true },
    notes: { type: String },
    status: { type: String, enum: ['ACTIVE', 'FULFILLED', 'BROKEN', 'CANCELLED'], default: 'ACTIVE', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

promiseToPaySchema.index({ businessId: 1, partyId: 1, status: 1 });
promiseToPaySchema.index({ businessId: 1, promisedDate: 1, status: 1 });

export const PromiseToPay = mongoose.model<IPromiseToPayDoc>('PromiseToPay', promiseToPaySchema);
