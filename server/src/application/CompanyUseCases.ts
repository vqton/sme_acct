import type { Company } from '../domain/entities/Company.js';
import type { LegalRepresentative } from '../domain/entities/LegalRepresentative.js';
import type { CapitalContributor } from '../domain/entities/CapitalContributor.js';
import type { BusinessLine } from '../domain/entities/BusinessLine.js';
import type { CompanyBankAccount } from '../domain/entities/CompanyBankAccount.js';
import type { Branch } from '../domain/entities/Branch.js';
import type { FormerName } from '../domain/entities/FormerName.js';
import type { CompanyLicense } from '../domain/entities/CompanyLicense.js';
import type { CompanySeal } from '../domain/entities/CompanySeal.js';
import type { CompanyDocument } from '../domain/entities/CompanyDocument.js';
import type { CompanyRepository } from '../domain/repositories/CompanyRepository.js';
import type { LegalRepresentativeRepository } from '../domain/repositories/LegalRepresentativeRepository.js';
import type { CapitalContributorRepository } from '../domain/repositories/CapitalContributorRepository.js';
import type { BusinessLineRepository } from '../domain/repositories/BusinessLineRepository.js';
import type { CompanyBankAccountRepository } from '../domain/repositories/CompanyBankAccountRepository.js';
import type { BranchRepository } from '../domain/repositories/BranchRepository.js';
import type { FormerNameRepository } from '../domain/repositories/FormerNameRepository.js';
import type { CompanyLicenseRepository } from '../domain/repositories/CompanyLicenseRepository.js';
import { CompanyService } from '../domain/services/CompanyService.js';

export interface CompanyAggregateRepos {
  company: CompanyRepository;
  legalReps: LegalRepresentativeRepository;
  capitalContributors: CapitalContributorRepository;
  businessLines: BusinessLineRepository;
  bankAccounts: CompanyBankAccountRepository;
  branches?: BranchRepository;
  formerNames?: FormerNameRepository;
  licenses?: CompanyLicenseRepository;
}

export class CompanyUseCases {
  private service = new CompanyService();

  constructor(private repos: CompanyAggregateRepos) {}

  // ─── Company CRUD ───────────────────────────────────────

  list(): Company[] {
    return this.repos.company.findAll();
  }

  getById(id: string): Company {
    const company = this.repos.company.findById(id);
    if (!company) throw new Error('Company not found');
    return company;
  }

  create(data: Partial<Company>): Company {
    if (data.taxCode) {
      const existing = this.repos.company.findByTaxCode(data.taxCode);
      if (existing) throw new Error('Tax code already registered');
    }
    return this.repos.company.save({
      id: crypto.randomUUID(),
      name: data.name || '',
      status: data.status ?? 1,
      createdAt: new Date(),
      ...data,
    });
  }

  update(id: string, data: Partial<Company>): Company {
    const company = this.getById(id);
    const updated = { ...company, ...data, updatedAt: new Date() };
    return this.repos.company.save(updated);
  }

  delete(id: string): void {
    this.repos.company.delete(id);
  }

  // ─── Status Lifecycle ───────────────────────────────────

  activate(id: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.activate(company));
  }

  suspend(id: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.suspend(company));
  }

  dissolve(id: string, reason?: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.dissolve(company, reason));
  }

  bankrupt(id: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.bankrupt(company));
  }

  convert(id: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.convert(company));
  }

  merge(id: string): Company {
    const company = this.getById(id);
    return this.repos.company.save(this.service.merge(company));
  }

  // ─── Legal Representatives ──────────────────────────────

  getLegalReps(companyId: string): LegalRepresentative[] {
    return this.repos.legalReps.findByCompanyId(companyId);
  }

  addLegalRep(companyId: string, data: Parameters<typeof this.repos.legalReps.save>[0]): LegalRepresentative {
    const entity = { ...data, id: crypto.randomUUID(), companyId, createdAt: new Date() };
    return this.repos.legalReps.save(entity);
  }

  updateLegalRep(id: string, data: Partial<LegalRepresentative>): LegalRepresentative | null {
    const existing = this.repos.legalReps.findById(id);
    if (!existing) return null;
    return this.repos.legalReps.save({ ...existing, ...data, updatedAt: new Date() });
  }

  deleteLegalRep(id: string): void {
    this.repos.legalReps.delete(id);
  }

  // ─── Capital Contributors ───────────────────────────────

  getCapitalContributors(companyId: string): CapitalContributor[] {
    return this.repos.capitalContributors.findByCompanyId(companyId);
  }

  addCapitalContributor(companyId: string, data: Partial<CapitalContributor>): CapitalContributor {
    const entity = {
      id: crypto.randomUUID(), companyId, createdAt: new Date(),
      contributorType: data.contributorType ?? 1,
      fullName: data.fullName ?? '',
      contributorCategory: data.contributorCategory ?? 1,
      capitalContribution: data.capitalContribution ?? 0,
      ownershipRatio: data.ownershipRatio ?? 0,
      contributionDate: data.contributionDate ?? new Date().toISOString().split('T')[0],
      isFounder: data.isFounder ?? false,
    };
    return this.repos.capitalContributors.save(entity);
  }

  // ─── Business Lines ────────────────────────────────────

  getBusinessLines(companyId: string): BusinessLine[] {
    return this.repos.businessLines.findByCompanyId(companyId);
  }

  addBusinessLine(companyId: string, data: Partial<BusinessLine>): BusinessLine {
    const entity = {
      id: crypto.randomUUID(), companyId, createdAt: new Date(),
      vsicCode: data.vsicCode ?? '',
      vsicLevel: data.vsicLevel ?? 4,
      name: data.name ?? '',
      isPrimary: data.isPrimary ?? false,
      startDate: data.startDate ?? new Date().toISOString().split('T')[0],
    };
    return this.repos.businessLines.save(entity);
  }

  // ─── Bank Accounts ──────────────────────────────────────

  getBankAccounts(companyId: string): CompanyBankAccount[] {
    return this.repos.bankAccounts.findByCompanyId(companyId);
  }

  addBankAccount(companyId: string, data: Partial<CompanyBankAccount>): CompanyBankAccount {
    const entity = {
      id: crypto.randomUUID(), companyId, createdAt: new Date(), isActive: true,
      accountNumber: data.accountNumber ?? '',
      accountName: data.accountName ?? '',
      bankName: data.bankName ?? '',
      currencyCode: data.currencyCode ?? 'VND',
      isPrimaryTaxPayment: data.isPrimaryTaxPayment ?? false,
      openedDate: data.openedDate ?? new Date().toISOString().split('T')[0],
    };
    return this.repos.bankAccounts.save(entity);
  }
}
