import mongoose from 'mongoose';
import { Quotation } from '../models/Quotation.js';
import { QuotationSequence } from '../models/QuotationSequence.js';
import { Party } from '../models/Party.js';
import { Item } from '../models/Item.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { getFinancialYearFormat } from '@textilepro/shared';
import { logger } from '../lib/logger.js';

export class QuotationService {

    // ─── Sequence Number ───────────────────────────────────────

    static async getNextQuotationNumber(businessId: string, date: Date = new Date()): Promise<string> {
        const tSettings = await TenantSettings.findOne({ businessId }).lean();
        const fSettings = (tSettings as any)?.finance || {};
        const fyStartStr = fSettings.financialYearStart || 'april';
        const fy = getFinancialYearFormat(date, fyStartStr);
        const qSettings = (tSettings as any)?.quotations || {};
        const prefix = qSettings.prefix || 'QTN';

        const seq = await QuotationSequence.findOne({ businessId, financialYear: fy });
        const nextNum = (seq?.lastNumber || 0) + 1;
        return `${prefix}-${fy}-${String(nextNum).padStart(5, '0')}`;
    }

    static async generateAtomicQuotationNumber(businessId: string, date: Date): Promise<string> {
        const tSettings = await TenantSettings.findOne({ businessId }).lean();
        const fSettings = (tSettings as any)?.finance || {};
        const fyStartStr = fSettings.financialYearStart || 'april';
        const fy = getFinancialYearFormat(date, fyStartStr);
        const qSettings = (tSettings as any)?.quotations || {};
        const prefix = qSettings.prefix || 'QTN';

        const seq = await QuotationSequence.findOneAndUpdate(
            { businessId, financialYear: fy },
            { $inc: { lastNumber: 1 } },
            { new: true, upsert: true }
        );
        return `${prefix}-${fy}-${String(seq.lastNumber).padStart(5, '0')}`;
    }

    // ─── Create Quotation ─────────────────────────────────────

    static async create(businessId: string, userId: string, data: any) {
        // Validate items
        const populatedItems = await Promise.all(data.items.map(async (item: any) => {
            const quality: any = await Item.findOne({ _id: item.itemId, businessId });
            if (!quality) throw new Error(`Quality ${item.itemId} not found`);

            const discountType = item.discountType || 'NONE';
            const discountValue = item.discountValue || 0;
            let finalRate = item.ratePerMeter;

            if (discountType === 'PERCENT') {
                finalRate = item.ratePerMeter * (1 - discountValue / 100);
            } else if (discountType === 'FIXED') {
                finalRate = item.ratePerMeter - discountValue;
            }

            finalRate = Math.max(0, finalRate);
            const lineAmount = finalRate * item.quantityMeters;

            return {
                itemId: quality._id,
                itemName: quality.name,
                itemCode: quality.shortCode || quality.code,
                hsnCode: quality.hsnCode || item.hsnCode,
                quantityMeters: item.quantityMeters,
                minimumOrderQty: item.minimumOrderQty,
                ratePerMeter: item.ratePerMeter,
                discountType,
                discountValue,
                finalRate: item.finalRate ?? finalRate,
                lineAmount: item.lineAmount ?? lineAmount,
            };
        }));

        // Calculate totals
        const subtotal = populatedItems.reduce((s, i) => s + i.lineAmount, 0);
        const totalDiscount = populatedItems.reduce((s, i) => {
            return s + (i.ratePerMeter - i.finalRate) * i.quantityMeters;
        }, 0);
        const taxableAmount = subtotal;
        const gstMode = data.gstMode || 'EXTRA';
        const estimatedGst = gstMode === 'EXTRA' ? taxableAmount * 0.05 : 0;
        const grandTotal = subtotal + estimatedGst;

        const quotationDate = data.date ? new Date(data.date) : new Date();
        const quotationNumber = await this.generateAtomicQuotationNumber(businessId, quotationDate);

        const status = data.status || 'DRAFT';

        // Custom Expiry Logic from Settings
        const tSettings = await TenantSettings.findOne({ businessId }).lean();
        const validityDays = (tSettings as any)?.quotations?.validityDays || 15;
        let validDate = new Date(quotationDate.getTime() + validityDays * 24 * 60 * 60 * 1000);
        if (data.validTillDate) validDate = new Date(data.validTillDate);

        const quotationDoc = {
            businessId,
            quotationNumber,
            date: quotationDate,
            validTillDate: validDate,
            status,
            partyId: data.partyId || undefined,
            leadId: data.leadId || undefined,
            customerSnapshot: data.customerSnapshot,
            items: populatedItems,
            freightTerms: data.freightTerms,
            packingTerms: data.packingTerms,
            gstMode,
            paymentTerms: data.paymentTerms,
            dispatchTime: data.dispatchTime,
            remarks: data.remarks,
            subtotal: data.subtotal ?? subtotal,
            totalDiscount: data.totalDiscount ?? totalDiscount,
            taxableAmount: data.taxableAmount ?? taxableAmount,
            estimatedGst: data.estimatedGst ?? estimatedGst,
            grandTotal: data.grandTotal ?? grandTotal,
            expectedMarginAmount: data.expectedMarginAmount,
            expectedMarginPercent: data.expectedMarginPercent,
            sentAt: status === 'SENT' ? new Date() : undefined,
            createdBy: userId,
            updatedBy: userId,
        };

        const quotation = await Quotation.create(quotationDoc);
        logger.info(`Quotation ${quotationNumber} created`, { businessId, quotationId: quotation._id });

        // Auto-create followup task if sent
        if (status === 'SENT') {
            await this.createFollowupTask(businessId, userId, quotation);
        }

        return quotation;
    }

