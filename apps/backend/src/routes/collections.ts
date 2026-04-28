import { Router, Request, Response } from 'express';
import { CollectionsService } from '../services/collections.service.js';
import { CreditProfileService } from '../services/creditProfile.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import {
    CreatePromiseSchema,
    CreateCollectionTaskSchema,
    CompleteCollectionTaskSchema,
    BlockPartySchema,
    BreakPromiseSchema,
    UpdateCreditProfileSchema,
} from '@textilepro/shared';

const router = Router();
router.use(authenticate, tenantIsolation);

// ─── Dashboard ──────────────────────────────────────────────

router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getDashboard(req.businessId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Aging Report ───────────────────────────────────────────

router.get('/aging-report', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getAgingReport(req.businessId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── High Risk Parties ──────────────────────────────────────

router.get('/high-risk-parties', async (req: Request, res: Response) => {
    try {
        const data = await CreditProfileService.getHighRiskParties(req.businessId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Outstanding Parties ────────────────────────────────────

router.get('/outstanding', async (req: Request, res: Response) => {
    try {
        const data = await CreditProfileService.getOutstandingParties(req.businessId, req.query);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Collector Performance ──────────────────────────────────

router.get('/collector-performance', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getCollectorPerformance(req.businessId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Tasks ──────────────────────────────────────────────────

router.get('/tasks', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getTasks(req.businessId, req.query);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/tasks', async (req: Request, res: Response) => {
    try {
        const validated = CreateCollectionTaskSchema.parse(req.body);
        const task = await CollectionsService.createTask(req.businessId, validated);
        res.status(201).json({ success: true, data: task });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/tasks/:id/complete', async (req: Request, res: Response) => {
    try {
        const validated = CompleteCollectionTaskSchema.parse(req.body);
        const task = await CollectionsService.completeTask(req.businessId, req.params.id, validated);
        res.json({ success: true, data: task });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Promises ───────────────────────────────────────────────

router.get('/promises', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getPromises(req.businessId, req.query);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/create-promise', async (req: Request, res: Response) => {
    try {
        const validated = CreatePromiseSchema.parse(req.body);
        const promise = await CollectionsService.createPromise(req.businessId, req.user!.userId, validated);
        res.status(201).json({ success: true, data: promise });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/break-promise-manual', async (req: Request, res: Response) => {
    try {
        const { promiseId } = BreakPromiseSchema.parse(req.body);
        const promise = await CollectionsService.breakPromise(req.businessId, promiseId);
        res.json({ success: true, data: promise });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Reminders ──────────────────────────────────────────────

router.post('/send-reminder/:invoiceId', async (req: Request, res: Response) => {
    try {
        const reminder = await CollectionsService.sendReminder(req.businessId, req.params.invoiceId);
        res.json({ success: true, data: reminder });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Block / Unblock ────────────────────────────────────────

router.post('/block-party/:partyId', async (req: Request, res: Response) => {
    try {
        const { reason } = BlockPartySchema.parse(req.body);
        const profile = await CreditProfileService.blockParty(req.businessId, req.params.partyId, req.user!.userId, reason);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/unblock-party/:partyId', async (req: Request, res: Response) => {
    try {
        const profile = await CreditProfileService.unblockParty(req.businessId, req.params.partyId);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Credit Profile ─────────────────────────────────────────

router.get('/credit-profile/:partyId', async (req: Request, res: Response) => {
    try {
        const profile = await CreditProfileService.getOrCreate(req.businessId, req.params.partyId);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.put('/credit-profile/:partyId', async (req: Request, res: Response) => {
    try {
        const validated = UpdateCreditProfileSchema.parse(req.body);
        const profile = await CreditProfileService.updateLimits(req.businessId, req.params.partyId, validated);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/credit-profile/:partyId/recalculate', async (req: Request, res: Response) => {
    try {
        const profile = await CreditProfileService.recalculateScore(req.businessId, req.params.partyId);
        res.json({ success: true, data: profile });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

router.post('/recalculate-all', async (req: Request, res: Response) => {
    try {
        const result = await CreditProfileService.recalculateAll(req.businessId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Party History ──────────────────────────────────────────

router.get('/party/:partyId/history', async (req: Request, res: Response) => {
    try {
        const data = await CollectionsService.getPartyHistory(req.businessId, req.params.partyId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// ─── Credit Check (used by challan/quotation create) ────────

router.get('/credit-check/:partyId', async (req: Request, res: Response) => {
    try {
        const amount = Number(req.query.amount) || 0;
        const result = await CreditProfileService.checkCredit(req.businessId, req.params.partyId, amount);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

export default router;
