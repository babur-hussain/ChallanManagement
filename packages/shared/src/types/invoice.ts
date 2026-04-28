export type PaymentMode = 'CASH' | 'UPI' | 'CHEQUE' | 'NEFT' | 'RTGS' | 'OTHER';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type EInvoiceStatus = 'NOT_GENERATED' | 'GENERATED' | 'CANCELLED';

export interface IPaymentEntry {
  _id?: string;
  amount: number;
  date: Date;
  mode: PaymentMode;
  reference?: string;
  bank?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface IInvoiceItem {
  itemId: string;
  itemName: string;
  itemCode?: string;
  hsnCode: string;

  quantity: number; // consolidated meters
  unit: string; // usually "MTR"
  ratePerUnit: number;
  amount: number; // quantity * ratePerUnit

  gstRate: number; // e.g. 5
  cgstRate: number; // e.g. 2.5
  sgstRate: number;
  igstRate: number;

  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxableAmount: number;
  totalAmount: number; // per line fully baked
}

export interface IInvoice {
  _id: string;
  businessId: string;

  invoiceNumber: string; // INV-2425-00001
  invoiceDate: Date;
  dueDate: Date;

  partyId: string;
  partySnapshot: {
    name: string;
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

  businessSnapshot: {
    name: string;
    address: string;
    state: string;
    gstin?: string;
  };

  challanIds: string[];
  challanNumbers: string[];

  supplyType: 'INTRA_STATE' | 'INTER_STATE';
  items: IInvoiceItem[];

  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  grandTotal: number;
  roundOff: number;
  finalAmount: number;
  amountInWords: string;

  paymentStatus: PaymentStatus;
  payments: IPaymentEntry[];
  totalPaid: number;
  balanceDue: number;
  paidAt?: Date;

  irnNumber?: string;
  eInvoiceStatus: EInvoiceStatus;
  ackNumber?: string;
  ackDate?: Date;
  signedInvoice?: string;
  signedQRCode?: string;

  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  emailSentAt?: Date;
  whatsappSentAt?: Date;

  notes?: string;
  termsAndConditions?: string;

  isAmended: boolean;
  originalInvoiceId?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'DRAFT';

  cancelledAt?: Date;
  cancellationReason?: string;

  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
