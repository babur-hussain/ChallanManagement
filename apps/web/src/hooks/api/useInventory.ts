import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, IStockSummary, IPurchase, ITransfer, IStockLedger } from '@textilepro/shared';
import { toast } from 'sonner';

// ─── Query Keys ────────────────────────────────────────────
const INVENTORY_STATS_KEY = 'inventory-stats';
const STOCK_SUMMARY_KEY = 'stock-summary';
const PURCHASES_KEY = 'purchases';
const TRANSFERS_KEY = 'transfers';
const ADJUSTMENTS_KEY = 'adjustments';
const DISPATCHES_KEY = 'dispatches';
const STOCK_LEDGER_KEY = 'stock-ledger';

// ─── Inventory Stats ───────────────────────────────────────
export interface InventoryStats {
  totalItems: number;
  totalStock: number;
  totalStockValue: number;
  lowStockItems: number;
  totalPurchases: number;
  totalTransfers: number;
  recentAdjustments: number;
}

export function useInventoryStats() {
  return useQuery({
    queryKey: [INVENTORY_STATS_KEY],
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryStats>>('/inventory/stats');
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data.data;
    },
  });
}

// ─── Stock Summary ─────────────────────────────────────────
export function useStockSummary(filters: { isLowStock?: boolean; search?: string } = {}) {
  return useQuery({
    queryKey: [STOCK_SUMMARY_KEY, filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<IStockSummary[]>>('/inventory/summary', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data.data;
    },
  });
}

// ─── Stock Ledger (per item) ───────────────────────────────
export function useStockLedger(itemId: string, page = 1) {
  return useQuery({
    queryKey: [STOCK_LEDGER_KEY, itemId, page],
    queryFn: async () => {
      const response = await api.get(`/inventory/${itemId}/ledger`, { params: { page, limit: 50 } });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
    enabled: !!itemId,
  });
}

// ─── Purchases ─────────────────────────────────────────────
export function usePurchases(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({
    queryKey: [PURCHASES_KEY, params],
    queryFn: async () => {
      const response = await api.get('/inventory/purchases', { params });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/inventory/purchase', data);
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PURCHASES_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [INVENTORY_STATS_KEY] });
      toast.success('Purchase recorded successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to record purchase'),
  });
}

// Alias for backward compatibility
export const useRecordPurchase = useCreatePurchase;

// ─── Transfers ─────────────────────────────────────────────
export function useTransfers(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({
    queryKey: [TRANSFERS_KEY, params],
    queryFn: async () => {
      const response = await api.get('/inventory/transfers', { params });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/inventory/transfer', data);
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSFERS_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [INVENTORY_STATS_KEY] });
      toast.success('Transfer recorded successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to record transfer'),
  });
}

// ─── Adjustments ───────────────────────────────────────────
export function useAdjustments(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: [ADJUSTMENTS_KEY, params],
    queryFn: async () => {
      const response = await api.get('/inventory/adjustments', { params });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { itemId: string; newQuantity: number; reason: string }) => {
      const response = await api.post('/inventory/adjust', data);
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADJUSTMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [INVENTORY_STATS_KEY] });
      toast.success('Stock adjusted successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to adjust stock'),
  });
}

// ─── Dispatches ────────────────────────────────────────────
export function useDispatches(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({
    queryKey: [DISPATCHES_KEY, params],
    queryFn: async () => {
      const response = await api.get('/inventory/dispatches', { params });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}
