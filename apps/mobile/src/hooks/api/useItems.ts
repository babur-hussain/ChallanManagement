import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete } from '../../lib/api';
import type { IItem, IItemFilters, CreateItemInput, UpdateItemInput, ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

export const ITEM_KEY = 'items';

interface ItemListResponse {
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

export function useItems(filters: IItemFilters = {}) {
    return useQuery({
        queryKey: [ITEM_KEY, filters],
        queryFn: async () => {
            const response = await api.get<any>('/items', { params: filters });
            if (!response.data.success) throw new Error(response.data.error?.message);
            return response.data as ItemListResponse;
        },
    });
}

export function useCreateItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateItemInput) => apiPost<IItem>('/items', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [ITEM_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to create item');
        },
    });
}

export function useUpdateItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateItemInput }) => apiPut<IItem>(`/items/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [ITEM_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to update item');
        },
    });
}

export function useDeleteItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<IItem>(`/items/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [ITEM_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to delete item');
        },
    });
}
