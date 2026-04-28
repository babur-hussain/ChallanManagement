import { ApprovalRequest, IApprovalRequestDoc } from '../models/ApprovalRequest.js';

export class ApprovalWorkflowService {

    /**
     * Gates an action that requires management approval
     */
    static async requestApproval(
        businessId: string,
        userId: string,
        module: 'EXPENSE' | 'QUOTATION' | 'INVOICE' | 'PAYROLL' | 'STOCK_ADJUSTMENT',
        description: string,
        payload: any,
        requiredRole = 'DIRECTOR',
        referenceId?: string
    ) {
        const request = new ApprovalRequest({
            businessId,
            module,
            requestedBy: userId,
            requiredRole,
            description,
            payload,
            referenceId,
            status: 'PENDING'
        });

        await request.save();
        // In real app, trigger Push Notification to Directors
        return request;
    }

    /**
     * Action an approval request
     */
    static async actionRequest(requestId: string, actionedBy: string, decision: 'APPROVED' | 'REJECTED', reason?: string) {
        const request = await ApprovalRequest.findById(requestId);
        if (!request) throw new Error('Approval request not found');

        request.status = decision;
        request.actionedBy = actionedBy as any;
        request.actionedAt = new Date();
        if (reason) request.rejectionReason = reason;

        await request.save();

        if (decision === 'APPROVED') {
            // Fire payload execution
            // Example logic:
            // if (request.module === 'EXPENSE') await Expense.findByIdAndUpdate(request.payload.expenseId, { status: 'APPROVED' })
        }

        return request;
    }

}
