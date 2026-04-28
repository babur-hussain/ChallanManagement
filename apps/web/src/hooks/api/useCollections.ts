import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type {
    ICollectionDashboard, IAgingBucket, IPartyCreditProfile,
    IPromiseToPay, ICollectionTask, ICollectorPerformance,
    IPartyCollectionHistory, ICreditCheckResult,
} from '@textilepro/shared';
import { toast } from 'sonner';

export const COLLECTION_KEY = 'collections';

// ─── Dashboard ──────────────────────────────────────────────

export function useCollectionDashboard() {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'dashboard'],
        queryFn: () => apiGet<ICollectionDashboard>('/collections/dashboard'),
    });
}

export function useAgingReport() {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'aging'],
        queryFn: () => apiGet<IAgingBucket[]>('/collections/aging-report'),
    });
}

export function useHighRiskParties() {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'high-risk'],
        queryFn: () => apiGet<any[]>('/collections/high-risk-parties'),
    });
}

export function useOutstandingParties(filters: any = {}) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'outstanding', filters],
        queryFn: () => apiGet<any[]>('/collections/outstanding', filters),
    });
}

export function useCollectorPerformance() {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'performance'],
        queryFn: () => apiGet<ICollectorPerformance[]>('/collections/collector-performance'),
    });
}

// ─── Tasks ──────────────────────────────────────────────────

export function useCollectionTasks(filters: any = {}) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'tasks', filters],
        queryFn: () => apiGet<ICollectionTask[]>('/collections/tasks', filters),
    });
}

export function useCreateCollectionTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/collections/tasks', data),
        onSuccess: () => { toast.success('Task created'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

export function useCompleteCollectionTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPost(`/collections/tasks/${id}/complete`, data),
        onSuccess: () => { toast.success('Task completed'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Promises ───────────────────────────────────────────────

export function usePromises(filters: any = {}) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'promises', filters],
        queryFn: () => apiGet<IPromiseToPay[]>('/collections/promises', filters),
    });
}

export function useCreatePromise() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/collections/create-promise', data),
        onSuccess: () => { toast.success('Promise recorded'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

export function useBreakPromise() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/collections/break-promise-manual', data),
        onSuccess: () => { toast.success('Promise marked as broken'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Reminders ──────────────────────────────────────────────

export function useSendReminder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (invoiceId: string) => apiPost(`/collections/send-reminder/${invoiceId}`),
        onSuccess: () => { toast.success('Reminder sent'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Credit Profile ─────────────────────────────────────────

export function useCreditProfile(partyId: string) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'credit-profile', partyId],
        queryFn: () => apiGet<IPartyCreditProfile>(`/collections/credit-profile/${partyId}`),
        enabled: !!partyId,
    });
}

export function useUpdateCreditProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ partyId, data }: { partyId: string; data: any }) => apiPut(`/collections/credit-profile/${partyId}`, data),
        onSuccess: (_, { partyId }) => { toast.success('Credit profile updated'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY, 'credit-profile', partyId] }); },
    });
}

export function useRecalculateScore() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (partyId: string) => apiPost(`/collections/credit-profile/${partyId}/recalculate`),
        onSuccess: () => { toast.success('Score recalculated'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Block / Unblock ────────────────────────────────────────

export function useBlockParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ partyId, reason }: { partyId: string; reason: string }) => apiPost(`/collections/block-party/${partyId}`, { reason }),
        onSuccess: () => { toast.success('Party blocked'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

export function useUnblockParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (partyId: string) => apiPost(`/collections/unblock-party/${partyId}`),
        onSuccess: () => { toast.success('Party unblocked'); qc.invalidateQueries({ queryKey: [COLLECTION_KEY] }); },
    });
}

// ─── Credit Check ───────────────────────────────────────────

export function useCreditCheck(partyId: string, amount: number) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'credit-check', partyId, amount],
        queryFn: () => apiGet<ICreditCheckResult>(`/collections/credit-check/${partyId}?amount=${amount}`),
        enabled: !!partyId && amount > 0,
    });
}

// ─── Party History ──────────────────────────────────────────

export function usePartyCollectionHistory(partyId: string) {
    return useQuery({
        queryKey: [COLLECTION_KEY, 'party-history', partyId],
        queryFn: () => apiGet<IPartyCollectionHistory>(`/collections/party/${partyId}/history`),
        enabled: !!partyId,
    });
}
