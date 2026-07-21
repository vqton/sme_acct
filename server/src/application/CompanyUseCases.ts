import type { Company } from '../domain/entities/Company.js';
import type { CompanyRepository } from '../domain/repositories/CompanyRepository.js';
import { CompanyService } from '../domain/services/CompanyService.js';

export class CompanyUseCases {
  private service = new CompanyService();

  constructor(private repo: CompanyRepository) {}

  list(): Company[] {
    return this.repo.findAll();
  }

  getById(id: string): Company {
    const company = this.repo.findById(id);
    if (!company) throw new Error('Company not found');
    return company;
  }

  create(data: Partial<Company>): Company {
    if (data.taxCode) {
      const existing = this.repo.findByTaxCode(data.taxCode);
      if (existing) throw new Error('Tax code already registered');
    }
    return this.repo.save({
      id: crypto.randomUUID(),
      name: data.name || '',
      status: data.status ?? 1,
      createdAt: new Date(),
      ...data,
    });
  }

  activate(id: string): Company {
    const company = this.getById(id);
    return this.repo.save(this.service.activate(company));
  }

  suspend(id: string): Company {
    const company = this.getById(id);
    return this.repo.save(this.service.suspend(company));
  }
}
