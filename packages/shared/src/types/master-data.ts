// ═══════════════════════════════════════════════════════════════
// Master Data Types — Item, Party, Broker
// ═══════════════════════════════════════════════════════════════



// ─── Categories ──────────────────────────────────────────────

export interface ICategory {
  _id: string;
  businessId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Item / Product ─────────────────────────────────────────

export interface IItem {
  _id: string;
  businessId: string;
  name: string;
  shortCode: string;
  hsnCode: string;
  category: string;
  defaultRate: number;
  gstRate: number;
  unit: 'METERS' | 'KILOGRAMS' | 'PIECES' | 'PAIRS' | 'SETS';
  composition?: string;
  width?: number;
  description?: string;
  isActive: boolean;
  lowStockThreshold?: number;
  sortOrder: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItemListItem extends IItem {
  challanCount?: number;
}

export interface IItemFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'sortOrder' | 'defaultRate';
  sortOrder?: 'asc' | 'desc';
}

export interface IBulkImportResult {
  imported: number;
  failed: Array<{ row: number; name?: string; error: string }>;
  skipped: Array<{ row: number; name: string; reason: string }>;
  total: number;
}

// ─── Party / Client ─────────────────────────────────────────

export type PartyType = 'BUYER' | 'BROKER' | 'BOTH';
export type BalanceType = 'DR' | 'CR';

export interface IParty {
  _id: string;
  businessId: string;
  name: string;
  shortCode: string;
  partyType: PartyType;
  phone: string;
  whatsapp?: string;
  altPhone?: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  gstin?: string;
  panNumber?: string;
  creditLimit: number;
  creditDays: number;
  openingBalance: number;
  balanceType: BalanceType;
  transporterName?: string;
  remarks?: string;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPartyListItem extends IParty {
  outstandingBalance?: number;
  lastChallanDate?: Date;
  totalChallans?: number;
  isOverdue?: boolean;
}

export interface IPartyFilters {
  search?: string;
  partyType?: PartyType;
  city?: string;
  state?: string;
  isActive?: boolean;
  hasOverdue?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'outstandingBalance' | 'lastChallanDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IPartyStatement {
  party: IParty;
  openingBalance: number;
  closingBalance: number;
  transactions: Array<{
    date: Date;
    type: 'CHALLAN' | 'INVOICE' | 'PAYMENT' | 'OPENING';
    reference: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  periodStart: Date;
  periodEnd: Date;
}

export interface IPartyQuickSearch {
  _id: string;
  name: string;
  shortCode: string;
  phone: string;
  outstandingBalance: number;
}

// ─── Broker ─────────────────────────────────────────────────

export type CommissionType = 'PERCENTAGE' | 'FIXED_PER_METER' | 'FIXED_PER_CHALLAN';
export type PaymentCycle = 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';

export interface IBroker {
  _id: string;
  businessId: string;
  name: string;
  phone: string;
  partyId?: string;
  commissionType: CommissionType;
  commissionRate: number;
  paymentCycle: PaymentCycle;
  currentCommissionDue: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  remarks?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrokerListItem extends IBroker {
  linkedPartyName?: string;
  totalEarned?: number;
  totalPaid?: number;
}

export interface IBrokerCommissionEntry {
  date: Date;
  challanId: string;
  challanNumber: string;
  partyName: string;
  challanAmount: number;
  commissionAmount: number;
  isPaid: boolean;
  paidDate?: Date;
}

// ─── Brands ──────────────────────────────────────────────────

export interface IBrand {
  _id: string;
  businessId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Units ───────────────────────────────────────────────────

export interface IUnit {
  _id: string;
  businessId: string;
  name: string;
  shortCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnitFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Tax Codes (HSN/SAC) ─────────────────────────────────────

export interface ITaxCode {
  _id: string;
  businessId: string;
  code: string;
  description?: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaxCodeFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'code' | 'rate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Attributes ──────────────────────────────────────────────

export interface IAttribute {
  _id: string;
  businessId: string;
  name: string;
  options: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttributeFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── Warehouses ──────────────────────────────────────────────

export interface IWarehouse {
  _id: string;
  businessId: string;
  name: string;
  code: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
