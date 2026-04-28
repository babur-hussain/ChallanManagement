import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import type { IQuotation, CreateQuotationInput, ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

export const QUOTATION_KEY = 'quotations';

interface QuotationListResponse {
    data: IQuotation[];
    stats: { totalQuotations: number; totalAmount: number; avgAmount: number };
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useQuotations(filters: any = {}) {
    return useQuery({
        queryKey: [QUOTATION_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<QuotationListResponse>>('/quotations', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useQuotation(id: string) {
    return useQuery({
        queryKey: [QUOTATION_KEY, id],
        queryFn: () => apiGet<IQuotation>(`/quotations/${id}`),
        enabled: !!id,
    });
}

export function useNextQuotationNumber() {
    return useQuery({
        queryKey: [QUOTATION_KEY, 'next-number'],
        queryFn: () => apiGet<{ nextStr: string }>('/quotations/next-number'),
        staleTime: 0,
    });
}

export function useCreateQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuotationInput) => apiPost<IQuotation>('/quotations', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [QUOTATION_KEY] }); },
        onError: (err: any) => { Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed'); },
    });
}

export function useUpdateQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut<IQuotation>(`/quotations/${id}`, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

export function useDeleteQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/quotations/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [QUOTATION_KEY] }); },
    });
}

export function useAcceptQuotation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/accept`),
        onSuccess: (_, id) => {
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
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}

export function useConvertToChallan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/convert-to-challan`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [QUOTATION_KEY] }); },
    });
}

export function useSendQuotationWhatsapp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost(`/quotations/${id}/send-whatsapp`),
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY] });
            qc.invalidateQueries({ queryKey: [QUOTATION_KEY, id] });
        },
    });
}
