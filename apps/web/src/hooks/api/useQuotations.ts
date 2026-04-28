import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { IQuotation, CreateQuotationInput, ApiResponse, IRateIntelligence } from '@textilepro/shared';
import { toast } from 'sonner';

export const QUOTATION_KEY = 'quotations';

interface QuotationListResponse {
    data: IQuotation[];
    stats: {
        totalQuotations: number;
        totalAmount: number;
        avgAmount: number;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface DashboardSummary {
    sentToday: number;
    acceptedThisMonth: number;
    pendingFollowups: number;
    expired: number;
    winRate: number;
    pipelineValue: number;
}

// ─── List ───────────────────────────────────────────────────

export function useQuotations(filters: any = {}) {
    return useQuery({
        queryKey: [QUOTATION_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<QuotationListResponse>>('/quotations', { params: filters });
            if (!response.data.success) throw new Error(response.data.error?.message);
            return response.data;
        },
    });
}

// ─── Single ─────────────────────────────────────────────────

export function useQuotation(id: string) {
    return useQuery({
        queryKey: [QUOTATION_KEY, id],
        queryFn: () => apiGet<IQuotation>(`/quotations/${id}`),
        enabled: !!id,
    });
}

// ─── Dashboard Summary ─────────────────────────────────────

export function useQuotationDashboard() {
    return useQuery({
        queryKey: [QUOTATION_KEY, 'dashboard-summary'],
        queryFn: () => apiGet<DashboardSummary>('/quotations/dashboard-summary'),
    });
}

// ─── Next Number ────────────────────────────────────────────

export function useNextQuotationNumber() {
    return useQuery({
        queryKey: [QUOTATION_KEY, 'next-number'],
        queryFn: () => apiGet<{ nextStr: string }>('/quotations/next-number'),
        staleTime: 0,
    });
}

// ─── Rate Intelligence ──────────────────────────────────────

export function useRateIntelligence(itemId: string) {
    return useQuery({
        queryKey: [QUOTATION_KEY, 'rate-intelligence', itemId],
        queryFn: () => apiGet<IRateIntelligence>(`/quotations/rate-intelligence/${itemId}`),
        enabled: !!itemId,
    });
}

// ─── Create ─────────────────────────────────────────────────

export function useCreateQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuotationInput) => apiPost<IQuotation>('/quotations', data),
        onSuccess: () => {
            toast.success('Quotation created successfully');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create quotation');
        },
    });
}

// ─── Update ─────────────────────────────────────────────────

export function useUpdateQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut<IQuotation>(`/quotations/${id}`, data),
        onSuccess: (_, { id }) => {
            toast.success('Quotation updated');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

// ─── Delete ─────────────────────────────────────────────────

export function useDeleteQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/quotations/${id}`),
        onSuccess: () => {
            toast.success('Quotation deleted');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
        },
    });
}

// ─── Actions ────────────────────────────────────────────────

export function useSendQuotationWhatsapp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/send-whatsapp`),
        onSuccess: (_, id) => {
            toast.success('Quotation sent via WhatsApp');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

export function useAcceptQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/accept`),
        onSuccess: (_, id) => {
            toast.success('Quotation accepted');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

export function useRejectQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
            apiPost(`/quotations/${id}/reject`, { rejectionReason }),
        onSuccess: (_, { id }) => {
            toast.success('Quotation rejected');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

export function useConvertToChallan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/convert-to-challan`),
        onSuccess: () => {
            toast.success('Quotation converted to Challan');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
        },
    });
}

export function useDuplicateQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/duplicate`),
        onSuccess: () => {
            toast.success('Quotation duplicated');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
        },
    });
}

export function useAddNegotiationNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, text }: { id: string; text: string }) =>
            apiPost(`/quotations/${id}/negotiation-note`, { text }),
        onSuccess: (_, { id }) => {
            toast.success('Note added');
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}
