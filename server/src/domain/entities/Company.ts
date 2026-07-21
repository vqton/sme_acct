export interface Company {
  id: string;
  name: string;
  nameVietnamese?: string;
  taxCode?: string;
  enterpriseCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export enum CompanyStatus {
  Active = 1,
  Suspended = 2,
  Dissolved = 3,
  Bankrupt = 4,
  Merged = 5,
  Converting = 6,
}
