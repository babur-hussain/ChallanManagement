import mongoose, { Document, Schema } from 'mongoose';

export interface ICityMetricDoc extends Document {
    cityName: string;
    state: string;
    estimatedTAM: number; // e.g. 50,000 textile businesses
    activeLeads: number;
    activeTrials: number;
    paidCustomers: number;
    activeResellers: number;
    marketSharePercentage: number;
    competitorDominance: 'HIGH' | 'MEDIUM' | 'LOW';
    updatedAt: Date;
}

const cityMetricSchema = new Schema<ICityMetricDoc>({
    cityName: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    estimatedTAM: { type: Number, default: 0 },
    activeLeads: { type: Number, default: 0 },
    activeTrials: { type: Number, default: 0 },
    paidCustomers: { type: Number, default: 0 },
    activeResellers: { type: Number, default: 0 },
    marketSharePercentage: { type: Number, default: 0 },
    competitorDominance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' }
}, { timestamps: true });

export const CityMetric = mongoose.model<ICityMetricDoc>('CityMetric', cityMetricSchema);
