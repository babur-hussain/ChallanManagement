import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '../../lib/api';
import type { ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

export const LEAD_KEY = 'leads';
export const TASK_KEY = 'tasks';
export const VISIT_KEY = 'visits';

// ─── Leads ──────────────────────────────────────────────────

export function useLeads(filters: any = {}) {
    return useQuery({
        queryKey: [LEAD_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/leads', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useLead(id: string) {
    return useQuery({
        queryKey: [LEAD_KEY, id],
        queryFn: () => apiGet<any>(`/leads/${id}`),
        enabled: !!id,
    });
}

export function useCreateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/leads', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [LEAD_KEY] }); },
        onError: (err: any) => { Alert.alert('Error', err?.message || 'Failed'); },
    });
}

export function useUpdateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut<any>(`/leads/${id}`, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: [LEAD_KEY] });
            qc.invalidateQueries({ queryKey: [LEAD_KEY, id] });
        },
    });
}

// ─── Tasks ──────────────────────────────────────────────────

export function useTasks(filters: any = {}) {
    return useQuery({
        queryKey: [TASK_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/tasks', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/tasks', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [TASK_KEY] }); },
    });
}

export function useUpdateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut<any>(`/tasks/${id}`, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [TASK_KEY] }); },
    });
}

// ─── Visits ─────────────────────────────────────────────────

export function useVisits(filters: any = {}) {
    return useQuery({
        queryKey: [VISIT_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/visits', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useCheckInVisit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { partyId: string; latLng: { lat: number; lng: number }; notes?: string }) =>
            apiPost<any>('/visits/check-in', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [VISIT_KEY] }); },
    });
}

export function useCheckOutVisit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiPost<any>(`/visits/${id}/check-out`, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [VISIT_KEY] }); },
    });
}

// ─── Sales ──────────────────────────────────────────────────

export function useSalesLeaderboard() {
    return useQuery({
        queryKey: ['sales', 'leaderboard'],
        queryFn: () => apiGet<any>('/sales/leaderboard'),
    });
}
