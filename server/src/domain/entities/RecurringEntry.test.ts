import { describe, it, expect } from 'vitest';
import { createRecurringTemplate, generateNextDate, evaluateFormula, RecurringFrequency } from './RecurringEntry.js';

describe('RecurringEntry', () => {
  describe('createRecurringTemplate', () => {
    it('creates template with defaults', () => {
      const tpl = createRecurringTemplate({
        companyId: 1,
        name: 'Khấu hao TSCĐ',
        entryType: 9,
        frequency: RecurringFrequency.Monthly,
        templateLines: [
          { accountId: 1, accountNumber: '642', debitFormula: '10000000', creditFormula: '' },
          { accountId: 2, accountNumber: '214', debitFormula: '', creditFormula: '10000000' },
        ],
        startDate: '2026-01-31',
      });

      expect(tpl.name).toBe('Khấu hao TSCĐ');
      expect(tpl.isActive).toBe(true);
      expect(tpl.nextGenerationDate).toBe('2026-01-31');
      expect(tpl.templateLines).toHaveLength(2);
    });
  });

  describe('generateNextDate', () => {
    it('adds one month for monthly frequency', () => {
      const next = generateNextDate('2026-01-15', RecurringFrequency.Monthly, 15);
      expect(next).toBe('2026-02-15');
    });

    it('handles year boundary', () => {
      const next = generateNextDate('2026-12-01', RecurringFrequency.Monthly, 1);
      expect(next).toBe('2027-01-01');
    });

    it('handles end-of-month clamping', () => {
      const next = generateNextDate('2026-01-31', RecurringFrequency.Monthly, 31);
      expect(next).toBe('2026-02-28');
    });

    it('adds 3 months for quarterly', () => {
      const next = generateNextDate('2026-01-15', RecurringFrequency.Quarterly, 15);
      expect(next).toBe('2026-04-15');
    });

    it('adds 12 months for annually', () => {
      const next = generateNextDate('2026-01-15', RecurringFrequency.Annually, 15);
      expect(next).toBe('2027-01-15');
    });
  });

  describe('evaluateFormula', () => {
    it('returns fixed value for plain number', () => {
      expect(evaluateFormula('10000000', {})).toBe(10000000);
    });

    it('evaluates parameter reference', () => {
      expect(evaluateFormula('{salary}', { salary: 15000000 })).toBe(15000000);
    });

    it('evaluates multiplier formula', () => {
      expect(evaluateFormula('2 * {rate}', { rate: 5000000 })).toBe(10000000);
    });

    it('evaluates sum of parts', () => {
      expect(evaluateFormula('10000000 + 5000000', {})).toBe(15000000);
    });

    it('returns 0 for empty formula', () => {
      expect(evaluateFormula('', {})).toBe(0);
    });
  });
});
