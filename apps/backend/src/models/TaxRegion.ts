import mongoose, { Document, Schema } from 'mongoose';

export interface ITaxRegionDoc extends Document {
    code: string; // 'IN_GST', 'UAE_VAT', 'UK_VAT', 'US_SALES'
    country: string;
    system: 'GST' | 'VAT' | 'SALES_TAX' | 'NONE';
    rates: {
        name: string;
        percentage: number;
        description: string;
    }[];
    filingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
    createdAt: Date;
}

const taxRegionSchema = new Schema<ITaxRegionDoc>({
    code: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    system: { type: String, required: true, enum: ['GST', 'VAT', 'SALES_TAX', 'NONE'] },
    rates: [{
        name: { type: String },
        percentage: { type: Number },
        description: { type: String }
    }],
    filingFrequency: { type: String, default: 'MONTHLY' }
}, { timestamps: true });

export const TaxRegion = mongoose.model<ITaxRegionDoc>('TaxRegion', taxRegionSchema);
