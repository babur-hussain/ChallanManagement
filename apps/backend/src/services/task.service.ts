import { FollowUpTask } from '../models/FollowUpTask.js';
import { SalesPerformance } from '../models/SalesPerformance.js';
import { Errors } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

export class TaskService {
    async list(businessId: string, filters: any) {
        const { assignedToUserId, today, overdue, completed, priority, relatedType } = filters;
        const query: any = { businessId };

        if (assignedToUserId) query.assignedToUserId = assignedToUserId;
        if (priority) query.priority = priority;
        if (relatedType) query.relatedType = relatedType;
        if (completed === 'true') {
            query.status = 'DONE';
        } else if (completed === 'false') {
            query.status = { $ne: 'DONE' };
        }

        const now = new Date();
        if (today === 'true') {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
            query.dueAt = { $gte: startOfToday, $lte: endOfToday };
        }

        if (overdue === 'true') {
            query.dueAt = { $lt: now };
            query.status = { $nin: ['DONE', 'CANCELLED'] };
        }

        const tasks = await FollowUpTask.find(query).sort({ dueAt: 1 }).lean();
        return tasks;
    }

    async create(businessId: string, userId: string, data: any) {
        const task = await FollowUpTask.create({
            ...data,
            businessId,
            createdBy: userId,
        });
        return task;
    }

    async update(businessId: string, id: string, data: any) {
        const task = await FollowUpTask.findOneAndUpdate(
            { _id: id, businessId },
            { $set: data },
            { new: true }
        );
        if (!task) throw Errors.notFound('Task not found');
        return task;
    }

    async getById(businessId: string, id: string) {
        const task = await FollowUpTask.findOne({ _id: id, businessId }).lean();
        if (!task) throw Errors.notFound('Task not found');
        return task;
    }

    async complete(businessId: string, id: string, userId: string, notes?: string) {
        const task = await FollowUpTask.findOne({ _id: id, businessId });
        if (!task) throw Errors.notFound('Task not found');

        if (task.status === 'DONE') {
            throw Errors.badRequest('Task is already completed');
        }

        task.status = 'DONE';
        task.completedAt = new Date();
        task.completedNotes = notes;
        await task.save();

        // Update Sales Performance mapping
        await this.incrementSalesMetric(businessId, userId, 'followupsCompleted');

        return task;
    }

    async cancel(businessId: string, id: string) {
        const task = await FollowUpTask.findOneAndUpdate(
            { _id: id, businessId },
            { $set: { status: 'CANCELLED' } },
            { new: true }
        );
        if (!task) throw Errors.notFound('Task not found');
        return task;
    }

    async delete(businessId: string, id: string) {
        const task = await FollowUpTask.findOneAndDelete({ _id: id, businessId });
        if (!task) throw Errors.notFound('Task not found');
        return task;
    }

    async getDashboardSummary(businessId: string, assignedToUserId?: string) {
        const query: any = { businessId };
        if (assignedToUserId) query.assignedToUserId = assignedToUserId;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

        const [dueToday, overdue, completedToday, pendingHighPriority] = await Promise.all([
            FollowUpTask.countDocuments({ ...query, dueAt: { $gte: startOfToday, $lte: endOfToday }, status: { $nin: ['DONE', 'CANCELLED'] } }),
            FollowUpTask.countDocuments({ ...query, dueAt: { $lt: now }, status: { $nin: ['DONE', 'CANCELLED'] } }),
            FollowUpTask.countDocuments({ ...query, status: 'DONE', completedAt: { $gte: startOfToday, $lte: endOfToday } }),
            FollowUpTask.countDocuments({ ...query, status: 'PENDING', priority: { $in: ['HIGH', 'URGENT'] } })
        ]);

        return {
            dueToday,
            overdue,
            completedToday,
            pendingHighPriority
        };
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

export const taskService = new TaskService();
