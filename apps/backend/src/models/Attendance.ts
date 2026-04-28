import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    date: Date;
    shiftStart?: string; // "09:00"
    shiftEnd?: string; // "18:00"
    checkIn?: Date;
    checkOut?: Date;
    checkInLocation?: { lat: number; lng: number; address?: string };
    checkOutLocation?: { lat: number; lng: number; address?: string };
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';
    overtimeHours: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendanceDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true }, // e.g. UTC start of day for that specific date
    shiftStart: { type: String },
    shiftEnd: { type: String },
    checkIn: { type: Date },
    checkOut: { type: Date },
    checkInLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    checkOutLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE'],
        default: 'ABSENT'
    },
    overtimeHours: { type: Number, default: 0 },
    notes: { type: String }
}, { timestamps: true });

// An employee can only have one attendance record per day
attendanceSchema.index({ businessId: 1, employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDoc>('Attendance', attendanceSchema);
