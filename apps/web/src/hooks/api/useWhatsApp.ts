import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

export const WA_KEY = 'whatsapp';

// ─── Config ─────────────────────────────────────────────────

export function useWAConfig() {
    return useQuery({ queryKey: [WA_KEY, 'config'], queryFn: () => apiGet('/whatsapp/config') });
}

export function useSaveWAConfig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/whatsapp/config', data),
        onSuccess: () => { toast.success('Config saved'); qc.invalidateQueries({ queryKey: [WA_KEY, 'config'] }); },
    });
}

// ─── Conversations ──────────────────────────────────────────

export function useConversations(filters: any = {}) {
    return useQuery({
        queryKey: [WA_KEY, 'conversations', filters],
        queryFn: () => apiGet('/whatsapp/conversations', filters),
        refetchInterval: 5000, // Poll every 5s for real-time feel
    });
}

export function useUpdateConversation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut(`/whatsapp/conversations/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [WA_KEY, 'conversations'] }),
    });
}

export function useAssignChat() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, userId }: { id: string; userId: string }) => apiPost(`/whatsapp/conversations/${id}/assign`, { assignToUserId: userId }),
        onSuccess: () => { toast.success('Chat assigned'); qc.invalidateQueries({ queryKey: [WA_KEY, 'conversations'] }); },
    });
}

export function useMarkSeen() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (convId: string) => apiPost(`/whatsapp/conversations/${convId}/seen`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [WA_KEY, 'conversations'] }),
    });
}

export function useCustomerContext(convId: string) {
    return useQuery({
        queryKey: [WA_KEY, 'context', convId],
        queryFn: () => apiGet(`/whatsapp/conversations/${convId}/context`),
        enabled: !!convId,
    });
}

// ─── Messages ───────────────────────────────────────────────

export function useMessages(conversationId: string, page = 1) {
    return useQuery({
        queryKey: [WA_KEY, 'messages', conversationId, page],
        queryFn: () => apiGet(`/whatsapp/messages/${conversationId}`, { page }),
        enabled: !!conversationId,
        refetchInterval: 3000,
    });
}

export function useSendMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/whatsapp/messages/send', data),
        onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: [WA_KEY, 'messages', vars.conversationId] }); qc.invalidateQueries({ queryKey: [WA_KEY, 'conversations'] }); },
    });
}

export function useStarMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (msgId: string) => apiPost(`/whatsapp/messages/${msgId}/star`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [WA_KEY, 'messages'] }),
    });
}

export function useSearchMessages(query: string) {
    return useQuery({
        queryKey: [WA_KEY, 'search', query],
        queryFn: () => apiGet('/whatsapp/messages/search', { q: query }),
        enabled: query.length >= 2,
    });
}

// ─── AI Bot ─────────────────────────────────────────────────

export function useAIRespond() {
    return useMutation({
        mutationFn: ({ convId, text }: { convId: string; text: string }) => apiPost(`/whatsapp/ai-respond/${convId}`, { text }),
    });
}

// ─── Templates ──────────────────────────────────────────────

export function useTemplates(category?: string) {
    return useQuery({
        queryKey: [WA_KEY, 'templates', category],
        queryFn: () => apiGet('/whatsapp/templates', category ? { category } : undefined),
    });
}

export function useCreateTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/whatsapp/templates', data),
        onSuccess: () => { toast.success('Template created'); qc.invalidateQueries({ queryKey: [WA_KEY, 'templates'] }); },
    });
}

export function useUpdateTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiPut(`/whatsapp/templates/${id}`, data),
        onSuccess: () => { toast.success('Template updated'); qc.invalidateQueries({ queryKey: [WA_KEY, 'templates'] }); },
    });
}

export function useDeleteTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/whatsapp/templates/${id}`),
        onSuccess: () => { toast.success('Template deleted'); qc.invalidateQueries({ queryKey: [WA_KEY, 'templates'] }); },
    });
}

export function useUseTemplate() {
    return useMutation({
        mutationFn: ({ id, variables }: { id: string; variables: any }) => apiPost(`/whatsapp/templates/${id}/use`, { variables }),
    });
}

// ─── Campaigns ──────────────────────────────────────────────

export function useCampaigns() {
    return useQuery({ queryKey: [WA_KEY, 'campaigns'], queryFn: () => apiGet('/whatsapp/campaigns') });
}

export function useCreateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost('/whatsapp/campaigns', data),
        onSuccess: () => { toast.success('Campaign created'); qc.invalidateQueries({ queryKey: [WA_KEY, 'campaigns'] }); },
    });
}

export function useUpdateCampaignStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => apiPost(`/whatsapp/campaigns/${id}/status`, { status }),
        onSuccess: () => { toast.success('Campaign updated'); qc.invalidateQueries({ queryKey: [WA_KEY, 'campaigns'] }); },
    });
}

// ─── Analytics ──────────────────────────────────────────────

export function useWAAnalytics() {
    return useQuery({ queryKey: [WA_KEY, 'analytics'], queryFn: () => apiGet('/whatsapp/analytics') });
}

// ─── Seed Templates ─────────────────────────────────────────

export function useSeedTemplates() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiPost('/whatsapp/seed-templates'),
        onSuccess: () => { toast.success('Default templates seeded'); qc.invalidateQueries({ queryKey: [WA_KEY, 'templates'] }); },
    });
}
