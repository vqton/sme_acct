import type { CapitalContributor } from '../entities/CapitalContributor.js';

export interface CapitalContributorRepository {
  findById(id: string): CapitalContributor | null;
  findByCompanyId(companyId: string): CapitalContributor[];
  save(entity: CapitalContributor): CapitalContributor;
  delete(id: string): void;
}
