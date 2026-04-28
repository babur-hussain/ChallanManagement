import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { StorageService } from '../services/storage.service.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// Configure multer with memory storage (files are kept in buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        }

        const businessId = (req as any).businessId;

        // Upload to S3 using the existig storage service
        // Pass the file buffer to the StorageService logic we viewed earlier
        const url = await StorageService.uploadFile(businessId, req.file, 'logos');

        res.status(201).json({ success: true, url });
    } catch (e: any) {
        res.status(400).json({ success: false, error: { message: e.message } });
    }
});

export default router;
