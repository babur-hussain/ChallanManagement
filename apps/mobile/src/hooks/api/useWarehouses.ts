import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import type {
    IWarehouseFilters,
    CreateWarehouseInput,
    UpdateWarehouseInput,
    ApiResponse
} from '@textilepro/shared';
import { Alert } from 'react-native';

export const WAREHOUSE_KEY = 'warehouses';

export function useWarehouses(filters: IWarehouseFilters = {}) {
    return useQuery({
        queryKey: [WAREHOUSE_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any[]>>('/warehouses', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useCreateWarehouse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWarehouseInput) => apiPost<any>('/warehouses', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [WAREHOUSE_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to create warehouse');
        },
    });
}

export function useUpdateWarehouse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseInput }) =>
            apiPut<any>(`/warehouses/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [WAREHOUSE_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to update warehouse');
        },
    });
}

export function useDeleteWarehouse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<any>(`/warehouses/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [WAREHOUSE_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to delete warehouse');
        },
    });
}
