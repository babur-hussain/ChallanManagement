import mongoose from 'mongoose';
import { StockSummary } from '../models/StockSummary.js';
import { StockLedger } from '../models/StockLedger.js';
import { Purchase } from '../models/Purchase.js';
import { Transfer } from '../models/Transfer.js';
import { Item } from '../models/Item.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { getFinancialYearFormat } from '@textilepro/shared';
// import { notificationQueue } from '../lib/queue.js'; // Will implement notification logic if needed
import { logger } from '../lib/logger.js';

export class InventoryService {

  // A generic internal method to apply a movement, ensuring the StockSummary and StockLedger are updated together
  static async _applyMovement(
    businessId: string | mongoose.Types.ObjectId,
    itemId: string | mongoose.Types.ObjectId,
    date: Date,
    movementType: 'PURCHASE_IN' | 'CHALLAN_OUT' | 'CHALLAN_CANCEL_IN' | 'MANUAL_ADJUST' | 'OPENING_STOCK' | 'TRANSFER_IN' | 'TRANSFER_OUT',
    meters: number,
    direction: 'IN' | 'OUT',
    userId: string | mongoose.Types.ObjectId,
    meta: { referenceId?: string, referenceNumber?: string, notes?: string },
    session: mongoose.ClientSession,
    purchaseAmount?: number // used to recalculate average cost if it's a purchase
  ) {
    if (meters < 0) throw new Error('Meters must be positive for movement');

    // Load Tenant Settings for Inventory
    const tSettings = await TenantSettings.findOne({ businessId }).session(session).lean();
    const invSettings: any = (tSettings as any)?.inventory || {};
    const allowNegativeStock = invSettings.allowNegativeStock ?? false;
    const lowStockThresholdDefault = invSettings.lowStockThresholdDefault ?? 10;

    // 1. Get or init Summary
    let summary: any = await StockSummary.findOne({ businessId, itemId }).session(session);

    if (!summary) {
      const quality: any = await Item.findById(itemId).session(session);
      if (!quality) throw new Error('Fabric quality not found');

      summary = new StockSummary({
        businessId,
        itemId,
        itemName: quality.name,
        itemCode: quality.shortCode,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        averageCost: quality.defaultRate || 0,
        lowStockThreshold: quality.lowStockThreshold || lowStockThresholdDefault,
      });
    }

    const balanceBefore = summary.currentStock;

    // 2. Adjust Stock
    if (direction === 'IN') {
      summary.currentStock += meters;

      // Compute new average cost if it's a purchase
      if (purchaseAmount && purchaseAmount > 0) {
        // new avg = (old stock * old avg + new amount) / new stock
        const oldTotalValue = balanceBefore * summary.averageCost;
        const newTotalValue = oldTotalValue + purchaseAmount;
        summary.averageCost = Number((newTotalValue / summary.currentStock).toFixed(2));
      }
    } else {
      summary.currentStock -= meters;
    }

    summary.availableStock = summary.currentStock - summary.reservedStock;

    if (!allowNegativeStock && summary.availableStock < 0) {
      throw new Error(`Negative stock not allowed for ${summary.itemName}. Available: ${balanceBefore}, Requested: ${meters}`);
    }

    summary.isLowStock = summary.availableStock <= summary.lowStockThreshold;
    summary.lastMovementAt = date;
    summary.lastMovementType = movementType === 'MANUAL_ADJUST' ? 'ADJUST' : direction;

    await summary.save({ session });

    // 3. Write Ledger
    const ledger = new StockLedger({
      businessId,
      itemId,
      date,
      movementType,
      meters,
      direction,
      balanceBefore,
      balanceAfter: summary.currentStock,
      ...meta,
      createdBy: userId
    });

    await ledger.save({ session });

    return summary;
  }

