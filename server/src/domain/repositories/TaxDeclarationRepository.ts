import type { Repository } from './Repository.js';
import type { TaxDeclaration } from '../entities/TaxDeclaration.js';
import type { TaxType } from '../enums/TaxEnums.js';

export interface TaxDeclarationRepository extends Repository<TaxDeclaration, number> {
  findByCompanyId(companyId: number): TaxDeclaration[];
  findByPeriodId(periodId: number): TaxDeclaration[];
  findByTaxType(companyId: number, taxType: TaxType): TaxDeclaration[];
  findByYear(companyId: number, year: number): TaxDeclaration[];
  findByYearAndMonth(companyId: number, year: number, month: number): TaxDeclaration[];
  findLatestByPeriod(companyId: number, periodId: number): TaxDeclaration | null;
  findSubmitted(companyId: number): TaxDeclaration[];
  findDraftDeclarations(companyId: number): TaxDeclaration[];
}
