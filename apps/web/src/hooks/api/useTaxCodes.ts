import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  ITaxCodeFilters, 
  CreateTaxCodeInput, 
  UpdateTaxCodeInput 
} from '@textilepro/shared';

export function useTaxCodes(filters?: ITaxCodeFilters) {
  return useQuery({
    queryKey: ['taxCodes', filters],
    queryFn: async () => {
      const { data } = await api.get('/tax-codes', { params: filters });
      return data;
    },
  });
}

export function useCreateTaxCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaxCodeInput) => {
      const res = await api.post('/tax-codes', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('TaxCode created successfully');
      queryClient.invalidateQueries({ queryKey: ['taxCodes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create taxcode');
    },
  });
}

export function useUpdateTaxCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaxCodeInput }) => {
      const res = await api.put(`/tax-codes/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('TaxCode updated successfully');
      queryClient.invalidateQueries({ queryKey: ['taxCodes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update taxcode');
    },
  });
}

export function useDeleteTaxCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/tax-codes/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('TaxCode state changed');
      queryClient.invalidateQueries({ queryKey: ['taxCodes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update taxcode');
    },
  });
}
