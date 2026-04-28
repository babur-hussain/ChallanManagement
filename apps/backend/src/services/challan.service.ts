import mongoose from 'mongoose';
import { Challan } from '../models/Challan.js';
import { ChallanSequence } from '../models/ChallanSequence.js';
import { Party } from '../models/Party.js';
import { Broker } from '../models/Broker.js';
import { Item } from '../models/Item.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { getFinancialYearFormat } from '@textilepro/shared';
import { pdfQueue, whatsappQueue, stockSyncQueue } from '../lib/queue.js';
import { logger } from '../lib/logger.js';
import { Errors } from '../middleware/errorHandler.js';

export class ChallanService {

  static formatChallanNumber(nextNum: number, date: Date, settings: any): string {
    const prefix = settings.prefix ? `${settings.prefix}-` : '';
    const suffix = settings.suffix ? `-${settings.suffix}` : '';
    const format = settings.numberingFormat || 'YY-MM-SEQ';

    let core = '';
    if (format === 'YY-MM-SEQ') {
      const yy = date.getFullYear().toString().slice(2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      core = `${yy}-${mm}-${String(nextNum).padStart(4, '0')}`;
    } else {
      const fyStartStr = settings.finance?.financialYearStart || 'april';
      const fy = getFinancialYearFormat(date, fyStartStr);
      core = `${fy}-${String(nextNum).padStart(5, '0')}`;
    }

    return `${prefix}${core}${suffix}`;
  }

  /**
   * Predict the next challan number without incrementing
   */
  static async getNextChallanNumber(businessId: string, date: Date = new Date()): Promise<string> {
    const tSettings = await TenantSettings.findOne({ businessId }).lean();
    const cSettings = (tSettings as any)?.challans || {};
    const fSettings = (tSettings as any)?.finance || {};
    const fyStartStr = fSettings.financialYearStart || 'april';
    const fy = cSettings.financialYearReset === false ? 'ALL' : getFinancialYearFormat(date, fyStartStr);

    const seq = await ChallanSequence.findOne({ businessId, financialYear: fy });
    const nextNum = (seq?.lastNumber || 0) + 1;
    return this.formatChallanNumber(nextNum, date, { ...cSettings, finance: fSettings });
  }

  /**
   * Atomically get and increment the challan number
   */
  static async gernateAtomicChallanNumber(businessId: string, date: Date): Promise<string> {
    const tSettings = await TenantSettings.findOne({ businessId }).lean();
    const cSettings = (tSettings as any)?.challans || {};
    const fSettings = (tSettings as any)?.finance || {};
    const fyStartStr = fSettings.financialYearStart || 'april';
    const fy = cSettings.financialYearReset === false ? 'ALL' : getFinancialYearFormat(date, fyStartStr);

    const seq = await ChallanSequence.findOneAndUpdate(
      { businessId, financialYear: fy },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true }
    );
    return this.formatChallanNumber(seq.lastNumber, date, { ...cSettings, finance: fSettings });
  }

