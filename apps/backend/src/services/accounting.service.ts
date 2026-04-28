import mongoose from 'mongoose';
import { JournalEntry, IJournalLine } from '../models/JournalEntry.js';
import { BankAccount } from '../models/BankAccount.js';
import { Invoice } from '../models/Invoice.js';

export const DEFAULT_CHART_OF_ACCOUNTS = {
    ASSETS: ['CASH', 'BANK_ACCOUNT', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'ADVANCES_GIVEN', 'SECURITY_DEPOSITS'],
    LIABILITIES: ['ACCOUNTS_PAYABLE', 'LOANS', 'GST_PAYABLE', 'SALARIES_PAYABLE'],
    INCOME: ['SALES', 'OTHER_INCOME', 'COMMISSION_INCOME'],
    EXPENSES: ['PURCHASE', 'FREIGHT', 'SALARY', 'RENT', 'ELECTRICITY', 'BROKERAGE', 'MARKETING', 'MISCELLANEOUS'],
    EQUITY: ['CAPITAL', 'DRAWINGS', 'RETAINED_EARNINGS']
};

export class AccountingService {
    /**
     * Submits a double entry into the ledger with strict balancing enforcement.
     */
    static async postJournalEntry(
        businessId: string | mongoose.Types.ObjectId,
        voucherType: 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA' | 'EXPENSE',
        narration: string,
        entries: (Partial<IJournalLine> & { accountId: string, debit: number, credit: number })[],
        createdBy: string | mongoose.Types.ObjectId,
        date: Date = new Date(),
    ) {
        const voucherNumber = `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const journal = new JournalEntry({
            businessId,
            voucherNumber,
            voucherType,
            date,
            narration,
            entries,
            createdBy
        });

        await journal.save(); // pre-save hook handles debit=credit math validation
        return journal;
    }

    /**
     * ERP Hook: Auto-posts an Invoice to the ledger
     * Debit: Accounts Receivable (Party)
     * Credit: Sales Income
     * Credit: GST Payable
     */
    static async autoPostInvoice(invoiceId: string, createdBy: string) {
        const invoice = await Invoice.findById(invoiceId).populate('partyId');
        if (!invoice) throw new Error('Invoice not found');

        const salesCredit = (invoice.finalAmount || 0) - (invoice.totalGst || 0);

        const entries: any[] = [
            {
                accountId: 'ACCOUNTS_RECEIVABLE',
                debit: invoice.finalAmount || 0,
                credit: 0,
                linkedEntityType: 'PARTY' as const,
                linkedEntityId: invoice.partyId._id
            },
            {
                accountId: 'SALES',
                debit: 0,
                credit: salesCredit,
                linkedEntityType: 'INVOICE' as const,
                linkedEntityId: invoice._id
            }
        ];

        if (invoice.totalGst > 0) {
            entries.push({
                accountId: 'GST_PAYABLE',
                debit: 0,
                credit: invoice.totalGst
            });
        }

        await this.postJournalEntry(
            invoice.businessId,
            'SALES',
            `Auto-generated entry for Invoice ${invoice.invoiceNumber}`,
            entries,
            createdBy
        );
    }

    /**
     * Finds the existing linked JournalEntry, pushes the previous state to editHistory,
     * and overrides the entries with the newly calculated amounts.
     */
    static async updateAutoPostInvoice(invoiceId: string, updatedBy: string) {
        const invoice = await Invoice.findById(invoiceId).populate('partyId');
        if (!invoice) throw new Error('Invoice not found');

        const journal = await JournalEntry.findOne({
            businessId: invoice.businessId,
            'entries.linkedEntityType': 'INVOICE',
            'entries.linkedEntityId': invoice._id
        });

        if (!journal) {
            return this.autoPostInvoice(invoiceId, updatedBy);
        }

        const salesCredit = (invoice.finalAmount || 0) - (invoice.totalGst || 0);

        const newEntries: any[] = [
            {
                accountId: 'ACCOUNTS_RECEIVABLE',
                debit: invoice.finalAmount || 0,
                credit: 0,
                linkedEntityType: 'PARTY' as const,
                linkedEntityId: (invoice.partyId as any)._id
            },
            {
                accountId: 'SALES',
                debit: 0,
                credit: salesCredit,
                linkedEntityType: 'INVOICE' as const,
                linkedEntityId: invoice._id
            }
        ];

        if (invoice.totalGst > 0) {
            newEntries.push({
                accountId: 'GST_PAYABLE',
                debit: 0,
                credit: invoice.totalGst
            });
        }

        const snapshot = {
            editedAt: new Date(),
            editedBy: new mongoose.Types.ObjectId(updatedBy),
            previousDate: journal.date,
            previousNarration: journal.narration,
            previousEntries: JSON.parse(JSON.stringify(journal.entries)),
            action: 'EDIT' as const
        };

        journal.editHistory = journal.editHistory || [];
        journal.editHistory.push(snapshot as any);

        journal.entries = newEntries as any;
        journal.date = invoice.invoiceDate;

        await journal.save();
    }

    /**
     * Cashflow: Calculate AR & AP total outstandings
     */
    static async getWorkingCapital(businessId: string) {
        // Uses mongo aggregation on journal entries
        const pipeline = [
            { $match: { businessId: new mongoose.Types.ObjectId(businessId), isReversed: false } },
            { $unwind: "$entries" },
            { $match: { "entries.accountId": { $in: ["ACCOUNTS_RECEIVABLE", "ACCOUNTS_PAYABLE"] } } },
            {
                $group: {
                    _id: "$entries.accountId",
                    balance: { $sum: { $subtract: ["$entries.debit", "$entries.credit"] } }
                }
            }
        ];

        const results = await JournalEntry.aggregate(pipeline);

        let ar = 0; // standard DR balance 
        let ap = 0; // standard CR balance

        results.forEach(res => {
            if (res._id === 'ACCOUNTS_RECEIVABLE') ar = res.balance;
            // AP has a normal credit balance, so debit - credit will be negative if payable. 
            // We flip sign for positive representation
            if (res._id === 'ACCOUNTS_PAYABLE') ap = -res.balance;
        });

        return { AR: ar, AP: ap, NetWorkingCapital: ar - ap };
    }
}
