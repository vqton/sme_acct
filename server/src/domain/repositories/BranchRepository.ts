import type { Branch } from '../entities/Branch.js';

export interface BranchRepository {
  findById(id: number): Branch | null;
  findByCompanyId(companyId: number): Branch[];
  save(entity: Branch): Branch;
  delete(id: number): void;
}
