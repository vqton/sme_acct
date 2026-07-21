import { describe, it, expect } from 'vitest';
import { createFiscalPeriod, closePeriod, openPeriod, lockPeriod } from './FiscalPeriod.js';
import { FiscalPeriodStatus } from '../enums/AccountEnums.js';

describe('FiscalPeriod', () => {
  const base = {
    companyId: 'c1',
    year: 2026,
    month: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  };

  describe('createFiscalPeriod', () => {
    it('creates period with open status', () => {
      const p = createFiscalPeriod(base);
      expect(p.status).toBe(FiscalPeriodStatus.Open);
      expect(p.periodName).toBe('Tháng 1/2026');
    });
  });

  describe('closePeriod', () => {
    it('closes an open period', () => {
      const p = createFiscalPeriod(base);
      const closed = closePeriod(p, 'user-1');
      expect(closed.status).toBe(FiscalPeriodStatus.Closed);
      expect(closed.closedAt).toBeDefined();
      expect(closed.closedByUserId).toBe('user-1');
    });

    it('throws when already closed', () => {
      const p = createFiscalPeriod(base);
      const closed = closePeriod(p, 'user-1');
      expect(() => closePeriod(closed, 'user-1')).toThrow('already closed');
    });

    it('throws when locked', () => {
      const p = createFiscalPeriod(base);
      const locked = lockPeriod(p);
      expect(() => closePeriod(locked, 'user-1')).toThrow('locked');
    });
  });
});
