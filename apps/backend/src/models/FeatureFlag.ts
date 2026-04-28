import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlagDoc extends Document {
    key: string;
    name: string;
    description: string;
    isActive: boolean;
    rolloutPercentage: number; // 0 to 100
    targetedPlans: ('STARTER' | 'GROWTH' | 'PRO' | 'ENTERPRISE')[];
    targetedRegions: string[];
    targetedBusinesses: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlagDoc>({
    key: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    rolloutPercentage: { type: Number, default: 0, min: 0, max: 100 },
    targetedPlans: [{ type: String }],
    targetedRegions: [{ type: String }],
    targetedBusinesses: [{ type: Schema.Types.ObjectId, ref: 'Business' }]
}, { timestamps: true });

export const FeatureFlag = mongoose.model<IFeatureFlagDoc>('FeatureFlag', featureFlagSchema);
