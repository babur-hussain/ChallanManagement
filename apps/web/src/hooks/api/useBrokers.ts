import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '@/lib/api';
import type { 
  IBroker, 
  CreateBrokerInput, 
  UpdateBrokerInput,
  ApiResponse
} from '@textilepro/shared';
import { toast } from 'sonner';

export const BROKER_KEY = 'brokers';

interface BrokerResponse {
  data: IBroker[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useBrokers(filters: { search?: string, isActive?: boolean, page?: number, limit?: number } = {}) {
  return useQuery({
    queryKey: [BROKER_KEY, filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<BrokerResponse>>('/brokers', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}

export function useBroker(id: string) {
  return useQuery({
    queryKey: [BROKER_KEY, id],
    queryFn: () => apiGet<IBroker>(`/brokers/${id}`),
    enabled: !!id,
  });
}

export function useCreateBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrokerInput) => apiPost<IBroker>('/brokers', data),
    onSuccess: () => {
      toast.success('Broker added successfully');
      qc.invalidateQueries({ queryKey: [BROKER_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create broker');
    }
  });
}

export function useUpdateBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrokerInput }) => 
      apiPut<IBroker>(`/brokers/${id}`, data),
    onSuccess: (_, { id }) => {
      toast.success('Broker updated');
      qc.invalidateQueries({ queryKey: [BROKER_KEY] });
      qc.invalidateQueries({ queryKey: [BROKER_KEY, id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update broker');
    }
  });
}

export function useDeleteBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<IBroker>(`/brokers/${id}`),
    onSuccess: () => {
      toast.success('Broker removed');
      qc.invalidateQueries({ queryKey: [BROKER_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to delete broker');
    }
  });
}

export function useBrokerCommissionStatement(id: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [BROKER_KEY, id, 'commission', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const url = `/brokers/${id}/commission-statement?${params.toString()}`;
      return apiGet<any>(url);
    },
    enabled: !!id,
  });
}

export function usePayBrokerCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string, amount: number }) => 
      apiPost<IBroker>(`/brokers/${id}/pay-commission`, { amount }),
    onSuccess: (_, { id }) => {
      toast.success('Commission payment recorded');
      qc.invalidateQueries({ queryKey: [BROKER_KEY] });
      qc.invalidateQueries({ queryKey: [BROKER_KEY, id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Payment recording failed');
    }
  });
}
