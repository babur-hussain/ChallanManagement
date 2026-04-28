import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiPost, apiPut, apiGet, apiDelete } from '../../lib/api';
import type { ApiResponse } from '@textilepro/shared';
import { Alert } from 'react-native';

// ─── Marketplace ────────────────────────────────────────────

export const MARKETPLACE_KEY = 'marketplace';

export function useMarketplaceListings(filters: any = {}) {
    return useQuery({
        queryKey: [MARKETPLACE_KEY, 'listings', filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/marketplace/listings', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

export function useMyListings() {
    return useQuery({
        queryKey: [MARKETPLACE_KEY, 'my-listings'],
        queryFn: () => apiGet<any>('/marketplace/my-listings'),
    });
}

export function useCreateListing() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/marketplace/listings', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [MARKETPLACE_KEY] }); },
        onError: (err: any) => { Alert.alert('Error', err?.message || 'Failed'); },
    });
}

export function useMarketplaceInquiries() {
    return useQuery({
        queryKey: [MARKETPLACE_KEY, 'inquiries'],
        queryFn: () => apiGet<any>('/marketplace/inquiries'),
    });
}

// ─── AI Copilot ─────────────────────────────────────────────

export const AI_KEY = 'ai';

export function useAIChat() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { message: string; context?: string }) =>
            apiPost<any>('/ai/chat', data),
    });
}

export function useAIInsights() {
    return useQuery({
        queryKey: [AI_KEY, 'insights'],
        queryFn: () => apiGet<any>('/ai/insights'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAICommandCenter() {
    return useQuery({
        queryKey: [AI_KEY, 'command-center'],
        queryFn: () => apiGet<any>('/ai/command-center'),
    });
}

// ─── Super Admin ────────────────────────────────────────────

export const ADMIN_KEY = 'admin';

export function useAdminDashboard() {
    return useQuery({
        queryKey: [ADMIN_KEY, 'dashboard'],
        queryFn: () => apiGet<any>('/admin/dashboard'),
    });
}

export function useAdminBusinesses(filters: any = {}) {
    return useQuery({
        queryKey: [ADMIN_KEY, 'businesses', filters],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/admin/businesses', { params: filters });
            if (!response.data.success) throw new Error((response.data as any).error?.message);
            return response.data;
        },
    });
}

// ─── Partner ────────────────────────────────────────────────

export const PARTNER_KEY = 'partner';

export function usePartnerDashboard() {
    return useQuery({
        queryKey: [PARTNER_KEY, 'dashboard'],
        queryFn: () => apiGet<any>('/partner/dashboard'),
    });
}

export function usePartnerReferrals() {
    return useQuery({
        queryKey: [PARTNER_KEY, 'referrals'],
        queryFn: () => apiGet<any>('/partner/referrals'),
    });
}

// ─── Settings ───────────────────────────────────────────────

export const SETTINGS_KEY = 'settings';

export function useBusinessSettings() {
    return useQuery({
        queryKey: [SETTINGS_KEY, 'business'],
        queryFn: () => apiGet<any>('/settings/business'),
    });
}

export function useUpdateBusinessSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPut<any>('/settings/business', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }); },
    });
}

export function useUserProfile() {
    return useQuery({
        queryKey: [SETTINGS_KEY, 'profile'],
        queryFn: () => apiGet<any>('/auth/me'),
    });
}

export function useUpdateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPut<any>('/auth/profile', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }); },
    });
}

// ─── Approvals ──────────────────────────────────────────────

export const APPROVAL_KEY = 'approvals';

export function usePendingApprovals() {
    return useQuery({
        queryKey: [APPROVAL_KEY, 'pending'],
        queryFn: () => apiGet<any[]>('/enterprise/approvals'),
    });
}

export function useApproveItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action, reason }: { id: string; action: 'APPROVED' | 'REJECTED'; reason?: string }) =>
            apiPost<any>(`/enterprise/approvals/${id}/action`, { decision: action, reason }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [APPROVAL_KEY] }); },
    });
}
