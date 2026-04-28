// ═══════════════════════════════════════════════════════════════
// @textilepro/shared — Types
// All TypeScript interfaces and type definitions
// ═══════════════════════════════════════════════════════════════

// ─── Enums ──────────────────────────────────────────────────

export const UserRole = {
  OWNER: 'OWNER',
  ACCOUNTANT: 'ACCOUNTANT',
  SALESMAN: 'SALESMAN',
  DELIVERY_BOY: 'DELIVERY_BOY',
  REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  HR_MANAGER: 'HR_MANAGER',
  AUDITOR: 'AUDITOR',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Plan = {
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type Plan = (typeof Plan)[keyof typeof Plan];



// ─── API Response ────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ─── Business ────────────────────────────────────────────────

export interface IBusiness {
  _id: string;
  name: string;
  gstin?: string;
  pan?: string;
  plan: Plan;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  email: string;
  logo?: string;
  settings: IBusinessSettings;
  isActive: boolean;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessSettings {
  currency: string;
  dateFormat: string;
  challanPrefix: string;
  challanNumberLength: number;
  autoGenerateChallanNumber: boolean;
  defaultPaymentTerms: number; // days
  gstEnabled: boolean;
  defaultGstRate: number;
  printHeader?: string;
  printFooter?: string;
}

// ─── User ────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  firebaseUid: string;
  businessId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole | string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthPayload {
  userId: string;
  businessId: string;
  role: UserRole | string;
  plan: Plan;
}

export interface ILoginResponse {
  user: IUser;
  business: IBusiness;
  permissions: string[];
}



// ─── Fabric ─────────────────────────────────────────────────

export interface IFabric {
  _id: string;
  businessId: string;
  name: string;
  code: string;
  category: string;
  unit: 'METER' | 'YARD' | 'KG' | 'PIECE' | 'THAN';
  hsnCode?: string;
  gstRate: number;
  defaultPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


// ─── Branches ───────────────────────────────────────────────

export interface IBranch {
  _id: string;
  businessId: string;
  branchCode: string;
  branchName: string;
  type: 'HEAD_OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SALES_OFFICE' | 'RETAIL_STORE';
  address: string;
  city: string;
  state: string;
  country: string;
  gstin?: string;
  phone?: string;
  managerUserId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Registration ───────────────────────────────────────────

export interface IRegisterInput {
  businessName: string;
  gstin?: string;
  ownerName: string;
  mobile: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  firebaseIdToken: string;
}

export * from './crm';
export * from './tasks';
export * from './quotation';
export * from './settings';
