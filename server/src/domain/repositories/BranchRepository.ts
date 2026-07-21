import type { Branch } from '../entities/Branch.js';

export interface BranchRepository {
  findById(id: string): Branch | null;
  findByCompanyId(companyId: string): Branch[];
  save(entity: Branch): Branch;
  delete(id: string): void;
}
