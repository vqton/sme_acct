import { describe, it, expect } from 'vitest';
import {
  generateFinancialStatementLine,
  resolveFormulaLines,
  getB01TTSMapping,
  getB02KQHDMapping,
  generateAllLines,
  FinancialStatementType,
} from './FinancialStatement.js';
import type { AccountBalance } from './LedgerEntry.js';
import type { FinancialStatementLine } from './FinancialStatement.js';

describe('FinancialStatement', () => {
  const makeBal = (acct: string, debit: number, credit: number): AccountBalance => ({
    accountId: 1, accountNumber: acct, companyId: 1, periodId: 1,
    openingDebit: 0, openingCredit: 0,
    periodDebit: 0, periodCredit: 0,
    closingDebit: debit, closingCredit: credit,
  });

  describe('B01-DN (balance sheet) mapping', () => {
    it('maps cash accounts to line 110 (Tiền)', () => {
      const balances = [
        makeBal('111', 50000000, 0),
        makeBal('112', 200000000, 0),
      ];
      const rules = getB01TTSMapping();
      const cashLine = rules.find((r) => r.code === '100')!;
      const line = generateFinancialStatementLine(cashLine, balances, []);
      const cash = line.children!.find((c) => c.code === '110')!;
      expect(cash.currentPeriod).toBe(250000000);
    });

    it('maps AR debit balance to line 131', () => {
      const balances = [makeBal('131', 150000000, 0)];
      const rules = getB01TTSMapping();
      const arParent = rules.find((r) => r.code === '100')!;
      const line = generateFinancialStatementLine(arParent, balances, []);
      const ar130 = line.children!.find((c) => c.code === '130')!;
      const ar131 = ar130.children!.find((c) => c.code === '131')!;
      expect(ar131.currentPeriod).toBe(150000000);
    });

    it('maps 331 debit balance to prepayment (line 132)', () => {
      const balances = [makeBal('331', 50000000, 0)];
      const rules = getB01TTSMapping();
      const caLine = rules.find((r) => r.code === '100')!;
      const line = generateFinancialStatementLine(caLine, balances, []);
      const ar130 = line.children!.find((c) => c.code === '130')!;
      const prepay = ar130.children!.find((c) => c.code === '132')!;
      expect(prepay.currentPeriod).toBe(50000000);
    });

    it('maps 331 credit balance to AP (line 310)', () => {
      const balances = [makeBal('331', 0, 80000000)];
      const rules = getB01TTSMapping();
      const apLine = rules.find((r) => r.code === '300')!;
      const line = generateFinancialStatementLine(apLine, balances, []);
      const ap310 = line.children!.find((c) => c.code === '310')!;
      expect(ap310.currentPeriod).toBe(80000000);
    });

    it('maps 214 accumulated depreciation as negative (line 220)', () => {
      const balances = [makeBal('214', 0, 50000000)];
      const rules = getB01TTSMapping();
      const ltaLine = rules.find((r) => r.code === '200')!;
      const line = generateFinancialStatementLine(ltaLine, balances, []);
      const depr = line.children!.find((c) => c.code === '220')!;
      expect(depr.currentPeriod).toBe(50000000);
    });

    it('returns zero when no balances match', () => {
      const line = generateFinancialStatementLine(
        { code: '999', name: 'Empty', accountNumbers: ['999'], sign: 1 },
        [], [],
      );
      expect(line.currentPeriod).toBe(0);
      expect(line.previousPeriod).toBe(0);
    });
  });

  describe('B02-DN (P&L) mapping', () => {
    it('maps revenue to positive value', () => {
      const balances = [makeBal('511', 0, 500000000)];
      const rules = getB02KQHDMapping();
      const revRule = rules.find((r) => r.code === '01')!;
      const line = generateFinancialStatementLine(revRule, balances, []);
      expect(line.currentPeriod).toBe(500000000);
    });

    it('maps cost of goods sold to negative', () => {
      const balances = [makeBal('632', 300000000, 0)];
      const rules = getB02KQHDMapping();
      const cogsRule = rules.find((r) => r.code === '11')!;
      const line = generateFinancialStatementLine(cogsRule, balances, []);
      expect(line.currentPeriod).toBe(-300000000);
    });

    it('calculates net revenue (doanh thu thuần)', () => {
      const balances = [
        makeBal('511', 0, 500000000),
        makeBal('521', 10000000, 0),
      ];
      const rules = getB02KQHDMapping();
      const lines = rules.map((r) => generateFinancialStatementLine(r, balances, []));
      const resolved = resolveFormulaLines(lines);
      const netLine = resolved.find((l) => l.code === '10')!;
      expect(netLine.currentPeriod).toBe(490000000);
    });

    it('calculates gross profit (lợi nhuận gộp)', () => {
      const balances = [
        makeBal('511', 0, 500000000),
        makeBal('521', 10000000, 0),
        makeBal('632', 300000000, 0),
      ];
      const rules = getB02KQHDMapping();
      const lines = rules.map((r) => generateFinancialStatementLine(r, balances, []));
      const resolved = resolveFormulaLines(lines);
      const gpLine = resolved.find((l) => l.code === '20')!;
      expect(gpLine.currentPeriod).toBe(190000000);
    });

    it('calculates full P&L with all components', () => {
      const balances = [
        makeBal('511', 0, 500000000),
        makeBal('521', 10000000, 0),
        makeBal('632', 300000000, 0),
        makeBal('642', 50000000, 0),
        makeBal('635', 10000000, 0),
        makeBal('515', 0, 5000000),
        makeBal('711', 0, 2000000),
        makeBal('811', 1000000, 0),
        makeBal('8211', 25000000, 0),
      ];
      const rules = getB02KQHDMapping();
      const lines = rules.map((r) => generateFinancialStatementLine(r, balances, []));
      const resolved = resolveFormulaLines(lines);

      expect(resolved.find((l) => l.code === '10')!.currentPeriod).toBe(490000000);
      expect(resolved.find((l) => l.code === '20')!.currentPeriod).toBe(190000000);
      expect(resolved.find((l) => l.code === '30')!.currentPeriod).toBe(135000000);
      expect(resolved.find((l) => l.code === '60')!.currentPeriod).toBe(111000000);
    });

    it('includes previous period comparison', () => {
      const current = [makeBal('511', 0, 600000000)];
      const previous = [makeBal('511', 0, 500000000)];
      const rule = getB02KQHDMapping().find((r) => r.code === '01')!;
      const line = generateFinancialStatementLine(rule, current, previous);
      expect(line.currentPeriod).toBe(600000000);
      expect(line.previousPeriod).toBe(500000000);
    });
  });

  describe('generateAllLines', () => {
    it('generates complete B01-DN statement', () => {
      const balances = [makeBal('111', 100000000, 0)];
      const result = generateAllLines(
        FinancialStatementType.B01_DN,
        balances, [],
        'Test Co', 'Q1 2026',
      );

      expect(result.type).toBe(FinancialStatementType.B01_DN);
      expect(result.companyName).toBe('Test Co');
      expect(result.periodLabel).toBe('Q1 2026');
      expect(result.generatedAt).toBeDefined();
      expect(result.lines.length).toBeGreaterThan(0);
    });

    it('generates complete B02-DN statement', () => {
      const balances = [makeBal('511', 0, 100000000)];
      const result = generateAllLines(
        FinancialStatementType.B02_DN,
        balances, [],
        'Test Co', 'Q1 2026',
      );

      expect(result.type).toBe(FinancialStatementType.B02_DN);
      expect(result.lines.length).toBeGreaterThan(0);
    });
  });
});
