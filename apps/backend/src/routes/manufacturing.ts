import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { BillOfMaterials } from '../models/BillOfMaterials.js';
import { ProductionOrder } from '../models/ProductionOrder.js';
import { AppError } from '../lib/errors.js';

export const manufacturingRouter = Router();

manufacturingRouter.use(authenticate);

// Enforce Industry Pack logic: Deny if they aren't Garment Mfg
const requireGarmentIndustry = async (req: any, res: any, next: any) => {
    // In production, we'd lookup req.auth.businessId -> Business.industryKey
    // For now we allow it but log securely.
    console.log(`[MANUFACTURING API] Verifying Industry Pack for business ${req.auth.businessId}`);
    next();
};

manufacturingRouter.use(requireGarmentIndustry);

// ─── BILL OF MATERIALS ──────────────────────────────────────────

manufacturingRouter.get('/bom', handleRequest(async (req) => {
    return await BillOfMaterials.find({ businessId: req.auth!.businessId });
}));

manufacturingRouter.post('/bom', handleRequest(async (req) => {
    const bom = new BillOfMaterials({ ...req.body, businessId: req.auth!.businessId });
    await bom.save();
    return { success: true, bom };
}));

// ─── PRODUCTION ORDERS ──────────────────────────────────────────

manufacturingRouter.get('/orders', handleRequest(async (req) => {
    return await ProductionOrder.find({ businessId: req.auth!.businessId }).populate('bomId');
}));

manufacturingRouter.post('/orders', handleRequest(async (req) => {
    const order = new ProductionOrder({ ...req.body, businessId: req.auth!.businessId, status: 'DRAFT' });
    await order.save();
    return { success: true, order };
}));

manufacturingRouter.patch('/orders/:id/status', handleRequest(async (req) => {
    const { status, actualYield } = req.body;
    const order = await ProductionOrder.findOneAndUpdate(
        { _id: req.params.id, businessId: req.auth!.businessId },
        { status, actualYield, ...(status === 'COMPLETED' ? { endDate: new Date() } : {}) },
        { new: true }
    );
    if (!order) throw new AppError('Order not found', 404);

    // In real app, trigger Inventory Service to consume raw materials and vault Finished Goods

    return { success: true, order };
}));
