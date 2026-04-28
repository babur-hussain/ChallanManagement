import mongoose, { Schema, Document } from 'mongoose';
import type { IUser, UserRole } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// User Model — belongs to a Business (tenant)
// ═══════════════════════════════════════════════════════════════

export interface UserDocument extends Omit<IUser, '_id'>, Document { }

const userSchema = new Schema<UserDocument>(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
    },
    businessId: {
      type: String,
      required: [true, 'Business ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
    },
    avatar: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

// Compound indexes
userSchema.index({ businessId: 1, email: 1 }, { unique: true });
userSchema.index({ businessId: 1, role: 1 });
userSchema.index({ businessId: 1, isActive: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);
