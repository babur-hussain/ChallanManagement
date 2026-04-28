import { JournalEntry } from '../models/JournalEntry.js';
import { Party } from '../models/Party.js';

export class PartyLedgerService {
  static async getStatement(businessId: string, partyId: string, fromDate?: Date, toDate?: Date) {
    const party = await Party.findOne({ _id: partyId, businessId }).lean();
    if (!party) throw new Error('Party not found');

    const journalQuery: any = {
      businessId,
      isReversed: false,
      'entries.linkedEntityId': partyId
    };

    // We pull all entries chronologically to compute accurate running balances
    const allEntries = await JournalEntry.find(journalQuery).sort({ date: 1 }).lean();

    const ledger: any[] = [];

    // Starting structural opening balance from when the party was migrated/created
    let runningBalance = party.openingBalance * (party.balanceType === 'DR' ? 1 : -1);

    let totalDebitForPeriod = 0;
    let totalCreditForPeriod = 0;

    let periodOpeningBalance = runningBalance;

    for (const journal of allEntries) {
      // Find the specific line that affects this party's account
      const partyLine = journal.entries.find((e: any) => e.linkedEntityId?.toString() === partyId);
      if (!partyLine) continue;

      const isBeforePeriod = fromDate && new Date(journal.date) < fromDate;

      // Update the continuous running balance
      runningBalance += partyLine.debit || 0;
      runningBalance -= partyLine.credit || 0;

      if (isBeforePeriod) {
        // Carry forward the balance for the designated 'fromDate' opening state
        periodOpeningBalance = runningBalance;
      } else if (!toDate || new Date(journal.date) <= toDate) {
        // Accumulate statistics for the requested period
        totalDebitForPeriod += partyLine.debit || 0;
        totalCreditForPeriod += partyLine.credit || 0;

        ledger.push({
          date: journal.date,
          type: journal.voucherType,
          reference: journal.voucherNumber,
          description: journal.narration || partyLine.notes || 'Transaction',
          debit: partyLine.debit || 0,
          credit: partyLine.credit || 0,
          runningBalance: runningBalance,
          sourceId: journal._id,
          linkedInvoiceId: journal.entries.find(e => e.linkedEntityType === 'INVOICE')?.linkedEntityId?.toString(),
          hasEdits: journal.editHistory && journal.editHistory.length > 0,
          editHistory: journal.editHistory || []
        });
      }
    }

    // Explicitly add the Opening Balance row for the period at the top
    ledger.unshift({
      date: fromDate || party.createdAt,
      type: 'OPENING',
      reference: '-',
      description: 'Opening Balance',
      debit: periodOpeningBalance > 0 ? periodOpeningBalance : 0,
      credit: periodOpeningBalance < 0 ? Math.abs(periodOpeningBalance) : 0,
      runningBalance: periodOpeningBalance,
      sourceId: null
    });

    return {
      party,
      ledger,
      openingBalance: periodOpeningBalance,
      closingBalance: runningBalance,
      totalDebit: totalDebitForPeriod,
      totalCredit: totalCreditForPeriod,
      periodStart: fromDate || party.createdAt,
      periodEnd: toDate || new Date()
    };
  }
}
