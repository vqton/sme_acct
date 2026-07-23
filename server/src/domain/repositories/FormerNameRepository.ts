import type { FormerName } from '../entities/FormerName.js';

export interface FormerNameRepository {
  findByCompanyId(companyId: number): FormerName[];
  save(entity: FormerName): FormerName;
  delete(id: number): void;
}
