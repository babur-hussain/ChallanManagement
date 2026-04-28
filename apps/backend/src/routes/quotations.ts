import { Router, Request, Response } from 'express';
import { QuotationService } from '../services/quotation.service.js';
import { RateIntelligenceService } from '../services/rateIntelligence.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import {
    CreateQuotationSchema,
    UpdateQuotationSchema,
    AddNegotiationNoteSchema,
    RejectQuotationSchema,
} from '@textilepro/shared';

const router = Router();

router.use(authenticate, tenantIsolation);

// ─── Dashboard Summary ──────────────────────────────────────

router.get('/dashboard-summary', async (req: Request, res: Response) => {
    try {
        const summary = await QuotationService.getDashboardSummary(req.businessId);
        res.json({ success: true, data: summary });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Next Number Preview ────────────────────────────────────

router.get('/next-number', async (req: Request, res: Response) => {
    try {
        const nextStr = await QuotationService.getNextQuotationNumber(req.businessId);
        res.json({ success: true, data: { nextStr } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Rate Intelligence ──────────────────────────────────────

router.get('/rate-intelligence/:itemId', async (req: Request, res: Response) => {
    try {
        const intel = await RateIntelligenceService.getIntelligence(req.businessId, req.params.itemId);
        res.json({ success: true, data: intel });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.get('/rate-intelligence/:itemId/check', async (req: Request, res: Response) => {
    try {
        const rate = Number(req.query.rate);
        if (!rate) throw new Error('rate query param required');
        const result = await RateIntelligenceService.checkRateWarnings(req.businessId, req.params.itemId, rate);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/rate-history', async (req: Request, res: Response) => {
    try {
        const entry = await RateIntelligenceService.upsertRate(req.businessId, req.user!.userId, req.body);
        res.json({ success: true, data: entry });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.get('/rate-history/:itemId', async (req: Request, res: Response) => {
    try {
        const days = Number(req.query.days) || 30;
        const history = await RateIntelligenceService.getHistory(req.businessId, req.params.itemId, days);
        res.json({ success: true, data: history });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── CRUD ───────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, status, partyId, leadId, createdBy, dateFrom, dateTo, expiringSoon } = req.query;
        const result = await QuotationService.list(
            req.businessId,
            { search, status, partyId, leadId, createdBy, dateFrom, dateTo, expiringSoon },
            { page: Number(page), limit: Number(limit) }
        );
        res.json({ success: true, data: result.data, stats: result.stats, pagination: result.pagination });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const validated = CreateQuotationSchema.parse(req.body);
        const quotation = await QuotationService.create(req.businessId, req.user!.userId, validated);
        res.status(201).json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.getById(req.businessId, req.params.id);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(404).json({ success: false, error: { message: error.message } });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const validated = UpdateQuotationSchema.parse(req.body);
        const quotation = await QuotationService.update(req.businessId, req.params.id, req.user!.userId, validated);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const result = await QuotationService.delete(req.businessId, req.params.id);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Status Actions ─────────────────────────────────────────

router.post('/:id/send-whatsapp', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.markSent(req.businessId, req.params.id, req.user!.userId);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/:id/send-email', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.markSent(req.businessId, req.params.id, req.user!.userId);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/:id/mark-viewed', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.markViewed(req.businessId, req.params.id);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/:id/accept', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.accept(req.businessId, req.params.id, req.user!.userId);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/:id/reject', async (req: Request, res: Response) => {
    try {
        const { rejectionReason } = RejectQuotationSchema.parse(req.body);
        const quotation = await QuotationService.reject(req.businessId, req.params.id, req.user!.userId, rejectionReason);
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Negotiation ────────────────────────────────────────────

router.post('/:id/negotiation-note', async (req: Request, res: Response) => {
    try {
        const { text } = AddNegotiationNoteSchema.parse(req.body);
        const quotation = await QuotationService.addNegotiationNote(
            req.businessId, req.params.id, req.user!.userId, req.user!.name || 'User', text
        );
        res.json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Conversion ─────────────────────────────────────────────

router.post('/:id/convert-to-challan', async (req: Request, res: Response) => {
    try {
        const result = await QuotationService.convertToChallan(req.businessId, req.params.id, req.user!.userId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/:id/convert-to-invoice', async (req: Request, res: Response) => {
    try {
        const result = await QuotationService.convertToInvoice(req.businessId, req.params.id, req.user!.userId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Duplicate ──────────────────────────────────────────────

router.post('/:id/duplicate', async (req: Request, res: Response) => {
    try {
        const quotation = await QuotationService.duplicate(req.businessId, req.params.id, req.user!.userId);
        res.status(201).json({ success: true, data: quotation });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

export default router;
