import { Party } from '../models/Party.js';
import { Errors } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import { generateShortCode, getStateFromGSTIN } from '@textilepro/shared';
import type { SortOrder, FilterQuery } from 'mongoose';
import type { IParty, IPartyFilters, IPartyStatement, IPartyQuickSearch } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Party Service — CRUD, search, statement
// ═══════════════════════════════════════════════════════════════

export class PartyService {

  /** List parties with filters and pagination */
  async list(businessId: string, filters: IPartyFilters): Promise<any> {
    const {
      search, partyType, city, state, isActive = true, tags,
      page = 1, limit = 20,
      sortBy = 'name', sortOrder = 'asc',
    } = filters;

    const query: FilterQuery<IParty> = { businessId };

    if (isActive !== undefined) query.isActive = isActive;
    if (partyType) query.partyType = partyType;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (state) query['address.state'] = state;
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      if (tagList.length > 0) query.tags = { $in: tagList };
    }

    if (search?.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { shortCode: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { 'address.city': { $regex: s, $options: 'i' } },
        { gstin: { $regex: s, $options: 'i' } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    if (sortBy === 'outstandingBalance') {
      // Will compute this in aggregation later; for now fall back to name
      sort.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Party.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Party.countDocuments(query),
    ]);

    // Compute outstanding balance from opening balance (until we have invoices/payments)
    const enrichedData = data.map(party => ({
      ...party,
      outstandingBalance: party.openingBalance * (party.balanceType === 'DR' ? 1 : -1),
      totalChallans: 0,          // Will be replaced when Challan model exists
      lastChallanDate: undefined, // Will be replaced
      isOverdue: false,           // Will be computed from credit days
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

  /** Get party by ID with computed fields */
  async getById(businessId: string, id: string): Promise<any> {
    const party = await Party.findOne({ _id: id, businessId }).lean();
    if (!party) throw Errors.notFound('Party');

    const outstandingBalance = party.openingBalance * (party.balanceType === 'DR' ? 1 : -1);
    const creditUtilization = party.creditLimit > 0
      ? Math.round((Math.abs(outstandingBalance) / party.creditLimit) * 100)
      : 0;

    return {
      ...party,
      outstandingBalance,
      creditUtilization,
      totalChallans: 0,
      lastChallanDate: undefined,
      isOverdue: false,
    };
  }

  /** Create a new party */
  async create(businessId: string, userId: string, data: Partial<IParty>) {
    if (!data.shortCode) {
      data.shortCode = generateShortCode(data.name || '');
    }

    // Auto-detect state from GSTIN if no state is explicitly provided
    if (data.gstin && (!data.address || !data.address.state)) {
      const detectedState = getStateFromGSTIN(data.gstin);
      if (detectedState) {
        data.address = { ...(data.address || {}), state: detectedState } as any;
      }
    }

    // Default whatsapp to phone if not set
    if (!data.whatsapp && data.phone) {
      data.whatsapp = data.phone;
    }

    data.shortCode = await this.ensureUniqueShortCode(businessId, data.shortCode);

    try {
      const party = await Party.create({
        ...data,
        businessId,
        createdBy: userId,
      });

      logger.info('Party created', {
        businessId, partyId: party._id.toString(), name: data.name,
      });

      return party.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number; keyPattern?: Record<string, number> };
      if (err.code === 11000) {
        if (err.keyPattern?.phone) {
          throw Errors.conflict('A party with this phone number already exists');
        }
        if (err.keyPattern?.shortCode) {
          throw Errors.conflict(`Short code "${data.shortCode}" already exists`);
        }
        throw Errors.conflict('Duplicate entry');
      }
      throw error;
    }
  }

  /** Update a party */
  async update(businessId: string, id: string, userId: string, data: Partial<IParty>) {
    const existing = await Party.findOne({ _id: id, businessId });
    if (!existing) throw Errors.notFound('Party');

    // Auto-detect state from GSTIN if no state is explicitly provided
    if (data.gstin && (!data.address || !data.address.state)) {
      const detectedState = getStateFromGSTIN(data.gstin);
      if (detectedState) {
        if (!data.address) data.address = {} as any;
        data.address.state = detectedState;
      }
    }

    const changes = Object.keys(data);

    try {
      Object.assign(existing, data);
      await existing.save();

      logger.info('Party updated', { businessId, partyId: id, updatedBy: userId, changes });
      return existing.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw Errors.conflict('A party with this phone number or code already exists');
      }
      throw error;
    }
  }

  /** Soft-delete a party */
  async softDelete(businessId: string, id: string) {
    const party = await Party.findOne({ _id: id, businessId });
    if (!party) throw Errors.notFound('Party');

    // TODO: Check challans once model exists
    party.isActive = false;
    await party.save();

    logger.info('Party deactivated', { businessId, partyId: id });
    return party.toJSON();
  }

  /** Quick search for autocomplete dropdowns (< 100ms target) */
  async quickSearch(businessId: string, search: string): Promise<IPartyQuickSearch[]> {
    const query: FilterQuery<IParty> = {
      businessId,
      isActive: true,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { phone: { $regex: search } },
      ],
    };

    const results = await Party.find(query)
      .select('name shortCode phone openingBalance balanceType')
      .limit(20)
      .lean();

    return results.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      shortCode: p.shortCode,
      phone: p.phone,
      outstandingBalance: p.openingBalance * (p.balanceType === 'DR' ? 1 : -1),
    }));
  }

  /** Get party statement for date range */
  async getStatement(
    businessId: string,
    id: string,
    startDate: Date,
    endDate: Date
  ): Promise<IPartyStatement> {
    const party = await Party.findOne({ _id: id, businessId }).lean();
    if (!party) throw Errors.notFound('Party');

    // Build transaction list from opening balance
    // TODO: Add challan, invoice, and payment transactions once models exist
    const openingBalance = party.openingBalance * (party.balanceType === 'DR' ? 1 : -1);
    const transactions = [
      {
        date: party.createdAt,
        type: 'OPENING' as const,
        reference: '-',
        description: 'Opening Balance',
        debit: party.balanceType === 'DR' ? party.openingBalance : 0,
        credit: party.balanceType === 'CR' ? party.openingBalance : 0,
        balance: openingBalance,
      },
    ];

    return {
      party: party as unknown as IParty,
      openingBalance,
      closingBalance: openingBalance,
      transactions,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /** Get all unique tags used within a business */
  async getBusinessTags(businessId: string): Promise<string[]> {
    const result = await Party.distinct('tags', { businessId, isActive: true });
    return result.sort();
  }

  /** Get party stats for a business */
  async getStats(businessId: string) {
    const [total, active, byType] = await Promise.all([
      Party.countDocuments({ businessId }),
      Party.countDocuments({ businessId, isActive: true }),
      Party.aggregate([
        { $match: { businessId, isActive: true } },
        { $group: { _id: '$partyType', count: { $sum: 1 } } },
      ]),
    ]);

    // Compute total outstanding from opening balances
    const balances = await Party.aggregate([
      { $match: { businessId, isActive: true } },
      {
        $group: {
          _id: null,
          totalDR: {
            $sum: { $cond: [{ $eq: ['$balanceType', 'DR'] }, '$openingBalance', 0] },
          },
          totalCR: {
            $sum: { $cond: [{ $eq: ['$balanceType', 'CR'] }, '$openingBalance', 0] },
          },
        },
      },
    ]);

    const bal = balances[0] || { totalDR: 0, totalCR: 0 };

    return {
      total,
      active,
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
      totalOutstanding: bal.totalDR - bal.totalCR,
      overdueCount: 0, // Will be computed when challan/payment models exist
    };
  }

  /** Ensure unique short code */
  private async ensureUniqueShortCode(businessId: string, code: string): Promise<string> {
    let candidate = code.toUpperCase().substring(0, 6);
    let suffix = 1;
    while (await Party.exists({ businessId, shortCode: candidate })) {
      candidate = `${code.substring(0, 4)}${suffix}`.toUpperCase();
      suffix++;
      if (suffix > 99) throw Errors.conflict('Cannot generate unique short code');
    }
    return candidate;
  }
}

export const partyService = new PartyService();
