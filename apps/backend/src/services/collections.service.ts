import mongoose from 'mongoose';
import { CollectionTask } from '../models/CollectionTask.js';
import { PromiseToPay } from '../models/PromiseToPay.js';
import { CollectionReminder } from '../models/CollectionReminder.js';
import { PartyCreditProfile } from '../models/PartyCreditProfile.js';
import { Invoice } from '../models/Invoice.js';
import { CreditProfileService } from './creditProfile.service.js';
import { logger } from '../lib/logger.js';

export class CollectionsService {

    // ═══════════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════

    static async getDashboard(businessId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalOutstandingAgg,
            dueTodayAgg,
            overdueAgg,
            highRiskCount,
            promisesPending,
            brokenPromises,
        ] = await Promise.all([
            PartyCreditProfile.aggregate([
                { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
                { $group: { _id: null, total: { $sum: '$currentOutstanding' } } },
            ]),
            Invoice.aggregate([
                {
                    $match: {
                        businessId: new mongoose.Types.ObjectId(businessId),
                        paymentStatus: { $ne: 'PAID' },
                        dueDate: { $gte: today, $lt: tomorrow },
                    }
                },
                { $group: { _id: null, total: { $sum: { $subtract: ['$grandTotal', { $ifNull: ['$amountPaid', 0] }] } } } },
            ]),
            Invoice.aggregate([
                {
                    $match: {
                        businessId: new mongoose.Types.ObjectId(businessId),
                        paymentStatus: { $ne: 'PAID' },
                        dueDate: { $lt: today },
                    }
                },
                { $group: { _id: null, total: { $sum: { $subtract: ['$grandTotal', { $ifNull: ['$amountPaid', 0] }] } } } },
            ]),
            PartyCreditProfile.countDocuments({
                businessId,
                riskLevel: { $in: ['HIGH', 'CRITICAL'] },
            }),
            PromiseToPay.countDocuments({ businessId, status: 'ACTIVE' }),
            PromiseToPay.countDocuments({ businessId, status: 'BROKEN' }),
        ]);

        return {
            totalOutstanding: totalOutstandingAgg[0]?.total || 0,
            dueToday: dueTodayAgg[0]?.total || 0,
            overdueTotal: overdueAgg[0]?.total || 0,
            highRiskAccounts: highRiskCount,
            collectedToday: 0, // Will be populated when payment receipts model is added
            promisesPending,
            brokenPromises,
        };
    }

    // ═══════════════════════════════════════════════════════════
    // AGING REPORT
    // ═══════════════════════════════════════════════════════════

