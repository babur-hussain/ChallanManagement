import { Attribute } from '../models/Attribute.js';
import { Errors } from '../middleware/errorHandler.js';
import type { IAttributeFilters } from '@textilepro/shared';
import type { FilterQuery, SortOrder } from 'mongoose';

export class AttributeService {
  async list(businessId: string, filters: IAttributeFilters) {
    const { search, isActive, page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = filters;
    const query: FilterQuery<any> = { businessId };
    
    if (isActive !== undefined) query.isActive = isActive;
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } }
      ];
    }

    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attribute.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Attribute.countDocuments(query),
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
    const doc = await Attribute.findOne({ _id: id, businessId }).lean();
    if (!doc) throw Errors.notFound('Attribute');
    return doc;
  }

  async create(businessId: string, data: any) {
    try {
      const doc = await Attribute.create({ ...data, businessId });
      return doc.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('Attribute already exists');
      throw error;
    }
  }

  async update(businessId: string, id: string, data: any) {
    try {
      const existing = await Attribute.findOne({ _id: id, businessId });
      if (!existing) throw Errors.notFound('Attribute');
      
      Object.assign(existing, data);
      await existing.save();
      return existing.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('Attribute already exists');
      throw error;
    }
  }

  async delete(businessId: string, id: string) {
    const doc = await Attribute.findOne({ _id: id, businessId });
    if (!doc) throw Errors.notFound('Attribute');
    doc.isActive = false;
    await doc.save();
    return doc.toJSON();
  }
}

export const attributeService = new AttributeService();
