import { SalesPerformance } from '../models/SalesPerformance.js';
import { User } from '../models/User.js';

export class SalesPerformanceService {
    async getDashboard(businessId: string, dateOption: 'TODAY' | 'WEEK' | 'MONTH') {
        const now = new Date();
        let startDate: Date;

        if (dateOption === 'TODAY') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (dateOption === 'WEEK') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const performances = await SalesPerformance.aggregate([
            {
                $match: {
                    businessId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalCalls: { $sum: '$callsMade' },
                    totalLeadsContacted: { $sum: '$leadsContacted' },
                    totalMeetings: { $sum: '$meetingsDone' },
                    totalFollowups: { $sum: '$followupsCompleted' },
                    totalQuotations: { $sum: '$quotationsSent' },
                    totalLeadsWon: { $sum: '$leadsWon' },
                    totalChallans: { $sum: '$challansCreated' },
                    totalInvoiceValue: { $sum: '$invoiceValueGenerated' },
                    totalCollections: { $sum: '$paymentsCollected' },
                    totalKmTravelled: { $sum: '$kilometersTravelled' },
                    totalActiveMinutes: { $sum: '$activeMinutesInApp' }
                }
            }
        ]);

        // Populate user details manually since aggregate breaks Mongoose virtuals
        const userIds = performances.map(p => p._id);
        const users = await User.find({ _id: { $in: userIds } }).select('name role email lastLoginAt').lean();

        const userMap = new Map();
        users.forEach(u => userMap.set(u._id.toString(), u));

        return performances.map(p => {
            const user = userMap.get(p._id);

            const calls = p.totalCalls || 0;
            const contacts = p.totalLeadsContacted || 0;
            const follow = p.totalFollowups || 0;
            const meets = p.totalMeetings || 0;

            // Activity Score: 10pts/meeting, 3pts/contact, 2pts per call/followup (max 100)
            const activityScore = Math.min((meets * 10) + (contacts * 3) + (calls * 2) + (follow * 2), 100);

            return {
                ...p,
                user,
                activityScore
            };
        });
    }

    async getLeaderboards(businessId: string, dateOption: 'TODAY' | 'WEEK' | 'MONTH') {
        const dashboardStats = await this.getDashboard(businessId, dateOption);

        return {
            highestSales: [...dashboardStats].sort((a, b) => b.totalInvoiceValue - a.totalInvoiceValue).slice(0, 5),
            highestCollections: [...dashboardStats].sort((a, b) => b.totalCollections - a.totalCollections).slice(0, 5),
            bestConversion: [...dashboardStats].sort((a, b) => b.totalLeadsWon - a.totalLeadsWon).slice(0, 5),
            mostActive: [...dashboardStats].sort((a, b) => b.activityScore - a.activityScore).slice(0, 5),
        };
    }
}

export const salesPerformanceService = new SalesPerformanceService();
