import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiDelete, apiGet } from '@/lib/api';
import type {
    ILead,
    LeadQueryFilters,
    CreateLeadInput,
    UpdateLeadInput,
    ApiResponse,
    PipelineStage
} from '@textilepro/shared';
import { toast } from 'sonner';

export const LEADS_KEY = 'leads';

interface LeadsResponse {
    data: ILead[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function useLeads(filters: LeadQueryFilters = {}) {
    return useQuery({
        queryKey: [LEADS_KEY, filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<LeadsResponse>>('/leads', { params: filters });
            if (!response.data.success) throw new Error(response.data.error?.message);
            return response.data;
        },
    });
}

export function useLead(id: string) {
    return useQuery({
        queryKey: [LEADS_KEY, id],
        queryFn: () => apiGet<ILead>(`/leads/${id}`),
        enabled: !!id,
    });
}

export function useLeadDashboardSummary() {
    return useQuery({
        queryKey: [LEADS_KEY, 'dashboard-summary'],
        queryFn: () => apiGet<any>('/leads/dashboard-summary'),
    });
}

export function useCreateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLeadInput) => apiPost<ILead>('/leads', data),
        onSuccess: () => {
            toast.success('Lead created successfully');
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to create lead');
        }
    });
}

export function useUpdateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
            apiPut<ILead>(`/leads/${id}`, data),
        onSuccess: (_, { id }) => {
            toast.success('Lead updated successfully');
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update lead');
        }
    });
}

export function useChangeLeadStage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
            apiPost<ILead>(`/leads/${id}/change-stage`, { stage }),
        onSuccess: (_, { id, stage }) => {
            toast.success(`Lead moved to ${stage}`);
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to change lead stage');
        }
    });
}

export function useAddLeadNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) =>
            apiPost<ILead>(`/leads/${id}/add-note`, { note }),
        onSuccess: (_, { id }) => {
            toast.success('Note added');
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to add note');
        }
    });
}

export function useAddLeadFollowUp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, title, description, nextFollowUpAt }: { id: string; title: string, description?: string, nextFollowUpAt?: string }) =>
            apiPost<ILead>(`/leads/${id}/add-followup`, { title, description, nextFollowUpAt }),
        onSuccess: (_, { id }) => {
            toast.success('Follow-up scheduled');
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to schedule follow-up');
        }
    });
}

export function useMarkLeadWon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, partyName, closingValue }: { id: string; partyName?: string; closingValue?: number }) =>
            apiPost<any>(`/leads/${id}/mark-won`, { partyName, closingValue }),
        onSuccess: (_, { id }) => {
            toast.success('Lead marked as Won and converted to Party!');
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
            qc.invalidateQueries({ queryKey: ['parties'] }); // Invalidate parties so it shows up in parties list
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to convert lead');
        }
    });
}

export function useMarkLeadLost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, lostReason }: { id: string; lostReason: string }) =>
            apiPost<ILead>(`/leads/${id}/mark-lost`, { lostReason }),
        onSuccess: (_, { id }) => {
            toast.success('Lead marked as Lost');
            qc.invalidateQueries({ queryKey: [LEADS_KEY] });
            qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message || err.message || 'Failed to mark lead as lost');
        }
    });
}
