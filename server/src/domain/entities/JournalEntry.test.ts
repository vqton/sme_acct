import { describe, it, expect } from 'vitest';
import { createJournalEntry, postJournalEntry, reverseJournalEntry } from './JournalEntry.js';
import { JournalEntryType } from '../enums/AccountEnums.js';

describe('JournalEntry', () => {
  const baseLines = [
    { accountId: 'a1', accountNumber: '1111', debitAmount: 1000, creditAmount: 0 },
    { accountId: 'a2', accountNumber: '5111', debitAmount: 0, creditAmount: 1000 },
  ];

  describe('createJournalEntry', () => {
    it('creates entry with balanced lines', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Thu tiền bán hàng',
        lines: baseLines,
      });

      expect(entry.id).toBeDefined();
      expect(entry.totalDebit).toBe(1000);
      expect(entry.totalCredit).toBe(1000);
      expect(entry.lines).toHaveLength(2);
      expect(entry.isPosted).toBe(false);
    });

    it('throws when lines are unbalanced', () => {
      expect(() => createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Unbalanced',
        lines: [
          { accountId: 'a1', accountNumber: '1111', debitAmount: 1000, creditAmount: 0 },
          { accountId: 'a2', accountNumber: '5111', debitAmount: 0, creditAmount: 500 },
        ],
      })).toThrow('Total debit must equal total credit');
    });

    it('assigns ids to lines', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Test',
        lines: baseLines,
      });

      expect(entry.lines[0].id).toBeDefined();
      expect(entry.lines[1].id).toBeDefined();
    });
  });

  describe('postJournalEntry', () => {
    it('posts a valid entry', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Test',
        lines: baseLines,
      });

      const posted = postJournalEntry(entry);
      expect(posted.isPosted).toBe(true);
      expect(posted.postedAt).toBeDefined();
    });

    it('throws when already posted', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Test',
        lines: baseLines,
      });

      const posted = postJournalEntry(entry);
      expect(() => postJournalEntry(posted)).toThrow('already posted');
    });

    it('throws when no lines', () => {
      expect(() => postJournalEntry({
        id: '1', companyId: 'c1', entryDate: '2026-01-15', periodId: 'p1',
        entryType: JournalEntryType.ThuTien, description: 'Test',
        entryNumber: '0001', totalDebit: 0, totalCredit: 0,
        isPosted: false, isReversed: false,
        createdAt: new Date(), lines: [],
      })).toThrow('at least one line');
    });
  });

  describe('reverseJournalEntry', () => {
    it('creates reversal entry with opposite amounts', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Test',
        lines: baseLines,
      });

      const posted = postJournalEntry(entry);
      const { reversal, original } = reverseJournalEntry(posted, 'user-1');

      expect(reversal.isPosted).toBe(true);
      expect(original.isReversed).toBe(true);
      expect(reversal.lines[0].debitAmount).toBe(0);
      expect(reversal.lines[0].creditAmount).toBe(1000);
      expect(reversal.lines[1].debitAmount).toBe(1000);
      expect(reversal.lines[1].creditAmount).toBe(0);
    });

    it('throws when entry not posted', () => {
      const entry = createJournalEntry({
        companyId: 'c1',
        entryDate: '2026-01-15',
        periodId: 'p1',
        entryType: JournalEntryType.ThuTien,
        description: 'Test',
        lines: baseLines,
      });

      expect(() => reverseJournalEntry(entry, 'user-1')).toThrow('Cannot reverse an unposted entry');
    });
  });
});
