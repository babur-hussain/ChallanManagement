import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';

export function useTasks(filters = {}) {
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => apiGet('/tasks', filters),
    });
}

export function useTaskDashboardSummary(userId?: string) {
    return useQuery({
        queryKey: ['tasks', 'dashboard-summary', userId],
        queryFn: () => apiGet('/tasks/dashboard-summary', userId ? { userId } : {}),
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => apiPost('/tasks', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut(`/tasks/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useCompleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => apiPost(`/tasks/${id}/complete`, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useCancelTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiPost(`/tasks/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiDelete(`/tasks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}