    static async getAgingReport(businessId: string) {
        const today = new Date();
        const buckets = [
            { label: '0-7 days', min: 0, max: 7 },
            { label: '8-15 days', min: 8, max: 15 },
            { label: '16-30 days', min: 16, max: 30 },
            { label: '31-60 days', min: 31, max: 60 },
            { label: '61-90 days', min: 61, max: 90 },
            { label: '90+ days', min: 91, max: 99999 },
        ];

        const result = [];
        for (const bucket of buckets) {
            const fromDate = new Date(today.getTime() - bucket.max * 86400000);
            const toDate = new Date(today.getTime() - bucket.min * 86400000);

            const agg = await Invoice.aggregate([
                {
                    $match: {
                        businessId: new mongoose.Types.ObjectId(businessId),
                        paymentStatus: { $ne: 'PAID' },
                        dueDate: { $gte: fromDate, $lt: toDate },
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: { $sum: { $subtract: ['$grandTotal', { $ifNull: ['$amountPaid', 0] }] } },
                        count: { $sum: 1 },
                    }
                },
            ]);

            result.push({
                label: bucket.label,
                min: bucket.min,
                max: bucket.max,
                amount: agg[0]?.amount || 0,
                count: agg[0]?.count || 0,
            });
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // PROMISES
    // ═══════════════════════════════════════════════════════════

    static async createPromise(businessId: string, userId: string, data: any) {
        const promise = await PromiseToPay.create({
            businessId,
            partyId: data.partyId,
            invoiceId: data.invoiceId,
            promisedAmount: data.promisedAmount,
            promisedDate: new Date(data.promisedDate),
            promisedByName: data.promisedByName,
            communicationMode: data.communicationMode,
            notes: data.notes,
            status: 'ACTIVE',
            createdBy: userId,
        });
        return promise;
    }

    static async breakPromise(businessId: string, promiseId: string) {
        const promise = await PromiseToPay.findOne({ _id: promiseId, businessId });
        if (!promise) throw new Error('Promise not found');
        promise.status = 'BROKEN';
        await promise.save();

        // Auto-create collection task for broken promise
        await CollectionTask.create({
            businessId,
            partyId: promise.partyId,
            invoiceId: promise.invoiceId,
            assignedToUserId: promise.createdBy,
            priority: 'HIGH',
            reason: 'BROKEN_PROMISE',
            dueAt: new Date(),
            status: 'OPEN',
        });

        // Recalculate risk
        await CreditProfileService.recalculateScore(businessId, promise.partyId.toString());

        return promise;
    }

    static async fulfillPromise(businessId: string, promiseId: string) {
        const promise = await PromiseToPay.findOne({ _id: promiseId, businessId });
        if (!promise) throw new Error('Promise not found');
        promise.status = 'FULFILLED';
        await promise.save();
        return promise;
    }

    static async getPromises(businessId: string, filters: any = {}) {
        const query: any = { businessId };
        if (filters.partyId) query.partyId = filters.partyId;
        if (filters.status) query.status = filters.status;
        return PromiseToPay.find(query).sort({ promisedDate: -1 }).populate('partyId', 'name').lean();
    }

    // Auto-break overdue promises
    static async autoBreakOverduePromises(businessId?: string) {
        const query: any = { status: 'ACTIVE', promisedDate: { $lt: new Date() } };
        if (businessId) query.businessId = businessId;

        const overduePromises = await PromiseToPay.find(query);
        let broken = 0;
        for (const p of overduePromises) {
            p.status = 'BROKEN';
            await p.save();

            await CollectionTask.create({
                businessId: p.businessId,
                partyId: p.partyId,
                invoiceId: p.invoiceId,
                assignedToUserId: p.createdBy,
                priority: 'HIGH',
                reason: 'BROKEN_PROMISE',
                dueAt: new Date(),
                status: 'OPEN',
            });

            broken++;
        }
        if (broken > 0) logger.info(`Auto-broke ${broken} overdue promises`);
        return broken;
    }

    // ═══════════════════════════════════════════════════════════
    // COLLECTION TASKS
    // ═══════════════════════════════════════════════════════════

    static async createTask(businessId: string, data: any) {
        return CollectionTask.create({
            businessId,
            partyId: data.partyId,
            invoiceId: data.invoiceId,
            assignedToUserId: data.assignedToUserId,
            priority: data.priority || 'MEDIUM',
            reason: data.reason || 'MANUAL',
            dueAt: new Date(data.dueAt),
            status: 'OPEN',
        });
    }

    static async completeTask(businessId: string, taskId: string, data: any) {
        const task = await CollectionTask.findOne({ _id: taskId, businessId });
        if (!task) throw new Error('Task not found');
        task.status = 'DONE';
        task.actionTaken = data.actionTaken;
        task.amountCollected = data.amountCollected;
        await task.save();
        return task;
    }

    static async getTasks(businessId: string, filters: any = {}) {
        const query: any = { businessId };
        if (filters.status) query.status = filters.status;
        if (filters.assignedToUserId) query.assignedToUserId = filters.assignedToUserId;
        if (filters.partyId) query.partyId = filters.partyId;
        if (filters.priority) query.priority = filters.priority;

        return CollectionTask.find(query)
            .sort({ dueAt: 1 })
            .populate('partyId', 'name phone address')
            .populate('assignedToUserId', 'name')
            .lean();
    }

    // Auto-create tasks for overdue invoices
    static async autoCreateOverdueTasks(businessId: string, defaultAssignee: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Due today
        const dueToday = await Invoice.find({
            businessId,
            paymentStatus: { $ne: 'PAID' },
            dueDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
        }).lean();

        // 7 days overdue
        const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
        const overdue7 = await Invoice.find({
            businessId,
            paymentStatus: { $ne: 'PAID' },
            dueDate: { $gte: sevenDaysAgo, $lt: today },
        }).lean();

        let created = 0;

        for (const inv of dueToday) {
            const existing = await CollectionTask.findOne({
                businessId, invoiceId: (inv as any)._id, reason: 'DUE_TODAY', status: 'OPEN',
            });
            if (!existing) {
                await CollectionTask.create({
                    businessId, partyId: (inv as any).partyId, invoiceId: (inv as any)._id,
                    assignedToUserId: defaultAssignee, priority: 'MEDIUM', reason: 'DUE_TODAY',
                    dueAt: today, status: 'OPEN',
                });
                created++;
            }
        }

        for (const inv of overdue7) {
            const existing = await CollectionTask.findOne({
                businessId, invoiceId: (inv as any)._id, reason: 'OVERDUE', status: 'OPEN',
            });
            if (!existing) {
                await CollectionTask.create({
                    businessId, partyId: (inv as any).partyId, invoiceId: (inv as any)._id,
                    assignedToUserId: defaultAssignee, priority: 'HIGH', reason: 'OVERDUE',
                    dueAt: today, status: 'OPEN',
                });
                created++;
            }
        }

        return created;
    }

    // ═══════════════════════════════════════════════════════════
    // REMINDERS
    // ═══════════════════════════════════════════════════════════

    static getReminderMessages(partyName: string, amount: number, invoiceNumber: string, stage: string) {
        const amt = `₹${amount.toLocaleString('en-IN')}`;
        const messages: Record<string, { hi: string; en: string }> = {
            DAY_0: {
                hi: `🙏 ${partyName} ji, आपका बिल ${invoiceNumber} (${amt}) आज due है। कृपया payment करें।`,
                en: `🙏 Dear ${partyName}, your invoice ${invoiceNumber} (${amt}) is due today. Kindly arrange payment.`,
            },
            DAY_7: {
                hi: `🔔 ${partyName} ji, आपका बिल ${invoiceNumber} (${amt}) 7 दिन से pending है। कृपया जल्दी payment करें।`,
                en: `🔔 Dear ${partyName}, your invoice ${invoiceNumber} (${amt}) is 7 days overdue. Please clear at the earliest.`,
            },
            DAY_15: {
                hi: `⚠️ ${partyName} ji, आपका बिल ${invoiceNumber} (${amt}) 15 दिन से overdue है। कृपया तुरंत payment करें।`,
                en: `⚠️ Dear ${partyName}, invoice ${invoiceNumber} (${amt}) is 15 days overdue. Immediate payment is requested.`,
            },
            DAY_30: {
                hi: `🚨 ${partyName} ji, ${invoiceNumber} (${amt}) 30 दिन से pending है। बिना payment आगे माल भेजना मुश्किल है।`,
                en: `🚨 ${partyName}, invoice ${invoiceNumber} (${amt}) is 30 days overdue. Further dispatch may be affected.`,
            },
            DAY_45: {
                hi: `❗ ${partyName} ji, ${invoiceNumber} (${amt}) 45 दिन से बकाया है। यह matter owner को escalate हो गया है।`,
                en: `❗ ${partyName}, ${invoiceNumber} (${amt}) is 45 days overdue. This has been escalated to management.`,
            },
            DAY_60_PLUS: {
                hi: `🔴 ${partyName} ji, ${invoiceNumber} (${amt}) 60+ दिन से बकाया है। Dispatch block लगाया जा सकता है।`,
                en: `🔴 ${partyName}, ${invoiceNumber} (${amt}) is 60+ days overdue. Dispatch block may be applied.`,
            },
        };
        return messages[stage] || messages['DAY_0'];
    }

    static async sendReminder(businessId: string, invoiceId: string) {
        const invoice = await Invoice.findOne({ _id: invoiceId, businessId })
            .populate('partyId', 'name phone')
            .lean() as any;

        if (!invoice) throw new Error('Invoice not found');
        if (invoice.paymentStatus === 'PAID') throw new Error('Invoice already paid');

        const overdueDays = invoice.dueDate
            ? Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000))
            : 0;

        let stage: string;
        if (overdueDays <= 0) stage = 'DAY_0';
        else if (overdueDays <= 7) stage = 'DAY_7';
        else if (overdueDays <= 15) stage = 'DAY_15';
        else if (overdueDays <= 30) stage = 'DAY_30';
        else if (overdueDays <= 45) stage = 'DAY_45';
        else stage = 'DAY_60_PLUS';

        const outstanding = (invoice.grandTotal || 0) - (invoice.amountPaid || 0);
        const partyName = invoice.partyId?.name || 'Customer';
        const invNum = invoice.invoiceNumber || invoiceId;
        const msgs = this.getReminderMessages(partyName, outstanding, invNum, stage)!;

        const reminder = await CollectionReminder.create({
            businessId,
            partyId: invoice.partyId?._id || invoice.partyId,
            invoiceId: invoice._id,
            stage,
            messageHi: msgs.hi,
            messageEn: msgs.en,
            sentAt: new Date(),
        });

        return reminder;
    }