  static async create(businessId: string, userId: string, data: any) {
    // 1. Fetch referencing entities to take snapshots
    const party: any = await Party.findOne({ _id: data.partyId, businessId });
    if (!party) throw new Error('Party not found or invalid');

    let broker: any = null;
    if (data.brokerId) {
      broker = await Broker.findOne({ _id: data.brokerId, businessId });
      if (!broker) throw new Error('Broker not found');
    }

    // 2. Validate and build items with snapshots
    let totalItems = 0;
    let totalRolls = 0;
    let totalMeters = 0;
    let totalAmount = 0;

    const populatedItems = await Promise.all(data.items.map(async (item: any) => {
      const quality: any = await Item.findOne({ _id: item.itemId, businessId });
      if (!quality) throw new Error(`Quality ${item.itemId} not found`);

      const rollMeters = Array.isArray(item.meters) ? item.meters : [item.meters];
      const itemTotalMeters = rollMeters.reduce((a: number, b: number) => a + b, 0);
      const itemAmount = itemTotalMeters * item.ratePerMeter;

      totalItems++;
      totalRolls += rollMeters.length;
      totalMeters += itemTotalMeters;
      totalAmount += itemAmount;

      return {
        itemId: quality._id,
        itemName: quality.name,
        itemCode: quality.shortCode,
        hsnCode: quality.hsnCode,
        rollNumbers: item.rollNumbers || [],
        meters: rollMeters,
        totalMeters: itemTotalMeters,
        ratePerMeter: item.ratePerMeter,
        amount: itemAmount,
        unit: quality.unit || 'METERS',
        remarks: item.remarks
      };
    }));

    // 3. Compute Commission
    let commissionAmt = 0;
    if (broker) {
      if (broker.commissionType === 'PERCENTAGE') {
        commissionAmt = (totalAmount * broker.commissionRate) / 100;
      } else if (broker.commissionType === 'FIXED_PER_METER') {
        commissionAmt = totalMeters * broker.commissionRate;
      } else if (broker.commissionType === 'FIXED_PER_CHALLAN') {
        commissionAmt = broker.commissionRate;
      }
    }

    // 4. Atomic Number Generation
    const challanDate = data.date ? new Date(data.date) : new Date();
    const challanNumber = await this.gernateAtomicChallanNumber(businessId, challanDate);

    // 5. Construct Document
    const challanDoc = {
      businessId,
      challanNumber,
      date: challanDate,
      partyId: party._id,
      partySnapshot: {
        name: party.name,
        shortCode: party.shortCode,
        address: party.address,
        phone: party.phone,
        gstin: party.gstin
      },
      brokerId: broker ? broker._id : undefined,
      brokerSnapshot: broker ? {
        name: broker.name,
        commissionRate: broker.commissionRate,
        commissionType: broker.commissionType,
      } : undefined,
      vehicleNumber: data.vehicleNumber,
      deliveryBoyId: data.deliveryBoyId,
      transporterName: data.transporterName,

      referenceNumber: data.referenceNumber,
      challanType: data.challanType || 'SUPPLY_ON_APPROVAL',
      placeOfSupply: data.placeOfSupply,
      supplyType: data.supplyType,

      items: populatedItems,
      totalItems,
      totalRolls,
      totalMeters,
      totalAmount,

      subTotal: data.subTotal || 0,
      totalDiscount: data.totalDiscount || 0,
      totalTax: data.totalTax || 0,
      adjustment: data.adjustment || { label: 'Adjustment', amount: 0 },
      roundOff: data.roundOff || 0,

      status: 'DRAFT',
      remarks: data.remarks,
      internalNotes: data.internalNotes,
      customerNotes: data.customerNotes,
      termsAndConditions: data.termsAndConditions,

      brokerCommissionAmount: commissionAmt,
      createdBy: userId,
      updatedBy: userId
    };

    // 6. Save
    const challan = await Challan.create(challanDoc);

    // 7. Dispatch Background Queues
    await pdfQueue.add('generate-pdf', { challanId: challan._id.toString() });

    // Stock Sync (Check settings for Draft reservations)
    const tSettings = await TenantSettings.findOne({ businessId }).lean();
    const invSettings = (tSettings as any)?.inventory || {};
    const reserveStock = invSettings.reserveStockOnDraftChallans ?? false;

    if (reserveStock || challanDoc.status !== 'DRAFT') {
      await stockSyncQueue.add('sync-stock', { challanId: challan._id.toString(), type: 'OUT' });
    }

    logger.info(`Challan ${challanNumber} created successfully`, { businessId, challanId: challan._id });

    return challan;
  }

  static async update(businessId: string, challanId: string, userId: string, data: any) {
    const challan = await Challan.findOne({ _id: challanId, businessId });
    if (!challan) throw Errors.notFound('Challan');

    if (['BILLED', 'CANCELLED'].includes(challan.status)) {
      throw Errors.badRequest('Cannot edit a billed or cancelled challan');
    }

    // 1. Fetch Party
    const party = await Party.findOne({ _id: data.partyId, businessId });
    if (!party) throw Errors.badRequest('Party not found');

    // 2. Fetch Broker
    let broker = null;
    if (data.brokerId) {
      broker = await Broker.findOne({ _id: data.brokerId, businessId });
    }

    // 3. Process items and validate rates
    let totalItems = 0;
    let totalRolls = 0;
    let totalMeters = 0;
    let totalAmount = 0;

    const populatedItems = await Promise.all(data.items.map(async (item: any) => {
      const quality = await Item.findOne({ _id: item.itemId, businessId });
      if (!quality) throw Errors.badRequest(`Fabric item ${item.itemId} not found`);

      const rollMeters = Array.isArray(item.meters) ? item.meters : [];
      const itemTotalMeters = rollMeters.reduce((sum: number, m: number) => sum + m, 0);
      const itemAmount = itemTotalMeters * item.ratePerMeter;

      totalItems += 1;
      totalRolls += rollMeters.length;
      totalMeters += itemTotalMeters;
      totalAmount += itemAmount;

      return {
        itemId: quality._id,
        itemName: quality.name,
        itemCode: quality.shortCode,
        hsnCode: quality.hsnCode,
        rollNumbers: item.rollNumbers || [],
        meters: rollMeters,
        totalMeters: itemTotalMeters,
        ratePerMeter: item.ratePerMeter,
        amount: itemAmount,
        unit: quality.unit || 'METERS',
        remarks: item.remarks
      };
    }));

    // 4. Calculate Commission
    let commissionAmt = 0;
    if (broker) {
      if (broker.commissionType === 'PERCENTAGE') commissionAmt = (totalAmount * broker.commissionRate) / 100;
      else if (broker.commissionType === 'FIXED_PER_METER') commissionAmt = totalMeters * broker.commissionRate;
      else if (broker.commissionType === 'FIXED_PER_CHALLAN') commissionAmt = broker.commissionRate;
    }

    // 5. Update Doc
    challan.partyId = party._id as any;
    challan.partySnapshot = {
      name: party.name,
      shortCode: party.shortCode || '',
      address: party.address,
      phone: party.phone,
      gstin: party.gstin
    };

    if (broker) {
      challan.brokerId = broker._id as any;
      challan.brokerSnapshot = {
        name: broker.name,
        commissionRate: broker.commissionRate,
        commissionType: broker.commissionType,
      };
      challan.brokerCommissionAmount = commissionAmt;
    } else {
      challan.brokerId = undefined;
      challan.brokerSnapshot = undefined;
      challan.brokerCommissionAmount = undefined;
    }

    challan.date = new Date(data.date);
    challan.vehicleNumber = data.vehicleNumber;
    challan.deliveryBoyId = data.deliveryBoyId;
    challan.transporterName = data.transporterName;

    challan.referenceNumber = data.referenceNumber;
    challan.challanType = data.challanType || 'SUPPLY_ON_APPROVAL';
    challan.placeOfSupply = data.placeOfSupply;
    challan.supplyType = data.supplyType;

    challan.items = populatedItems as any;
    challan.totalItems = totalItems;
    challan.totalRolls = totalRolls;
    challan.totalMeters = totalMeters;
    challan.totalAmount = totalAmount;

    challan.subTotal = data.subTotal || 0;
    challan.totalDiscount = data.totalDiscount || 0;
    challan.totalTax = data.totalTax || 0;
    challan.adjustment = data.adjustment || { label: 'Adjustment', amount: 0 };
    challan.roundOff = data.roundOff || 0;

    challan.remarks = data.remarks;
    challan.internalNotes = data.internalNotes;
    challan.customerNotes = data.customerNotes;
    challan.termsAndConditions = data.termsAndConditions;
    challan.updatedBy = userId as any;

    await challan.save();

    // Regenerate PDF
    await pdfQueue.add('generate-pdf', { challanId: challan._id.toString() });

    logger.info(`Challan ${challan.challanNumber} updated successfully`, { businessId, challanId: challan._id });
    return challan;
  }

