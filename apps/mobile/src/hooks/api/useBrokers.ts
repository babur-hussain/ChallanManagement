import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '../../lib/api';
import type { IBroker, CreateBrokerInput, UpdateBrokerInput, ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

export const BROKER_KEY = 'brokers';

export function useBrokers(filters: any = {}) {
    return useQuery({
        queryKey: [BROKER_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/brokers', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
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
        onSuccess: () => { qc.invalidateQueries({ queryKey: [BROKER_KEY] }); },
        onError: (err: any) => { Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed'); },
    });
}

export function useUpdateBroker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBrokerInput }) => apiPut<IBroker>(`/brokers/${id}`, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: [BROKER_KEY] });
            qc.invalidateQueries({ queryKey: [BROKER_KEY, id] });
        },
    });
}

export function useDeleteBroker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<IBroker>(`/brokers/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [BROKER_KEY] }); },
    });
}
