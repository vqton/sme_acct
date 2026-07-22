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

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  roles: string[];
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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

// ─── Accounting Types ─────────────────────────────────────

export interface Account {
  id: string;
  companyId: string;
  accountNumber: string;
  name: string;
  nameEnglish?: string;
  category: number;
  nature: number;
  type: number;
  parentId?: string;
  isActive: boolean;
  isSystem: boolean;
  allowTransactions: boolean;
  openingDebit?: number;
  openingCredit?: number;
  debitAmount?: number;
  creditAmount?: number;
  closingDebit?: number;
  closingCredit?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  entryDate: string;
  periodId: string;
  entryType: number;
  description: string;
  descriptionEnglish?: string;
  referenceNumber?: string;
  referenceDate?: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isReversed: boolean;
  reversedById?: string;
  postedAt?: string;
  createdAt: string;
  postedByUserId?: string;
  createdByUserId?: string;
  lines: JournalLine[];
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountNumber: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string;
  departmentId?: string;
  projectId?: string;
}

export interface FiscalPeriod {
  id: string;
  companyId: string;
  year: number;
  month: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: number;
  isOpeningBalancePeriod: boolean;
  closedAt?: string;
  closedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LedgerEntry {
  id: string;
  companyId: string;
  accountId: string;
  accountNumber: string;
  periodId: string;
  journalEntryId: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningDebit: number;
  runningCredit: number;
  runningBalance: number;
  costCenterId?: string;
  departmentId?: string;
  projectId?: string;
  createdAt: string;
}

export interface AccountBalance {
  accountId: string;
  accountNumber: string;
  companyId: string;
  periodId: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}
