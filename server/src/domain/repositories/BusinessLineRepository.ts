import type { BusinessLine } from '../entities/BusinessLine.js';

export interface BusinessLineRepository {
  findById(id: number): BusinessLine | null;
  findByCompanyId(companyId: number): BusinessLine[];
  findPrimaryByCompanyId(companyId: number): BusinessLine | null;
  save(entity: BusinessLine): BusinessLine;
  delete(id: number): void;
}
