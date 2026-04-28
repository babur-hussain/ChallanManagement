import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { visitService } from '../services/visit.service.js';
import { CheckInVisitSchema, CheckOutVisitSchema } from '@textilepro/shared';

export const visitRouter = Router();

visitRouter.use(authenticate);

visitRouter.get('/map-summary', async (req, res, next) => {
    try {
        const summary = await visitService.getMapSummary(req.auth!.businessId, req.auth!.userId, req.query.date as string);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
});

visitRouter.get('/', async (req, res, next) => {
    try {
        const filters = req.query as any;
        if (req.auth?.role === 'SALESMAN') {
            filters.userId = req.auth.userId;
        }
        const visits = await visitService.list(req.auth!.businessId, filters);
        res.json({ success: true, data: visits });
    } catch (error) {
        next(error);
    }
});

visitRouter.post('/checkin', async (req, res, next) => {
    try {
        const data = CheckInVisitSchema.parse(req.body);
        const visit = await visitService.checkIn(req.auth!.businessId, req.auth!.userId, data);
        res.status(201).json({ success: true, data: visit });
    } catch (error) {
        next(error);
    }
});

visitRouter.post('/:id/checkout', async (req, res, next) => {
    try {
        const data = CheckOutVisitSchema.parse(req.body);
        const visit = await visitService.checkOut(req.auth!.businessId, req.params.id, req.auth!.userId, data);
        res.json({ success: true, data: visit });
    } catch (error) {
        next(error);
    }
});
