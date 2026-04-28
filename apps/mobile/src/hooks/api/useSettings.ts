import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
import type { ITenantSettings } from '@textilepro/shared';

export function useSettingsData() {
    return useQuery({
        queryKey: ['tenant_settings'],
        queryFn: () => apiGet<ITenantSettings>('/settings'),
        staleTime: 5 * 60 * 1000,
    });
}
