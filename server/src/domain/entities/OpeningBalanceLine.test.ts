import { describe, it, expect } from 'vitest';
import { createOBLine, validateOBLine } from './OpeningBalanceLine.js';

describe('OpeningBalanceLine', () => {
  const base = {
    headerId: 1,
    companyId: 1,
    accountId: 10,
    accountNumber: '1111',
    accountName: 'Tiền mặt',
  };

  describe('createOBLine', () => {
    it('creates line with debit amount', () => {
      const line = createOBLine({ ...base, debitAmount: 1000000 });
      expect(line.debitAmount).toBe(1000000);
      expect(line.creditAmount).toBe(0);
    });

    it('creates line with credit amount', () => {
      const line = createOBLine({ ...base, creditAmount: 500000 });
      expect(line.creditAmount).toBe(500000);
      expect(line.debitAmount).toBe(0);
    });

    it('defaults to zero', () => {
      const line = createOBLine(base);
      expect(line.debitAmount).toBe(0);
      expect(line.creditAmount).toBe(0);
    });

    it('throws on negative debit', () => {
      expect(() => createOBLine({ ...base, debitAmount: -100 })).toThrow('cannot be negative');
    });

    it('throws on negative credit', () => {
      expect(() => createOBLine({ ...base, creditAmount: -100 })).toThrow('cannot be negative');
    });

    it('converts foreign currency to VND', () => {
      const line = createOBLine({
        ...base,
        foreignCurrencyCode: 'USD',
        foreignDebitAmount: 1000,
        exchangeRate: 25500,
      });
      expect(line.debitAmount).toBe(1000 * 25500);
      expect(line.foreignCurrencyCode).toBe('USD');
    });
  });

  describe('validateOBLine', () => {
    it('passes for valid debit-only line', () => {
      const line = createOBLine({ ...base, debitAmount: 1000 });
      expect(() => validateOBLine(line)).not.toThrow();
    });

    it('passes for valid credit-only line', () => {
      const line = createOBLine({ ...base, creditAmount: 1000 });
      expect(() => validateOBLine(line)).not.toThrow();
    });

    it('throws when both debit and credit present', () => {
      const line = createOBLine({ ...base, debitAmount: 500, creditAmount: 500 });
      expect(() => validateOBLine(line)).toThrow('cannot have both');
    });
  });
});
