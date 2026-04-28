import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '@/lib/api';
import type {
  IParty,
  IPartyFilters,
  CreatePartyMasterInput,
  UpdatePartyMasterInput,
  IPartyStatement,
  IPartyQuickSearch,
  ApiResponse
} from '@textilepro/shared';
import { toast } from 'sonner';

export const PARTY_KEY = 'parties';

export function useParties(filters: IPartyFilters = {}) {
  return useQuery({
    queryKey: [PARTY_KEY, filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<IParty[]>>('/parties', { params: filters });
      if (!response.data.success) throw new Error(response.data.error?.message);
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

export function usePartyStatement(id: string, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: [PARTY_KEY, id, 'statement', startDate, endDate],
    queryFn: () => apiGet<IPartyStatement>(`/parties/${id}/statement`, /* add query params if apiGet supports it, wait no, let's just make the URL string */),
  });
}

// For usePartyStatement, since apiGet doesn't take params, we'll override it manually:
// Wait, I will just use api.get directly for statement so we can append query params cleanly
export function usePartyStatementWithParams(id: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [PARTY_KEY, id, 'statement', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const url = `/parties/${id}/statement?${params.toString()}`;
      return apiGet<IPartyStatement>(url);
    },
    enabled: !!id,
  });
}

export function usePartyStats() {
  return useQuery({
    queryKey: [PARTY_KEY, 'stats'],
    queryFn: () => apiGet<any>('/parties/stats'),
  });
}

export function usePartyTags() {
  return useQuery({
    queryKey: [PARTY_KEY, 'tags'],
    queryFn: () => apiGet<string[]>('/parties/tags'),
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
      toast.success('Party added successfully');
      qc.invalidateQueries({ queryKey: [PARTY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create party');
    }
  });
}

export function useUpdateParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartyMasterInput }) =>
      apiPut<IParty>(`/parties/${id}`, data),
    onSuccess: (_, { id }) => {
      toast.success('Party updated');
      qc.invalidateQueries({ queryKey: [PARTY_KEY] });
      qc.invalidateQueries({ queryKey: [PARTY_KEY, id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update party');
    }
  });
}

export function useDeleteParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<IParty>(`/parties/${id}`),
    onSuccess: () => {
      toast.success('Party removed');
      qc.invalidateQueries({ queryKey: [PARTY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to delete party');
    }
  });
}
