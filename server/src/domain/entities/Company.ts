import { CompanyType } from '../enums/CompanyEnums.js';
import { Address } from '../valueObjects/Address.js';

export interface Company {
  id: string;
  name: string;
  nameVietnamese?: string;
  nameEnglish?: string;
  abbreviatedName?: string;

  taxCode?: string;
  enterpriseCode?: string;
  companyType?: CompanyType;

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

  status: CompanyStatus;
  reasonForDissolution?: string;

  taxOfficeId?: string;
  taxOfficeName?: string;
  taxDepartment?: string;
  managedByTaxAuthorityCode?: string;

  vNeIDOrganizationId?: string;
  vNeIDRegistrationDate?: string;
  vNeIDStatus?: number;
  lastVNeIDSyncAt?: string;

  createdAt: Date;
  updatedAt?: Date;
  createdByUserId?: string;
  updatedByUserId?: string;

  firstPeriodStartDate?: string;
  closedPeriodCount?: number;

  // Legacy fields kept for backward compat
  legalRepresentative?: string;
}

export enum CompanyStatus {
  Active = 1,
  Suspended = 2,
  Dissolved = 3,
  Bankrupt = 4,
  Merged = 5,
  Converting = 6,
}

export function createCompany(data: Partial<Company> & { name: string; status: CompanyStatus }): Company {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    ...data,
  };
}

export function getStatusLabel(status: CompanyStatus): string {
  const labels: Record<CompanyStatus, string> = {
    [CompanyStatus.Active]: 'Đang hoạt động',
    [CompanyStatus.Suspended]: 'Tạm ngừng hoạt động',
    [CompanyStatus.Dissolved]: 'Đã giải thể',
    [CompanyStatus.Bankrupt]: 'Phá sản',
    [CompanyStatus.Merged]: 'Đã sáp nhập',
    [CompanyStatus.Converting]: 'Đang chuyển đổi loại hình',
  };
  return labels[status];
}
