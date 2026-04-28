import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/dashboard', async (req, res) => {
  try {
    const data = await AnalyticsService.getDashboard(req.businessId!);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
