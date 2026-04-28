import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Branch } from '../models/Branch.js';
import { Employee } from '../models/Employee.js';
import { ApprovalRequest } from '../models/ApprovalRequest.js';
import { AuditLog } from '../models/AuditLog.js';
import { HrmsService } from '../services/hrms.service.js';
import { ApprovalWorkflowService } from '../services/approval.service.js';

export const enterpriseRouter = Router();

enterpriseRouter.use(authenticate);
enterpriseRouter.use(tenantIsolation);

// ─── BRANCHES ────────────────────────────────────────────────

enterpriseRouter.get('/branches', handleRequest(async (req) => {
    return await Branch.find({ businessId: req.businessId });
}));

enterpriseRouter.post('/branches', handleRequest(async (req) => {
    const branch = new Branch({ ...req.body, businessId: req.businessId });
    await branch.save();
    return branch;
}));

enterpriseRouter.put('/branches/:id', handleRequest(async (req) => {
    const branch = await Branch.findOneAndUpdate(
        { _id: req.params.id, businessId: req.businessId },
        { $set: req.body },
        { new: true }
    );
    if (!branch) throw new Error('Branch not found');
    return branch;
}));

enterpriseRouter.delete('/branches/:id', handleRequest(async (req) => {
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
    if (!branch) throw new Error('Branch not found');
    return { id: req.params.id };
}));

// ─── EMPLOYEES & HRMS ────────────────────────────────────────

enterpriseRouter.get('/employees', handleRequest(async (req) => {
    return await Employee.find({ businessId: req.businessId }).populate('branchId', 'branchName');
}));

enterpriseRouter.post('/employees', handleRequest(async (req) => {
    const emp = new Employee({ ...req.body, businessId: req.businessId });
    await emp.save();
    return emp;
}));

enterpriseRouter.post('/attendance/check-in', handleRequest(async (req) => {
    const { employeeId, lat, lng } = req.body;
    return await HrmsService.markAttendance(req.businessId as string, employeeId, lat, lng, 'CHECK_IN');
}));

enterpriseRouter.post('/attendance/check-out', handleRequest(async (req) => {
    const { employeeId, lat, lng } = req.body;
    return await HrmsService.markAttendance(req.businessId as string, employeeId, lat, lng, 'CHECK_OUT');
}));

enterpriseRouter.get('/payroll/:yearMonth', handleRequest(async (req) => {
    const d = new Date(req.params.yearMonth as string);
    return await HrmsService.generateMonthlyPayroll(req.businessId as string, d);
}));

// ─── APPROVALS ───────────────────────────────────────────────

enterpriseRouter.get('/approvals', handleRequest(async (req) => {
    return await ApprovalRequest.find({ businessId: req.businessId, status: 'PENDING' })
        .populate('requestedBy', 'name email');
}));

enterpriseRouter.post('/approvals/:id/action', handleRequest(async (req) => {
    const { decision, reason } = req.body;
    return await ApprovalWorkflowService.actionRequest(req.params.id as string, req.user?._id as string, decision, reason);
}));


// ─── AUDIT LOGS ──────────────────────────────────────────────

enterpriseRouter.get('/audit-logs', handleRequest(async (req) => {
    return await AuditLog.find({ businessId: req.businessId })
        .sort('-createdAt')
        .limit(100)
        .populate('userId', 'name role');
}));
