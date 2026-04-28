import { Router, Request, Response } from 'express';
import { InboxService } from '../services/inbox.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// ─── Config ─────────────────────────────────────────────────

router.get('/config', async (req: Request, res: Response) => {
    try {
        const config = await InboxService.getConfig((req as any).businessId);
        res.json({ success: true, data: config });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/config', async (req: Request, res: Response) => {
    try {
        const config = await InboxService.saveConfig((req as any).businessId, req.body);
        res.json({ success: true, data: config });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Conversations ──────────────────────────────────────────

router.get('/conversations', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.getConversations((req as any).businessId, req.query);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.put('/conversations/:id', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.updateConversation((req as any).businessId, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/conversations/:id/assign', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.assignChat((req as any).businessId, req.params.id, req.body.assignToUserId);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/conversations/:id/seen', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.markSeen((req as any).businessId, req.params.id);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.get('/conversations/:id/context', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.getCustomerContext((req as any).businessId, req.params.id);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Messages ───────────────────────────────────────────────

router.get('/messages/:conversationId', async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const data = await InboxService.getMessages((req as any).businessId, req.params.conversationId, page);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/messages/send', async (req: Request, res: Response) => {
    try {
        const msg = await InboxService.sendMessage((req as any).businessId, (req as any).user.userId, req.body);
        res.status(201).json({ success: true, data: msg });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/messages/:id/star', async (req: Request, res: Response) => {
    try {
        const msg = await InboxService.starMessage((req as any).businessId, req.params.id);
        res.json({ success: true, data: msg });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.get('/messages/search', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.searchMessages((req as any).businessId, req.query.q as string || '');
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── AI Bot ─────────────────────────────────────────────────

router.post('/ai-respond/:conversationId', async (req: Request, res: Response) => {
    try {
        const response = await InboxService.processAIResponse(
            (req as any).businessId, req.params.conversationId, req.body.text
        );
        res.json({ success: true, data: response });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Templates ──────────────────────────────────────────────

router.get('/templates', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.getTemplates((req as any).businessId, req.query.category as string);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/templates', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.createTemplate((req as any).businessId, req.body);
        res.status(201).json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.put('/templates/:id', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.updateTemplate((req as any).businessId, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.delete('/templates/:id', async (req: Request, res: Response) => {
    try {
        await InboxService.deleteTemplate((req as any).businessId, req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/templates/:id/use', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.useTemplate((req as any).businessId, req.params.id, req.body.variables || {});
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Campaigns ──────────────────────────────────────────────

router.get('/campaigns', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.getCampaigns((req as any).businessId);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/campaigns', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.createCampaign((req as any).businessId, (req as any).user.userId, req.body);
        res.status(201).json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/campaigns/:id/status', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.updateCampaignStatus((req as any).businessId, req.params.id, req.body.status);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Analytics ──────────────────────────────────────────────

router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const data = await InboxService.getAnalytics((req as any).businessId);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Webhook (unauthenticated) ──────────────────────────────

router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const { businessId, phone, contactName, message } = req.body;
        if (!businessId || !phone) return res.status(400).json({ success: false, error: { message: 'Missing fields' } });

        const result = await InboxService.receiveMessage(businessId, phone, contactName || phone, message || {});

        // AI auto-respond if message has body
        if (message?.body) {
            const aiResponse = await InboxService.processAIResponse(businessId, result.conversation._id.toString(), message.body);
            if (!aiResponse.assignToHuman) {
                await InboxService.sendMessage(businessId, 'system', {
                    conversationId: result.conversation._id.toString(),
                    type: 'TEXT',
                    body: aiResponse.reply,
                });
            }
        }

        res.json({ success: true, data: result });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Seed Templates ─────────────────────────────────────────

router.post('/seed-templates', async (req: Request, res: Response) => {
    try {
        await InboxService.seedDefaultTemplates((req as any).businessId);
        res.json({ success: true });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

export default router;
