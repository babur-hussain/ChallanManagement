import { AuditLog } from '../models/AuditLog.js';

export class AuditService {

    /**
     * Instantly write an immutable audit trail event
     */
    static async logAction(
        businessId: string,
        userId: string,
        module: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'APPROVE' | 'AI_ACTION',
        description: string,
        reqDetails?: { ip?: string, userAgent?: string },
        entityId?: string,
        oldValue?: any,
        newValue?: any
    ) {
        // Fire-and-forget logging for speed, doesn't block main request execution
        try {
            await AuditLog.create({
                businessId,
                userId,
                module,
                action,
                description,
                ipAddress: reqDetails?.ip,
                userAgent: reqDetails?.userAgent,
                entityId,
                oldValue,
                newValue
            });
        } catch (err) {
            console.error('Failed writing Audit log: ', err);
        }
    }
}
