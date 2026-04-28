import { z } from 'zod';

export const challanItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemName: z.string().min(1),
  itemCode: z.string().optional(),
  hsnCode: z.string().min(1),
  rollNumbers: z.array(z.string()).optional(),
  rollsText: z.string().optional(), // UI-only: space-separated meter readings
  meters: z.array(z.number().positive('Meter must be positive')).min(1, 'At least one meter reading required per item'),
  totalMeters: z.number().nonnegative(),
  ratePerMeter: z.number().nonnegative('Rate must be positive'),
  amount: z.number().nonnegative(),
  unit: z.string().optional(),
  remarks: z.string().optional(),

  // Zoho-style: discount & tax per line item
  discount: z.number().nonnegative().optional().default(0),
  discountType: z.enum(['PERCENTAGE', 'FLAT']).optional().default('PERCENTAGE'),
  taxRate: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
});

const baseChallanSchema = z.object({
  date: z.string().or(z.date()), // Accepts ISO string or Date
  partyId: z.string().min(1, 'Party is required'),
  brokerId: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  deliveryBoyId: z.string().optional().nullable(),
  transporterName: z.string().optional().nullable(),

  items: z.array(challanItemSchema).min(1, 'At least one item is required'),

  remarks: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  paperSize: z.enum(['A4', 'A5']).optional(),

  // Zoho-style: new header fields
  referenceNumber: z.string().optional().nullable(),
  challanType: z.enum(['JOB_WORK', 'SUPPLY_ON_APPROVAL', 'OTHERS']).optional().default('SUPPLY_ON_APPROVAL'),
  placeOfSupply: z.string().optional().nullable(),
  supplyType: z.enum(['INTRA_STATE', 'INTER_STATE']).optional().nullable(),

  // Zoho-style: notes & terms
  customerNotes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),

  // Zoho-style: totals
  subTotal: z.number().nonnegative().optional().default(0),
  totalDiscount: z.number().nonnegative().optional().default(0),
  totalTax: z.number().nonnegative().optional().default(0),
  adjustment: z.object({
    label: z.string().optional().default('Adjustment'),
    amount: z.number().optional().default(0),
  }).optional().nullable(),
  roundOff: z.number().optional().default(0),
});

export const createChallanSchema = baseChallanSchema.refine(data => {
  // Validate total arrays are aligned (if roll numbers are provided)
  for (const item of data.items) {
    if (item.rollNumbers && item.rollNumbers.length > 0 && item.rollNumbers.length !== item.meters.length) {
      return false;
    }
  }
  return true;
}, {
  message: "Roll numbers count must match meters count",
  path: ["items"]
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;

// Update is functionally identical but everything is optional unless specifically needed
export const updateChallanSchema = baseChallanSchema.partial().refine(data => {
  if (!data.items) return true;
  for (const item of data.items) {
    if (item.rollNumbers && item.rollNumbers.length > 0 && item.rollNumbers.length !== item.meters.length) {
      return false;
    }
  }
  return true;
}, {
  message: "Roll numbers count must match meters count",
  path: ["items"]
});
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;

export const cancelChallanSchema = z.object({
  cancellationReason: z.string().min(3, 'Reason is required'),
});

export const markDeliveredSchema = z.object({
  deliveryLatLng: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});
