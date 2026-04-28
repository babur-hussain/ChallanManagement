import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { salesPerformanceService } from '../services/salesPerformance.service.js';

export const salesRouter = Router();

salesRouter.use(authenticate);
salesRouter.use(requireRole(['OWNER'])); // Only management should view global leaderboards

salesRouter.get('/dashboard', async (req, res, next) => {
    try {
        const dateOption = (req.query.date as 'TODAY' | 'WEEK' | 'MONTH') || 'MONTH';
        const active = await salesPerformanceService.getDashboard(req.auth!.businessId, dateOption);
        res.json({ success: true, data: active });
    } catch (error) {
        next(error);
    }
});

salesRouter.get('/leaderboards', async (req, res, next) => {
    try {
        const dateOption = (req.query.date as 'TODAY' | 'WEEK' | 'MONTH') || 'MONTH';
        const boards = await salesPerformanceService.getLeaderboards(req.auth!.businessId, dateOption);
        res.json({ success: true, data: boards });
    } catch (error) {
        next(error);
    }
});
