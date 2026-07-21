import type { Repository } from './Repository.js';
import type { FiscalPeriod } from '../entities/FiscalPeriod.js';

export interface FiscalPeriodRepository extends Repository<FiscalPeriod, string> {
  findByCompanyId(companyId: string): FiscalPeriod[];
  findByYear(companyId: string, year: number): FiscalPeriod[];
  findByMonth(companyId: string, year: number, month: number): FiscalPeriod | null;
  findOpenPeriods(companyId: string): FiscalPeriod[];
  findCurrentPeriod(companyId: string): FiscalPeriod | null;
  findLatestClosedPeriod(companyId: string): FiscalPeriod | null;
}
