import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api, apiPost, apiGet } from '@/lib/api';
import type { IUser, IBusiness, ILoginResponse, IRegisterInput } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Auth Store — Zustand for authentication state
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
  loginWithGoogle: () => Promise<void>;
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
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // 2. Backend verification
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

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();

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
      const message = error instanceof Error ? error.message : 'Google login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      await signOut(auth);
    } catch {
      // Continue even if API call fails
    } finally {
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
      await sendPasswordResetEmail(auth, email);
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
