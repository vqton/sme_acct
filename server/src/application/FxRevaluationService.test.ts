import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { FxRevaluationService } from './FxRevaluationService.js';
import { FiscalPeriodStatus } from '../domain/enums/AccountEnums.js';

describe('FxRevaluationService', () => {
  let db: Database.Database;
  let service: FxRevaluationService;
  let ledgerRepo: SQLiteLedgerRepository;
  let accountRepo: SQLiteAccountRepository;
  let companyId: number;
  let periodId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    ledgerRepo = new SQLiteLedgerRepository(db);
    accountRepo = new SQLiteAccountRepository(db);
    service = new FxRevaluationService(ledgerRepo, accountRepo);

    const compRepo = new SQLiteCompanyRepository(db);
    companyId = compRepo.save({ id: 0, name: 'FX Co', status: 1, createdAt: new Date() }).id;

    const fiscalRepo = new SQLiteFiscalPeriodRepository(db);
    const period = fiscalRepo.save({
      id: 0, companyId, year: 2026, month: 3,
      periodName: 'Tháng 3/2026', startDate: '2026-03-01', endDate: '2026-03-31',
      status: FiscalPeriodStatus.Open, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    periodId = period.id;

    const base = (n: string, name: string, cat: number, nat: number, cur: string) => ({
      companyId, accountNumber: n, category: cat, name,
      nature: nat, type: 2,
      isActive: true, isSystem: true, allowTransactions: true, currency: cur,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    const usdAcct = accountRepo.save({ id: 0, ...base('1121', 'TGNH USD', 1, 1, 'USD') });
    const eurAcct = accountRepo.save({ id: 0, ...base('1122', 'TGNH EUR', 1, 1, 'EUR') });

    ledgerRepo.saveBalance({
      accountId: usdAcct.id, accountNumber: '1121', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 230000000, periodCredit: 0,
      closingDebit: 230000000, closingCredit: 0,
    });

    ledgerRepo.saveBalance({
      accountId: eurAcct.id, accountNumber: '1122', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 270000000, periodCredit: 0,
      closingDebit: 270000000, closingCredit: 0,
    });
  });

  afterAll(() => db.close());

  describe('previewRevaluation', () => {
    it('computes FX gain when rate increases', () => {
      const result = service.previewRevaluation(companyId, periodId, {
        USD: 25000,
        EUR: 28000,
      }, { USD: 23000, EUR: 27000 });

      expect(result.lines.length).toBe(2);
      const usdLine = result.lines.find((l) => l.currency === 'USD')!;
      expect(usdLine.fxGainLoss).toBeGreaterThan(0);
      expect(usdLine.isGain).toBe(true);
    });

    it('computes FX loss when rate decreases', () => {
      const result = service.previewRevaluation(companyId, periodId, {
        USD: 22000,
        EUR: 27000,
      }, { USD: 23000, EUR: 27000 });

      const usdLine = result.lines.find((l) => l.currency === 'USD')!;
      expect(usdLine.isGain).toBe(false);
      expect(usdLine.fxGainLoss).toBeGreaterThan(0);
    });

    it('returns zero delta when rates unchanged', () => {
      const result = service.previewRevaluation(companyId, periodId, {
        USD: 23000,
        EUR: 27000,
      }, { USD: 23000, EUR: 27000 });

      expect(result.totalGain).toBe(0);
      expect(result.totalLoss).toBe(0);
    });
  });

  describe('getForeignCurrencyAccounts', () => {
    it('returns only non-VND accounts', () => {
      const fcAccounts = service.getForeignCurrencyAccounts(companyId);
      expect(fcAccounts.length).toBe(2);
      expect(fcAccounts.every((a) => a.currency !== 'VND')).toBe(true);
    });
  });
});
