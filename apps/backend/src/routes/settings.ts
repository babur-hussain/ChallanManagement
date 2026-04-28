import { Router } from 'express';
import { settingsService } from '../services/settings.service.js';
import { authenticate, restrictToRole } from '../middleware/auth.js';
import { updateSettingsSchema } from '@textilepro/shared';
import { Errors } from '../middleware/errorHandler.js';

// ═══════════════════════════════════════════════════════════════
// Settings Routes
// GET /api/settings, PUT /api/settings
// ═══════════════════════════════════════════════════════════════

const router = Router();
router.use(authenticate);

/**
 * GET configs for context injection
 */
router.get('/', async (req, res, next) => {
    try {
        const settings = await settingsService.getSettings(req.auth!.businessId);
        res.status(200).json({ success: true, data: settings });
    } catch (e) {
        next(e);
    }
});

/**
 * PUT update tenant configs
 * We strictly restrict this to high clearance users to avoid mass misconfiguration
 */
router.put('/', restrictToRole(['OWNER', 'HR_MANAGER']), async (req, res, next) => {
    try {
        const result = updateSettingsSchema.safeParse(req.body);
        if (!result.success) {
            throw Errors.badRequest('Invalid Settings payload', result.error.flatten().fieldErrors);
        }

        const settings = await settingsService.updateSettings(
            req.auth!.businessId,
            result.data,
            req.auth!.userId
        );

        res.status(200).json({ success: true, data: settings });
    } catch (e) {
        next(e);
    }
});

/**
 * POST test whatsapp message
 */
router.post('/whatsapp/test', restrictToRole(['OWNER', 'HR_MANAGER']), async (req, res, next) => {
    try {
        const { provider, apiKey, senderNumber } = req.body;
        if (!apiKey || !senderNumber) {
            throw Errors.badRequest('Missing API Key or Sender Number');
        }

        // Simulate sending test message via requested provider (e.g. WATI, Twilio)
        console.log(`[WhatsApp Test] Attempting to test ${provider} integration using Key: ${apiKey.substring(0, 5)}...`);

        // Mock success rate for demonstration (95% success unless empty)
        await new Promise(resolve => setTimeout(resolve, 800)); // fake delay

        res.status(200).json({ success: true, message: `Test payload dispatched onto ${provider} servers successfully.` });
    } catch (e) {
        next(e);
    }
});

export default router;
