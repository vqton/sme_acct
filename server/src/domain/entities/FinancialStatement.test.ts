import { describe, it, expect } from 'vitest';
import {
  generateFinancialStatementLine,
  resolveFormulaLines,
  getB01TTSMapping,
  getB02KQHDMapping,
  getB03LCTTMapping,
  generateCashFlowStatementLine,
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

  describe('B03-DN (cash flow) mapping', () => {
    it('returns mapping with operating, investing, financing sections', () => {
      const rules = getB03LCTTMapping();
      expect(rules.length).toBeGreaterThan(0);
      const op = rules.find((r) => r.code === '20');
      expect(op).toBeDefined();
      expect(op!.name).toContain('HĐKD');
      const inv = rules.find((r) => r.code === '30');
      expect(inv).toBeDefined();
      const fin = rules.find((r) => r.code === '40');
      expect(fin).toBeDefined();
    });

    it('computes working capital change for AR decrease as cash inflow', () => {
      const current = [makeBal('131', 100000000, 0)];
      const previous = [makeBal('131', 150000000, 0)];
      const rules = getB03LCTTMapping();
      const arRule = rules.find((r) => r.code === '09')!;
      const line = generateCashFlowStatementLine(arRule, current, previous, []);
      expect(line.currentPeriod).toBe(50000000);
    });

    it('computes working capital change for AR increase as cash outflow', () => {
      const current = [makeBal('131', 200000000, 0)];
      const previous = [makeBal('131', 150000000, 0)];
      const rules = getB03LCTTMapping();
      const arRule = rules.find((r) => r.code === '09')!;
      const line = generateCashFlowStatementLine(arRule, current, previous, []);
      expect(line.currentPeriod).toBe(-50000000);
    });

    it('computes inventory decrease as cash inflow', () => {
      const current = [makeBal('156', 300000000, 0)];
      const previous = [makeBal('156', 400000000, 0)];
      const rules = getB03LCTTMapping();
      const invRule = rules.find((r) => r.code === '10')!;
      const line = generateCashFlowStatementLine(invRule, current, previous, []);
      expect(line.currentPeriod).toBe(100000000);
    });

    it('computes AP increase as cash inflow', () => {
      const current = [makeBal('331', 0, 80000000)];
      const previous = [makeBal('331', 0, 50000000)];
      const rules = getB03LCTTMapping();
      const apRule = rules.find((r) => r.code === '11')!;
      const line = generateCashFlowStatementLine(apRule, current, previous, []);
      expect(line.currentPeriod).toBe(30000000);
    });

    it('computes depreciation add-back from accumulated depreciation change', () => {
      const current = [makeBal('214', 0, 80000000)];
      const previous = [makeBal('214', 0, 50000000)];
      const rules = getB03LCTTMapping();
      const deprRule = rules.flatMap((r) => [r, ...(r.children ?? [])]).find((r) => r.code === '03')!;
      const line = generateCashFlowStatementLine(deprRule, current, previous, []);
      expect(line.currentPeriod).toBe(30000000);
    });

    it('computes net profit from P&L accounts', () => {
      const current = [
        makeBal('511', 0, 500000000),
        makeBal('632', 300000000, 0),
        makeBal('642', 50000000, 0),
        makeBal('8211', 25000000, 0),
      ];
      const previous: AccountBalance[] = [];
      const rules = getB03LCTTMapping();
      const profitRule = rules.find((r) => r.code === '01')!;
      const line = generateCashFlowStatementLine(profitRule, current, previous, []);
      expect(line.currentPeriod).toBe(125000000);
    });

    it('computes opening cash from 111+112 opening balances', () => {
      const current = [makeBal('111', 100000000, 0)];
      const previous = [makeBal('111', 50000000, 0)];
      const rules = getB03LCTTMapping();
      const openCashRule = rules.find((r) => r.code === '51')!;
      const line = generateCashFlowStatementLine(openCashRule, current, previous, []);
      expect(line.currentPeriod).toBe(50000000);
    });

    it('computes closing cash as net flow + opening + FX', () => {
      const profit = { code: '01', name: 'LNTT', currentPeriod: 100000, previousPeriod: 0 } as FinancialStatementLine;
      const operating = { code: '20', name: 'HĐKD', currentPeriod: 60000, previousPeriod: 0 } as FinancialStatementLine;
      const investing = { code: '30', name: 'HĐĐT', currentPeriod: 30000, previousPeriod: 0 } as FinancialStatementLine;
      const financing = { code: '40', name: 'HĐTC', currentPeriod: 10000, previousPeriod: 0 } as FinancialStatementLine;
      const openCash = { code: '51', name: 'Tien dau ky', currentPeriod: 50000, previousPeriod: 0 } as FinancialStatementLine;
      const fx = { code: '52', name: 'TG', currentPeriod: 0, previousPeriod: 0 } as FinancialStatementLine;
      const netFlow = { code: '50', name: 'LCT trong ky', currentPeriod: 0, previousPeriod: 0 } as FinancialStatementLine;
      const closing = { code: '60', name: 'Tien cuoi ky', currentPeriod: 0, previousPeriod: 0 } as FinancialStatementLine;
      const lines = [profit, openCash, fx, operating, investing, financing, netFlow, closing];
      resolveFormulaLines(lines, FinancialStatementType.B03_DN);
      expect(closing.currentPeriod).toBe(150000);
    });
  });
});
