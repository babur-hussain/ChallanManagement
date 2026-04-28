import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  IWarehouseFilters, 
  CreateWarehouseInput, 
  UpdateWarehouseInput 
} from '@textilepro/shared';

export function useWarehouses(filters?: IWarehouseFilters) {
  return useQuery({
    queryKey: ['warehouses', filters],
    queryFn: async () => {
      const { data } = await api.get('/warehouses', { params: filters });
      return data;
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWarehouseInput) => {
      const res = await api.post('/warehouses', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Warehouse created successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create warehouse');
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWarehouseInput }) => {
      const res = await api.put(`/warehouses/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Warehouse updated successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update warehouse');
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/warehouses/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Warehouse state changed');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update warehouse');
    },
  });
}
