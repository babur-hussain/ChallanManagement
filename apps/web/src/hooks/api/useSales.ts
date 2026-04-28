import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';

export function useSalesDashboard(dateOption: 'TODAY' | 'WEEK' | 'MONTH' = 'MONTH') {
    return useQuery({
        queryKey: ['sales', 'dashboard', dateOption],
        queryFn: () => apiGet('/sales/dashboard', { date: dateOption }),
    });
}

export function useSalesLeaderboards(dateOption: 'TODAY' | 'WEEK' | 'MONTH' = 'MONTH') {
    return useQuery({
        queryKey: ['sales', 'leaderboards', dateOption],
        queryFn: () => apiGet('/sales/leaderboards', { date: dateOption }),
    });
}
