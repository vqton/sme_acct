import type { Repository } from './Repository.js';
import type { TaxPeriod } from '../entities/TaxPeriod.js';

export interface TaxPeriodRepository extends Repository<TaxPeriod, number> {
  findByCompanyId(companyId: number): TaxPeriod[];
  findByYear(companyId: number, year: number): TaxPeriod[];
  findByMonth(companyId: number, year: number, month: number): TaxPeriod | null;
  findByQuarter(companyId: number, year: number, quarter: number): TaxPeriod | null;
  findOpenPeriods(companyId: number): TaxPeriod[];
  findCurrentPeriod(companyId: number): TaxPeriod | null;
  findLockedPeriods(companyId: number): TaxPeriod[];
  findFinalizedPeriods(companyId: number): TaxPeriod[];
}
