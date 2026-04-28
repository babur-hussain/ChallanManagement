import { Visit } from '../models/Visit.js';
import { SalesPerformance } from '../models/SalesPerformance.js';
import { Errors } from '../middleware/errorHandler.js';

export class VisitService {
    async list(businessId: string, filters: any) {
        const { userId, partyId, leadId, date } = filters;
        const query: any = { businessId };

        if (userId) query.userId = userId;
        if (partyId) query.partyId = partyId;
        if (leadId) query.leadId = leadId;
        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
            query.checkInAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const visits = await Visit.find(query).sort({ checkInAt: -1 }).lean();
        return visits;
    }

    async checkIn(businessId: string, userId: string, data: any) {
        const visit = await Visit.create({
            ...data,
            businessId,
            userId,
            checkInAt: new Date()
        });
        return visit;
    }

    async checkOut(businessId: string, id: string, userId: string, data: any) {
        const visit = await Visit.findOne({ _id: id, businessId, userId });
        if (!visit) throw Errors.notFound('Visit not found');

        if (visit.checkOutAt) {
            throw Errors.badRequest('Visit is already checked out');
        }

        visit.checkOutAt = new Date();
        visit.durationMinutes = Math.round((visit.checkOutAt.getTime() - visit.checkInAt.getTime()) / 60000);

        if (data.gpsEnd) visit.gpsEnd = data.gpsEnd;
        if (data.notes) visit.notes = data.notes;
        if (data.photos) visit.photos = data.photos;
        if (data.visitOutcome) visit.visitOutcome = data.visitOutcome;
        if (data.nextAction) visit.nextAction = data.nextAction;
        if (data.nextFollowUpAt) visit.nextFollowUpAt = data.nextFollowUpAt;

        await visit.save();

        // Log metric
        await this.incrementSalesMetric(businessId, userId, 'meetingsDone');

        return visit;
    }

    async getMapSummary(businessId: string, userId: string, date: string) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

        const visits = await Visit.find({
            businessId,
            userId,
            checkInAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ checkInAt: 1 }).lean();

        return visits;
    }

    private async incrementSalesMetric(businessId: string, userId: string, field: string, amount: number = 1) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        await SalesPerformance.updateOne(
            { businessId, userId, date: startOfToday },
            { $inc: { [field]: amount } },
            { upsert: true }
        );
    }
}

export const visitService = new VisitService();
