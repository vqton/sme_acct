import type { TaxPeriodRepository } from '../domain/repositories/TaxPeriodRepository.js';
import type { TaxPeriod } from '../domain/entities/TaxPeriod.js';
import { TaxPeriodStatus, VATMethod } from '../domain/enums/TaxEnums.js';
import { createTaxPeriod, lockTaxPeriod, finalizeTaxPeriod, unlockTaxPeriod } from '../domain/entities/TaxPeriod.js';

export class TaxPeriodService {
  constructor(private repo: TaxPeriodRepository) {}

  createPeriodsForYear(companyId: number, year: number, type: string): TaxPeriod[] {
    if (type === 'yearly') {
      const p = createTaxPeriod({
        companyId, year,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        type: 'yearly',
        vatMethod: VATMethod.KhauTru,
      });
      return [this.repo.save(p)];
    }

    if (type === 'quarterly') {
      const quarters = [
        { q: 1, start: `${year}-01-01`, end: `${year}-03-31` },
        { q: 2, start: `${year}-04-01`, end: `${year}-06-30` },
        { q: 3, start: `${year}-07-01`, end: `${year}-09-30` },
        { q: 4, start: `${year}-10-01`, end: `${year}-12-31` },
      ];
      return quarters.map(q => this.repo.save(
        createTaxPeriod({
          companyId, year, quarter: q.q,
          startDate: q.start, endDate: q.end,
          type: 'quarterly',
          vatMethod: VATMethod.KhauTru,
        })
      ));
    }

    const periods: TaxPeriod[] = [];
    for (let month = 1; month <= 12; month++) {
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const p = createTaxPeriod({
        companyId, year, month,
        startDate, endDate,
        type: 'monthly',
        vatMethod: VATMethod.KhauTru,
      });
      periods.push(this.repo.save(p));
    }
    return periods;
  }

  lockPeriod(periodId: number, userId: number): TaxPeriod {
    const p = this.repo.findById(periodId);
    if (!p) throw new Error('Period not found');
    const locked = lockTaxPeriod(p, userId);
    return this.repo.save(locked);
  }

  finalizePeriod(periodId: number, userId: number): TaxPeriod {
    const p = this.repo.findById(periodId);
    if (!p) throw new Error('Period not found');
    const finalized = finalizeTaxPeriod(p, userId);
    return this.repo.save(finalized);
  }

  unlockPeriod(periodId: number, userId: number, reason: string): TaxPeriod {
    const p = this.repo.findById(periodId);
    if (!p) throw new Error('Period not found');
    const unlocked = unlockTaxPeriod(p, userId, reason);
    return this.repo.save(unlocked);
  }

  getCurrentOpenPeriod(companyId: number): TaxPeriod | null {
    return this.repo.findCurrentPeriod(companyId);
  }

  getPeriodsByYear(companyId: number, year: number): TaxPeriod[] {
    return this.repo.findByYear(companyId, year);
  }
}
