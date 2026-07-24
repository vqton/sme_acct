import { describe, it, expect } from 'vitest';
import {
  createTaxPeriod, openTaxPeriod, lockTaxPeriod,
  finalizeTaxPeriod, unlockTaxPeriod,
} from './TaxPeriod.js';
import { TaxPeriodStatus, VATMethod } from '../enums/TaxEnums.js';

describe('TaxPeriod', () => {
  const base = {
    companyId: 1,
    year: 2026,
    month: 6,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    type: 'monthly' as const,
    vatMethod: VATMethod.KhauTru,
  };

  describe('createTaxPeriod', () => {
    it('creates period with Open status', () => {
      const p = createTaxPeriod(base);
      expect(p.status).toBe(TaxPeriodStatus.Open);
      expect(p.periodName).toBe('Tháng 6/2026');
      expect(p.vatMethod).toBe(VATMethod.KhauTru);
      expect(p.isLockable).toBe(false);
    });

    it('generates quarterly period name', () => {
      const q = createTaxPeriod({ ...base, month: undefined, quarter: 2, type: 'quarterly' });
      expect(q.periodName).toBe('Quý 2/2026');
    });

    it('generates yearly period name', () => {
      const y = createTaxPeriod({ ...base, month: undefined, type: 'yearly' });
      expect(y.periodName).toBe('Năm 2026');
    });
  });

  describe('state transitions', () => {
    it('open → locked', () => {
      const p = createTaxPeriod(base);
      const locked = lockTaxPeriod(p);
      expect(locked.status).toBe(TaxPeriodStatus.Locked);
      expect(locked.lockedAt).toBeDefined();
    });

    it('locked → finalized', () => {
      const p = createTaxPeriod(base);
      const locked = lockTaxPeriod(p);
      const finalized = finalizeTaxPeriod(locked, 1);
      expect(finalized.status).toBe(TaxPeriodStatus.Finalized);
      expect(finalized.finalizedByUserId).toBe(1);
    });

    it('locked → unlocked (amended)', () => {
      const p = createTaxPeriod(base);
      const locked = lockTaxPeriod(p);
      const unlocked = unlockTaxPeriod(locked, 1, 'Need to adjust');
      expect(unlocked.status).toBe(TaxPeriodStatus.Amended);
      expect(unlocked.unlockReason).toBe('Need to adjust');
    });

    it('throws when locking already locked period', () => {
      const p = createTaxPeriod(base);
      const locked = lockTaxPeriod(p);
      expect(() => lockTaxPeriod(locked)).toThrow('already locked');
    });

    it('throws when finalizing non-locked period', () => {
      const p = createTaxPeriod(base);
      expect(() => finalizeTaxPeriod(p, 1)).toThrow('must be locked');
    });

    it('throws when finalizing already finalized period', () => {
      const p = createTaxPeriod(base);
      const locked = lockTaxPeriod(p);
      const finalized = finalizeTaxPeriod(locked, 1);
      expect(() => finalizeTaxPeriod(finalized, 1)).toThrow('already finalized');
    });
  });
});
