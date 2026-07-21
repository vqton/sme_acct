import type { BusinessLine } from '../entities/BusinessLine.js';

export interface BusinessLineRepository {
  findById(id: string): BusinessLine | null;
  findByCompanyId(companyId: string): BusinessLine[];
  findPrimaryByCompanyId(companyId: string): BusinessLine | null;
  save(entity: BusinessLine): BusinessLine;
  delete(id: string): void;
}
