import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  strict: true,
});

categorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
