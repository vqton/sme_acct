import type { FormerName } from '../entities/FormerName.js';

export interface FormerNameRepository {
  findByCompanyId(companyId: string): FormerName[];
  save(entity: FormerName): FormerName;
  delete(id: string): void;
}
