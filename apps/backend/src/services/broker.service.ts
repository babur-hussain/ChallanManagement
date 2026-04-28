import { Broker } from '../models/Broker.js';
import { Party } from '../models/Party.js';
import { Errors } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import type { FilterQuery, SortOrder } from 'mongoose';
import type { IBroker, IBrokerCommissionEntry } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Broker Service — CRUD + commission tracking
// ═══════════════════════════════════════════════════════════════

export class BrokerService {

  /** List brokers with filters */
  async list(businessId: string, filters: {
    search?: string; isActive?: boolean;
    page?: number; limit?: number;
    sortBy?: string; sortOrder?: string;
  }) {
    const {
      search, isActive = true,
      page = 1, limit = 20,
      sortBy = 'name', sortOrder = 'asc',
    } = filters;

    const query: FilterQuery<IBroker> = { businessId };
    if (isActive !== undefined) query.isActive = isActive;

    if (search?.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { phone: { $regex: s } },
      ];
    }

    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Broker.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Broker.countDocuments(query),
    ]);

    // Enrich with linked party names
    const partyIds = data.filter(b => b.partyId).map(b => b.partyId);
    let partyMap: Record<string, string> = {};
    if (partyIds.length > 0) {
      const parties = await Party.find(
        { _id: { $in: partyIds } },
        { name: 1 }
      ).lean();
      partyMap = Object.fromEntries(parties.map(p => [p._id.toString(), p.name]));
    }

    const enrichedData = data.map(broker => ({
      ...broker,
      linkedPartyName: broker.partyId ? partyMap[broker.partyId] || null : null,
      totalEarned: broker.currentCommissionDue, // Simplified for now
      totalPaid: 0,
    }));

    return {
      data: enrichedData,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /** Get broker by ID */
  async getById(businessId: string, id: string) {
    const broker = await Broker.findOne({ _id: id, businessId }).lean();
    if (!broker) throw Errors.notFound('Broker');

    let linkedPartyName = null;
    if (broker.partyId) {
      const party = await Party.findById(broker.partyId, { name: 1 }).lean();
      linkedPartyName = party?.name || null;
    }

    return { ...broker, linkedPartyName };
  }

  /** Create broker */
  async create(businessId: string, userId: string, data: Partial<IBroker>) {
    // Validate linked party exists
    if (data.partyId) {
      const party = await Party.findOne({ _id: data.partyId, businessId });
      if (!party) throw Errors.badRequest('Linked party not found');
    }

    try {
      const broker = await Broker.create({
        ...data,
        businessId,
        createdBy: userId,
        currentCommissionDue: 0,
      });

      logger.info('Broker created', {
        businessId, brokerId: broker._id.toString(), name: data.name,
      });

      return broker.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw Errors.conflict('A broker with this phone number already exists');
      }
      throw error;
    }
  }

  /** Update broker */
  async update(businessId: string, id: string, userId: string, data: Partial<IBroker>) {
    const existing = await Broker.findOne({ _id: id, businessId });
    if (!existing) throw Errors.notFound('Broker');

    if (data.partyId) {
      const party = await Party.findOne({ _id: data.partyId, businessId });
      if (!party) throw Errors.badRequest('Linked party not found');
    }

    try {
      Object.assign(existing, data);
      await existing.save();

      logger.info('Broker updated', { businessId, brokerId: id, updatedBy: userId });
      return existing.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw Errors.conflict('A broker with this phone already exists');
      }
      throw error;
    }
  }

  /** Soft-delete broker */
  async softDelete(businessId: string, id: string) {
    const broker = await Broker.findOne({ _id: id, businessId });
    if (!broker) throw Errors.notFound('Broker');

    broker.isActive = false;
    await broker.save();

    logger.info('Broker deactivated', { businessId, brokerId: id });
    return broker.toJSON();
  }

  /** Get commission statement for a broker */
  async getCommissionStatement(
    businessId: string,
    brokerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    broker: IBroker;
    entries: IBrokerCommissionEntry[];
    totalEarned: number;
    totalPaid: number;
    totalDue: number;
  }> {
    const broker = await Broker.findOne({ _id: brokerId, businessId }).lean();
    if (!broker) throw Errors.notFound('Broker');

    // TODO: Once Challan model exists, aggregate all challans where brokerId matches
    // For now return empty entries with the broker's running total
    return {
      broker: broker as IBroker,
      entries: [],
      totalEarned: broker.currentCommissionDue,
      totalPaid: 0,
      totalDue: broker.currentCommissionDue,
    };
  }

  /** Mark commission as paid (record a payment) */
  async markCommissionPaid(businessId: string, brokerId: string, amount: number) {
    const broker = await Broker.findOne({ _id: brokerId, businessId });
    if (!broker) throw Errors.notFound('Broker');

    if (amount <= 0) throw Errors.badRequest('Amount must be positive');
    if (amount > broker.currentCommissionDue) {
      throw Errors.badRequest('Amount exceeds commission due');
    }

    broker.currentCommissionDue = Math.max(0, broker.currentCommissionDue - amount);
    await broker.save();

    logger.info('Commission paid', {
      businessId, brokerId, amount,
      remainingDue: broker.currentCommissionDue,
    });

    return broker.toJSON();
  }
}

export const brokerService = new BrokerService();
