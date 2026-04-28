import { SecurityIncident } from '../models/SecurityIncident.js';
import { User } from '../models/User.js';

export class SecurityOpsService {

    /**
     * Reports an anomaly to the SOC (Security Operations Center)
     */
    static async reportIncident(
        type: 'BRUTE_FORCE_LOGIN' | 'SUSPICIOUS_IP_ACCESS' | 'UNUSUAL_DATA_EXPORT' | 'API_RATE_LIMIT_EXCEEDED' | 'SPAM_WHATSAPP',
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        description: string,
        ipAddress: string,
        userId?: string,
        businessId?: string
    ) {
        const incident = new SecurityIncident({
            incidentType: type,
            severity,
            description,
            ipAddress,
            userId,
            businessId
        });

        await incident.save();

        if (severity === 'CRITICAL') {
            // E.g. Freeze user session instantly
            if (userId) {
                await this.forceLogout(userId);
            }
        }
    }

    /**
     * Killswitches a user
     */
    static async forceLogout(userId: string) {
        // We'd typically clear Redis session tokens or rotate JWT secret logic here
        // Since we are using standard JWT, we might set an `isLocked` flag on the User
        await User.findByIdAndUpdate(userId, { isActive: false });
        console.warn(`[KILLSWITCH] User ${userId} has been security locked.`);
    }
}
