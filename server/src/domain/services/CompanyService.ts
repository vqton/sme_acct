import { Company, CompanyStatus } from '../entities/Company.js';

export class CompanyService {
  canActivate(company: Company): boolean {
    return company.status === CompanyStatus.Suspended;
  }

  canSuspend(company: Company): boolean {
    return company.status === CompanyStatus.Active;
  }

  canDissolve(company: Company): boolean {
    return company.status === CompanyStatus.Active ||
           company.status === CompanyStatus.Suspended;
  }

  activate(company: Company): Company {
    if (!this.canActivate(company)) {
      throw new Error(`Cannot activate company in status ${company.status}`);
    }
    return { ...company, status: CompanyStatus.Active, updatedAt: new Date() };
  }

  suspend(company: Company): Company {
    if (!this.canSuspend(company)) {
      throw new Error(`Cannot suspend company in status ${company.status}`);
    }
    return { ...company, status: CompanyStatus.Suspended, updatedAt: new Date() };
  }
}
