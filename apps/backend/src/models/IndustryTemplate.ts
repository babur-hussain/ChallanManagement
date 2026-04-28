import mongoose, { Document, Schema } from 'mongoose';

export interface IIndustryTemplateDoc extends Document {
    key: string; // 'TEXTILE_TRADING', 'GARMENT_MFG', 'FMCG_DIST', 'PHARMA'
    name: string;
    terminology: {
        challan: string;    // e.g. 'Delivery Note'
        party: string;      // e.g. 'Retailer' or 'Customer'
        inventory: string;  // e.g. 'Stock'
    };
    enabledModules: string[]; // e.g. ['BILL_OF_MATERIALS', 'STITCHING']
    createdAt: Date;
}

const industryTemplateSchema = new Schema<IIndustryTemplateDoc>({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    terminology: { type: Schema.Types.Mixed, default: {} },
    enabledModules: [{ type: String }]
}, { timestamps: true });

export const IndustryTemplate = mongoose.model<IIndustryTemplateDoc>('IndustryTemplate', industryTemplateSchema);
