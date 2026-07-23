import type { CompanyLicense } from '../entities/CompanyLicense.js';

export interface CompanyLicenseRepository {
  findById(id: number): CompanyLicense | null;
  findByCompanyId(companyId: number): CompanyLicense[];
  save(entity: CompanyLicense): CompanyLicense;
  delete(id: number): void;
}
