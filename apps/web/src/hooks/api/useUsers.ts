import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { IUser } from '@textilepro/shared';
import { toast } from 'sonner';

export const USERS_KEY = 'users';

export function useUsers() {
    return useQuery({
        queryKey: [USERS_KEY],
        queryFn: () => apiGet<IUser[]>('/users'),
    });
}

export function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<IUser>) => apiPost<IUser>('/users', data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success(`User ${data.name || ''} invited successfully`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create user');
        }
    });
}

export function useUpdateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<IUser> }) =>
            apiPut<IUser>(`/users/${id}`, data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success('User updated successfully');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update user');
        }
    });
}

export function useDeleteUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/users/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [USERS_KEY] });
            toast.success('User deleted out of the system');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to delete user');
        }
    });
}
