import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
import type { IAnalyticsDashboard } from '@textilepro/shared';

export const ANALYTICS_KEY = 'analytics';

export function useDashboard() {
    return useQuery({
        queryKey: [ANALYTICS_KEY, 'dashboard'],
        queryFn: () => apiGet<IAnalyticsDashboard>('/analytics/dashboard'),
        refetchInterval: 60000, // Poll every minute
    });
}
