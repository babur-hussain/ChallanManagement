import { z } from 'zod';

export const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  itemCode: z.string().optional(),
  hsnCode: z.string().min(1, 'HSN Code is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  ratePerUnit: z.coerce.number().min(0, 'Rate must be 0 or greater'),
  gstRate: z.coerce.number().min(0, 'GST Rate must be 0 or greater'),
  discount: z.coerce.number().optional().default(0),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']).optional().default('PERCENTAGE'),
});

export const createInvoiceSchema = z.object({
  partyId: z.string().min(1, 'Customer is required'),
  challanIds: z.array(z.string()).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  invoiceDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  orderNumber: z.string().optional().nullable(),
  shippingCharges: z.coerce.number().optional().default(0),
  adjustment: z.coerce.number().optional().default(0),
  notes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  isDraft: z.boolean().optional().default(false),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  date: z.string().or(z.date()),
  mode: z.enum(['CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'OTHER']),
  reference: z.string().optional().nullable(),
  bank: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const cancelInvoiceSchema = z.object({
  cancellationReason: z.string().min(5, 'Reason must be at least 5 characters'),
});
