import { Item } from '../models/Item.js';
import { Errors } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import { generateShortCode } from '@textilepro/shared';
import type { SortOrder, FilterQuery } from 'mongoose';
import type { IItem, IItemFilters, IBulkImportResult } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Item Service
// CRUD, search, filtering, bulk import/export
// ═══════════════════════════════════════════════════════════════

export class ItemService {

  /** List items with filters, pagination, search */
  async list(businessId: string, filters: IItemFilters) {
    const {
      search, category, isActive = true,
      page = 1, limit = 50,
      sortBy = 'sortOrder', sortOrder = 'asc',
    } = filters;

    const query: FilterQuery<IItem> = { businessId };

    if (isActive !== undefined) query.isActive = isActive;
    if (category) query.category = category;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { shortCode: { $regex: s, $options: 'i' } },
        { hsnCode: { $regex: s, $options: 'i' } },
      ];
    }

    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    if (sortBy !== 'name') sort.name = 1; // secondary sort

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Item.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Item.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /** Get a single item by ID (with tenant check) */
  async getById(businessId: string, id: string) {
    const item = await Item.findOne({ _id: id, businessId }).lean();
    if (!item) throw Errors.notFound('Item');
    return item;
  }

  /** Create a new item */
  async create(businessId: string, userId: string, data: Partial<IItem>) {
    // Auto-generate shortCode if not provided
    if (!data.shortCode) {
      data.shortCode = generateShortCode(data.name || '');
    }

    // Ensure unique shortCode within business
    data.shortCode = await this.ensureUniqueShortCode(businessId, data.shortCode);

    try {
      const item = await Item.create({
        ...data,
        businessId,
        createdBy: userId,
      });

      logger.info('Item created', {
        businessId, itemId: item._id.toString(), name: data.name,
      });

      return item.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number; keyPattern?: Record<string, number> };
      if (err.code === 11000) {
        if (err.keyPattern?.name) {
          throw Errors.conflict(`Item "${data.name}" already exists`);
        }
        if (err.keyPattern?.shortCode) {
          throw Errors.conflict(`Short code "${data.shortCode}" already exists`);
        }
        throw Errors.conflict('Duplicate entry');
      }
      throw error;
    }
  }

  /** Update an item */
  async update(businessId: string, id: string, userId: string, data: Partial<IItem>) {
    const existing = await Item.findOne({ _id: id, businessId });
    if (!existing) throw Errors.notFound('Item');

    // Build audit trail of what changed
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(data)) {
      const oldVal = (existing as any)[key];
      if (oldVal !== value) {
        changes[key] = { from: oldVal, to: value };
      }
    }

    try {
      Object.assign(existing, data);
      await existing.save();

      logger.info('Item updated', {
        businessId, itemId: id, updatedBy: userId,
        changes: Object.keys(changes),
      });

      return existing.toJSON();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw Errors.conflict('An item with this name or code already exists');
      }
      throw error;
    }
  }

  /** Soft-delete (deactivate) an item */
  async softDelete(businessId: string, id: string) {
    const item = await Item.findOne({ _id: id, businessId });
    if (!item) throw Errors.notFound('Item');

    // TODO: Check if used in any challans/invoices
    // Once the Challan model exists, add:
    // const challanCount = await Challan.countDocuments({ businessId, 'items.itemId': id });
    // if (challanCount > 0) throw new AppError('Cannot deactivate...', 409, 'IN_USE');

    item.isActive = false;
    await item.save();

    logger.info('Item deactivated', { businessId, itemId: id });
    return item.toJSON();
  }

  /** Bulk import from parsed Excel rows */
  async bulkImport(
    businessId: string,
    userId: string,
    rows: Array<Record<string, unknown>>
  ): Promise<IBulkImportResult> {
    const result: IBulkImportResult = {
      imported: 0,
      failed: [],
      skipped: [],
      total: rows.length,
    };

    if (rows.length > 500) {
      throw Errors.badRequest('Maximum 500 rows per import');
    }

    // Get existing names for duplicate check
    const existingItems = await Item.find(
      { businessId },
      { name: 1 }
    ).lean();
    const existingNames = new Set(existingItems.map(q => q.name.toLowerCase()));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2; // +2 because row 1 is header, index is 0-based

      try {
        const name = String(row['Name'] || row['name'] || '').trim();
        if (!name) {
          result.failed.push({ row: rowNum, error: 'Name is required' });
          continue;
        }

        // Duplicate check
        if (existingNames.has(name.toLowerCase())) {
          result.skipped.push({ row: rowNum, name, reason: 'Already exists' });
          continue;
        }

        const shortCode = String(row['Short Code'] || row['shortCode'] || generateShortCode(name)).toUpperCase();
        const hsnCode = String(row['HSN Code'] || row['hsnCode'] || '').trim();
        const category = String(row['Category'] || row['category'] || 'OTHER').toUpperCase();
        const rate = parseFloat(String(row['Rate Per Meter'] || row['defaultRate'] || '0'));
        const width = row['Width'] || row['width'] ? Number(row['Width'] || row['width']) : undefined;
        const composition = String(row['Composition'] || row['composition'] || '').trim() || undefined;

        if (!hsnCode || !/^\d{4,8}$/.test(hsnCode)) {
          result.failed.push({ row: rowNum, name, error: 'Invalid HSN code' });
          continue;
        }
        if (rate <= 0) {
          result.failed.push({ row: rowNum, name, error: 'Rate must be > 0' });
          continue;
        }

        const uniqueCode = await this.ensureUniqueShortCode(businessId, shortCode);

        await Item.create({
          businessId,
          name,
          shortCode: uniqueCode,
          hsnCode,
          category,
          defaultRate: rate,
          unit: 'METERS',
          width,
          composition,
          isActive: true,
          sortOrder: 0,
          createdBy: userId,
        });

        existingNames.add(name.toLowerCase());
        result.imported++;
      } catch (error) {
        result.failed.push({
          row: rowNum,
          name: String(row['Name'] || ''),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info('Bulk import completed', {
      businessId, imported: result.imported,
      failed: result.failed.length, skipped: result.skipped.length,
    });

    return result;
  }

  /** Export all items for a business (for Excel export) */
  async exportAll(businessId: string) {
    return Item.find({ businessId })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  /** Ensure a shortCode is unique, appending number suffix if needed */
  private async ensureUniqueShortCode(businessId: string, code: string): Promise<string> {
    let candidate = code.toUpperCase().substring(0, 6);
    let suffix = 1;
    while (await Item.exists({ businessId, shortCode: candidate })) {
      candidate = `${code.substring(0, 4)}${suffix}`.toUpperCase();
      suffix++;
      if (suffix > 99) throw Errors.conflict('Cannot generate unique short code');
    }
    return candidate;
  }
}

export const itemService = new ItemService();