    // ═══════════════════════════════════════════════════════════
    // PARTY COLLECTION HISTORY
    // ═══════════════════════════════════════════════════════════

    static async getPartyHistory(businessId: string, partyId: string) {
        const [profile, unpaidInvoices, reminders, promises, tasks] = await Promise.all([
            CreditProfileService.getOrCreate(businessId, partyId),
            Invoice.find({
                businessId, partyId, paymentStatus: { $ne: 'PAID' },
            }).sort({ dueDate: 1 }).lean(),
            CollectionReminder.find({ businessId, partyId }).sort({ createdAt: -1 }).limit(50).lean(),
            PromiseToPay.find({ businessId, partyId }).sort({ createdAt: -1 }).lean(),
            CollectionTask.find({ businessId, partyId }).sort({ createdAt: -1 }).lean(),
        ]);

        return { creditProfile: profile, unpaidInvoices, remindersSent: reminders, promises, tasks };
    }

    // ═══════════════════════════════════════════════════════════
    // COLLECTOR PERFORMANCE
    // ═══════════════════════════════════════════════════════════

    static async getCollectorPerformance(businessId: string) {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const performance = await CollectionTask.aggregate([
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId),
                    createdAt: { $gte: monthStart },
                }
            },
            {
                $group: {
                    _id: '$assignedToUserId',
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] },
                    },
                    amountRecovered: {
                        $sum: { $ifNull: ['$amountCollected', 0] },
                    },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: '$_id',
                    userName: { $ifNull: ['$user.name', 'Unknown'] },
                    totalTasks: 1,
                    completedTasks: 1,
                    amountRecovered: 1,
                    recoveryPercent: {
                        $cond: [
                            { $gt: ['$totalTasks', 0] },
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                            0,
                        ],
                    },
                }
            },
            { $sort: { amountRecovered: -1 } },
        ]);

        return performance;
    }
}
