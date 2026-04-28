import { Lead } from '../models/Lead.js';
import { LeadActivity } from '../models/LeadActivity.js';
import { Party } from '../models/Party.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { Errors } from '../middleware/errorHandler.js';
import { generateSequenceNumber } from '../utils/sequenceGenerator.js';
import { automationQueue } from '../lib/queue.js';

export class LeadService {
    async list(businessId: string, filters: any) {
        const { page, limit, search, stage, temperature, source, city, assignedToUserId, followupOverdue, sortBy, sortOrder } = filters;
        const query: any = { businessId };

        if (search) {
            query.$text = { $search: search };
        }
        if (stage) query.pipelineStage = stage;
        if (temperature) query.temperature = temperature;
        if (source) query.source = source;
        if (city) query.city = city;
        if (assignedToUserId) query.assignedToUserId = assignedToUserId;
        if (followupOverdue) {
            query.nextFollowUpAt = { $lt: new Date() };
            query.pipelineStage = { $nin: ['WON', 'LOST'] };
        }

        const sort: any = {};
        if (search && !sortBy) {
            sort.score = { $meta: 'textScore' };
        } else {
            sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Lead.find(query).sort(sort).skip(skip).limit(limit).lean(),
            Lead.countDocuments(query),
        ]);

        return {
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async create(businessId: string, userId: string, data: any) {
        // Fetch Tenant CRM Settings
        const tSettings = await TenantSettings.findOne({ businessId }).lean();
        const crmSettings = (tSettings as any)?.crm || {};

        const duplicateStrickness = crmSettings.duplicateDetectionStrictness || 'medium';
        const autoAssignLeads = crmSettings.autoAssignLeads ?? true;
        const defaultSalesperson = crmSettings.defaultSalesperson;
        const reminderDefaults = crmSettings.reminderDefaults || 3;

        // 1. Duplicate Detection Engine
        if (duplicateStrickness !== 'low' && data.phone) {
            // Check active pipeline leads
            const existingLead = await Lead.findOne({
                businessId,
                phone: data.phone,
                pipelineStage: { $nin: ['WON', 'LOST', 'DORMANT'] }
            }).lean();

            if (existingLead) {
                if (duplicateStrickness === 'strict') {
                    throw Errors.badRequest(`Duplicate detected. Lead ${existingLead.leadNumber} currently uses phone ${data.phone}.`);
                } else if (duplicateStrickness === 'medium') {
                    data.notes = (data.notes || '') + `\n[SYSTEM] Warning: Lead ${existingLead.leadNumber} previously registered with this phone.`;
                }
            }
        }

        // 2. Auto-Assignment
        if (autoAssignLeads && !data.assignedToUserId && defaultSalesperson && defaultSalesperson !== 'Auto-assign') {
            data.assignedToUserId = defaultSalesperson;
        }

        // 3. Reminder Defaults
        if (!data.nextFollowUpAt) {
            const nextFollowUp = new Date();
            nextFollowUp.setDate(nextFollowUp.getDate() + reminderDefaults);
            data.nextFollowUpAt = nextFollowUp;
        }

        // Generate distinct Lead number LEAD-2425-00001
        const leadNumber = await generateSequenceNumber(businessId, 'LEAD', 'LEAD');

        const lead = await Lead.create({
            ...data,
            businessId,
            leadNumber,
            createdBy: userId,
        });

        await LeadActivity.create({
            businessId,
            leadId: lead._id,
            type: 'CREATED',
            title: 'Lead Created',
            description: `Lead created from source: ${data.source}`,
            performedBy: userId,
        });

        await automationQueue.add('crm-automation', { businessId, eventType: 'LEAD_CREATED', referenceId: lead._id.toString(), userId });

        return lead;
    }

    async getById(businessId: string, id: string): Promise<any> {
        const lead = await Lead.findOne({ _id: id, businessId }).lean();
        if (!lead) throw Errors.notFound('Lead not found');

        const timeline = await LeadActivity.find({ leadId: id, businessId }).sort({ createdAt: -1 }).lean();
        return { ...lead, timeline };
    }

    async update(businessId: string, id: string, userId: string, data: any) {
        const lead = await Lead.findOneAndUpdate(
            { _id: id, businessId },
            { $set: { ...data, updatedBy: userId } },
            { new: true }
        );
        if (!lead) throw Errors.notFound('Lead not found');

        if (data.temperature === 'HOT') {
            await automationQueue.add('crm-automation', { businessId, eventType: 'LEAD_HOT', referenceId: lead._id.toString(), userId });
        }

        return lead;
    }

    async softDelete(businessId: string, id: string) {
        // Soft delete can just be marking pipelineStage as dormant or we add isActive field (if model supports it)
        const lead = await Lead.findOneAndDelete({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');
        return lead;
    }

    async changeStage(businessId: string, id: string, userId: string, newStage: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        const oldStage = lead.pipelineStage;
        lead.pipelineStage = newStage as any;
        lead.updatedBy = userId;
        lead.lastInteractionAt = new Date();
        await lead.save();

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'STAGE_CHANGED',
            title: 'Stage Changed',
            description: `Stage changed from ${oldStage} to ${newStage}`,
            performedBy: userId,
        });

        return lead;
    }

    async addNote(businessId: string, id: string, userId: string, note: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        lead.notes = lead.notes ? `${lead.notes}\n---\n${new Date().toLocaleDateString()}: ${note}` : note;
        lead.lastInteractionAt = new Date();
        await lead.save();

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'NOTE',
            title: 'Note Added',
            description: note,
            performedBy: userId,
        });