  static async list(businessId: string, filters: any, pagination: any) {
    const query: any = { businessId };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.status) query.status = filters.status;
    if (filters.partyId) query.partyId = filters.partyId;
    if (filters.brokerId) query.brokerId = filters.brokerId;

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
    }

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const data = await Challan.find(query)
      .sort({ date: -1, createdAt: -1 }) // default sort
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Challan.countDocuments(query);

    // Also get fast aggregates for the current query
    const aggregates = await Challan.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalChallans: { $sum: 1 },
          totalMeters: { $sum: '$totalMeters' },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = aggregates[0] || { totalChallans: 0, totalMeters: 0, totalAmount: 0 };

    return {
      data,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getById(businessId: string, challanId: string) {
    const challan = await Challan.findOne({ _id: challanId, businessId }).lean();
    if (!challan) throw new Error('Challan not found');
    return challan;
  }

  static async cancel(businessId: string, challanId: string, reason: string, userId: string) {
    const challan = await Challan.findOne({ _id: challanId, businessId });
    if (!challan) throw new Error('Challan not found');
    if (challan.status === 'BILLED') throw new Error('Cannot cancel a billed challan');

    challan.status = 'CANCELLED';
    challan.cancellationReason = reason;
    challan.cancelledAt = new Date();
    challan.updatedBy = new mongoose.Types.ObjectId(userId) as any;
    await challan.save();

    await stockSyncQueue.add('sync-stock-cancel', { challanId: challan._id.toString(), type: 'IN' });

    return challan;
  }

  static async markDelivered(businessId: string, challanId: string, latLng: any, userId: string) {
    const challan = await Challan.findOne({ _id: challanId, businessId });
    if (!challan) throw new Error('Challan not found');

    const wasDraft = challan.status === 'DRAFT';

    challan.status = 'DELIVERED';
    challan.deliveredAt = new Date();
    if (latLng) challan.deliveryLatLng = latLng;
    challan.updatedBy = new mongoose.Types.ObjectId(userId) as any;

    await challan.save();

    // If it was a Draft and we were NOT reserving stock on drafts, deduct it NOW
    if (wasDraft) {
      const tSettings = await TenantSettings.findOne({ businessId }).lean();
      const invSettings = (tSettings as any)?.inventory || {};
      const reserveStock = invSettings.reserveStockOnDraftChallans ?? false;
      if (!reserveStock) {
        await stockSyncQueue.add('sync-stock', { challanId: challan._id.toString(), type: 'OUT' });
      }
    }

    return challan;
  }

  static async requestPdf(businessId: string, challanId: string) {
    const challan = await Challan.findOne({ _id: challanId, businessId });
    if (!challan) throw new Error('Challan not found');

    if (challan.pdfUrl) {
      return { status: 'ready', url: challan.pdfUrl };
    }

    await pdfQueue.add('generate-pdf-manual', { challanId: challan._id.toString() });
    return { status: 'queued' };
  }

  static async requestWhatsapp(businessId: string, challanId: string) {
    const challan = await Challan.findOne({ _id: challanId, businessId });
    if (!challan) throw new Error('Challan not found');

    await whatsappQueue.add('send-whatsapp-manual', { challanId: challan._id.toString() });
    return { status: 'queued' };
  }
}
