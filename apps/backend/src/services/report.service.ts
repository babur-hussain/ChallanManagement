import ExcelJS from 'exceljs';
import { Invoice } from '../models/Invoice.js';
import { Party } from '../models/Party.js';
import { Challan } from '../models/Challan.js';
import { PartyLedgerService } from './partyLedger.service.js';
import { formatCurrency, formatDate } from '@textilepro/shared';

// Utility helper
const setRowBold = (row: any) => { row.eachCell((c:any) => c.font = { bold: true }); };

export class ReportService {

  static async getPartyStatementExcel(businessId: string, partyId: string, fromDate?: Date, toDate?: Date) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Account Statement');
    
    const statement = await PartyLedgerService.getStatement(businessId, partyId, fromDate, toDate);
    const party = await Party.findById(partyId).lean();
    if (!party) throw new Error('Party not found');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Reference', key: 'ref', width: 20 },
      { header: 'Description', key: 'desc', width: 40 },
      { header: 'Debit (Dr)', key: 'debit', width: 15 },
      { header: 'Credit (Cr)', key: 'credit', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 }
    ];

    setRowBold(sheet.getRow(1));

    for (const entry of statement.ledger) {
      sheet.addRow({
        date: formatDate(entry.date, 'dd-MM-yyyy'),
        type: entry.type,
        ref: entry.reference,
        desc: entry.description,
        debit: entry.debit || '-',
        credit: entry.credit || '-',
        balance: entry.runningBalance
      });
    }

    sheet.addRow({});
    const totalsRow = sheet.addRow({
      desc: 'CLOSING TOTALS',
      debit: statement.totalDebit,
      credit: statement.totalCredit,
      balance: statement.closingBalance
    });
    setRowBold(totalsRow);

    return workbook;
  }

  static async getOutstandingExcel(businessId: string) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Aged Receivables');

    const invoices = await Invoice.find({ businessId, paymentStatus: { $ne: 'PAID' }, status: 'ACTIVE' }).populate('partyId', 'name shortCode').lean();
    
    sheet.columns = [
      { header: 'Party', key: 'party', width: 25 },
      { header: 'Invoice #', key: 'inv', width: 15 },
      { header: 'Invoice Date', key: 'date', width: 12 },
      { header: 'Due Date', key: 'due', width: 12 },
      { header: 'Days Overdue', key: 'days', width: 15 },
      { header: 'Invoice Amt', key: 'amt', width: 15 },
      { header: 'Paid', key: 'paid', width: 15 },
      { header: 'Balance Due', key: 'bal', width: 15 },
      { header: 'Bucket', key: 'bucket', width: 15 }
    ];
    setRowBold(sheet.getRow(1));

    const nowTime = Date.now();
    let totalBal = 0;

    for (const inv of invoices) {
      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((nowTime - dueTime) / (1000 * 3600 * 24));
      
      let bucket = 'Current';
      if (diffDays > 90) bucket = '> 90 Days';
      else if (diffDays > 60) bucket = '61-90 Days';
      else if (diffDays > 30) bucket = '31-60 Days';
      else if (diffDays > 0) bucket = '1-30 Days';

      sheet.addRow({
        party: (inv.partyId as any)?.name || 'Unknown',
        inv: inv.invoiceNumber,
        date: formatDate(inv.invoiceDate, 'dd-MM-yyyy'),
        due: formatDate(inv.dueDate, 'dd-MM-yyyy'),
        days: diffDays > 0 ? diffDays : 0,
        amt: inv.finalAmount,
        paid: inv.totalPaid,
        bal: inv.balanceDue,
        bucket
      });
      totalBal += inv.balanceDue;
    }

    sheet.addRow({});
    const totalsRow = sheet.addRow({
      paid: 'TOTAL OUTSTANDING:',
      bal: totalBal
    });
    setRowBold(totalsRow);

    return workbook;
  }
}
