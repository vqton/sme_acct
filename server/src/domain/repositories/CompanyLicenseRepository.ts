import type { CompanyLicense } from '../entities/CompanyLicense.js';

export interface CompanyLicenseRepository {
  findById(id: string): CompanyLicense | null;
  findByCompanyId(companyId: string): CompanyLicense[];
  save(entity: CompanyLicense): CompanyLicense;
  delete(id: string): void;
}
