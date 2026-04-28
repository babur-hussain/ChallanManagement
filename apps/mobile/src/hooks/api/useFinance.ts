import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost } from '../../lib/api';
import type { ApiResponse } from '@textilepro/shared';

export const FINANCE_KEY = 'finance';
export const BANKS_KEY = 'banks';
export const EXPENSES_KEY = 'expenses';

// ─── Banking ───────────────────────────────────────────────

export function useBankAccounts() {
    return useQuery({
        queryKey: [BANKS_KEY],
        queryFn: () => apiGet<any[]>('/finance/banks'),
    });
}

export function useCreateBankAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/finance/banks', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: [BANKS_KEY] }); },
    });
}

// ─── Expenses ──────────────────────────────────────────────

export function useExpenses() {
    return useQuery({
        queryKey: [EXPENSES_KEY],
        queryFn: () => apiGet<any[]>('/finance/expenses'),
    });
}

export function useCreateExpense() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiPost<any>('/finance/expenses', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
            qc.invalidateQueries({ queryKey: [FINANCE_KEY, 'working-capital'] });
        },
    });
}

// ─── Analytics & AI ────────────────────────────────────────

export function useWorkingCapital() {
    return useQuery({
        queryKey: [FINANCE_KEY, 'working-capital'],
        queryFn: () => apiGet<any>('/finance/working-capital'),
        staleTime: 60 * 1000,
    });
}

export function useFraudAlerts() {
    return useQuery({
        queryKey: [FINANCE_KEY, 'fraud-alerts'],
        queryFn: () => apiGet<any[]>('/finance/ai/fraud-alerts'),
    });
}

export function useCashflowAI() {
    return useQuery({
        queryKey: [FINANCE_KEY, 'cashflow'],
        queryFn: () => apiGet<any>('/finance/ai/cashflow'),
    });
}
