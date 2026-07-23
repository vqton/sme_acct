import type { Repository } from './Repository.js';
import type { FiscalPeriod } from '../entities/FiscalPeriod.js';

export interface FiscalPeriodRepository extends Repository<FiscalPeriod, number> {
  findByCompanyId(companyId: number): FiscalPeriod[];
  findByYear(companyId: number, year: number): FiscalPeriod[];
  findByMonth(companyId: number, year: number, month: number): FiscalPeriod | null;
  findOpenPeriods(companyId: number): FiscalPeriod[];
  findCurrentPeriod(companyId: number): FiscalPeriod | null;
  findLatestClosedPeriod(companyId: number): FiscalPeriod | null;
}
