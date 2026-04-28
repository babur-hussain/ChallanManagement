import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { IBranch } from '@textilepro/shared';
import { toast } from 'sonner';

export const BRANCHES_KEY = 'branches';

export function useBranches() {
    return useQuery({
        queryKey: [BRANCHES_KEY],
        queryFn: () => apiGet<IBranch[]>('/enterprise/branches'),
    });
}

export function useCreateBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<IBranch>) => apiPost<IBranch>('/enterprise/branches', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [BRANCHES_KEY] });
            toast.success('Branch added successfully');
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to create branch');
        }
    });
}

export function useUpdateBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<IBranch> }) =>
            apiPut<IBranch>(`/enterprise/branches/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [BRANCHES_KEY] });
            toast.success('Branch updated successfully');
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to update branch');
        }
    });
}

export function useDeleteBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/enterprise/branches/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [BRANCHES_KEY] });
            toast.success('Branch deleted');
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to delete branch');
        }
    });
}
