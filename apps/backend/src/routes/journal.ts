import { Router } from 'express';
import mongoose from 'mongoose';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { Invoice } from '../models/Invoice.js';
import { Errors } from '../middleware/errorHandler.js';
import { AccountingService } from '../services/accounting.service.js';

export const journalRouter = Router();

journalRouter.use(authenticate, tenantIsolation);

/**
 * Fetch paginated vouchers / generic Daybook list
 */
journalRouter.get('/', handleRequest(async (req) => {
    const { voucherType, page = '1', limit = '20', startDate, endDate, partyId } = req.query;
    const query: any = { businessId: req.businessId, isReversed: false };

    if (voucherType) {
        query.voucherType = voucherType;
    }
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
    }
    if (partyId) {
        query['entries.linkedEntityId'] = partyId;
    }

    const mPage = parseInt(page as string);
    const mLimit = parseInt(limit as string);

    const [entries, total] = await Promise.all([
        JournalEntry.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip((mPage - 1) * mLimit)
            .limit(mLimit)
            .populate('entries.linkedEntityId', 'name')
            .lean(),
        JournalEntry.countDocuments(query)
    ]);

    return { entries, total, page: mPage, limit: mLimit };
}));

/**
 * Create a new generic voucher
 */
journalRouter.post('/', handleRequest(async (req) => {
    const { voucherType, narration, entries, date } = req.body;

    if (!voucherType || !narration || !entries || !Array.isArray(entries) || entries.length < 2) {
        throw Errors.badRequest('Invalid voucher data. Ensure voucherType, narration, and at least two entries are provided.');
    }

    const journal = await AccountingService.postJournalEntry(
        req.businessId as string,
        voucherType,
        narration,
        entries,
        req.user?._id as string,
        date ? new Date(date) : new Date()
    );

    return journal;
}));

/**
 * Create a specialized Payment Receipt against specific Invoices
 */
journalRouter.post('/receipt', handleRequest(async (req) => {
    const { partyId, accountId, amount, paymentMode = 'CASH', referenceId, date, narration, allocations = [] } = req.body;

    if (!partyId || !accountId || !amount) {
        throw Errors.badRequest('Missing core receipt data (partyId, accountId, amount).');
    }

    const receiptDate = date ? new Date(date) : new Date();

    // 1. Generate the core Journal Entry for the receipt
    const entries = [
        { accountId: accountId, debit: Number(amount), credit: 0 },
        { accountId: 'ACCOUNTS_RECEIVABLE', debit: 0, credit: Number(amount), linkedEntityType: 'PARTY', linkedEntityId: partyId }
    ];

    const journal = await AccountingService.postJournalEntry(
        req.businessId as string,
        'RECEIPT',
        narration || `Payment received roughly via ${paymentMode}`,
        entries,
        req.user?._id as string,
        receiptDate
    );

    // 2. Process Invoice Allocations precisely
    if (allocations && Array.isArray(allocations) && allocations.length > 0) {
        for (const alloc of allocations) {
            if (!alloc.invoiceId || !alloc.amountAllocated) continue;

            const invoice = await Invoice.findOne({ _id: alloc.invoiceId, businessId: req.businessId });
            if (!invoice) continue;

            const allocatedNum = Number(alloc.amountAllocated);

            // Append to payments sub-document
            invoice.payments.push({
                amount: allocatedNum,
                date: receiptDate,
                mode: paymentMode,
                reference: referenceId || journal.voucherNumber,
                recordedBy: new mongoose.Types.ObjectId(req.user?._id as string),
                recordedAt: new Date()
            } as any);

            // Recalculate totals dynamically
            invoice.totalPaid = (invoice.totalPaid || 0) + allocatedNum;
            invoice.balanceDue = Math.max(0, invoice.finalAmount - invoice.totalPaid);

            // Update status safely
            if (invoice.balanceDue <= 0.01) { // Floating point safety
                invoice.paymentStatus = 'PAID';
                if (!invoice.paidAt) invoice.paidAt = receiptDate;
            } else {
                invoice.paymentStatus = 'PARTIAL';
            }

            await invoice.save();
        }
    }

    // Attempt to aggregate the total working capital update implicitly via the Party schema if needed, but not required yet.
    return { success: true, message: 'Advanced Receipt posted successfully', journal, allocated: allocations.length };
}));

