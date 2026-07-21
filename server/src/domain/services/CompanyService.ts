import { Company, CompanyStatus, getStatusLabel } from '../entities/Company.js';

const TRANSITION_MAP: Record<CompanyStatus, CompanyStatus[]> = {
  [CompanyStatus.Active]: [CompanyStatus.Suspended, CompanyStatus.Dissolved, CompanyStatus.Bankrupt, CompanyStatus.Converting, CompanyStatus.Merged],
  [CompanyStatus.Suspended]: [CompanyStatus.Active, CompanyStatus.Dissolved, CompanyStatus.Bankrupt, CompanyStatus.Merged],
  [CompanyStatus.Dissolved]: [],
  [CompanyStatus.Bankrupt]: [],
  [CompanyStatus.Merged]: [],
  [CompanyStatus.Converting]: [CompanyStatus.Active, CompanyStatus.Suspended],
};

export function canTransition(from: CompanyStatus, to: CompanyStatus): boolean {
  return TRANSITION_MAP[from]?.includes(to) ?? false;
}

export function getValidTransitions(status: CompanyStatus): CompanyStatus[] {
  return [...(TRANSITION_MAP[status] ?? [])];
}

export function assertCanTransition(from: CompanyStatus, to: CompanyStatus): void {
  if (!canTransition(from, to)) {
    const fromLabel = getStatusLabel(from);
    const toLabel = getStatusLabel(to);
    throw new Error(`Cannot transition company from ${fromLabel} to ${toLabel}`);
  }
}

export class CompanyService {
  canActivate(company: Company): boolean {
    return company.status === CompanyStatus.Suspended;
  }

  canSuspend(company: Company): boolean {
    return company.status === CompanyStatus.Active;
  }

  canDissolve(company: Company): boolean {
    return company.status === CompanyStatus.Active || company.status === CompanyStatus.Suspended;
  }

  canBankrupt(company: Company): boolean {
    return company.status === CompanyStatus.Active || company.status === CompanyStatus.Suspended;
  }

  canConvert(company: Company): boolean {
    return company.status === CompanyStatus.Active;
  }

  canMerge(company: Company): boolean {
    return company.status !== CompanyStatus.Dissolved &&
           company.status !== CompanyStatus.Bankrupt &&
           company.status !== CompanyStatus.Merged;
  }

  activate(company: Company): Company {
    if (!this.canActivate(company)) {
      throw new Error(`Cannot activate company in status ${getStatusLabel(company.status)}`);
    }
    return { ...company, status: CompanyStatus.Active, updatedAt: new Date() };
  }

  suspend(company: Company): Company {
    if (!this.canSuspend(company)) {
      throw new Error(`Cannot suspend company in status ${getStatusLabel(company.status)}`);
    }
    return { ...company, status: CompanyStatus.Suspended, updatedAt: new Date() };
  }

  dissolve(company: Company, reason?: string): Company {
    if (!this.canDissolve(company)) {
      throw new Error(`Cannot dissolve company in status ${getStatusLabel(company.status)}`);
    }
    return {
      ...company,
      status: CompanyStatus.Dissolved,
      reasonForDissolution: reason,
      updatedAt: new Date(),
    };
  }

  bankrupt(company: Company): Company {
    if (!this.canBankrupt(company)) {
      throw new Error(`Cannot mark company bankrupt in status ${getStatusLabel(company.status)}`);
    }
    return { ...company, status: CompanyStatus.Bankrupt, updatedAt: new Date() };
  }

  convert(company: Company): Company {
    if (!this.canConvert(company)) {
      throw new Error(`Cannot convert company in status ${getStatusLabel(company.status)}`);
    }
    return { ...company, status: CompanyStatus.Converting, updatedAt: new Date() };
  }

  merge(company: Company): Company {
    if (!this.canMerge(company)) {
      throw new Error(`Cannot merge company in status ${getStatusLabel(company.status)}`);
    }
    return { ...company, status: CompanyStatus.Merged, updatedAt: new Date() };
  }
}
