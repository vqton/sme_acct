export interface Company {
  id: string;
  name: string;
  nameVietnamese?: string;
  taxCode?: string;
  enterpriseCode?: string;
  status: number;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
  };
  companies: CompanyOption[];
  requires2FA?: boolean;
  tempToken?: string;
}

export interface CompanyOption {
  id: string;
  name: string;
  role?: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}
