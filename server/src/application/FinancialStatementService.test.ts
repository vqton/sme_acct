import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { FinancialStatementService } from './FinancialStatementService.js';
import {
  AccountCategory, AccountNature, AccountType, JournalEntryType,
} from '../domain/enums/AccountEnums.js';
import { FinancialStatementType } from '../domain/entities/FinancialStatement.js';

describe('FinancialStatementService', () => {
  let db: Database.Database;
  let service: FinancialStatementService;
  let ledgerRepo: SQLiteLedgerRepository;
  let fiscalRepo: SQLiteFiscalPeriodRepository;
  let companyRepo: SQLiteCompanyRepository;
  let accountRepo: SQLiteAccountRepository;
  let companyId: number;
  let periodId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    ledgerRepo = new SQLiteLedgerRepository(db);
    fiscalRepo = new SQLiteFiscalPeriodRepository(db);
    companyRepo = new SQLiteCompanyRepository(db);
    accountRepo = new SQLiteAccountRepository(db);

    service = new FinancialStatementService(ledgerRepo, fiscalRepo, companyRepo);

    companyId = companyRepo.save({ id: 0, name: 'BCTC Test Co', status: 1, createdAt: new Date() }).id;

    const cashAcct = accountRepo.save({
      id: 0, companyId, accountNumber: '111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: 1, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: true, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    const revAcct = accountRepo.save({
      id: 0, companyId, accountNumber: '511',
      name: 'Doanh thu', category: AccountCategory.DoanhThu,
      nature: 2, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: true, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    const cogsAcct = accountRepo.save({
      id: 0, companyId, accountNumber: '632',
      name: 'Giá vốn', category: AccountCategory.ChiPhi,
      nature: 1, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: true, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    const febPeriod = fiscalRepo.save({
      id: 0, companyId, year: 2026, month: 2,
      periodName: 'Tháng 2/2026', startDate: '2026-02-01', endDate: '2026-02-28',
      status: 3, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    const febPeriodId = febPeriod.id;

    const period = fiscalRepo.save({
      id: 0, companyId, year: 2026, month: 3,
      periodName: 'Tháng 3/2026', startDate: '2026-03-01', endDate: '2026-03-31',
      status: 1, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    periodId = period.id;

    ledgerRepo.saveBalance({
      accountId: cashAcct.id, accountNumber: '111', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 100000000, periodCredit: 0,
      closingDebit: 100000000, closingCredit: 0,
    });

    ledgerRepo.saveBalance({
      accountId: revAcct.id, accountNumber: '511', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 0, periodCredit: 500000000,
      closingDebit: 0, closingCredit: 500000000,
    });

    ledgerRepo.saveBalance({
      accountId: cogsAcct.id, accountNumber: '632', companyId, periodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 300000000, periodCredit: 0,
      closingDebit: 300000000, closingCredit: 0,
    });

    ledgerRepo.saveBalance({
      accountId: cashAcct.id, accountNumber: '111', companyId,
      periodId: febPeriodId,
      openingDebit: 0, openingCredit: 0,
      periodDebit: 50000000, periodCredit: 0,
      closingDebit: 50000000, closingCredit: 0,
    });
  });

  afterAll(() => db.close());

  it('generates balance sheet with cash asset', () => {
    const bs = service.generateBalanceSheet(companyId, periodId);
    expect(bs.type).toBe(FinancialStatementType.B01_DN);
    expect(bs.companyName).toBe('BCTC Test Co');
    expect(bs.lines.length).toBeGreaterThan(0);

    const ca = bs.lines.find((l) => l.code === '100');
    expect(ca).toBeDefined();
    const cash = ca!.children?.find((c) => c.code === '110');
    expect(cash).toBeDefined();
    expect(cash!.currentPeriod).toBe(100000000);
  });

  it('generates income statement with revenue and COGS', () => {
    const is = service.generateIncomeStatement(companyId, periodId);
    expect(is.type).toBe(FinancialStatementType.B02_DN);

    const rev = is.lines.find((l) => l.code === '01');
    expect(rev).toBeDefined();
    expect(rev!.currentPeriod).toBe(500000000);

    const cogs = is.lines.find((l) => l.code === '11');
    expect(cogs).toBeDefined();
    expect(cogs!.currentPeriod).toBe(-300000000);

    const gp = is.lines.find((l) => l.code === '20');
    expect(gp!.currentPeriod).toBe(200000000);
  });

  it('includes previous period data', () => {
    const bs = service.generateBalanceSheet(companyId, periodId);
    const ca = bs.lines.find((l) => l.code === '100')!;
    const cash = ca.children?.find((c) => c.code === '110')!;
    expect(cash.previousPeriod).toBe(50000000);
  });

  it('throws for unknown period', () => {
    expect(() => service.generateBalanceSheet(companyId, 9999)).toThrow('not found');
  });

  it('throws for period not belonging to company', () => {
    expect(() => service.generateBalanceSheet(9999, periodId)).toThrow('does not belong');
  });
});
