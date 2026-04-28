import { Router, Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import {
    createLeadSchema,
    updateLeadSchema,
    leadFilterSchema,
    changeStageSchema,
    addNoteSchema,
    addFollowupSchema,
    assignUserSchema,
    markWonSchema,
    markLostSchema
} from '@textilepro/shared';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Lead Routes
// ═══════════════════════════════════════════════════════════════

const router = Router();
router.use(authenticate, tenantIsolation);

/** GET /api/leads/dashboard-summary */
router.get('/dashboard-summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await leadService.getDashboardSummary(req.auth!.businessId);
        res.json({ success: true, data: summary } as ApiResponse);
    } catch (error) { next(error); }
});

/** GET /api/leads */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = leadFilterSchema.parse(req.query);
        const result = await leadService.list(req.auth!.businessId, filters);
        res.json({ success: true, data: result.data, pagination: result.pagination } as ApiResponse);
    } catch (error) { next(error); }
});

/** GET /api/leads/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lead = await leadService.getById(req.auth!.businessId, req.params.id as string);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = createLeadSchema.safeParse(req.body);
        if (!parsed.success) {
            throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
        }
        const lead = await leadService.create(req.auth!.businessId, req.auth!.userId, parsed.data);
        res.status(201).json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** PUT /api/leads/:id */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = updateLeadSchema.safeParse(req.body);
        if (!parsed.success) {
            throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
        }
        const lead = await leadService.update(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.data);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** DELETE /api/leads/:id */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lead = await leadService.softDelete(req.auth!.businessId, req.params.id as string);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

// ─── Actions ──────────────────────────────────────────────────

/** POST /api/leads/:id/change-stage */
router.post('/:id/change-stage', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = changeStageSchema.parse(req.body);
        const lead = await leadService.changeStage(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.stage);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads/:id/add-note */
router.post('/:id/add-note', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = addNoteSchema.parse(req.body);
        const lead = await leadService.addNote(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.note);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads/:id/add-followup */
router.post('/:id/add-followup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = addFollowupSchema.parse(req.body);
        const lead = await leadService.addFollowup(req.auth!.businessId, req.params.id as string, req.auth!.userId, new Date(parsed.date), parsed.note);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads/:id/assign-user */
router.post('/:id/assign-user', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = assignUserSchema.parse(req.body);
        const lead = await leadService.assignUser(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.userId);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads/:id/mark-won */
router.post('/:id/mark-won', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = markWonSchema.parse(req.body);
        const result = await leadService.markWon(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.remarks);
        res.json({ success: true, data: result } as ApiResponse);
    } catch (error) { next(error); }
});

/** POST /api/leads/:id/mark-lost */
router.post('/:id/mark-lost', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = markLostSchema.parse(req.body);
        const lead = await leadService.markLost(req.auth!.businessId, req.params.id as string, req.auth!.userId, parsed.lostReason);
        res.json({ success: true, data: lead } as ApiResponse);
    } catch (error) { next(error); }
});

export default router;
