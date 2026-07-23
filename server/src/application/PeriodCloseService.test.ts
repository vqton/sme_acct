import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { PeriodCloseService } from './PeriodCloseService.js';
import {
  AccountCategory, AccountNature, AccountType, JournalEntryType, FiscalPeriodStatus,
} from '../domain/enums/AccountEnums.js';

describe('PeriodCloseService', () => {
  let db: Database.Database;
  let service: PeriodCloseService;
  let ledgerRepo: SQLiteLedgerRepository;
  let fiscalRepo: SQLiteFiscalPeriodRepository;
  let journalRepo: SQLiteJournalEntryRepository;
  let accountRepo: SQLiteAccountRepository;
  let companyId: number;
  let periodId: number;
  let nextPeriodId: number;
  let cashAcctId: number;
  let apAcctId: number;
  let revAcctId: number;
  let cogsAcctId: number;
  let retainAcctId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    ledgerRepo = new SQLiteLedgerRepository(db);
    fiscalRepo = new SQLiteFiscalPeriodRepository(db);
    journalRepo = new SQLiteJournalEntryRepository(db);
    accountRepo = new SQLiteAccountRepository(db);

    service = new PeriodCloseService(ledgerRepo, fiscalRepo, journalRepo, accountRepo);

    const compRepo = new SQLiteCompanyRepository(db);
    companyId = compRepo.save({ id: 0, name: 'Close Test Co', status: 1, createdAt: new Date() }).id;

    const base = (n: string, cat: number, nat: number) => ({
      companyId, accountNumber: n, category: cat,
      nature: nat, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: true, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    cashAcctId = accountRepo.save({ id: 0, name: 'Tiền mặt', ...base('111', AccountCategory.TaiSan, AccountNature.DuNo) }).id;
    apAcctId = accountRepo.save({ id: 0, name: 'Phải trả NB', ...base('331', AccountCategory.NoPhaiTra, AccountNature.DuCo) }).id;
    revAcctId = accountRepo.save({ id: 0, name: 'Doanh thu', ...base('511', AccountCategory.DoanhThu, AccountNature.DuCo) }).id;
    cogsAcctId = accountRepo.save({ id: 0, name: 'Giá vốn', ...base('632', AccountCategory.ChiPhi, AccountNature.DuNo) }).id;
    retainAcctId = accountRepo.save({ id: 0, name: 'LNST chưa PP', ...base('421', AccountCategory.VonChuSoHuu, AccountNature.DuCo) }).id;

    const period = fiscalRepo.save({
      id: 0, companyId, year: 2026, month: 3,
      periodName: 'Tháng 3/2026', startDate: '2026-03-01', endDate: '2026-03-31',
      status: FiscalPeriodStatus.Open, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    periodId = period.id;

    const next = fiscalRepo.save({
      id: 0, companyId, year: 2026, month: 4,
      periodName: 'Tháng 4/2026', startDate: '2026-04-01', endDate: '2026-04-30',
      status: FiscalPeriodStatus.Open, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    nextPeriodId = next.id;

    ledgerRepo.saveBalance({
      accountId: cashAcctId, accountNumber: '111', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 500000000, periodCredit: 0,
      closingDebit: 500000000, closingCredit: 0,
    });

    ledgerRepo.saveBalance({
      accountId: apAcctId, accountNumber: '331', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 0, periodCredit: 300000000,
      closingDebit: 0, closingCredit: 300000000,
    });

    ledgerRepo.saveBalance({
      accountId: revAcctId, accountNumber: '511', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 0, periodCredit: 500000000,
      closingDebit: 0, closingCredit: 500000000,
    });

    ledgerRepo.saveBalance({
      accountId: cogsAcctId, accountNumber: '632', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 300000000, periodCredit: 0,
      closingDebit: 300000000, closingCredit: 0,
    });

    ledgerRepo.saveBalance({
      accountId: retainAcctId, accountNumber: '421', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 0, periodCredit: 0,
      closingDebit: 0, closingCredit: 0,
    });
  });

  afterAll(() => db.close());

  describe('validateClose', () => {
    it('passes when all conditions met', () => {
      const result = service.validateClose(companyId, periodId);
      expect(result.valid).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('fails when unposted entries exist', () => {
      const entry = journalRepo.save({
        id: 0, companyId, entryNumber: 'CT-001', entryDate: '2026-03-15',
        periodId, entryType: JournalEntryType.Khac,
        description: 'Test', isPosted: false, isReversed: false,
        totalDebit: 0, totalCredit: 0, createdAt: new Date(),
        lines: [],
      });

      const result = service.validateClose(companyId, periodId);
      expect(result.valid).toBe(false);
      const postedCheck = result.checks.find((c) => c.name === 'All entries posted');
      expect(postedCheck?.passed).toBe(false);

      journalRepo.delete(entry.id);
    });

    it('fails for already closed period', () => {
      const closedPeriod = fiscalRepo.save({
        id: 0, companyId, year: 2025, month: 12,
        periodName: 'T12/2025', startDate: '2025-12-01', endDate: '2025-12-31',
        status: FiscalPeriodStatus.Closed, isOpeningBalancePeriod: false,
        createdAt: new Date(),
      });

      const result = service.validateClose(companyId, closedPeriod.id);
      const closedCheck = result.checks.find((c) => c.name === 'Period not already closed');
      expect(closedCheck?.passed).toBe(false);
    });
  });

  describe('carryForwardBalances', () => {
    it('carries forward closing balances as opening', () => {
      const carried = service.carryForwardBalances(companyId, periodId, nextPeriodId);
      expect(carried.length).toBeGreaterThan(0);

      const nextBal = ledgerRepo.getAccountBalance(companyId, cashAcctId, nextPeriodId);
      expect(nextBal?.openingDebit).toBe(500000000);
      expect(nextBal?.openingCredit).toBe(0);
    });

    it('throws for non-open target period', () => {
      const fakePeriod = fiscalRepo.save({
        id: 0, companyId, year: 2025, month: 11,
        periodName: 'T11/2025', startDate: '2025-11-01', endDate: '2025-11-30',
        status: FiscalPeriodStatus.Closed, isOpeningBalancePeriod: false,
        createdAt: new Date(),
      });

      expect(() => service.carryForwardBalances(companyId, periodId, fakePeriod.id))
        .toThrow('not open');
    });
  });

  describe('transferNetIncome', () => {
    it('transfers net income to retained earnings', () => {
      const netIncome = service.transferNetIncome(companyId, periodId, '421');
      expect(netIncome).toBe(200000000);

      const targetBal = ledgerRepo.getAccountBalance(companyId, retainAcctId, periodId);
      expect(targetBal?.closingCredit).toBe(200000000);
    });
  });
});
