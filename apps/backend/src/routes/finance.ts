import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { AccountingService, DEFAULT_CHART_OF_ACCOUNTS } from '../services/accounting.service.js';
import { ProfitAnalyticsService } from '../services/profit.service.js';
import { FinanceAIService } from '../services/finance-ai.service.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { BankAccount } from '../models/BankAccount.js';
import { Expense } from '../models/Expense.js';
import { TenantSettings } from '../models/TenantSettings.js';

export const financeRouter = Router();

financeRouter.use(authenticate);
financeRouter.use(tenantIsolation);

// ─── LEDGER & COA ──────────────────────────────────────────

financeRouter.get('/coa', handleRequest(async () => {
    return DEFAULT_CHART_OF_ACCOUNTS;
}));

financeRouter.get('/ledger', handleRequest(async (req) => {
    const entries = await JournalEntry.find({ businessId: req.businessId })
        .sort('-date').limit(50).populate('createdBy', 'name');
    return entries;
}));

// ─── BANKING ───────────────────────────────────────────────

financeRouter.get('/banks', handleRequest(async (req) => {
    return await BankAccount.find({ businessId: req.businessId });
}));

financeRouter.post('/banks', handleRequest(async (req) => {
    const bank = new BankAccount({ ...req.body, businessId: req.businessId });
    await bank.save();
    return bank;
}));

// ─── EXPENSES ──────────────────────────────────────────────

financeRouter.get('/expenses', handleRequest(async (req) => {
    return await Expense.find({ businessId: req.businessId }).sort('-createdAt').limit(20);
}));

financeRouter.post('/expenses', handleRequest(async (req) => {
    const tSettings = await TenantSettings.findOne({ businessId: req.businessId }).lean();
    const fSettings = (tSettings as any)?.finance || {};
    const approvalThreshold = fSettings.expenseApprovalsThreshold ?? 5000;
    const autoJournal = fSettings.autoJournalPosting ?? true;

    // Drafts bypass approval logic; otherwise auto-approve if below threshold
    let initialStatus = req.body.status || 'PENDING_APPROVAL';
    if (initialStatus !== 'DRAFT') {
        initialStatus = req.body.totalAmount >= approvalThreshold ? 'PENDING_APPROVAL' : 'APPROVED';
    }

    const expense = new Expense({
        ...req.body,
        businessId: req.businessId,
        status: initialStatus,
        createdBy: req.user?._id
    });
    await expense.save();

    // Auto post to ledger only if enabled and approved
    if (autoJournal && expense.status === 'APPROVED') {
        const entries = [];

        if (expense.itcEligibility) {
            // Split into Expense cost + Input Tax Credit Accounts
            entries.push({ accountId: expense.category.toUpperCase(), debit: expense.amount, credit: 0 });
            if (expense.cgstAmount) entries.push({ accountId: 'INPUT_CGST', debit: expense.cgstAmount, credit: 0 });
            if (expense.sgstAmount) entries.push({ accountId: 'INPUT_SGST', debit: expense.sgstAmount, credit: 0 });
            if (expense.igstAmount) entries.push({ accountId: 'INPUT_IGST', debit: expense.igstAmount, credit: 0 });
            if (expense.cessAmount) entries.push({ accountId: 'INPUT_CESS', debit: expense.cessAmount, credit: 0 });
        } else {
            // Tax is absorbed into the expense cost if not claiming ITC
            entries.push({ accountId: expense.category.toUpperCase(), debit: expense.totalAmount, credit: 0 });
        }

        // Credit the payment source
        entries.push({ accountId: expense.paymentMode === 'CASH' ? 'CASH' : 'BANK_ACCOUNT', debit: 0, credit: expense.totalAmount });

        await AccountingService.postJournalEntry(
            req.businessId as string,
            'EXPENSE',
            `Expense ${expense.category}: ${expense.notes || ''} (Vendor: ${expense.vendor || 'Unknown'})`,
            entries,
            req.user?._id as string
        );
    }
    return expense;
}));

// ─── ANALYTICS & AI ────────────────────────────────────────

financeRouter.get('/working-capital', handleRequest(async (req) => {
    return await AccountingService.getWorkingCapital(req.businessId as string);
}));

financeRouter.get('/profit/monthly', handleRequest(async (req) => {
    return await ProfitAnalyticsService.getMonthlyProfitOverview(req.businessId as string);
}));

financeRouter.get('/profit/party', handleRequest(async (req) => {
    return await ProfitAnalyticsService.getProfitByParty(req.businessId as string);
}));

financeRouter.get('/ai/fraud-alerts', handleRequest(async (req) => {
    return await FinanceAIService.getFraudAlerts(req.businessId as string);
}));

financeRouter.get('/ai/cashflow', handleRequest(async (req) => {
    return await FinanceAIService.getCashflowForecast(req.businessId as string);
}));
