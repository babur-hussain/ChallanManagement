import mongoose, { Document, Schema } from 'mongoose';

export interface IBillOfMaterialsDoc extends Document {
    businessId: string;
    finishedProductId: Schema.Types.ObjectId;
    name: string;
    expectedOutputQty: number;
    rawMaterials: {
        itemId: Schema.Types.ObjectId;
        quantityRequired: number;
        wastagePercentage: number;
    }[];
    createdAt: Date;
}

const bomSchema = new Schema<IBillOfMaterialsDoc>({
    businessId: { type: String, required: true, index: true },
    finishedProductId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    expectedOutputQty: { type: Number, default: 1 },
    rawMaterials: [{
        itemId: { type: Schema.Types.ObjectId, required: true },
        quantityRequired: { type: Number, required: true },
        wastagePercentage: { type: Number, default: 0 }
    }]
}, { timestamps: true });

export const BillOfMaterials = mongoose.model<IBillOfMaterialsDoc>('BillOfMaterials', bomSchema);
