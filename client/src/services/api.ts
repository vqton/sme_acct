import type {
  AuthResponse, Company, TokenRefreshResponse, DashboardData,
  LegalRepresentative, CapitalContributor, BusinessLine, CompanyBankAccount,
  Account, JournalEntry, FiscalPeriod, LedgerEntry, AccountBalance,
  UserListItem, UserGroup, Department, UserDepartment,
} from '../types';

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

export function getUser(): { id: number; username: string; fullName: string } | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setUser(user: { id: number; username: string; fullName: string }): void {
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

  selectCompany: async (companyId: number): Promise<AuthResponse> => {
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
    return request<{ id: number; username: string; email: string; fullName: string }>('/auth/register', {
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

  getDashboard: () => request<DashboardData>('/dashboard'),

  getCompanies: () => request<Company[]>('/companies'),
  getCompany: (id: number) => request<Company>(`/companies/${id}`),
  createCompany: (data: Partial<Company>) =>
    request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCompany: (id: number, data: Partial<Company>) =>
    request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCompany: (id: number) =>
    request<void>(`/companies/${id}`, { method: 'DELETE' }),

  // Status transitions
  activateCompany: (id: number) =>
    request<Company>(`/companies/${id}/activate`, { method: 'POST' }),
  suspendCompany: (id: number) =>
    request<Company>(`/companies/${id}/suspend`, { method: 'POST' }),
  dissolveCompany: (id: number, reason?: string) =>
    request<Company>(`/companies/${id}/dissolve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  bankruptCompany: (id: number) =>
    request<Company>(`/companies/${id}/bankrupt`, { method: 'POST' }),
  convertCompany: (id: number) =>
    request<Company>(`/companies/${id}/convert`, { method: 'POST' }),
  mergeCompany: (id: number) =>
    request<Company>(`/companies/${id}/merge`, { method: 'POST' }),

  // Legal Representatives
  getLegalReps: (companyId: number) =>
    request<LegalRepresentative[]>(`/companies/${companyId}/legal-reps`),
  addLegalRep: (companyId: number, data: Partial<LegalRepresentative>) =>
    request<LegalRepresentative>(`/companies/${companyId}/legal-reps`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLegalRep: (companyId: number, repId: number, data: Partial<LegalRepresentative>) =>
    request<LegalRepresentative>(`/companies/${companyId}/legal-reps/${repId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLegalRep: (companyId: number, repId: number) =>
    request<void>(`/companies/${companyId}/legal-reps/${repId}`, { method: 'DELETE' }),

  // Capital Contributors
  getCapitalContributors: (companyId: number) =>
    request<CapitalContributor[]>(`/companies/${companyId}/contributors`),
  addCapitalContributor: (companyId: number, data: Partial<CapitalContributor>) =>
    request<CapitalContributor>(`/companies/${companyId}/contributors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Business Lines
  getBusinessLines: (companyId: number) =>
    request<BusinessLine[]>(`/companies/${companyId}/business-lines`),
  addBusinessLine: (companyId: number, data: Partial<BusinessLine>) =>
    request<BusinessLine>(`/companies/${companyId}/business-lines`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Bank Accounts
  getBankAccounts: (companyId: number) =>
    request<CompanyBankAccount[]>(`/companies/${companyId}/bank-accounts`),
  addBankAccount: (companyId: number, data: Partial<CompanyBankAccount>) =>
    request<CompanyBankAccount>(`/companies/${companyId}/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ─── Accounting ─────────────────────────────────────────

  getAccounts: (companyId: number, params?: { query?: string; category?: number; activeOnly?: boolean; page?: number; pageSize?: number }) => {
    let path = `/accounting/accounts?companyId=${companyId}`;
    if (params?.query) path += `&query=${encodeURIComponent(params.query)}`;
    if (params?.category !== undefined) path += `&category=${params.category}`;
    if (params?.activeOnly !== undefined) path += `&activeOnly=${params.activeOnly}`;
    if (params?.page !== undefined) path += `&page=${params.page}`;
    if (params?.pageSize !== undefined) path += `&pageSize=${params.pageSize}`;
    return request<any>(path);
  },
  getAccount: (id: number) =>
    request<Account>(`/accounting/accounts/${id}`),
  createAccount: (data: Partial<Account>) =>
    request<Account>('/accounting/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAccount: (id: number, data: Partial<Account>) =>
    request<Account>(`/accounting/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAccount: (id: number) =>
    request<void>(`/accounting/accounts/${id}`, { method: 'DELETE' }),
  deactivateAccount: (id: number, reason?: string) =>
    request<Account>(`/accounting/accounts/${id}/deactivate`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  reactivateAccount: (id: number) =>
    request<Account>(`/accounting/accounts/${id}/reactivate`, {
      method: 'PATCH',
    }),
  seedAccounts: (companyId: number) =>
    request<Account[]>('/accounting/accounts/seed', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    }),

  getJournalEntries: (companyId: number) =>
    request<JournalEntry[]>(`/accounting/journal-entries?companyId=${companyId}`),
  getJournalEntry: (id: number) =>
    request<JournalEntry>(`/accounting/journal-entries/${id}`),
  createJournalEntry: (data: any) =>
    request<JournalEntry>('/accounting/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  postJournalEntry: (id: number) =>
    request<JournalEntry>(`/accounting/journal-entries/${id}/post`, { method: 'POST' }),
  reverseJournalEntry: (id: number) =>
    request<{ reversal: JournalEntry; original: JournalEntry }>(`/accounting/journal-entries/${id}/reverse`, { method: 'POST' }),
  deleteJournalEntry: (id: number) =>
    request<void>(`/accounting/journal-entries/${id}`, { method: 'DELETE' }),

  getLedger: (companyId: number, accountId?: number, periodId?: number) => {
    let path = `/accounting/ledger?companyId=${companyId}`;
    if (accountId) path += `&accountId=${accountId}`;
    if (periodId) path += `&periodId=${periodId}`;
    return request<LedgerEntry[]>(path);
  },
  getTrialBalance: (companyId: number, periodId: number) =>
    request<AccountBalance[]>(`/accounting/ledger/balances?companyId=${companyId}&periodId=${periodId}`),

  getFiscalPeriods: (companyId: number) =>
    request<FiscalPeriod[]>(`/accounting/fiscal-periods?companyId=${companyId}`),
  getCurrentPeriod: (companyId: number) =>
    request<FiscalPeriod>(`/accounting/fiscal-periods/current?companyId=${companyId}`),
  createFiscalPeriod: (data: { companyId: number; year: number; month: number }) =>
    request<FiscalPeriod>('/accounting/fiscal-periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  closeFiscalPeriod: (id: number) =>
    request<FiscalPeriod>(`/accounting/fiscal-periods/${id}/close`, { method: 'POST' }),
};

// Standalone exports for direct imports
export function getAccounts(companyId: number, params?: { query?: string; category?: number; activeOnly?: boolean; page?: number; pageSize?: number }) { return api.getAccounts(companyId, params); }
export function createAccount(data: any) { return api.createAccount(data); }
export function updateAccount(id: number, data: any) { return api.updateAccount(id, data); }
export function deleteAccount(id: number) { return api.deleteAccount(id); }
export function deactivateAccount(id: number, reason?: string) { return api.deactivateAccount(id, reason); }
export function reactivateAccount(id: number) { return api.reactivateAccount(id); }
export function seedAccounts(companyId: number) { return api.seedAccounts(companyId); }
export function getJournalEntries(companyId: number) { return api.getJournalEntries(companyId); }
export function createJournalEntry(data: any) { return api.createJournalEntry(data); }
export function postJournalEntry(id: number) { return api.postJournalEntry(id); }
export function reverseJournalEntry(id: number) { return api.reverseJournalEntry(id); }
export function deleteJournalEntry(id: number) { return api.deleteJournalEntry(id); }
export function getLedger(companyId: number, accountId?: number, periodId?: number) { return api.getLedger(companyId, accountId, periodId); }
export function getTrialBalance(companyId: number, periodId: number) { return api.getTrialBalance(companyId, periodId); }
export function getFiscalPeriods(companyId: number) { return api.getFiscalPeriods(companyId); }

// ─── User Management ──────────────────────────────────────

export const userApi = {
  listUsers: (params?: { query?: string; isActive?: boolean; role?: string; groupId?: number; offset?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.query) sp.set('query', params.query);
    if (params?.isActive !== undefined) sp.set('isActive', String(params.isActive));
    if (params?.role) sp.set('role', params.role);
    if (params?.groupId) sp.set('groupId', String(params.groupId));
    if (params?.offset !== undefined) sp.set('offset', String(params.offset));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return request<{ data: UserListItem[]; total: number }>(`/users${qs ? `?${qs}` : ''}`);
  },

  getUser: (id: number) => request<UserListItem>(`/users/${id}`),

  updateUser: (id: number, data: Partial<UserListItem>) =>
    request<UserListItem>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteUser: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),

  activateUser: (id: number) => request<UserListItem>(`/users/${id}/activate`, { method: 'POST' }),

  deactivateUser: (id: number) => request<UserListItem>(`/users/${id}/deactivate`, { method: 'POST' }),

  getUserRoles: (id: number) => request<{ roles: string[] }>(`/users/${id}/roles`),

  assignRole: (id: number, role: string) =>
    request<{ roles: string[] }>(`/users/${id}/roles`, { method: 'POST', body: JSON.stringify({ role }) }),

  removeRole: (id: number, role: string) =>
    request<{ roles: string[] }>(`/users/${id}/roles/${role}`, { method: 'DELETE' }),

  getUserGroups: (id: number) => request<{ data: UserGroup[] }>(`/users/${id}/groups`),

  addUserToGroup: (id: number, groupId: number) =>
    request<{ ok: boolean }>(`/users/${id}/groups/${groupId}`, { method: 'POST' }),

  removeUserFromGroup: (id: number, groupId: number) =>
    request<{ ok: boolean }>(`/users/${id}/groups/${groupId}`, { method: 'DELETE' }),

  // Groups management
  listGroups: () => request<{ data: UserGroup[] }>('/users/groups/all'),

  createGroup: (data: { name: string; description?: string }) =>
    request<UserGroup>('/users/groups', { method: 'POST', body: JSON.stringify(data) }),

  updateGroup: (id: number, data: { name?: string; description?: string }) =>
    request<UserGroup>(`/users/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteGroup: (id: number) => request<void>(`/users/groups/${id}`, { method: 'DELETE' }),

  toggleGroupActive: (id: number, isActive: boolean) =>
    request<UserGroup>(`/users/groups/${id}/toggle`, { method: 'POST', body: JSON.stringify({ isActive }) }),
};

// ─── Department Management ─────────────────────────────────

export const departmentApi = {
  list: (companyId: number) =>
    request<Department[]>(`/companies/${companyId}/departments`),

  getById: (companyId: number, id: number) =>
    request<Department>(`/companies/${companyId}/departments/${id}`),

  create: (companyId: number, data: Record<string, unknown>) =>
    request<Department>(`/companies/${companyId}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (companyId: number, id: number, data: Record<string, unknown>) =>
    request<Department>(`/companies/${companyId}/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (companyId: number, id: number) =>
    request<void>(`/companies/${companyId}/departments/${id}`, { method: 'DELETE' }),

  deactivate: (companyId: number, id: number) =>
    request<Department>(`/companies/${companyId}/departments/${id}/deactivate`, { method: 'POST' }),

  reactivate: (companyId: number, id: number) =>
    request<Department>(`/companies/${companyId}/departments/${id}/reactivate`, { method: 'POST' }),

  dissolve: (companyId: number, id: number, dissolutionDate?: string) =>
    request<Department>(`/companies/${companyId}/departments/${id}/dissolve`, {
      method: 'POST',
      body: JSON.stringify({ dissolutionDate }),
    }),

  reparent: (companyId: number, id: number, newParentId: number) =>
    request<Department>(`/companies/${companyId}/departments/${id}/reparent`, {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    }),

  // User-Department assignments
  getDepartmentUsers: (companyId: number, deptId: number) =>
    request<UserDepartment[]>(`/companies/${companyId}/departments/${deptId}/users`),

  assignUser: (companyId: number, deptId: number, data: { userId: number; isPrimary?: boolean; jobTitle?: string }) =>
    request<UserDepartment>(`/companies/${companyId}/departments/${deptId}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setPrimary: (companyId: number, deptId: number, userId: number) =>
    request<{ ok: boolean }>(`/companies/${companyId}/departments/${deptId}/users/${userId}/primary`, { method: 'POST' }),

  removeUser: (companyId: number, deptId: number, userId: number) =>
    request<void>(`/companies/${companyId}/departments/${deptId}/users/${userId}`, { method: 'DELETE' }),
};
