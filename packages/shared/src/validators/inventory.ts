import { z } from 'zod';

export const purchaseItemSchema = z.object({
  itemId: z.string().min(1, 'Select an item'),
  itemName: z.string().optional(),
  meters: z.number().positive('Meters must be positive'),
  rollCount: z.number().int().nonnegative().optional(),
  ratePerMeter: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const createPurchaseSchema = z.object({
  date: z.string().or(z.date()),
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierPhone: z.string().optional().nullable(),
  supplierGstin: z.string().optional().nullable(),
  billNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export const adjustStockSchema = z.object({
  itemId: z.string().min(1),
  newQuantity: z.number().min(0, 'Quantity cannot be negative'),
  reason: z.string().min(3, 'Adjustment reason required'),
});

export const bulkOpeningStockSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    meters: z.number().nonnegative(),
    ratePerMeter: z.number().nonnegative(),
  }))
});

// ─── Transfer ─────────────────────────────────────────────

export const transferItemSchema = z.object({
  itemId: z.string().min(1, 'Select an item'),
  itemName: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().optional(),
});

export const createTransferSchema = z.object({
  date: z.string().or(z.date()),
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  fromWarehouseName: z.string().optional(),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  toWarehouseName: z.string().optional(),
  remarks: z.string().optional().nullable(),
  items: z.array(transferItemSchema).min(1, 'At least one item is required'),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
