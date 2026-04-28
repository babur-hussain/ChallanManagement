import { CityMetric } from '../models/CityMetrics.js';
import { PlatformLead } from '../models/PlatformLead.js';
import { Business } from '../models/Business.js';

export class GrowthService {
    /**
     * Ranks cities by their growth potential vs saturation.
     * Higher score = Easiest to expand into next.
     */
    static async getCityExpansionLeaderboard() {
        const metrics = await CityMetric.find();

        return metrics.map(city => {
            const penetration = city.estimatedTAM > 0 ? (city.paidCustomers / city.estimatedTAM) * 100 : 0;
            const easeOfExpansion = penetration < 30 && city.competitorDominance !== 'HIGH' ? 'HIGH' : 'LOW';

            return {
                cityName: city.cityName,
                penetration: penetration.toFixed(2),
                activeTrials: city.activeTrials,
                easeOfExpansion,
                targetScore: (city.activeLeads * 0.4) + (city.activeTrials * 0.6)
            };
        }).sort((a, b) => b.targetScore - a.targetScore);
    }

    /**
     * Calculate Daily KPI
     */
    static async getDailyHypergrowthMetrics() {
        // Find total leads generated in the last 24h
        const yesterday = new Date(Date.now() - 86400000);

        const newLeads = await PlatformLead.countDocuments({ createdAt: { $gte: yesterday } });
        const wonLeads = await PlatformLead.countDocuments({ stage: 'WON', updatedAt: { $gte: yesterday } });
        const demosBooked = await PlatformLead.countDocuments({ stage: 'DEMO_BOOKED', updatedAt: { $gte: yesterday } });

        return {
            leadsAddedToday: newLeads,
            demosBookedToday: demosBooked,
            conversionsToday: wonLeads,
            // Assuming $40 average MRR per conversion
            mrrAddedToday: wonLeads * 40
        };
    }
}
