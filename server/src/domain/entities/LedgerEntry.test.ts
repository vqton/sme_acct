import { describe, it, expect } from 'vitest';
import { calculateBalance } from './LedgerEntry.js';
import type { LedgerEntry } from './LedgerEntry.js';

describe('LedgerEntry', () => {
  describe('calculateBalance', () => {
    const makeEntry = (debit: number, credit: number): LedgerEntry => ({
      id: 1, companyId: 1, accountId: 1, accountNumber: '1111',
      periodId: 1, journalEntryId: 2, entryNumber: '0001',
      entryDate: '2026-01-15', description: 'Test',
      debitAmount: debit, creditAmount: credit,
      runningDebit: 0, runningCredit: 0, runningBalance: 0,
      createdAt: new Date(),
    });

    it('calculates balance from entries', () => {
      const entries = [makeEntry(1000, 0), makeEntry(0, 500)];
      const bal = calculateBalance(entries, 2000, 0, 'DuNo');

      expect(bal.periodDebit).toBe(1000);
      expect(bal.periodCredit).toBe(500);
      expect(bal.closingDebit).toBe(2500);
    });

    it('returns zeros for empty entries', () => {
      const bal = calculateBalance([], 0, 0, 'DuNo');
      expect(bal.periodDebit).toBe(0);
      expect(bal.periodCredit).toBe(0);
    });
  });
});
