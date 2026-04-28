import { Router, Request, Response, NextFunction } from 'express';
import { brokerService } from '../services/broker.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import { createBrokerSchema, updateBrokerSchema } from '@textilepro/shared';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Broker Routes
// ═══════════════════════════════════════════════════════════════

const router = Router();
router.use(authenticate, tenantIsolation);

/** GET /api/brokers */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await brokerService.list(req.auth!.businessId, {
      search: String(req.query.search || ''),
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sortBy: String(req.query.sortBy || 'name'),
      sortOrder: String(req.query.sortOrder || 'asc'),
    });
    res.json({ success: true, data: result.data, pagination: result.pagination } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/brokers/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const broker = await brokerService.getById(req.auth!.businessId, req.params.id!);
    res.json({ success: true, data: broker } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/brokers/:id/commission-statement */
router.get('/:id/commission-statement', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : new Date(new Date().getFullYear(), 3, 1);
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();

    const statement = await brokerService.getCommissionStatement(
      req.auth!.businessId, req.params.id!, startDate, endDate
    );
    res.json({ success: true, data: statement } as ApiResponse);
  } catch (error) { next(error); }
});

/** POST /api/brokers */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createBrokerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const broker = await brokerService.create(
      req.auth!.businessId, req.auth!.userId, parsed.data
    );
    res.status(201).json({ success: true, data: broker } as ApiResponse);
  } catch (error) { next(error); }
});

/** PUT /api/brokers/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateBrokerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const broker = await brokerService.update(
      req.auth!.businessId, req.params.id!, req.auth!.userId, parsed.data
    );
    res.json({ success: true, data: broker } as ApiResponse);
  } catch (error) { next(error); }
});

/** DELETE /api/brokers/:id (soft delete) */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const broker = await brokerService.softDelete(req.auth!.businessId, req.params.id!);
    res.json({ success: true, data: broker } as ApiResponse);
  } catch (error) { next(error); }
});

/** POST /api/brokers/:id/pay-commission */
router.post('/:id/pay-commission', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw Errors.badRequest('Valid payment amount is required');
    }
    const broker = await brokerService.markCommissionPaid(
      req.auth!.businessId, req.params.id!, amount
    );
    res.json({ success: true, data: broker } as ApiResponse);
  } catch (error) { next(error); }
});

export default router;
