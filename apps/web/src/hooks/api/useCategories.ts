import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type {
    ICategory,
    ICategoryFilters,
    CreateCategoryInput,
    UpdateCategoryInput,
    ApiResponse
} from '@textilepro/shared';

const QUERY_KEY = ['categories'];

export function useCategories(filters?: ICategoryFilters) {
    return useQuery({
        queryKey: [...QUERY_KEY, filters],
        queryFn: async () => {
            const { data } = await api.get('/categories', { params: filters });
            return data;
        },
    });
}

export function useCategory(id: string) {
    return useQuery({
        queryKey: [...QUERY_KEY, id],
        queryFn: () => apiGet<ICategory>(`/categories/${id}`),
        enabled: !!id,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryInput) => apiPost<ICategory>('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
            apiPut<ICategory>(`/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiDelete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}
