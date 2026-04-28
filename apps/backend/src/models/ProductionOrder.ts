import mongoose, { Document, Schema } from 'mongoose';

export interface IProductionOrderDoc extends Document {
    businessId: string;
    bomId: Schema.Types.ObjectId;
    status: 'DRAFT' | 'IN_PRODUCTION' | 'QUALITY_CHECK' | 'COMPLETED' | 'CANCELLED';
    targetQuantity: number;
    actualYield?: number;
    startDate?: Date;
    endDate?: Date;
    assignedToWorkerId?: Schema.Types.ObjectId; // For linking to Job Work vendors or internal labor
    createdAt: Date;
}

const prodOrderSchema = new Schema<IProductionOrderDoc>({
    businessId: { type: String, required: true, index: true },
    bomId: { type: Schema.Types.ObjectId, ref: 'BillOfMaterials', required: true },
    status: { type: String, required: true, default: 'DRAFT', enum: ['DRAFT', 'IN_PRODUCTION', 'QUALITY_CHECK', 'COMPLETED', 'CANCELLED'] },
    targetQuantity: { type: Number, required: true },
    actualYield: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    assignedToWorkerId: { type: Schema.Types.ObjectId }
}, { timestamps: true });

export const ProductionOrder = mongoose.model<IProductionOrderDoc>('ProductionOrder', prodOrderSchema);
