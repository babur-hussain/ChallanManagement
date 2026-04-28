import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../lib/api';

export function useMapSummary(date?: string) {
    return useQuery({
        queryKey: ['visits', 'map-summary', date],
        queryFn: () => apiGet('/visits/map-summary', date ? { date } : {}),
    });
}

export function useVisits(filters = {}) {
    return useQuery({
        queryKey: ['visits', filters],
        queryFn: () => apiGet('/visits', filters),
    });
}

export function useCheckInVisit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => apiPost('/visits/checkin', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
        },
    });
}

export function useCheckOutVisit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPost(`/visits/${id}/checkout`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
        },
    });
}
