import { Router, Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { StockSummary } from '../models/StockSummary.js';
import { StockLedger } from '../models/StockLedger.js';
import { Purchase } from '../models/Purchase.js';
import { Transfer } from '../models/Transfer.js';
import { Challan } from '../models/Challan.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { createPurchaseSchema, adjustStockSchema, createTransferSchema } from '@textilepro/shared';

const router = Router();
router.use(authenticate, tenantIsolation);

// ─── Stock Summary ──────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { isLowStock, search } = req.query;
    const query: any = { businessId: req.businessId };

    if (isLowStock === 'true') {
      query.isLowStock = true;
    }
    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    const summaries = await StockSummary.find(query)
      .sort({ itemName: 1 })
      .lean();

    res.json({ success: true, data: summaries });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Stock Ledger for an item ───────────────────────────────
router.get('/:itemId/ledger', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const data = await StockLedger.find({ businessId: req.businessId, itemId: req.params.itemId })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await StockLedger.countDocuments({ businessId: req.businessId, itemId: req.params.itemId });

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Purchases ──────────────────────────────────────────────
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const validated = createPurchaseSchema.parse(req.body);
    const purchase = await InventoryService.recordPurchase(req.businessId as string, req.user!.userId, validated);
    res.status(201).json({ success: true, data: purchase });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/purchases', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { businessId: req.businessId };
    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { purchaseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await Purchase.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Adjustments ────────────────────────────────────────────
router.post('/adjust', async (req: Request, res: Response) => {
  try {
    const validated = adjustStockSchema.parse(req.body);
    const summary = await InventoryService.adjustStock(req.businessId as string, req.user!.userId, validated);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/adjustments', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const data = await StockLedger.find({
      businessId: req.businessId,
      movementType: 'MANUAL_ADJUST'
    })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('itemId', 'name shortCode')
      .lean();

    const total = await StockLedger.countDocuments({ businessId: req.businessId, movementType: 'MANUAL_ADJUST' });

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Transfers ──────────────────────────────────────────────
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const validated = createTransferSchema.parse(req.body);
    const transfer = await InventoryService.recordTransfer(req.businessId as string, req.user!.userId, validated);
    res.status(201).json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/transfers', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { businessId: req.businessId };
    if (search) {
      query.$or = [
        { transferNumber: { $regex: search, $options: 'i' } },
        { fromWarehouseName: { $regex: search, $options: 'i' } },
        { toWarehouseName: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await Transfer.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Transfer.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Dispatches (from Challans) ─────────────────────────────
router.get('/dispatches', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { businessId: req.businessId };
    if (search) {
      query.$or = [
        { challanNumber: { $regex: search, $options: 'i' } },
        { 'party.name': { $regex: search, $options: 'i' } },
      ];
    }

    const challans = await Challan.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Challan.countDocuments(query);

    // Map challans to dispatch summary format
    const data = challans.map((c: any) => ({
      _id: c._id,
      challanNumber: c.challanNumber,
      date: c.date,
      partyName: c.party?.name || 'Unknown',
      items: (c.items || []).map((i: any) => ({
        itemName: i.itemName || i.fabricName || 'Item',
        quantity: i.meters || i.quantity || 0,
      })),
      totalQuantity: c.totalMeters || c.items?.reduce((sum: number, i: any) => sum + (i.meters || i.quantity || 0), 0) || 0,
      status: c.status || 'DELIVERED',
    }));

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ─── Dashboard Stats ────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const businessId = req.businessId;

    const [summaries, totalPurchases, totalTransfers, recentAdjustments, totalDispatches, actualTotalItems] = await Promise.all([
      StockSummary.find({ businessId }).lean(),
      Purchase.countDocuments({ businessId }),
      Transfer.countDocuments({ businessId }),
      StockLedger.countDocuments({ businessId, movementType: 'MANUAL_ADJUST' }),
      Challan.countDocuments({ businessId }),
      import('../models/Item.js').then(m => m.Item.countDocuments({ businessId })),
    ]);

    const totalItems = actualTotalItems || 0;
    const totalStockValue = summaries.reduce((sum: number, s: any) => sum + (s.currentStock * s.averageCost), 0);
    const lowStockItems = summaries.filter((s: any) => s.isLowStock).length;
    const totalStock = summaries.reduce((sum: number, s: any) => sum + s.currentStock, 0);

    res.json({
      success: true,
      data: {
        totalItems,
        totalStock,
        totalStockValue,
        lowStockItems,
        totalPurchases,
        totalTransfers,
        recentAdjustments,
        totalDispatches,
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
