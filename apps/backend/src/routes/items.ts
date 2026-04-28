import { Router, Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import {
  createItemSchema,
  updateItemSchema,
  itemFilterSchema,
} from '@textilepro/shared';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Item Routes
// ═══════════════════════════════════════════════════════════════

const router = Router();
router.use(authenticate, tenantIsolation);

/** GET /api/items */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = itemFilterSchema.parse(req.query);
    const result = await itemService.list(req.auth!.businessId, filters);
    res.json({ success: true, data: result.data, pagination: result.pagination } as ApiResponse);
  } catch (error) { next(error); }
});

/** POST /api/items */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const item = await itemService.create(
      req.auth!.businessId, req.auth!.userId, parsed.data
    );
    res.status(201).json({ success: true, data: item } as ApiResponse);
  } catch (error) { next(error); }
});

/** PUT /api/items/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const item = await itemService.update(
      req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.data
    );
    res.json({ success: true, data: item } as ApiResponse);
  } catch (error) { next(error); }
});

/** DELETE /api/items/:id (soft delete) */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await itemService.softDelete(
      req.auth!.businessId, req.params.id as string
    );
    res.json({ success: true, data: item } as ApiResponse);
  } catch (error) { next(error); }
});

/** POST /api/items/bulk-import */
router.post('/bulk-import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      throw Errors.badRequest('No data rows provided');
    }
    const result = await itemService.bulkImport(
      req.auth!.businessId, req.auth!.userId, rows
    );
    res.json({ success: true, data: result } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/items/export */
router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await itemService.exportAll(req.auth!.businessId);
    res.json({ success: true, data: items } as ApiResponse);
  } catch (error) { next(error); }
});

export default router;
