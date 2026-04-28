import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// @textilepro/shared — Validators
// Zod schemas for input validation (used by both frontend + backend)
// ═══════════════════════════════════════════════════════════════

// ─── Primitives ─────────────────────────────────────────────

/**
 * Indian mobile number: 10 digits, starts with 6-9
 */
export const indianMobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9.');

/**
 * GSTIN format: 15-character alphanumeric with checksum
 * Format: 2-digit state code + 10-char PAN + 1-char entity + Z + 1-char checksum
 */
export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/,
    'Invalid GSTIN format. Must be 15 characters (e.g., 24AABCU9603R1ZP).'
  );

/**
 * Indian PIN code: 6 digits
 */
export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid PIN code. Must be 6 digits.');

/**
 * PAN format: 5 letters + 4 digits + 1 letter
 */
export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F).');

/**
 * Indian currency amount: max 2 decimal places, positive
 */
export const amountSchema = z
  .number()
  .nonnegative('Amount must be positive')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places');

// ─── Registration ───────────────────────────────────────────

export const registerSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be at most 100 characters'),
  gstin: gstinSchema.optional().or(z.literal('')),
  ownerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  mobile: indianMobileSchema,
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Login ──────────────────────────────────────────────────

export const loginSchema = z.object({
  firebaseIdToken: z.string().min(1, 'Firebase ID token is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Party ──────────────────────────────────────────────────

export const createPartySchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']),
  gstin: gstinSchema.optional().or(z.literal('')),
  pan: panSchema.optional().or(z.literal('')),
  phone: indianMobileSchema,
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z.object({
    line1: z.string().trim().min(1, 'Address line 1 is required').max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1, 'City is required').max(50),
    state: z.string().trim().min(1, 'State is required').max(50),
    pincode: pincodeSchema,
  }),
  openingBalance: amountSchema.default(0),
  creditLimit: amountSchema.optional(),
  brokerId: z.string().optional(),
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;

// ─── Fabric ─────────────────────────────────────────────────

export const createFabricSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(1).max(20),
  category: z.string().trim().min(1).max(50),
  unit: z.enum(['METER', 'YARD', 'KG', 'PIECE', 'THAN']),
  hsnCode: z.string().trim().max(10).optional(),
  gstRate: z.number().min(0).max(28),
  defaultPrice: amountSchema.optional(),
  description: z.string().trim().max(500).optional(),
});

export type CreateFabricInput = z.infer<typeof createFabricSchema>;



// ─── Business Settings ──────────────────────────────────────

export const updateBusinessSettingsSchema = z.object({
  challanPrefix: z.string().trim().max(10).optional(),
  challanNumberLength: z.number().int().min(3).max(10).optional(),
  autoGenerateChallanNumber: z.boolean().optional(),
  defaultPaymentTerms: z.number().int().min(0).max(365).optional(),
  gstEnabled: z.boolean().optional(),
  defaultGstRate: z.number().min(0).max(28).optional(),
  printHeader: z.string().trim().max(500).optional(),
  printFooter: z.string().trim().max(500).optional(),
});

export type UpdateBusinessSettingsInput = z.infer<typeof updateBusinessSettingsSchema>;

// ─── Pagination ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export * from './crm';
export * from './tasks';
export * from './quotation';
