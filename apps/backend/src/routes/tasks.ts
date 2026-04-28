import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { taskService } from '../services/task.service.js';
import { CreateFollowUpTaskSchema, UpdateFollowUpTaskSchema } from '@textilepro/shared';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get('/dashboard-summary', async (req, res, next) => {
    try {
        const userIdFilter = req.auth?.role === 'SALESMAN' ? req.auth.userId : req.query.userId as string;
        const summary = await taskService.getDashboardSummary(req.auth!.businessId, userIdFilter);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
});

taskRouter.get('/', async (req, res, next) => {
    try {
        const filters = req.query;
        if (req.auth?.role === 'SALESMAN') {
            filters.assignedToUserId = req.auth.userId;
        }
        const tasks = await taskService.list(req.auth!.businessId, filters);
        res.json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
});

taskRouter.post('/', async (req, res, next) => {
    try {
        const data = CreateFollowUpTaskSchema.parse(req.body);
        const task = await taskService.create(req.auth!.businessId, req.auth!.userId, data);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
});

taskRouter.get('/:id', async (req, res, next) => {
    try {
        const task = await taskService.getById(req.auth!.businessId, req.params.id);
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
});

taskRouter.put('/:id', async (req, res, next) => {
    try {
        const data = UpdateFollowUpTaskSchema.parse(req.body);
        const task = await taskService.update(req.auth!.businessId, req.params.id, data);
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
});

taskRouter.post('/:id/complete', async (req, res, next) => {
    try {
        const task = await taskService.complete(req.auth!.businessId, req.params.id, req.auth!.userId, req.body.notes);
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
});

taskRouter.post('/:id/cancel', async (req, res, next) => {
    try {
        const task = await taskService.cancel(req.auth!.businessId, req.params.id);
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
});

taskRouter.delete('/:id', async (req, res, next) => {
    try {
        await taskService.delete(req.auth!.businessId, req.params.id);
        res.json({ success: true, data: { message: 'Task deleted' } });
    } catch (error) {
        next(error);
    }
});
