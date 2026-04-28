import { Router, Request, Response } from 'express';
import { OCRService } from '../services/ocr.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// ─── Config ─────────────────────────────────────────────────

router.get('/config', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.getConfig((req as any).businessId);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/config', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.saveConfig((req as any).businessId, req.body);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Upload ─────────────────────────────────────────────────

router.post('/upload', async (req: Request, res: Response) => {
    try {
        // In production, multer middleware handles file upload
        // For now, accept file metadata in body
        const file = {
            originalname: req.body.fileName || 'document',
            size: req.body.fileSize || 0,
            mimetype: req.body.mimeType || 'application/octet-stream',
            path: req.body.storageUrl || `/uploads/${Date.now()}`,
        };
        const doc = await OCRService.uploadDocument(
            (req as any).businessId,
            (req as any).user.userId,
            file,
            req.body.source || 'UPLOAD',
            req.body.typeHint,
        );
        res.status(201).json({ success: true, data: doc });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/upload/bulk', async (req: Request, res: Response) => {
    try {
        const files = req.body.files || [];
        const docs = [];
        for (const f of files) {
            const file = {
                originalname: f.fileName || 'document',
                size: f.fileSize || 0,
                mimetype: f.mimeType || 'application/octet-stream',
                path: f.storageUrl || `/uploads/${Date.now()}`,
            };
            const doc = await OCRService.uploadDocument(
                (req as any).businessId,
                (req as any).user.userId,
                file,
                f.source || 'UPLOAD',
                f.typeHint,
            );
            docs.push(doc);
        }
        res.status(201).json({ success: true, data: docs });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Documents ──────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.getDocuments((req as any).businessId, req.query);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.getAnalytics((req as any).businessId);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.getDocument((req as any).businessId, req.params.id);
        if (!data) return res.status(404).json({ success: false, error: { message: 'Not found' } });
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Process & Review ───────────────────────────────────────

router.post('/:id/process', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.processDocument((req as any).businessId, req.params.id);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/:id/review', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.reviewDocument((req as any).businessId, req.params.id, req.body);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

router.post('/:id/reprocess', async (req: Request, res: Response) => {
    try {
        const data = await OCRService.reprocessDocument((req as any).businessId, req.params.id);
        res.json({ success: true, data });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Convert ────────────────────────────────────────────────

router.post('/:id/convert', async (req: Request, res: Response) => {
    try {
        const result = await OCRService.convertDocument(
            (req as any).businessId, req.params.id, req.body.action, (req as any).user.userId
        );
        res.json({ success: true, data: result });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Delete ─────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await OCRService.deleteDocument((req as any).businessId, req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Bulk ───────────────────────────────────────────────────

router.post('/bulk-process', async (req: Request, res: Response) => {
    try {
        const results = await OCRService.bulkProcess((req as any).businessId, req.body.documentIds || []);
        res.json({ success: true, data: results });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

// ─── Party Match ────────────────────────────────────────────

router.post('/match-party', async (req: Request, res: Response) => {
    try {
        const party = await OCRService.matchParty(
            (req as any).businessId, req.body.name, req.body.phone, req.body.gstin
        );
        res.json({ success: true, data: party });
    } catch (e: any) { res.status(400).json({ success: false, error: { message: e.message } }); }
});

export default router;
