export enum CompanyStatus {
  Active = 1,
  Suspended = 2,
  Dissolved = 3,
  Bankrupt = 4,
  Merged = 5,
  Converting = 6,
}

export interface Company {
  id: number;
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
  taxOfficeId?: number;
  taxOfficeName?: string;
  taxDepartment?: string;
  managedByTaxAuthorityCode?: string;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: number;
  updatedByUserId?: number;
  firstPeriodStartDate?: string;
  closedPeriodCount?: number;
  legalRepresentative?: string;
}

export interface LegalRepresentative {
  id: number;
  companyId: number;
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
  id: number;
  companyId: number;
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
  id: number;
  companyId: number;
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
  id: number;
  companyId: number;
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
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface UserListItem {
  id: number;
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
  id: number;
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
    id: number;
    username: string;
    fullName: string;
  };
  companies: CompanyOption[];
  requires2FA?: boolean;
  tempToken?: string;
}

export interface CompanyOption {
  id: number;
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
  id: number;
  companyId: number;
  accountNumber: string;
  name: string;
  nameEnglish?: string;
  category: number;
  nature: number;
  type: number;
  parentId?: number;
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
  id: number;
  companyId: number;
  entryNumber: string;
  entryDate: string;
  periodId: number;
  entryType: number;
  description: string;
  descriptionEnglish?: string;
  referenceNumber?: string;
  referenceDate?: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isReversed: boolean;
  reversedById?: number;
  postedAt?: string;
  createdAt: string;
  postedByUserId?: number;
  createdByUserId?: number;
  lines: JournalLine[];
}

export interface JournalLine {
  id: number;
  journalEntryId: number;
  accountId: number;
  accountNumber: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: number;
  departmentId?: number;
  projectId?: number;
}

export interface FiscalPeriod {
  id: number;
  companyId: number;
  year: number;
  month: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: number;
  isOpeningBalancePeriod: boolean;
  closedAt?: string;
  closedByUserId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LedgerEntry {
  id: number;
  companyId: number;
  accountId: number;
  accountNumber: string;
  periodId: number;
  journalEntryId: number;
  entryNumber: string;
  entryDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningDebit: number;
  runningCredit: number;
  runningBalance: number;
  costCenterId?: number;
  departmentId?: number;
  projectId?: number;
  createdAt: string;
}

// ─── Department Types ─────────────────────────────────────

export interface Department {
  id: number;
  companyId: number;
  code: string;
  name: string;
  nameEnglish?: string;
  departmentType: number;
  parentId?: number;
  path: string;
  depth: number;
  sortOrder: number;
  managerUserId?: number;
  managerTitle?: string;
  deputyManagerUserId?: number;
  defaultSalaryAccount?: string;
  defaultExpenseAccount?: string;
  hasBudgetControl: boolean;
  budgetAlertThreshold: number;
  budgetControlLevel: number;
  status: number;
  effectiveDate: string;
  dissolutionDate?: string;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: number;
  updatedByUserId?: number;
}

export interface UserDepartment {
  userId: number;
  departmentId: number;
  isPrimary: boolean;
  jobTitle?: string;
  isActive: boolean;
  assignedAt: string;
}

export interface DepartmentTreeItem extends Department {
  children: DepartmentTreeItem[];
}

export interface AccountBalance {
  accountId: number;
  accountNumber: string;
  companyId: number;
  periodId: number;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}
