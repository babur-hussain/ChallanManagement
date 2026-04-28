import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiGet } from '../../lib/api';
import type { IInvoice, CreateInvoiceInput, ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

export const INVOICE_KEY = 'invoices';

interface InvoiceListResponse {
    data: IInvoice[];
    stats: {
        totalInvoices: number;
        totalAmount: number;
        totalBalanceDue: number;
        totalPaid: number;
        overdueCount: number;
        overdueAmount: number;
    };
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useInvoices(filters: any = {}) {
    return useQuery({
        queryKey: [INVOICE_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<InvoiceListResponse>>('/invoices', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: [INVOICE_KEY, id],
        queryFn: () => apiGet<IInvoice>(`/invoices/${id}`),
        enabled: !!id,
    });
}

export function useInvoiceHtml(id: string) {
    return useQuery({
        queryKey: [INVOICE_KEY, id, 'html'],
        queryFn: async () => {
            const response = await api.get(`/invoices/${id}/html`, { responseType: 'text' });
            return response.data;
        },
        enabled: !!id,
    });
}

export function useNextInvoiceNumber() {
    return useQuery({
        queryKey: [INVOICE_KEY, 'next-number'],
        queryFn: () => apiGet<{ nextStr: string }>('/invoices/next-number'),
        staleTime: 0,
    });
}

export function useCreateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateInvoiceInput) => apiPost<IInvoice>('/invoices', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
            qc.invalidateQueries({ queryKey: ['challans'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to create invoice');
        },
    });
}

export function useUpdateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.put<ApiResponse<IInvoice>>(`/invoices/${id}`, data).then(r => r.data.data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
            qc.invalidateQueries({ queryKey: [INVOICE_KEY, id] });
            qc.invalidateQueries({ queryKey: ['partyLedger'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to update invoice');
        },
    });
}

export function useInvoicePreview() {
    return useMutation({
        mutationFn: (data: any) => apiPost<string>('/invoices/preview', data),
    });
}

export function useRecordPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) =>
            apiPost<IInvoice>(`/invoices/${invoiceId}/record-payment`, data),
        onSuccess: (_, { invoiceId }) => {
            qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
            qc.invalidateQueries({ queryKey: [INVOICE_KEY, invoiceId] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to record payment');
        },
    });
}

export function useCancelInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason: string }) =>
            apiPost<IInvoice>(`/invoices/${invoiceId}/cancel`, { cancellationReason: reason }),
        onSuccess: (_, { invoiceId }) => {
            qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
            qc.invalidateQueries({ queryKey: [INVOICE_KEY, invoiceId] });
        },
    });
}
