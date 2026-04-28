import { Router, Request, Response, NextFunction } from 'express';
import { partyService } from '../services/party.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import {
  createPartyMasterSchema,
  updatePartyMasterSchema,
  partyFilterSchema,
} from '@textilepro/shared';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Party Routes
// ═══════════════════════════════════════════════════════════════

const router = Router();
router.use(authenticate, tenantIsolation);

/** GET /api/parties */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = partyFilterSchema.parse(req.query);
    const result = await partyService.list(req.auth!.businessId, filters);
    res.json({ success: true, data: result.data, pagination: result.pagination } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/parties/search-quick — lightweight autocomplete */
router.get('/search-quick', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = String(req.query.q || '');
    if (!search || search.length < 1) {
      return res.json({ success: true, data: [] } as ApiResponse);
    }
    const results = await partyService.quickSearch(req.auth!.businessId, search);
    res.json({ success: true, data: results } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/parties/stats */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await partyService.getStats(req.auth!.businessId);
    res.json({ success: true, data: stats } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/parties/tags — all unique tags */
router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await partyService.getBusinessTags(req.auth!.businessId);
    res.json({ success: true, data: tags } as ApiResponse);
  } catch (error) { next(error); }
});

/** GET /api/parties/:id/ledger */
router.get('/:id/ledger', async (req, res, next) => {
  try {
    const { PartyLedgerService } = await import('../services/partyLedger.service.js');
    const { fromDate, toDate } = req.query;

    let from, to;
    if (fromDate) from = new Date(fromDate as string);
    if (toDate) to = new Date(toDate as string);

    const statement = await PartyLedgerService.getStatement(req.auth!.businessId, req.params.id, from, to);
    res.json({ success: true, data: statement });
  } catch (error) { next(error); }
});

/** GET /api/parties/:id/ledger/export */
router.get('/:id/ledger/export', async (req, res, next) => {
  try {
    const { PdfService } = await import('../services/pdf.service.js');
    const { fromDate, toDate } = req.query;

    let from, to;
    if (fromDate) from = new Date(fromDate as string);
    if (toDate) to = new Date(toDate as string);

    // returns base64 which mobile handles cleanly via Intent share
    const b64 = await PdfService.generatePartyLedgerPdf(req.auth!.businessId, req.params.id, from, to);
    res.json({ success: true, data: { base64: b64 } });
  } catch (error) { next(error); }
});

/** GET /api/parties/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const party = await partyService.getById(req.auth!.businessId, req.params.id!);
    res.json({ success: true, data: party } as ApiResponse);
  } catch (error) { next(error); }
});



/** POST /api/parties */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createPartyMasterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const party = await partyService.create(
      req.auth!.businessId, req.auth!.userId, parsed.data
    );
    res.status(201).json({ success: true, data: party } as ApiResponse);
  } catch (error) { next(error); }
});

/** PUT /api/parties/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updatePartyMasterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const party = await partyService.update(
      req.auth!.businessId, req.params.id!, req.auth!.userId, parsed.data
    );
    res.json({ success: true, data: party } as ApiResponse);
  } catch (error) { next(error); }
});

/** DELETE /api/parties/:id (soft delete) */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const party = await partyService.softDelete(req.auth!.businessId, req.params.id!);
    res.json({ success: true, data: party } as ApiResponse);
  } catch (error) { next(error); }
});

export default router;
