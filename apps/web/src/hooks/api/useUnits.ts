import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  IUnitFilters, 
  CreateUnitInput, 
  UpdateUnitInput 
} from '@textilepro/shared';

export function useUnits(filters?: IUnitFilters) {
  return useQuery({
    queryKey: ['units', filters],
    queryFn: async () => {
      const { data } = await api.get('/units', { params: filters });
      return data;
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUnitInput) => {
      const res = await api.post('/units', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Unit created successfully');
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create unit');
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUnitInput }) => {
      const res = await api.put(`/units/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Unit updated successfully');
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update unit');
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/units/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Unit state changed');
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update unit');
    },
  });
}
