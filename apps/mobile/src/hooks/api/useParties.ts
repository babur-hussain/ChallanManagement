import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '../../lib/api';
import type {
    IParty,
    IPartyFilters,
    CreatePartyMasterInput,
    UpdatePartyMasterInput,
    IPartyQuickSearch,
    ApiResponse,
} from '@textilepro/shared';
import { Alert } from 'react-native';

export const PARTY_KEY = 'parties';

export function useParties(filters: IPartyFilters = {}) {
    return useQuery({
        queryKey: [PARTY_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<IParty[]>>('/parties', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useParty(id: string) {
    return useQuery({
        queryKey: [PARTY_KEY, id],
        queryFn: () => apiGet<IParty>(`/parties/${id}`),
        enabled: !!id,
    });
}

export function useQuickSearchParties(search: string) {
    return useQuery({
        queryKey: [PARTY_KEY, 'quickSearch', search],
        queryFn: () => apiGet<IPartyQuickSearch[]>(`/parties/search-quick?q=${encodeURIComponent(search)}`),
        enabled: search.length >= 2,
        staleTime: 60 * 1000,
    });
}

export function useCreateParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePartyMasterInput) => apiPost<IParty>('/parties', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [PARTY_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to create party');
        },
    });
}

export function useUpdateParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePartyMasterInput }) =>
            apiPut<IParty>(`/parties/${id}`, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: [PARTY_KEY] });
            qc.invalidateQueries({ queryKey: [PARTY_KEY, id] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to update party');
        },
    });
}

export function useDeleteParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<IParty>(`/parties/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [PARTY_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to delete party');
        },
    });
}

export function usePartyLedger(id: string, fromDate?: Date, toDate?: Date) {
    return useQuery({
        queryKey: [PARTY_KEY, 'ledger', id, fromDate?.toISOString(), toDate?.toISOString()],
        queryFn: () => {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());
            const qs = params.toString() ? `?${params.toString()}` : '';
            return apiGet<any>(`/parties/${id}/ledger${qs}`);
        },
        enabled: !!id,
    });
}

export async function exportPartyLedgerPdf(id: string, fromDate?: Date, toDate?: Date) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    const qs = params.toString() ? `?${params.toString()}` : '';

    return apiGet<any>(`/parties/${id}/ledger/export${qs}`);
}

export function useEditJournalEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut<any>(`/journal/${id}/party-edit`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [PARTY_KEY, 'ledger'] });
            qc.invalidateQueries({ queryKey: [PARTY_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to edit entry');
        },
    });
}

export function useDeleteJournalEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<any>(`/journal/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [PARTY_KEY, 'ledger'] });
            qc.invalidateQueries({ queryKey: [PARTY_KEY] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err?.response?.data?.error?.message || err.message || 'Failed to delete entry');
        },
    });
}
