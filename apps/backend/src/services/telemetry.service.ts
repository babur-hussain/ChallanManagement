import mongoose from 'mongoose';
import { Business } from '../models/Business.js';
import { User } from '../models/User.js';
import { SupportTicket } from '../models/SupportTicket.js';

export class TelemetryService {
    /**
     * Gathers simulated, but plausible, system diagnostics to emulate a Datadog-like dashboard
     */
    static async getSystemHealth() {
        const dbState = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        const isDbHealthy = dbState === 1;

        // In a real Datadog environment, this would hit AWS Cloudwatch / OS libraries.
        // We simulate a robust load reporting structure here for the admin UI.

        return {
            mongodb: {
                status: isDbHealthy ? 'HEALTHY' : 'DEGRADED',
                latencyMs: isDbHealthy ? Math.floor(Math.random() * 20) + 12 : 999
            },
            apiServers: {
                status: 'HEALTHY',
                cpuUtilization: Math.floor(Math.random() * 40) + 20, // 20% - 60%
                ramUtilization: Math.floor(Math.random() * 30) + 40, // 40% - 70%
                errorRatePercent: parseFloat((Math.random() * 0.5).toFixed(2)) // 0.0 - 0.5%
            },
            webhooksQueue: {
                status: 'HEALTHY',
                backlogSize: Math.floor(Math.random() * 5),
                processingLatencyMs: Math.floor(Math.random() * 150) + 50
            },
            aiProvider: {
                status: 'HEALTHY',
                lastErrorAt: null,
                avgResponseSeconds: 3.4
            }
        };
    }

    static async getRealTimeTraffic() {
        // High level KPI simulation logic
        const activeUsers = await User.countDocuments();
        const activeBusinesses = await Business.countDocuments();
        return {
            activeUsers,
            activeBusinesses,
            requestsPerMinute: Math.floor(Math.random() * 500) + 1200
        };
    }
}
