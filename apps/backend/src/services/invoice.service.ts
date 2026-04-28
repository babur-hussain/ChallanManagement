import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { InvoiceSequence } from '../models/InvoiceSequence.js';
import { Challan } from '../models/Challan.js';
import { Party } from '../models/Party.js';
import { Business } from '../models/Business.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { AccountingService } from './accounting.service.js';
import { getFinancialYearFormat, numberToWords } from '@textilepro/shared';
// import { pdfQueue } from '../lib/queue.js'; // Will queue later
import { logger } from '../lib/logger.js';

export class InvoiceService {

  static async getNextInvoiceNumber(businessId: string, date: Date = new Date()): Promise<string> {
    const tSettings = await TenantSettings.findOne({ businessId }).lean();
    const fSettings = (tSettings as any)?.finance || {};
    const fyStartStr = fSettings.financialYearStart || 'april';
    const fy = getFinancialYearFormat(date, fyStartStr);
    const seq = await InvoiceSequence.findOneAndUpdate(
      { businessId, financialYear: fy },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true }
    );
    return `INV-${fy}-${String(seq.lastNumber).padStart(5, '0')}`;
  }

  static async create(businessId: string, userId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!data.partyId) throw new Error('Party ID is required');
      if (!data.items || data.items.length === 0) throw new Error('At least one item is required to create an invoice');

      const party: any = await Party.findById(data.partyId).session(session);
      const business: any = await Business.findById(businessId).session(session);

      if (!party) throw new Error('Party not found');
      if (!business) throw new Error('Business not found');

      // Check if challans are valid if provided
      let challans: any[] = [];
      if (data.challanIds && data.challanIds.length > 0) {
        challans = await Challan.find({ _id: { $in: data.challanIds }, businessId }).session(session);
        if (challans.length !== data.challanIds.length) throw new Error('One or more challans not found');
        if (challans.some(c => c.partyId.toString() !== data.partyId)) throw new Error('All challans must belong to the selected party');
        if (challans.some(c => c.status === 'BILLED')) throw new Error('One or more challans are already billed');
      }

      // 1. Determine Supply Type (Inter vs Intra)
      let supplyType: 'INTRA_STATE' | 'INTER_STATE' = 'INTER_STATE';
      if (business.gstin && party.gstin) {
        if (business.gstin.substring(0, 2) === party.gstin.substring(0, 2)) supplyType = 'INTRA_STATE';
      } else {
        if (business.address?.state?.toLowerCase() === party.address?.state?.toLowerCase()) supplyType = 'INTRA_STATE';
      }

      const consolidatedItems: any[] = [];
      let subtotal = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;

      // 2. Compute Taxes for Items
      for (const item of data.items) {
        const gstRate = Number(item.gstRate ?? 5);
        let cgstRate = 0, sgstRate = 0, igstRate = 0;
        let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

        // Calculate amount from quantity and rate
        const rawAmount = Number(item.quantity) * Number(item.ratePerUnit);
        let taxableAmount = rawAmount;

        // Apply discount if provided
        if (item.discount > 0) {
          if (item.discountType === 'PERCENTAGE') {
            taxableAmount = rawAmount - (rawAmount * Number(item.discount) / 100);
          } else {
            taxableAmount = rawAmount - Number(item.discount);
          }
        }

        if (supplyType === 'INTRA_STATE') {
          cgstRate = gstRate / 2;
          sgstRate = gstRate / 2;
          cgstAmount = (taxableAmount * cgstRate) / 100;
          sgstAmount = (taxableAmount * sgstRate) / 100;
        } else {
          igstRate = gstRate;
          igstAmount = (taxableAmount * igstRate) / 100;
        }

        const itemTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

        consolidatedItems.push({
          itemId: item.itemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unit: item.unit,
          ratePerUnit: item.ratePerUnit,
          amount: rawAmount,
          gstRate, cgstRate, sgstRate, igstRate,
          cgstAmount, sgstAmount, igstAmount,
          taxableAmount,
          totalAmount: itemTotal
        });

        subtotal += taxableAmount;
        totalCgst += cgstAmount;
        totalSgst += sgstAmount;
        totalIgst += igstAmount;
      }

      const totalGst = totalCgst + totalSgst + totalIgst;
      const grandTotalRaw = subtotal + totalGst + (Number(data.shippingCharges) || 0) + (Number(data.adjustment) || 0);
      const finalAmount = Math.round(grandTotalRaw);
      const roundOff = finalAmount - grandTotalRaw;

      // 3. Generate Atomic Number (skip for drafts)
      const isDraft = !!data.isDraft;
      const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
      let dueDate = data.dueDate ? new Date(data.dueDate) : new Date(invoiceDate);
      if (!data.dueDate && party.creditDays) {
        dueDate.setDate(dueDate.getDate() + party.creditDays);
      }

      const invoiceNumber = isDraft
        ? `DRAFT-${Date.now()}`
        : await this.getNextInvoiceNumber(businessId, invoiceDate);

      // 4. Build Invoice Document
      const invoice = new Invoice({
        businessId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        partyId: party._id,
        partySnapshot: {
          name: party.name,
          address: party.address,
          phone: party.phone,
          gstin: party.gstin
        },
        businessSnapshot: {
          name: business.name,
          address: [
            business.address?.line1,
            business.address?.line2,
            business.address?.city,
            business.address?.state,
            business.address?.pincode,
          ].filter(Boolean).join(', '),
          state: business.address?.state,
          gstin: business.gstin
        },
        challanIds: challans.map(c => c._id),
        challanNumbers: challans.map(c => c.challanNumber),
        supplyType,
        orderNumber: data.orderNumber,
        items: consolidatedItems,
        subtotal,
        shippingCharges: data.shippingCharges || 0,
        adjustment: data.adjustment || 0,
        totalCgst,
        totalSgst,
        totalIgst,
        totalGst,
        grandTotal: grandTotalRaw,
        roundOff,
        finalAmount,
        amountInWords: numberToWords(finalAmount),
        balanceDue: finalAmount,
        paymentStatus: 'UNPAID',
        status: isDraft ? 'DRAFT' : 'ACTIVE',
        notes: data.notes,
        termsAndConditions: data.termsAndConditions || business.invoiceTerms || 'E. & O.E. Goods once sold will not be taken back.',
        createdBy: userId,
        updatedBy: userId
      });

      await invoice.save({ session });

      // 5. Update Challans if any (skip for drafts)
      if (!isDraft && challans.length > 0) {
        await Challan.updateMany(
          { _id: { $in: data.challanIds } },
          { $set: { status: 'BILLED', invoiceId: invoice._id } },
          { session }
        );
      }

      await session.commitTransaction();

      // Trigger Auto Journal Posting outside transaction (non-blocking)
      const tSettings = await TenantSettings.findOne({ businessId }).lean();
      const fSettings = (tSettings as any)?.finance || {};
      const autoJournal = fSettings.autoJournalPosting ?? true;

      // Only post to ledger if it's not a draft and settings allow
      if (autoJournal && !isDraft) {
        // Run in background to avoid blocking response
        AccountingService.autoPostInvoice(invoice._id.toString(), userId)
          .catch(err => logger.error(`Failed auto journal post for Invoice ${invoice.invoiceNumber}`, err));
      }

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to create invoice', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async update(businessId: string, invoiceId: string, userId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!data.partyId) throw new Error('Party ID is required');
      if (!data.items || data.items.length === 0) throw new Error('At least one item is required');

      const invoice: any = await Invoice.findOne({ _id: invoiceId, businessId }).session(session);
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status === 'CANCELLED') throw new Error('Cannot edit a cancelled invoice');

      const party: any = await Party.findById(data.partyId).session(session);
      const business: any = await Business.findById(businessId).session(session);
      if (!party) throw new Error('Party not found');
      if (!business) throw new Error('Business not found');

      let supplyType: 'INTRA_STATE' | 'INTER_STATE' = 'INTER_STATE';
      if (business.gstin && party.gstin) {
        if (business.gstin.substring(0, 2) === party.gstin.substring(0, 2)) supplyType = 'INTRA_STATE';
      } else {
        if (business.address?.state?.toLowerCase() === party.address?.state?.toLowerCase()) supplyType = 'INTRA_STATE';
      }

      const consolidatedItems: any[] = [];
      let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;

      for (const item of data.items) {
        const gstRate = Number(item.gstRate ?? 5);
        let cgstRate = 0, sgstRate = 0, igstRate = 0;
        let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

        const rawAmount = Number(item.quantity) * Number(item.ratePerUnit);
        let taxableAmount = rawAmount;
        if (item.discount > 0) {
          taxableAmount = item.discountType === 'PERCENTAGE'
            ? rawAmount - (rawAmount * Number(item.discount) / 100)
            : rawAmount - Number(item.discount);
        }

        if (supplyType === 'INTRA_STATE') {
          cgstRate = gstRate / 2; sgstRate = gstRate / 2;
          cgstAmount = (taxableAmount * cgstRate) / 100; sgstAmount = (taxableAmount * sgstRate) / 100;
        } else {
          igstRate = gstRate; igstAmount = (taxableAmount * igstRate) / 100;
        }

        consolidatedItems.push({
          itemId: item.itemId, itemName: item.itemName, itemCode: item.itemCode,
          hsnCode: item.hsnCode, quantity: item.quantity, unit: item.unit,
          ratePerUnit: item.ratePerUnit, amount: rawAmount,
          gstRate, cgstRate, sgstRate, igstRate, cgstAmount, sgstAmount, igstAmount,
          taxableAmount, totalAmount: taxableAmount + cgstAmount + sgstAmount + igstAmount
        });

        subtotal += taxableAmount;
        totalCgst += cgstAmount; totalSgst += sgstAmount; totalIgst += igstAmount;
      }

      const totalGst = totalCgst + totalSgst + totalIgst;
      const grandTotalRaw = subtotal + totalGst + (Number(data.shippingCharges) || 0) + (Number(data.adjustment) || 0);
      const finalAmount = Math.round(grandTotalRaw);
      const roundOff = finalAmount - grandTotalRaw;

      // Adjust balance due
      const amountPaid = invoice.finalAmount - invoice.balanceDue; // how much was already paid
      const newBalanceDue = finalAmount - amountPaid;

      // Updating fields
      invoice.partyId = party._id;
      invoice.partySnapshot = { name: party.name, address: party.address, phone: party.phone, gstin: party.gstin };
      invoice.invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : invoice.invoiceDate;
      invoice.dueDate = data.dueDate ? new Date(data.dueDate) : invoice.dueDate;
      invoice.orderNumber = data.orderNumber;
      invoice.supplyType = supplyType;
      invoice.items = consolidatedItems;
      invoice.subtotal = subtotal;
      invoice.shippingCharges = data.shippingCharges || 0;
      invoice.adjustment = data.adjustment || 0;
      invoice.totalCgst = totalCgst; invoice.totalSgst = totalSgst; invoice.totalIgst = totalIgst;
      invoice.totalGst = totalGst;
      invoice.grandTotal = grandTotalRaw;
      invoice.roundOff = roundOff;
      invoice.finalAmount = finalAmount;
      invoice.amountInWords = numberToWords(finalAmount);
      invoice.balanceDue = newBalanceDue;
      invoice.paymentStatus = newBalanceDue <= 0 ? (amountPaid > 0 ? 'PAID' : 'UNPAID') : (amountPaid > 0 ? 'PARTIAL' : 'UNPAID');
      invoice.notes = data.notes;
      invoice.termsAndConditions = data.termsAndConditions || business.invoiceTerms || 'E. & O.E. Goods once sold will not be taken back.';
      invoice.updatedBy = userId;

      const isDraft = !!data.isDraft;
      invoice.status = isDraft ? 'DRAFT' : 'ACTIVE';

      await invoice.save({ session });
      await session.commitTransaction();

      // Update Ledger Accounting
      const tSettings = await TenantSettings.findOne({ businessId }).lean();
      const fSettings = (tSettings as any)?.finance || {};
      const autoJournal = fSettings.autoJournalPosting ?? true;

      if (autoJournal && !isDraft) {
        AccountingService.updateAutoPostInvoice(invoice._id.toString(), userId)
          .catch(err => logger.error(`Failed auto journal update for Invoice ${invoice.invoiceNumber}`, err));
      }

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to update invoice', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async list(businessId: string, filters: any, pagination: any) {
    const query: any = { businessId };

    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.partyId) query.partyId = filters.partyId;
    if (filters.search) query.$text = { $search: filters.search };

    if (filters.overdue === 'true') {
      query.paymentStatus = { $ne: 'PAID' };
      query.dueDate = { $lt: new Date() };
    }

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const data = await Invoice.find(query)
      .sort({ invoiceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Invoice.countDocuments(query);

    const aggregates = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' },
          totalBalanceDue: { $sum: '$balanceDue' }
        }
      }
    ]);

    const stats = aggregates[0] || { totalInvoices: 0, totalAmount: 0, totalBalanceDue: 0 };

    return {
      data,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async recordPayment(businessId: string, invoiceId: string, userId: string, paymentData: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findOne({ _id: invoiceId, businessId }).session(session);
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status === 'CANCELLED') throw new Error('Cannot pay a cancelled invoice');

      if (paymentData.amount <= 0) throw new Error('Payment amount must be positive');
      if (paymentData.amount > invoice.balanceDue) {
        throw new Error(`Amount exceeds balance due. Max allowed: ${invoice.balanceDue}`);
      }

      const paymentEntry = {
        amount: paymentData.amount,
        date: new Date(paymentData.date),
        mode: paymentData.mode,
        reference: paymentData.reference,
        bank: paymentData.bank,
        notes: paymentData.notes,
        recordedBy: userId,
        recordedAt: new Date()
      };

      invoice.payments.push(paymentEntry as any);
      invoice.totalPaid += paymentData.amount;
      invoice.balanceDue -= paymentData.amount;

      if (invoice.balanceDue <= 0) {
        invoice.paymentStatus = 'PAID';
        invoice.paidAt = new Date();
      } else {
        invoice.paymentStatus = 'PARTIAL';
      }

      await invoice.save({ session });
      await session.commitTransaction();

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
