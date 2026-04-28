import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
import type { ITenantSettings, UpdateSettingsPayload } from '@textilepro/shared';

export function useSettingsData() {
    return useQuery({
        queryKey: ['tenant_settings'],
        queryFn: () => apiGet<ITenantSettings>('/settings'),
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSettingsPayload) => apiPut<ITenantSettings>('/settings', data),
        onSuccess: (newSettings) => {
            queryClient.setQueryData(['tenant_settings'], newSettings);
        },
    });
}
