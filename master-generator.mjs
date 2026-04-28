import fs from 'fs';
import path from 'path';

const BEND_SRC = '/Users/baburhussain/ChallanManagement-main/apps/backend/src';

const entities = [
    { name: 'Brand', varName: 'brand', routeName: 'brands', schemaPrefix: 'Brand', filters: 'IBrandFilters' },
    { name: 'Unit', varName: 'unit', routeName: 'units', schemaPrefix: 'Unit', filters: 'IUnitFilters' },
    { name: 'TaxCode', varName: 'taxCode', routeName: 'tax-codes', schemaPrefix: 'TaxCode', filterKey: 'code', sortingKey: 'code', filters: 'ITaxCodeFilters' },
    { name: 'Attribute', varName: 'attribute', routeName: 'attributes', schemaPrefix: 'Attribute', filters: 'IAttributeFilters' },
    { name: 'Warehouse', varName: 'warehouse', routeName: 'warehouses', schemaPrefix: 'Warehouse', filters: 'IWarehouseFilters' }
];

// MODEL Generation
const models = [
    { name: 'Brand', fields: '  description: { type: String, trim: true },', interface: 'IBrand' },
    { name: 'Unit', fields: '  shortCode: { type: String, required: true, trim: true, uppercase: true },', interface: 'IUnit' },
    { name: 'TaxCode', fields: '  code: { type: String, required: true, trim: true },\n  description: { type: String, trim: true },\n  rate: { type: Number, required: true },', interface: 'ITaxCode', indexKey: 'code' },
    { name: 'Attribute', fields: '  options: [{ type: String, trim: true }],', interface: 'IAttribute' },
    { name: 'Warehouse', fields: '  code: { type: String, required: true, trim: true, uppercase: true },\n  address: {\n    line1: { type: String },\n    line2: { type: String },\n    city: { type: String },\n    state: { type: String },\n    pincode: { type: String }\n  },', interface: 'IWarehouse' }
];

models.forEach(m => {
    const fileContent = `import mongoose, { Schema, Document } from 'mongoose';
import type { ${m.interface} } from '@textilepro/shared';

export interface ${m.name}Document extends Omit<${m.interface}, '_id'>, Document {}

const schema = new Schema<${m.name}Document>({
  businessId: { type: String, required: true, index: true },
  ${m.name !== 'TaxCode' ? 'name: { type: String, required: true, trim: true },' : ''}
${m.fields}
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform(_d, ret) { ret.id = ret._id; delete (ret as any).__v; } } });

schema.index({ businessId: 1, ${m.indexKey || 'name'}: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
${m.name === 'Warehouse' ? 'schema.index({ businessId: 1, code: 1 }, { unique: true });' : ''}
export const ${m.name} = mongoose.model<${m.name}Document>('${m.name}', schema);
`;
    fs.writeFileSync(path.join(BEND_SRC, 'models', `${m.name}.ts`), fileContent);
});

// SERVICE Generation
entities.forEach(ent => {
    const serviceContent = `import { ${ent.name} } from '../models/${ent.name}.js';
import { Errors } from '../middleware/errorHandler.js';
import type { ${ent.filters} } from '@textilepro/shared';
import type { FilterQuery, SortOrder } from 'mongoose';

export class ${ent.name}Service {
  async list(businessId: string, filters: ${ent.filters}) {
    const { search, isActive, page = 1, limit = 50, sortBy = '${ent.sortingKey || 'name'}', sortOrder = 'asc' } = filters;
    const query: FilterQuery<any> = { businessId };
    
    if (isActive !== undefined) query.isActive = isActive;
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { ${ent.filterKey || 'name'}: { $regex: s, $options: 'i' } }
      ];
    }

    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ${ent.name}.find(query).sort(sort).skip(skip).limit(limit).lean(),
      ${ent.name}.countDocuments(query),
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
    const doc = await ${ent.name}.findOne({ _id: id, businessId }).lean();
    if (!doc) throw Errors.notFound('${ent.name}');
    return doc;
  }

  async create(businessId: string, data: any) {
    try {
      const doc = await ${ent.name}.create({ ...data, businessId });
      return doc.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('${ent.name} already exists');
      throw error;
    }
  }

  async update(businessId: string, id: string, data: any) {
    try {
      const existing = await ${ent.name}.findOne({ _id: id, businessId });
      if (!existing) throw Errors.notFound('${ent.name}');
      
      Object.assign(existing, data);
      await existing.save();
      return existing.toJSON();
    } catch (error: any) {
      if (error.code === 11000) throw Errors.conflict('${ent.name} already exists');
      throw error;
    }
  }

  async delete(businessId: string, id: string) {
    const doc = await ${ent.name}.findOne({ _id: id, businessId });
    if (!doc) throw Errors.notFound('${ent.name}');
    doc.isActive = false;
    await doc.save();
    return doc.toJSON();
  }
}

export const ${ent.varName}Service = new ${ent.name}Service();
`;
    fs.writeFileSync(path.join(BEND_SRC, 'services', `${ent.varName}.service.ts`), serviceContent);
});

// ROUTE Generation
entities.forEach(ent => {
    const routeContent = `import { Router } from 'express';
import { ${ent.varName}Service } from '../services/${ent.varName}.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Errors } from '../middleware/errorHandler.js';
import { create${ent.schemaPrefix}Schema, update${ent.schemaPrefix}Schema } from '@textilepro/shared';
import * as shared from '@textilepro/shared';

const filterSchemaName = '${ent.varName}FilterSchema';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/', async (req, res, next) => {
  try {
    const filters = (shared as any)[filterSchemaName].parse(req.query);
    const result = await ${ent.varName}Service.list(req.auth!.businessId, filters);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = create${ent.schemaPrefix}Schema.safeParse(req.body);
    if (!parsed.success) throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    const doc = await ${ent.varName}Service.create(req.auth!.businessId, parsed.data);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = update${ent.schemaPrefix}Schema.safeParse(req.body);
    if (!parsed.success) throw Errors.badRequest('Validation failed', parsed.error.flatten().fieldErrors);
    const doc = await ${ent.varName}Service.update(req.auth!.businessId, req.params.id as string, parsed.data);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await ${ent.varName}Service.delete(req.auth!.businessId, req.params.id as string);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

export default router;
`;
    fs.writeFileSync(path.join(BEND_SRC, 'routes', `${ent.routeName}.ts`), routeContent);
});

console.log('Backend layers generated.');
