import { User, Store, AdminStats, OwnerStoreData } from './types';

const TOKEN_KEY = 'store_rating_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  getDemoAccounts: () => request<Record<string, any>>('/api/demo-accounts'),
  register: (payload: { name: string; email: string; address: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request<{ user: User; store?: any }>('/api/auth/me'),
  updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Normal User / Stores
  getStores: (params?: { search?: string; name?: string; address?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.name) query.append('name', params.name);
    if (params?.address) query.append('address', params.address);
    const qs = query.toString();
    return request<Store[]>(`/api/stores${qs ? `?${qs}` : ''}`);
  },
  submitRating: (payload: { storeId: string; rating: number }) =>
    request<{ message: string; isModification: boolean; submittedRating: number; storeStats: any }>('/api/ratings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Store Owner
  getOwnerDashboard: () =>
    request<{ hasStore: boolean; message?: string; stores: OwnerStoreData[] }>('/api/owner/dashboard'),

  // Admin
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),
  getAdminUsers: (filters?: { name?: string; email?: string; address?: string; role?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (filters?.name) query.append('name', filters.name);
    if (filters?.email) query.append('email', filters.email);
    if (filters?.address) query.append('address', filters.address);
    if (filters?.role) query.append('role', filters.role);
    if (filters?.search) query.append('search', filters.search);
    const qs = query.toString();
    return request<User[]>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  createAdminUser: (payload: { name: string; email: string; password: string; address: string; role: string }) =>
    request<{ message: string; user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminStores: (filters?: { name?: string; email?: string; address?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (filters?.name) query.append('name', filters.name);
    if (filters?.email) query.append('email', filters.email);
    if (filters?.address) query.append('address', filters.address);
    if (filters?.search) query.append('search', filters.search);
    const qs = query.toString();
    return request<Store[]>(`/api/admin/stores${qs ? `?${qs}` : ''}`);
  },
  createAdminStore: (payload: { name: string; email: string; address: string; ownerId?: string }) =>
    request<{ message: string; store: any }>('/api/admin/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
