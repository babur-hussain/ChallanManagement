import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    employeeCode: string;
    fullName: string;
    phone: string;
    email?: string;
    department: 'SALES' | 'ACCOUNTS' | 'WAREHOUSE' | 'DELIVERY' | 'ADMIN' | 'MANAGEMENT' | 'IT';
    designation: string;
    joiningDate: Date;
    salaryType: 'MONTHLY' | 'DAILY' | 'COMMISSION' | 'HYBRID';
    monthlySalary: number;
    incentiveRules?: Record<string, any>; // JSON structure for commissions
    reportingManagerId?: mongoose.Types.ObjectId; // Self reference to another Employee
    branchId: mongoose.Types.ObjectId;
    status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED';
    linkedUserId?: mongoose.Types.ObjectId; // Link to actual auth User if they use the app
    createdAt: Date;
    updatedAt: Date;
}

const employeeSchema = new Schema<IEmployeeDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employeeCode: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    department: {
        type: String,
        enum: ['SALES', 'ACCOUNTS', 'WAREHOUSE', 'DELIVERY', 'ADMIN', 'MANAGEMENT', 'IT'],
        required: true
    },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true, default: Date.now },
    salaryType: {
        type: String,
        enum: ['MONTHLY', 'DAILY', 'COMMISSION', 'HYBRID'],
        default: 'MONTHLY'
    },
    monthlySalary: { type: Number, default: 0 },
    incentiveRules: { type: Schema.Types.Mixed },
    reportingManagerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    status: {
        type: String,
        enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED'],
        default: 'ACTIVE'
    },
    linkedUserId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

employeeSchema.index({ businessId: 1, employeeCode: 1 }, { unique: true });

export const Employee = mongoose.model<IEmployeeDoc>('Employee', employeeSchema);
