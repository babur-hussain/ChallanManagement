import mongoose, { Document, Schema } from 'mongoose';
import { ITransfer, ITransferItem } from '@textilepro/shared';

export interface ITransferDoc extends Omit<ITransfer, '_id' | 'businessId' | 'createdBy' | 'items' | 'fromWarehouseId' | 'toWarehouseId'>, Document {
    businessId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    fromWarehouseId: mongoose.Types.ObjectId;
    toWarehouseId: mongoose.Types.ObjectId;
    items: (Omit<ITransferItem, 'itemId'> & { itemId: mongoose.Types.ObjectId })[];
}

const transferItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String },
});

const transferSchema = new Schema<ITransferDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    transferNumber: { type: String, required: true },
    date: { type: Date, required: true },

    fromWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    fromWarehouseName: { type: String, required: true },
    toWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    toWarehouseName: { type: String, required: true },

    items: [transferItemSchema],
    totalQuantity: { type: Number, required: true },

    status: { type: String, enum: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    remarks: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

transferSchema.index({ businessId: 1, transferNumber: 1 }, { unique: true });

export const Transfer = mongoose.model<ITransferDoc>('Transfer', transferSchema);
