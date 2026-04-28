export type ChallanStatus = 'DRAFT' | 'SENT' | 'DELIVERED' | 'BILLED' | 'CANCELLED';

export interface IChallanItem {
  itemId: string; // Ref to Item
  itemName: string; // Snapshot
  itemCode?: string; // Snapshot
  hsnCode: string; // Snapshot
  rollNumbers: string[]; // Optional array of roll numbers
  meters: number[]; // Array of meter values, one per roll [43.5, 44.0, 42.8]
  totalMeters: number; // Computed sum of meters array
  ratePerMeter: number; // Price per meter at time of challan
  amount: number; // Computed: totalMeters * ratePerMeter
  unit?: string; // Unit of measurement: METERS, KILOGRAMS etc.
  remarks?: string; // Item-level note

  discount?: number;
  discountType?: 'PERCENTAGE' | 'FLAT';
  taxRate?: number;
  taxAmount?: number;
}

export interface IChallan {
  _id: string;
  businessId: string;

  challanNumber: string; // "CHN-2425-00001"
  date: Date; // Date of dispatch

  partyId: string; // Ref to Party
  partySnapshot: {
    name: string;
    shortCode: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
    phone: string;
    gstin?: string;
  };

  brokerId?: string; // Ref to Broker
  brokerSnapshot?: {
    name: string;
    commissionRate: number;
    commissionType: 'PERCENTAGE' | 'FIXED_PER_METER' | 'FIXED_PER_CHALLAN';
  };

  vehicleNumber?: string;
  deliveryBoyId?: string; // Ref to User
  transporterName?: string;

  referenceNumber?: string;
  challanType?: 'JOB_WORK' | 'SUPPLY_ON_APPROVAL' | 'OTHERS';
  placeOfSupply?: string;
  supplyType?: 'INTRA_STATE' | 'INTER_STATE';

  customerNotes?: string;
  termsAndConditions?: string;

  subTotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  adjustment?: {
    label: string;
    amount: number;
  };
  roundOff?: number;

  items: IChallanItem[];

  // Computed aggregates
  totalItems: number;
  totalRolls: number;
  totalMeters: number;
  totalAmount: number;

  status: ChallanStatus;

  remarks?: string; // Printed on PDF
  internalNotes?: string; // Internal only
  paperSize?: 'A4' | 'A5';

  // File & Notification Tracking
  pdfUrl?: string; // S3 URL
  pdfGeneratedAt?: Date;

  whatsappSentAt?: Date;
  whatsappSentTo?: string;
  whatsappMessageId?: string;

  deliveredAt?: Date;
  deliveryLatLng?: {
    lat: number;
    lng: number;
  };

  cancelledAt?: Date;
  cancellationReason?: string;

  invoiceId?: string; // Settled via Invoice

  // Broker financial tracking
  brokerCommissionAmount?: number;
  brokerCommissionPaid?: boolean;

  createdBy: string; // Ref to User
  updatedBy: string; // Ref to User
  createdAt: Date;
  updatedAt: Date;
}
