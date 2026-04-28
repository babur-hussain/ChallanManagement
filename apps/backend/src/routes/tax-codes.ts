import { Router } from 'express';
import { taxCodeService } from '../services/taxCode.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import { createTaxCodeSchema, updateTaxCodeSchema } from '@textilepro/shared';
import * as shared from '@textilepro/shared';

const filterSchemaName = 'taxCodeFilterSchema';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/', async (req, res, next) => {
  try {
    const filters = (shared as any)[filterSchemaName].parse(req.query);
    const result = await taxCodeService.list(req.auth!.businessId, filters);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createTaxCodeSchema.safeParse(req.body);
    if (!parsed.success) throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    const doc = await taxCodeService.create(req.auth!.businessId, parsed.data);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = updateTaxCodeSchema.safeParse(req.body);
    if (!parsed.success) throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    const doc = await taxCodeService.update(req.auth!.businessId, req.params.id as string, parsed.data);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await taxCodeService.delete(req.auth!.businessId, req.params.id as string);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

export default router;