        return lead;
    }

    async addFollowup(businessId: string, id: string, userId: string, date: Date, note?: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        lead.nextFollowUpAt = date;
        lead.lastInteractionAt = new Date();
        await lead.save();

        let desc = `Follow-up set for ${date.toLocaleString()}`;
        if (note) desc += ` - ${note}`;

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'FOLLOWUP_SET',
            title: 'Follow-up Scheduled',
            description: desc,
            performedBy: userId,
        });

        return lead;
    }

    async assignUser(businessId: string, id: string, byUserId: string, targetUserId: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        lead.assignedToUserId = targetUserId;
        lead.updatedBy = byUserId;
        await lead.save();

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'ASSIGNED',
            title: 'Lead Assigned',
            description: `Assigned to user ID ${targetUserId}`,
            performedBy: byUserId,
        });

        return lead;
    }

    async markWon(businessId: string, id: string, userId: string, remarks?: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        if (lead.pipelineStage === 'WON') {
            throw Errors.badRequest('Lead is already WON');
        }

        // Attempt to see if Party already exists by phone
        let party = await Party.findOne({ businessId, phone: lead.phone });

        if (!party) {
            party = await Party.create({
                businessId,
                name: lead.companyName || lead.contactPerson,
                shortCode: (lead.companyName || lead.contactPerson).substring(0, 6).toUpperCase(),
                partyType: lead.leadType === 'BROKER' ? 'BROKER' : 'BUYER',
                phone: lead.phone,
                whatsapp: lead.whatsapp,
                email: lead.email,
                address: {
                    line1: String(lead.city),
                    city: lead.city,
                    state: lead.state,
                    pincode: '000000',
                },
                gstin: lead.gstin,
                tags: lead.tags,
                remarks: `Auto-converted from lead ${lead.leadNumber}. ${remarks || ''}`,
                createdBy: userId,
            });
        }

        lead.pipelineStage = 'WON';
        lead.wonAt = new Date();
        lead.probabilityPercent = 100;
        lead.updatedBy = userId;
        await lead.save();

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'WON',
            title: 'Lead Won',
            description: `Converted to Party: ${party.name}`,
            performedBy: userId,
        });

        return { lead, party };
    }

    async markLost(businessId: string, id: string, userId: string, lostReason: string) {
        const lead = await Lead.findOne({ _id: id, businessId });
        if (!lead) throw Errors.notFound('Lead not found');

        lead.pipelineStage = 'LOST';
        lead.lostReason = lostReason;
        lead.probabilityPercent = 0;
        lead.updatedBy = userId;
        await lead.save();

        await LeadActivity.create({
            businessId,
            leadId: id,
            type: 'LOST',
            title: 'Lead Lost',
            description: `Reason: ${lostReason}`,
            performedBy: userId,
        });

        return lead;
    }

    async getDashboardSummary(businessId: string) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const [totalLeads, hotLeads, followupsToday, wonThisMonth, pipelineAgg] = await Promise.all([
            Lead.countDocuments({ businessId, pipelineStage: { $nin: ['WON', 'LOST'] } }),
            Lead.countDocuments({ businessId, temperature: 'HOT', pipelineStage: { $nin: ['WON', 'LOST'] } }),
            Lead.countDocuments({ businessId, nextFollowUpAt: { $lt: endOfDay }, pipelineStage: { $nin: ['WON', 'LOST'] } }),
            Lead.countDocuments({ businessId, pipelineStage: 'WON', wonAt: { $gte: startOfMonth } }),
            Lead.aggregate([
                { $match: { businessId, pipelineStage: { $nin: ['WON', 'LOST', 'DORMANT'] } } },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$estimatedMonthlyValue' }
                    }
                }
            ])
        ]);

        return {
            totalLeads,
            hotLeads,
            followupsToday,
            wonThisMonth,
            estimatedPipelineValue: pipelineAgg[0]?.totalValue || 0,
        };
    }
}

export const leadService = new LeadService();
