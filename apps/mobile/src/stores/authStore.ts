import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import { apiPost, apiGet, setTokens, clearTokens } from '../lib/api';
import type { IUser, IBusiness, ILoginResponse, IRegisterInput } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Auth Store — Zustand for mobile authentication
// Firebase Auth → Backend JWT → AsyncStorage token persistence
// ═══════════════════════════════════════════════════════════════

interface AuthState {
    user: IUser | null;
    business: IBusiness | null;
    permissions: string[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    register: (input: IRegisterInput) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    business: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: true, // Start true so we check session on mount
    error: null,

    register: async (input: IRegisterInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiPost<ILoginResponse>('/auth/register', input);

            // Store tokens from response headers or body if backend supports it
            // For now, the backend sets cookies which don't work on mobile,
            // so we'll need to adapt the backend to return tokens in the body
            set({
                user: response.user,
                business: response.business,
                permissions: response.permissions,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Firebase Auth
            const credential = await auth().signInWithEmailAndPassword(email, password);
            const idToken = await credential.user.getIdToken();

            // 2. Backend verification — sends Firebase ID token, gets JWT back
            const response = await apiPost<ILoginResponse>('/auth/login', {
                firebaseIdToken: idToken,
            });

            set({
                user: response.user,
                business: response.business,
                permissions: response.permissions,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiPost('/auth/logout');
            await auth().signOut();
        } catch {
            // Continue even if API call fails
        } finally {
            await clearTokens();
            set({
                user: null,
                business: null,
                permissions: [],
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            await auth().sendPasswordResetEmail(email);
            set({ isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password reset failed';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    refreshSession: async () => {
        try {
            const response = await apiGet<ILoginResponse>('/auth/me');
            set({
                user: response.user,
                business: response.business,
                permissions: response.permissions,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            await clearTokens();
            set({
                user: null,
                business: null,
                permissions: [],
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