    // ─── Update Quotation ─────────────────────────────────────

    static async update(businessId: string, quotationId: string, userId: string, data: any) {
        const quotation = await Quotation.findOne({ _id: quotationId, businessId });
        if (!quotation) throw new Error('Quotation not found');
        if (['ACCEPTED', 'CONVERTED'].includes(quotation.status)) {
            throw new Error('Cannot edit an accepted or converted quotation');
        }

        // If items are being updated, re-populate
        if (data.items && data.items.length > 0) {
            const populatedItems = await Promise.all(data.items.map(async (item: any) => {
                const quality: any = await Item.findOne({ _id: item.itemId, businessId });
                return {
                    itemId: quality?._id || item.itemId,
                    itemName: quality?.name || item.itemName,
                    itemCode: quality?.shortCode || quality?.code || item.itemCode,
                    hsnCode: quality?.hsnCode || item.hsnCode,
                    quantityMeters: item.quantityMeters,
                    minimumOrderQty: item.minimumOrderQty,
                    ratePerMeter: item.ratePerMeter,
                    discountType: item.discountType || 'NONE',
                    discountValue: item.discountValue || 0,
                    finalRate: item.finalRate,
                    lineAmount: item.lineAmount,
                };
            }));
            data.items = populatedItems;
        }

        Object.assign(quotation, { ...data, updatedBy: userId });
        await quotation.save();
        return quotation;
    }

    // ─── List Quotations ──────────────────────────────────────

