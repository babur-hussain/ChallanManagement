import { TaxCode } from '../models/TaxCode.js';
import { Errors } from '../middleware/errorHandler.js';
import type { ITaxCodeFilters } from '@textilepro/shared';
import type { FilterQuery, SortOrder } from 'mongoose';

export class TaxCodeService {
  async list(businessId: string, filters: ITaxCodeFilters) {
    const { search, isActive, page = 1, limit = 50, sortBy = 'code', sortOrder = 'asc' } = filters;
    const query: FilterQuery<any> = { businessId };
    
    if (isActive !== undefined) query.isActive = isActive;
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { code: { $regex: s, $options: 'i' } }
      ];
    }

    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TaxCode.find(query).sort(sort).skip(skip).limit(limit).lean(),
      TaxCode.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(businessId: string, id: string) {
    const doc = await TaxCode.findOne({ _id: id, businessId }).lean();
    if (!doc) throw Errors.notFound('TaxCode');
    return doc;
  }

  async create(businessId: string, data: any) {
    try {
      const doc = await TaxCode.create({ ...data, businessId });
      return doc.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('TaxCode already exists');
      throw error;
    }
  }

  async update(businessId: string, id: string, data: any) {
    try {
      const existing = await TaxCode.findOne({ _id: id, businessId });
      if (!existing) throw Errors.notFound('TaxCode');
      
      Object.assign(existing, data);
      await existing.save();
      return existing.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('TaxCode already exists');
      throw error;
    }
  }

  async delete(businessId: string, id: string) {
    const doc = await TaxCode.findOne({ _id: id, businessId });
    if (!doc) throw Errors.notFound('TaxCode');
    doc.isActive = false;
    await doc.save();
    return doc.toJSON();
  }
}

export const taxCodeService = new TaxCodeService();
