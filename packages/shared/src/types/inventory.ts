export interface IStockSummary {
  _id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  itemCode?: string;

  currentStock: number; // MTR Single source of truth 
  reservedStock: number; // MTR in Draft challans
  availableStock: number; // current - reserved

  averageCost: number; // RS calculated per meter based on purchase math

  lowStockThreshold: number;
  isLowStock: boolean;

  lastMovementAt?: Date;
  lastMovementType?: 'IN' | 'OUT' | 'ADJUST';
}

export type MovementType = 'PURCHASE_IN' | 'CHALLAN_OUT' | 'CHALLAN_CANCEL_IN' | 'MANUAL_ADJUST' | 'OPENING_STOCK' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type DirectionType = 'IN' | 'OUT';

export interface IStockLedger {
  _id: string;
  businessId: string;
  itemId: string;

  date: Date;
  movementType: MovementType;
  meters: number; // Always positive
  direction: DirectionType;

  balanceBefore: number;
  balanceAfter: number;

  referenceId?: string; // Challan or Purchase ID
  referenceNumber?: string;

  notes?: string;

  createdBy: string;
  createdAt: Date;
}

export interface IPurchaseItem {
  itemId: string;
  itemName: string;
  meters: number;
  rollCount?: number;
  ratePerMeter: number;
  amount: number;
}

export interface IPurchase {
  _id: string;
  businessId: string;

  purchaseNumber: string; // PUR-2425-00001
  date: Date;

  supplierName: string;
  supplierPhone?: string;
  supplierGstin?: string;

  items: IPurchaseItem[];

  totalMeters: number;
  totalAmount: number;

  billNumber?: string;
  remarks?: string;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Transfer ─────────────────────────────────────────────
export interface ITransferItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit?: string;
}

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface ITransfer {
  _id: string;
  businessId: string;
  transferNumber: string;
  date: Date;

  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;

  items: ITransferItem[];
  totalQuantity: number;

  status: TransferStatus;
  remarks?: string;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Dispatch Summary (derived from Challans) ─────────────
export interface IDispatchSummary {
  _id: string;
  challanNumber: string;
  date: Date;
  partyName: string;
  items: { itemName: string; quantity: number }[];
  totalQuantity: number;
  status: string;
}
