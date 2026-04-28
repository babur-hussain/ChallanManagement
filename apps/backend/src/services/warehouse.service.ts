import { Warehouse } from '../models/Warehouse.js';
import { Errors } from '../middleware/errorHandler.js';
import type { IWarehouseFilters } from '@textilepro/shared';
import type { FilterQuery, SortOrder } from 'mongoose';

export class WarehouseService {
  async list(businessId: string, filters: IWarehouseFilters) {
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
      Warehouse.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Warehouse.countDocuments(query),
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
    const doc = await Warehouse.findOne({ _id: id, businessId }).lean();
    if (!doc) throw Errors.notFound('Warehouse');
    return doc;
  }

  async create(businessId: string, data: any) {
    try {
      const doc = await Warehouse.create({ ...data, businessId });
      return doc.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('Warehouse already exists');
      throw error;
    }
  }

  async update(businessId: string, id: string, data: any) {
    try {
      const existing = await Warehouse.findOne({ _id: id, businessId });
      if (!existing) throw Errors.notFound('Warehouse');
      
      Object.assign(existing, data);
      await existing.save();
      return existing.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('Warehouse already exists');
      throw error;
    }
  }

  async delete(businessId: string, id: string) {
    const doc = await Warehouse.findOne({ _id: id, businessId });
    if (!doc) throw Errors.notFound('Warehouse');
    doc.isActive = false;
    await doc.save();
    return doc.toJSON();
  }
}

export const warehouseService = new WarehouseService();
