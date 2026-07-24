import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, getUser, getCompanyId } from '../services/api';
import type { CompanyOption } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  user: { id: number; username: string; fullName: string } | null;
  companyId: number | null;
  pendingCompanies: CompanyOption[];
  pending2FAToken: string | null;
  login: (username: string, password: string) => Promise<{ requiresCompanySelection: boolean; requires2FA: boolean; tempToken?: string; companies: CompanyOption[] }>;
  selectCompany: (companyId: number) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: { username: string; email: string; password: string; fullName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(getUser);
  const [companyId, setCompanyIdState] = useState<AuthState['companyId']>(getCompanyId);
  const [pendingCompanies, setPendingCompanies] = useState<CompanyOption[]>([]);
  const [pending2FAToken, setPending2FAToken] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.login(username, password);
    if (data.requires2FA) {
      setPending2FAToken(data.tempToken ?? null);
      return { requiresCompanySelection: false, requires2FA: true, tempToken: data.tempToken, companies: [] };
    }
    if (data.token) {
      setUser(data.user);
      setPendingCompanies([]);
      setPending2FAToken(null);
      return { requiresCompanySelection: false, requires2FA: false, companies: data.companies };
    }
    setPendingCompanies(data.companies);
    setPending2FAToken(null);
    return { requiresCompanySelection: true, requires2FA: false, companies: data.companies };
  }, []);

  const selectCompany = useCallback(async (companyId: number) => {
    const data = await api.selectCompany(companyId);
    setUser(data.user);
    setCompanyIdState(companyId);
    setPendingCompanies([]);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setCompanyIdState(null);
    setPendingCompanies([]);
  }, []);

  const register = useCallback(async (input: { username: string; email: string; password: string; fullName: string }) => {
    await api.register(input);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, companyId, pendingCompanies, pending2FAToken, login, selectCompany, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
