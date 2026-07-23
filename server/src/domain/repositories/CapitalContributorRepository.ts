import type { CapitalContributor } from '../entities/CapitalContributor.js';

export interface CapitalContributorRepository {
  findById(id: number): CapitalContributor | null;
  findByCompanyId(companyId: number): CapitalContributor[];
  save(entity: CapitalContributor): CapitalContributor;
  delete(id: number): void;
}