  static async recordPurchase(businessId: string, userId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Generate Atomic Purchase Number
      const tSettings = await TenantSettings.findOne({ businessId }).lean();
      const fSettings = (tSettings as any)?.finance || {};
      const fyStartStr = fSettings.financialYearStart || 'april';
      const fy = getFinancialYearFormat(new Date(data.date), fyStartStr);
      // Hacky quick seq for now, usually we use a PurchaseSequence model exactly like InvoiceSequence
      // Given constraints, I will do a quick count logic here or use a simplified epoch
      const count = await Purchase.countDocuments({ businessId, date: { $gte: new Date(`${fy.substring(0, 2)}-04-01`) } });
      const purchaseNumber = `PUR-${fy}-${String(count + 1).padStart(4, '0')}`;

      let totalMeters = 0;
      let totalAmount = 0;

      for (const item of data.items) {
        totalMeters += item.meters;
        totalAmount += item.amount;
      }

      const purchase = new Purchase({
        businessId,
        purchaseNumber,
        date: new Date(data.date),
        supplierName: data.supplierName,
        supplierPhone: data.supplierPhone,
        supplierGstin: data.supplierGstin,
        billNumber: data.billNumber,
        remarks: data.remarks,
        items: data.items,
        totalMeters,
        totalAmount,
        createdBy: userId
      });

      await purchase.save({ session });

      // Process movements
      for (const item of purchase.items) {
        await this._applyMovement(
          businessId,
          item.itemId,
          purchase.date,
          'PURCHASE_IN',
          item.meters,
          'IN',
          userId,
          { referenceId: purchase._id.toString(), referenceNumber: purchase.purchaseNumber },
          session,
          item.amount
        );
      }

      await session.commitTransaction();
      return purchase;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to record purchase', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async adjustStock(businessId: string, userId: string, data: { itemId: string, newQuantity: number, reason: string }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const summary = await StockSummary.findOne({ businessId, itemId: data.itemId }).session(session);
      const current = summary ? summary.currentStock : 0;

      if (current === data.newQuantity) {
        throw new Error('New quantity is same as current quantity');
      }

      const difference = Math.abs(current - data.newQuantity);
      const direction = data.newQuantity > current ? 'IN' : 'OUT';

      const result = await this._applyMovement(
        businessId,
        data.itemId,
        new Date(),
        'MANUAL_ADJUST',
        difference,
        direction,
        userId,
        { notes: data.reason },
        session
      );

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async recordTransfer(businessId: string, userId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tSettings = await TenantSettings.findOne({ businessId }).lean();
      const fSettings = (tSettings as any)?.finance || {};
      const fyStartStr = fSettings.financialYearStart || 'april';
      const fy = getFinancialYearFormat(new Date(data.date), fyStartStr);
      const count = await Transfer.countDocuments({ businessId });
      const transferNumber = `TRF-${fy}-${String(count + 1).padStart(4, '0')}`;

      let totalQuantity = 0;
      for (const item of data.items) {
        totalQuantity += item.quantity;
      }

      const transfer = new Transfer({
        businessId,
        transferNumber,
        date: new Date(data.date),
        fromWarehouseId: data.fromWarehouseId,
        fromWarehouseName: data.fromWarehouseName || 'Main',
        toWarehouseId: data.toWarehouseId,
        toWarehouseName: data.toWarehouseName || 'Branch',
        items: data.items,
        totalQuantity,
        status: 'COMPLETED',
        remarks: data.remarks,
        createdBy: userId,
      });

      await transfer.save({ session });

      // Apply stock movements for each item
      for (const item of transfer.items) {
        // OUT from source
        await this._applyMovement(
          businessId,
          item.itemId,
          transfer.date,
          'TRANSFER_OUT',
          item.quantity,
          'OUT',
          userId,
          { referenceId: transfer._id.toString(), referenceNumber: transfer.transferNumber, notes: `Transfer to ${transfer.toWarehouseName}` },
          session
        );
        // IN to destination (conceptual — single-stock model, net zero)
        await this._applyMovement(
          businessId,
          item.itemId,
          transfer.date,
          'TRANSFER_IN',
          item.quantity,
          'IN',
          userId,
          { referenceId: transfer._id.toString(), referenceNumber: transfer.transferNumber, notes: `Transfer from ${transfer.fromWarehouseName}` },
          session
        );
      }

      await session.commitTransaction();
      return transfer;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to record transfer', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