    static async list(businessId: string, filters: any, pagination: any) {
        const query: any = { businessId };

        if (filters.search) query.$text = { $search: filters.search };
        if (filters.status) query.status = filters.status;
        if (filters.partyId) query.partyId = filters.partyId;
        if (filters.leadId) query.leadId = filters.leadId;
        if (filters.createdBy) query.createdBy = filters.createdBy;

        if (filters.dateFrom || filters.dateTo) {
            query.date = {};
            if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
            if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
        }

        if (filters.expiringSoon === 'true') {
            const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            query.validTillDate = { $lte: threeDays, $gte: new Date() };
            query.status = { $in: ['SENT', 'VIEWED', 'NEGOTIATION'] };
        }

        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;

        const data = await Quotation.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Quotation.countDocuments(query);

        const aggregates = await Quotation.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalQuotations: { $sum: 1 },
                    totalAmount: { $sum: '$grandTotal' },
                    avgAmount: { $avg: '$grandTotal' },
                }
            }
        ]);

        const stats = aggregates[0] || { totalQuotations: 0, totalAmount: 0, avgAmount: 0 };

        return {
            data,
            stats,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    // ─── Get By Id ────────────────────────────────────────────

    static async getById(businessId: string, quotationId: string) {
        const quotation = await Quotation.findOne({ _id: quotationId, businessId }).lean();
        if (!quotation) throw new Error('Quotation not found');
        return quotation;
    }

    // ─── Delete ───────────────────────────────────────────────

    static async delete(businessId: string, quotationId: string) {
        const quotation = await Quotation.findOne({ _id: quotationId, businessId });
        if (!quotation) throw new Error('Quotation not found');
        if (['ACCEPTED', 'CONVERTED'].includes(quotation.status)) {
            throw new Error('Cannot delete an accepted or converted quotation');
        }
        await Quotation.deleteOne({ _id: quotationId });
        return { deleted: true };
    }

    // ─── Status Transitions ───────────────────────────────────

    static async markSent(businessId: string, quotationId: string, userId: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        q.status = 'SENT';
        q.sentAt = new Date();
        q.updatedBy = new mongoose.Types.ObjectId(userId) as any;
        await q.save();
        await this.createFollowupTask(businessId, userId, q);
        return q;
    }

    static async markViewed(businessId: string, quotationId: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        if (!q.viewedAt) {
            q.viewedAt = new Date();
            if (q.status === 'SENT') q.status = 'VIEWED';
            await q.save();
        }
        return q;
    }

    static async accept(businessId: string, quotationId: string, userId: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        if (['REJECTED', 'CONVERTED', 'EXPIRED'].includes(q.status)) {
            throw new Error(`Cannot accept a ${q.status} quotation`);
        }
        q.status = 'ACCEPTED';
        q.acceptedAt = new Date();
        q.updatedBy = new mongoose.Types.ObjectId(userId) as any;
        await q.save();
        return q;
    }

    static async reject(businessId: string, quotationId: string, userId: string, reason: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        q.status = 'REJECTED';
        q.rejectedAt = new Date();
        q.rejectionReason = reason;
        q.updatedBy = new mongoose.Types.ObjectId(userId) as any;
        await q.save();
        return q;
    }

    // ─── Negotiation Notes ────────────────────────────────────

    static async addNegotiationNote(businessId: string, quotationId: string, userId: string, userName: string, text: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        if (q.status === 'DRAFT' || q.status === 'SENT' || q.status === 'VIEWED') {
            q.status = 'NEGOTIATION';
        }
        q.negotiationNotes.push({
            text,
            createdBy: new mongoose.Types.ObjectId(userId) as any,
            createdByName: userName,
            createdAt: new Date(),
        });
        q.updatedBy = new mongoose.Types.ObjectId(userId) as any;
        await q.save();
        return q;
    }

    // ─── Convert to Challan ───────────────────────────────────

    static async convertToChallan(businessId: string, quotationId: string, userId: string) {
        const q = await Quotation.findOne({ _id: quotationId, businessId });
        if (!q) throw new Error('Quotation not found');
        if (q.status !== 'ACCEPTED') throw new Error('Only accepted quotations can be converted');

        // Need a party for challan
        if (!q.partyId) throw new Error('Quotation must have a linked party to convert to challan');

        const party: any = await Party.findById(q.partyId);
        if (!party) throw new Error('Linked party not found');

        // Import ChallanService dynamically to avoid circular deps
        const { ChallanService } = await import('./challan.service.js');

        const challanItems = q.items.map((item: any) => ({
            itemId: item.itemId.toString(),
            meters: [item.quantityMeters],
            ratePerMeter: item.finalRate,
            remarks: '',
        }));

        const challanData = {
            partyId: q.partyId.toString(),
            date: new Date(),
            items: challanItems,
            remarks: `Converted from Quotation ${q.quotationNumber}`,
        };

        const challan = await ChallanService.create(businessId, userId, challanData);

        q.status = 'CONVERTED';
        q.convertedToChallanId = challan._id;
        q.updatedBy = new mongoose.Types.ObjectId(userId) as any;
        await q.save();

        return { quotation: q, challan };
    }

    // ─── Convert to Invoice ───────────────────────────────────

    static async convertToInvoice(businessId: string, quotationId: string, userId: string) {
        // First convert to challan, then that challan can be invoiced
        const result = await this.convertToChallan(businessId, quotationId, userId);
        return result;
    }

    // ─── Duplicate Quotation ──────────────────────────────────

    static async duplicate(businessId: string, quotationId: string, userId: string) {
        const original = await Quotation.findOne({ _id: quotationId, businessId }).lean();
        if (!original) throw new Error('Quotation not found');

        const newDate = new Date();
        const quotationNumber = await this.generateAtomicQuotationNumber(businessId, newDate);

        const tSettings = await TenantSettings.findOne({ businessId }).lean();
        const validityDays = (tSettings as any)?.quotations?.validityDays || 15;

        const duplicateDoc = {
            ...original,
            _id: undefined,
            quotationNumber,
            date: newDate,
            validTillDate: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
            status: 'DRAFT',
            sentAt: undefined,
            viewedAt: undefined,
            acceptedAt: undefined,
            rejectedAt: undefined,
            rejectionReason: undefined,
            convertedToChallanId: undefined,
            convertedToInvoiceId: undefined,
            negotiationNotes: [],
            followupSentCount: 0,
            lastFollowupAt: undefined,
            createdBy: userId,
            updatedBy: userId,
            createdAt: undefined,
            updatedAt: undefined,
        };

        const quotation = await Quotation.create(duplicateDoc);
        return quotation;
    }

    // ─── Dashboard Summary ────────────────────────────────────

    static async getDashboardSummary(businessId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const [sentToday, acceptedThisMonth, pending, expired, totalSent, totalAccepted, pipelineAgg] = await Promise.all([
            Quotation.countDocuments({
                businessId,
                sentAt: { $gte: today, $lt: tomorrow },
            }),
            Quotation.countDocuments({
                businessId,
                status: 'ACCEPTED',
                acceptedAt: { $gte: monthStart },
            }),
            Quotation.countDocuments({
                businessId,
                status: { $in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
            }),
            Quotation.countDocuments({
                businessId,
                status: 'EXPIRED',
            }),
            Quotation.countDocuments({
                businessId,
                sentAt: { $gte: monthStart },
            }),
            Quotation.countDocuments({
                businessId,
                status: { $in: ['ACCEPTED', 'CONVERTED'] },
                acceptedAt: { $gte: monthStart },
            }),
            Quotation.aggregate([
                {
                    $match: {
                        businessId: new mongoose.Types.ObjectId(businessId),
                        status: { $in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
                    }
                },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ]),
        ]);

        const winRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0;
        const pipeline = pipelineAgg[0]?.total || 0;

        return {
            sentToday,
            acceptedThisMonth,
            pendingFollowups: pending,
            expired,
            winRate,
            pipelineValue: pipeline,
        };
    }

    // ─── Expire Quotations ────────────────────────────────────

    static async expireOverdueQuotations() {
        const result = await Quotation.updateMany(
            {
                status: { $in: ['SENT', 'VIEWED', 'NEGOTIATION', 'DRAFT'] },
                validTillDate: { $lt: new Date() },
            },
            { $set: { status: 'EXPIRED' } }
        );
        if (result.modifiedCount > 0) {
            logger.info(`Expired ${result.modifiedCount} quotations`);
        }
        return result.modifiedCount;
    }

    // ─── Auto Followup Helper ────────────────────────────────

    private static async createFollowupTask(businessId: string, userId: string, quotation: any) {
        try {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await FollowUpTask.create({
                businessId,
                title: `Follow up on Quotation ${quotation.quotationNumber}`,
                description: `Quotation sent to ${quotation.customerSnapshot?.companyName}. Follow up for response.`,
                relatedType: 'GENERAL',
                relatedId: quotation._id?.toString(),
                priority: 'MEDIUM',
                status: 'PENDING',
                dueAt: tomorrow,
                assignedToUserId: userId,
                createdBy: userId,
            });
        } catch (err) {
            logger.warn('Failed to create quotation followup task', err);
        }
    }
}
