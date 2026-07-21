import type { AuthResponse, Company, TokenRefreshResponse } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  localStorage.setItem('token', token);
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

function setRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token);
}

export function clearTokens(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getUser(): { id: string; username: string; fullName: string } | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setUser(user: { id: string; username: string; fullName: string }): void {
  localStorage.setItem('user', JSON.stringify(user));
}

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Session expired');
  }

  const data: TokenRefreshResponse = await res.json();
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  return data.token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        refreshQueue.forEach((q) => q.resolve(newToken));
        refreshQueue = [];

        const retryRes = await fetch(`${BASE}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
            ...options?.headers,
          },
        });

        if (!retryRes.ok) {
          const body = await retryRes.json().catch(() => ({ error: retryRes.statusText }));
          throw new Error(body.error || 'Request failed');
        }
        return retryRes.json();
      } catch (err) {
        isRefreshing = false;
        refreshQueue.forEach((q) => q.reject(err as Error));
        refreshQueue = [];
        clearTokens();
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve: (t: string) => resolve(t as unknown as T), reject });
    });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  selectCompany: async (companyId: string): Promise<AuthResponse> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const data = await request<AuthResponse>('/auth/select-company', {
      method: 'POST',
      body: JSON.stringify({ refreshToken, companyId }),
    });
    setToken(data.token!);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
    } catch {}
    clearTokens();
  },

  register: async (input: { username: string; email: string; password: string; fullName: string }) => {
    return request<{ id: string; username: string; email: string; fullName: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  forgotPassword: async (email: string) => {
    return request<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  refreshSession: async (): Promise<string> => {
    return refreshAccessToken();
  },

  getCompanies: () => request<Company[]>('/companies'),
  getCompany: (id: string) => request<Company>(`/companies/${id}`),
  createCompany: (data: Partial<Company>) =>
    request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
