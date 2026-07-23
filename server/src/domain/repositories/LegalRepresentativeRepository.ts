import type { LegalRepresentative } from '../entities/LegalRepresentative.js';

export interface LegalRepresentativeRepository {
  findById(id: number): LegalRepresentative | null;
  findByCompanyId(companyId: number): LegalRepresentative[];
  findPrimaryByCompanyId(companyId: number): LegalRepresentative | null;
  save(entity: LegalRepresentative): LegalRepresentative;
  delete(id: number): void;
}
