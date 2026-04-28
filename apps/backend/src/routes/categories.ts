import { Router, Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import { createCategorySchema, updateCategorySchema, categoryFilterSchema } from '@textilepro/shared';
import type { ApiResponse } from '@textilepro/shared';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = categoryFilterSchema.parse(req.query);
        const result = await categoryService.getCategories(req.auth!.businessId, filters as any);
        res.json({ success: true, data: result.data, pagination: result.pagination } as ApiResponse);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = createCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
        }
        const category = await categoryService.createCategory(req.auth!.businessId, parsed.data);
        res.status(201).json({ success: true, data: category } as ApiResponse);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await categoryService.getCategoryById(req.auth!.businessId, req.params.id as string);
        res.json({ success: true, data: category } as ApiResponse);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = updateCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
        }
        const category = await categoryService.updateCategory(req.auth!.businessId, req.params.id as string, parsed.data);
        res.json({ success: true, data: category } as ApiResponse);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryService.deleteCategory(req.auth!.businessId, req.params.id as string);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
