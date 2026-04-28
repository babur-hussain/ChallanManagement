import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiGet } from '@/lib/api';
import type {
  IChallan,
  CreateChallanInput,
  ApiResponse
} from '@textilepro/shared';
import { toast } from 'sonner';

export const CHALLAN_KEY = 'challans';

interface ChallanResponse {
  data: IChallan[];
  stats: {
    totalChallans: number;
    totalMeters: number;
    totalAmount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useChallans(filters: any = {}) {
  return useQuery({
    queryKey: [CHALLAN_KEY, filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ChallanResponse>>('/challans', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data;
    },
  });
}

export function useChallan(id: string) {
  return useQuery({
    queryKey: [CHALLAN_KEY, id],
    queryFn: () => apiGet<IChallan>(`/challans/${id}`),
    enabled: !!id,
  });
}

export function useNextChallanNumber() {
  return useQuery({
    queryKey: [CHALLAN_KEY, 'next-number'],
    queryFn: () => apiGet<{ nextStr: string }>('/challans/next-number'),
    staleTime: 0, // Always fetch fresh
  });
}

export function useCreateChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChallanInput) => apiPost<IChallan>('/challans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || error.message || "Failed to create challan");
    }
  });
}

export function useUpdateChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateChallanInput }) =>
      api.put<{ success: boolean; data: IChallan }>(`/challans/${id}`, data).then(res => res.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY] });
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY, id] });
      toast.success("Challan updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create challan');
    }
  });
}

export function useCancelChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) =>
      apiPost<IChallan>(`/challans/${id}/cancel`, { cancellationReason: reason }),
    onSuccess: (_, { id }) => {
      toast.success('Challan cancelled');
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY] });
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY, id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to cancel');
    }
  });
}

export function useMarkDeliveredChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, latLng }: { id: string, latLng?: any }) =>
      apiPost<IChallan>(`/challans/${id}/mark-delivered`, { deliveryLatLng: latLng }),
    onSuccess: (_, { id }) => {
      toast.success('Challan marked as delivered');
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY] });
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY, id] });
    },
  });
}

export function useGeneratePdf() {
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/challans/${id}/generate-pdf`),
    onSuccess: () => toast.success('PDF generation queued'),
  });
}

export function useSendWhatsapp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/challans/${id}/send-whatsapp`),
    onSuccess: (_, id) => {
      toast.success('WhatsApp notification requested');
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY] });
      qc.invalidateQueries({ queryKey: [CHALLAN_KEY, id] });
    },
  });
}
