import type { LegalRepresentative } from '../entities/LegalRepresentative.js';

export interface LegalRepresentativeRepository {
  findById(id: string): LegalRepresentative | null;
  findByCompanyId(companyId: string): LegalRepresentative[];
  findPrimaryByCompanyId(companyId: string): LegalRepresentative | null;
  save(entity: LegalRepresentative): LegalRepresentative;
  delete(id: string): void;
}
