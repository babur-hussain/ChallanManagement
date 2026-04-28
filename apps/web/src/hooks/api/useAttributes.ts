import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  IAttributeFilters, 
  CreateAttributeInput, 
  UpdateAttributeInput 
} from '@textilepro/shared';

export function useAttributes(filters?: IAttributeFilters) {
  return useQuery({
    queryKey: ['attributes', filters],
    queryFn: async () => {
      const { data } = await api.get('/attributes', { params: filters });
      return data;
    },
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttributeInput) => {
      const res = await api.post('/attributes', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Attribute created successfully');
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create attribute');
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAttributeInput }) => {
      const res = await api.put(`/attributes/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Attribute updated successfully');
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attribute');
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/attributes/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Attribute state changed');
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attribute');
    },
  });
}
