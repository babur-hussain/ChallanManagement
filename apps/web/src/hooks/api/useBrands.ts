import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  IBrandFilters, 
  CreateBrandInput, 
  UpdateBrandInput 
} from '@textilepro/shared';

export function useBrands(filters?: IBrandFilters) {
  return useQuery({
    queryKey: ['brands', filters],
    queryFn: async () => {
      const { data } = await api.get('/brands', { params: filters });
      return data;
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBrandInput) => {
      const res = await api.post('/brands', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Brand created successfully');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create brand');
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBrandInput }) => {
      const res = await api.put(`/brands/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/brands/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Brand state changed');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });
}
