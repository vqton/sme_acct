export enum CompanyStatus {
  Active = 1,
  Suspended = 2,
  Dissolved = 3,
  Bankrupt = 4,
  Merged = 5,
  Converting = 6,
}

export interface Company {
  id: string;
  name: string;
  nameVietnamese?: string;
  nameEnglish?: string;
  abbreviatedName?: string;
  taxCode?: string;
  enterpriseCode?: string;
  companyType?: number;
  address?: string;
  headOfficeAddress?: string;
  headOfficeProvinceCode?: string;
  headOfficeDistrictCode?: string;
  headOfficeWardCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  charterCapital?: number;
  paidInCapital?: number;
  dateOfEstablishment?: string;
  dateOfOperationCommencement?: string;
  status: number;
  reasonForDissolution?: string;
  taxOfficeId?: string;
  taxOfficeName?: string;
  taxDepartment?: string;
  managedByTaxAuthorityCode?: string;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  firstPeriodStartDate?: string;
  closedPeriodCount?: number;
  legalRepresentative?: string;
}

export interface LegalRepresentative {
  id: string;
  companyId: string;
  fullName: string;
  vneidNumber?: string;
  position: string;
  isPrimary: boolean;
  authorizationScope?: string;
  digitalCertSerial?: string;
  digitalCertProvider?: string;
  digitalCertExpiry?: string;
  vneidVerifiedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CapitalContributor {
  id: string;
  companyId: string;
  contributorType: number;
  fullName: string;
  idNumber?: string;
  contributorCategory: number;
  capitalContribution: number;
  ownershipRatio: number;
  contributionDate: string;
  contributionCertificate?: string;
  isFounder: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessLine {
  id: string;
  companyId: string;
  vsicCode: string;
  vsicLevel: number;
  name: string;
  isPrimary: boolean;
  startDate: string;
  endDate?: string;
  licenseReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyBankAccount {
  id: string;
  companyId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBranch?: string;
  swiftCode?: string;
  currencyCode: string;
  isPrimaryTaxPayment: boolean;
  isActive: boolean;
  openedDate: string;
  createdAt: string;
  updatedAt?: string;
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

export interface DashboardSummary {
  totalCompanies: number;
  activeCompanies: number;
  totalCharterCapital: number;
  totalPaidInCapital: number;
  totalLegalReps: number;
  totalContributors: number;
  totalBankAccounts: number;
}

export interface CompanyStatusCount {
  status: number;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  companiesByStatus: CompanyStatusCount[];
  recentCompanies: Company[];
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}