/**
 * Perform a targeted edit of a journal entry from a party's ledger perspective.
 * This takes a snapshot of the old state and appends to editHistory.
 */
journalRouter.put('/:id/party-edit', handleRequest(async (req) => {
    const { partyId, newDebit, newCredit, narration, date } = req.body;

    const journal = await JournalEntry.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!journal) throw Errors.notFound('Journal Entry not found');
    if (journal.isReversed) throw Errors.badRequest('Cannot edit a reversed or deleted entry.');

    // Save snapshot
    const snapshot = {
        editedAt: new Date(),
        editedBy: new mongoose.Types.ObjectId(req.user?._id as string),
        previousDate: journal.date,
        previousNarration: journal.narration,
        previousEntries: JSON.parse(JSON.stringify(journal.entries)), // Deep copy
        action: 'EDIT' as const
    };

    // If Date or Narration changed
    if (date) journal.date = new Date(date);
    if (narration !== undefined) journal.narration = narration;

    // If financial amounts changed
    const partyLineIndex = journal.entries.findIndex(e => e.linkedEntityId?.toString() === partyId);
    if (partyLineIndex === -1 && (newDebit !== undefined || newCredit !== undefined)) {
        throw Errors.badRequest('Party not found in this entry.');
    }

    const partyLine = partyLineIndex !== -1 ? journal.entries[partyLineIndex] : null;

    let isAmountModified = false;
    if (partyLine) {
        if (newDebit !== undefined && Number(newDebit) !== partyLine.debit) isAmountModified = true;
        if (newCredit !== undefined && Number(newCredit) !== partyLine.credit) isAmountModified = true;
    }

    if (isAmountModified) {
        if (journal.entries.length > 2) {
            throw Errors.badRequest('Cannot edit amounts on complex multi-line journal entries automatically. Please delete and recreate.');
        }

        const offsetIndex = partyLineIndex === 0 ? 1 : 0;
        const offsetLine = journal.entries[offsetIndex];

        if (!partyLine || !offsetLine) throw Errors.badRequest('Invalid entry line structure.');

        // Apply new values to party line
        if (newDebit !== undefined) partyLine.debit = Number(newDebit);
        if (newCredit !== undefined) partyLine.credit = Number(newCredit);

        // Balance the offset line
        offsetLine.credit = partyLine.debit;
        offsetLine.debit = partyLine.credit;

        journal.entries[partyLineIndex] = partyLine as any;
        journal.entries[offsetIndex] = offsetLine as any;
    }

    journal.editHistory = journal.editHistory || [];
    journal.editHistory.push(snapshot as any);

    await journal.save();
    return journal;
}));

/**
 * Soft delete (reverse) a journal entry, keeping Audit Trail
 */
journalRouter.delete('/:id', handleRequest(async (req) => {
    const journal = await JournalEntry.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!journal) throw Errors.notFound('Journal Entry not found');
    if (journal.isReversed) return { message: 'Already deleted' };

    const snapshot = {
        editedAt: new Date(),
        editedBy: new mongoose.Types.ObjectId(req.user?._id as string),
        previousDate: journal.date,
        previousNarration: journal.narration,
        previousEntries: JSON.parse(JSON.stringify(journal.entries)),
        action: 'SOFT_DELETE' as const
    };

    journal.isReversed = true;
    journal.reversedBy = new mongoose.Types.ObjectId(req.user?._id as string);

    journal.editHistory = journal.editHistory || [];
    journal.editHistory.push(snapshot as any);

    await journal.save();
    return { success: true, message: 'Entry soft deleted' };
}));
