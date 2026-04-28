import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiGet } from '@/lib/api';
import type { IInvoice, CreateInvoiceInput, ApiResponse } from '@textilepro/shared';
import { toast } from 'sonner';

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
    dueToday: number;
    dueWithin30Days: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useInvoices(filters: any = {}) {
  return useQuery({
    queryKey: [INVOICE_KEY, filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<InvoiceListResponse>>('/invoices', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
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

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => apiPost<IInvoice>('/invoices', data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
      qc.invalidateQueries({ queryKey: ['challans'] });
      toast.success(`Invoice ${data.invoiceNumber} created successfully`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create invoice');
    }
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) =>
      apiPost<IInvoice>(`/invoices/${invoiceId}/record-payment`, data),
    onSuccess: (data, { invoiceId }) => {
      qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
      qc.invalidateQueries({ queryKey: [INVOICE_KEY, invoiceId] });
      toast.success('Payment recorded successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to record payment');
    }
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
      toast.success('Invoice cancelled');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to cancel invoice');
    }
  });
}
