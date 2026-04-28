import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// API Client — Axios instance with Bearer token auth
// Auto-refresh on 401, offline-aware
// ═══════════════════════════════════════════════════════════════

const TOKEN_KEY = '@TextilePro_Token';
const REFRESH_TOKEN_KEY = '@TextilePro_RefreshToken';

// Change this to your backend URL.
// For iOS simulator: http://localhost:3001
// For Android emulator: http://10.0.2.2:3001
// For physical device: use your machine's local IP, e.g. http://192.168.x.x:3001
const BASE_URL = __DEV__ ? 'http://192.168.29.193:3001/api' : 'https://api.textilepro.in/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ─── Token helpers ───────────────────────────────────────────

export async function setTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

// ─── Request interceptor — add Bearer token ─────────────────

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle token refresh on 401 ─────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Cookie: `refreshToken=${refreshTokenValue}` },
          withCredentials: true,
        });

        if (res.data?.success) {
          // Backend returns new tokens in cookies, but for mobile we need headers
          // If backend supports Bearer token refresh, use that instead
          processQueue(null);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Typed API helpers ──────────────────────────────────────

export async function apiGet<T>(url: string, params?: Record<string, any>): Promise<T> {
  try {
    const response = await api.get<ApiResponse<T>>(url, { params });
    if (!response.data.success) {
      throw new Error((response.data as any).error?.message || 'Request failed');
    }
    return response.data.data as T;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error((response.data as any).error?.message || 'Request failed');
    }
    return response.data.data as T;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.put<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error((response.data as any).error?.message || 'Request failed');
    }
    return response.data.data as T;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}

export async function apiDelete<T>(url: string): Promise<T> {
  try {
    const response = await api.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error((response.data as any).error?.message || 'Request failed');
    }
    return response.data.data as T;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}
