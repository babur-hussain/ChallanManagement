import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalLine {
    accountId: string; // E.g., 'CASH', 'BANK_HDFC', 'SALES', 'CGST_PAYABLE' 
    debit: number;
    credit: number;
    linkedEntityType?: 'INVOICE' | 'PURCHASE' | 'PARTY' | 'EXPENSE' | 'BROKER';
    linkedEntityId?: mongoose.Types.ObjectId;
    notes?: string;
}

export interface IJournalEntryEditHistory {
    editedAt: Date;
    editedBy: mongoose.Types.ObjectId;
    previousDate: Date;
    previousNarration: string;
    previousEntries: IJournalLine[];
    action: 'EDIT' | 'SOFT_DELETE';
}

export interface IJournalEntryDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    voucherNumber: string;
    voucherType: 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA' | 'EXPENSE';
    date: Date;
    narration: string;
    entries: IJournalLine[];
    createdBy: mongoose.Types.ObjectId;
    isReversed: boolean;
    reversedBy?: mongoose.Types.ObjectId;
    editHistory?: IJournalEntryEditHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const journalLineSchema = new Schema<IJournalLine>({
    accountId: { type: String, required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    linkedEntityType: { type: String, enum: ['INVOICE', 'PURCHASE', 'PARTY', 'EXPENSE', 'BROKER'] },
    linkedEntityId: { type: Schema.Types.ObjectId },
    notes: { type: String },
});

const journalEntrySchema = new Schema<IJournalEntryDoc>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    voucherNumber: { type: String, required: true, unique: true },
    voucherType: {
        type: String,
        enum: ['SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA', 'EXPENSE'],
        required: true
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    narration: { type: String, required: true },
    entries: [journalLineSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isReversed: { type: Boolean, default: false },
    reversedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    editHistory: [{
        editedAt: { type: Date, default: Date.now },
        editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        previousDate: { type: Date },
        previousNarration: { type: String },
        previousEntries: [journalLineSchema],
        action: { type: String, enum: ['EDIT', 'SOFT_DELETE'] }
    }]
}, { timestamps: true });

// Ensure double-entry validity before saving
journalEntrySchema.pre('save', function (next) {
    const totalDebit = this.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = this.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

    // Math.abs to handle minor floating point inaccuracies, though currency should strictly be handled better in true PROD.
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return next(new Error(`Journal Entry unbalanced. Debits: ${totalDebit}, Credits: ${totalCredit}`));
    }
    next();
});

export const JournalEntry = mongoose.model<IJournalEntryDoc>('JournalEntry', journalEntrySchema);
