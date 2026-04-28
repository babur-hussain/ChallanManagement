import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiGet } from '../../lib/api';
import type { ApiResponse } from '@textilepro/shared';

export const COLLECTION_KEY = 'collections';
export const INVENTORY_KEY = 'inventory';

// ─── Collections ────────────────────────────────────────────

export function useCollectionsDashboard() {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'dashboard'],
        queryFn: () => apiGet<any>('/collections/dashboard'),
    });
}

export function useOutstandingParties(filters: any = {}) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'outstanding', filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/collections/outstanding', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useRecordCollection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/collections', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Inventory ──────────────────────────────────────────────

export function useInventoryDashboard() {
    return useQuery({
        queryKey: [INVENTORY_KEY, 'dashboard'],
        queryFn: () => apiGet<any>('/inventory/dashboard'),
    });
}

export function useStockLedger(itemId: string) {
    return useQuery({
        queryKey: [INVENTORY_KEY, 'ledger', itemId],
        queryFn: () => apiGet<any>(`/inventory/ledger/${itemId}`),
        enabled: !!itemId,
    });
}

export function useCreatePurchase() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/inventory/purchases', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [INVENTORY_KEY] }); },
    });
}

// ─── WhatsApp ───────────────────────────────────────────────

export const WHATSAPP_KEY = 'whatsapp';

export function useWhatsAppInbox(filters: any = {}) {
    return useQuery({
        queryKey: [WHATSAPP_KEY, 'inbox', filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/whatsapp/inbox', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useWhatsAppTemplates() {
    return useQuery({
        queryKey: [WHATSAPP_KEY, 'templates'],
        queryFn: () => apiGet<any>('/whatsapp/templates'),
    });
}

export function useSendWhatsAppMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { to: string; templateId?: string; message?: string }) =>
            apiPost<any>('/whatsapp/send', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [WHATSAPP_KEY] }); },
    });
}
