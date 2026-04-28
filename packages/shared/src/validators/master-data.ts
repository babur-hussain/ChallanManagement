import { z } from 'zod';
import { indianMobileSchema, gstinSchema, panSchema, pincodeSchema, amountSchema } from './index';

// ═══════════════════════════════════════════════════════════════
// Master Data Validators — Zod schemas
// ═══════════════════════════════════════════════════════════════

// ─── Item / Product Quality ─────────────────────────────────

export const hsnCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{4,8}$/, 'HSN code must be 4-8 digits');

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  shortCode: z.string().trim().min(1).max(6).toUpperCase().optional(),
  hsnCode: hsnCodeSchema,
  category: z.string().trim().min(1, 'Category is required'),
  defaultRate: z.number().positive('Rate must be greater than 0').multipleOf(0.01),
  gstRate: z.number().min(0, 'GST must be >= 0').max(100, 'GST must be <= 100').default(5),
  unit: z.enum(['METERS', 'KILOGRAMS', 'PIECES', 'PAIRS', 'SETS']).default('METERS'),
  composition: z.string().trim().max(200).optional().or(z.literal('')),
  width: z.number().int().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = createItemSchema.partial();
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const itemFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'createdAt', 'sortOrder', 'defaultRate']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Party ──────────────────────────────────────────────────

export const createPartyMasterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  shortCode: z.string().trim().min(1).max(6).toUpperCase().optional(),
  partyType: z.enum(['BUYER', 'BROKER', 'BOTH']),
  phone: indianMobileSchema,
  whatsapp: indianMobileSchema.optional().or(z.literal('')),
  altPhone: indianMobileSchema.optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z.object({
    line1: z.string().trim().min(1, 'Address is required').max(200),
    line2: z.string().trim().max(200).optional().or(z.literal('')),
    city: z.string().trim().min(1, 'City is required').max(50),
    state: z.string().trim().min(1, 'State is required').max(50),
    pincode: pincodeSchema,
  }),
  gstin: gstinSchema.optional().or(z.literal('')),
  panNumber: panSchema.optional().or(z.literal('')),
  creditLimit: amountSchema.default(0),
  creditDays: z.number().int().min(0).max(365).default(30),
  openingBalance: z.number().multipleOf(0.01).default(0),
  balanceType: z.enum(['DR', 'CR']).default('DR'),
  transporterName: z.string().trim().max(100).optional().or(z.literal('')),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  tags: z.array(z.string().trim().max(30)).max(20).default([]),
  isActive: z.boolean().default(true),
});

export type CreatePartyMasterInput = z.infer<typeof createPartyMasterSchema>;

export const updatePartyMasterSchema = createPartyMasterSchema.partial();
export type UpdatePartyMasterInput = z.infer<typeof updatePartyMasterSchema>;

export const partyFilterSchema = z.object({
  search: z.string().optional(),
  partyType: z.enum(['BUYER', 'BROKER', 'BOTH']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  hasOverdue: z.coerce.boolean().optional(),
  tags: z.string().optional(), // comma-separated
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'outstandingBalance', 'lastChallanDate', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Broker ─────────────────────────────────────────────────

export const createBrokerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: indianMobileSchema,
  partyId: z.string().optional().or(z.literal('')),
  commissionType: z.enum(['PERCENTAGE', 'FIXED_PER_METER', 'FIXED_PER_CHALLAN']),
  commissionRate: z.number().nonnegative('Commission rate must be >= 0'),
  paymentCycle: z.enum(['WEEKLY', 'MONTHLY', 'ON_DEMAND']).default('MONTHLY'),
  bankDetails: z.object({
    accountName: z.string().trim().max(100),
    accountNumber: z.string().trim().max(20),
    ifsc: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
    bankName: z.string().trim().max(100),
  }).optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type CreateBrokerInput = z.infer<typeof createBrokerSchema>;
export const updateBrokerSchema = createBrokerSchema.partial();
export type UpdateBrokerInput = z.infer<typeof updateBrokerSchema>;

// ─── Brands ──────────────────────────────────────────────────

export const createBrandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name must be at least 2 characters').max(50),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export const updateBrandSchema = createBrandSchema.partial();
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export const brandFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Units ───────────────────────────────────────────────────

export const createUnitSchema = z.object({
  name: z.string().trim().min(2, 'Unit name must be at least 2 characters').max(50),
  shortCode: z.string().trim().min(1, 'Short code is required').max(10).toUpperCase(),
  isActive: z.boolean().default(true),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export const updateUnitSchema = createUnitSchema.partial();
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export const unitFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Tax Codes (HSN/SAC) ─────────────────────────────────────

export const createTaxCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{4,8}$/, 'HSN/SAC code must be 4-8 digits'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  rate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100'),
  isActive: z.boolean().default(true),
});

export type CreateTaxCodeInput = z.infer<typeof createTaxCodeSchema>;
export const updateTaxCodeSchema = createTaxCodeSchema.partial();
export type UpdateTaxCodeInput = z.infer<typeof updateTaxCodeSchema>;

export const taxCodeFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['code', 'rate', 'createdAt']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Attributes ──────────────────────────────────────────────

export const createAttributeSchema = z.object({
  name: z.string().trim().min(2, 'Attribute name must be at least 2 characters').max(50),
  options: z.array(z.string().trim().min(1, 'Option cannot be empty')).min(1, 'At least one option is required'),
  isActive: z.boolean().default(true),
});

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export const updateAttributeSchema = createAttributeSchema.partial();
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;

export const attributeFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ─── Warehouses ──────────────────────────────────────────────

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(2, 'Warehouse name must be at least 2 characters').max(100),
  code: z.string().trim().min(1, 'Warehouse code is required').max(20).toUpperCase(),
  address: z.object({
    line1: z.string().trim().min(1, 'Address is required').max(200),
    line2: z.string().trim().max(200).optional().or(z.literal('')),
    city: z.string().trim().min(1, 'City is required').max(50),
    state: z.string().trim().min(1, 'State is required').max(50),
    pincode: pincodeSchema,
  }).optional(),
  isActive: z.boolean().default(true),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export const updateWarehouseSchema = createWarehouseSchema.partial();
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;

export const warehouseFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
