import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete } from '@/lib/api';
import type {
  IItem,
  IItemFilters,
  CreateItemInput,
  UpdateItemInput,
  IBulkImportResult,
  ApiResponse
} from '@textilepro/shared';
import { toast } from 'sonner';

export const FABRIC_KEY = 'items';

interface FabricResponse {
  data: IItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useItems(filters: IItemFilters = {}, queryOptions: Record<string, any> = {}) {
  return useQuery({
    queryKey: [FABRIC_KEY, filters],
    queryFn: async () => {
      const response = await api.get<any>('/items', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
      return response.data as FabricResponse;
    },
    ...queryOptions,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemInput) => apiPost<IItem>('/items', data),
    onSuccess: () => {
      toast.success('Fabric quality added successfully');
      qc.invalidateQueries({ queryKey: [FABRIC_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create fabric quality');
    }
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemInput }) =>
      apiPut<IItem>(`/items/${id}`, data),
    onSuccess: () => {
      toast.success('Fabric quality updated');
      qc.invalidateQueries({ queryKey: [FABRIC_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update fabric quality');
    }
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<IItem>(`/items/${id}`),
    onSuccess: () => {
      toast.success('Fabric quality removed');
      qc.invalidateQueries({ queryKey: [FABRIC_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to delete fabric quality');
    }
  });
}

export function useImportItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: any[]) => apiPost<IBulkImportResult>('/items/bulk-import', { rows }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [FABRIC_KEY] });
      return result; // component will handle toast since it has details
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Import failed');
    }
  });
}
