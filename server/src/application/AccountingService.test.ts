import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { AccountingService } from './AccountingService.js';
import { AccountCategory, AccountNature, AccountType, JournalEntryType } from '../domain/enums/AccountEnums.js';

describe('AccountingService', () => {
  let db: Database.Database;
  let service: AccountingService;
  let companyId: number;
  let accountId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const repos = {
      accounts: new SQLiteAccountRepository(db),
      journalEntries: new SQLiteJournalEntryRepository(db),
      ledger: new SQLiteLedgerRepository(db),
      fiscalPeriods: new SQLiteFiscalPeriodRepository(db),
    };
    service = new AccountingService(repos);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Acct Test Co', status: 1, createdAt: new Date() }).id;

    accountId = repos.accounts.save({
      id: 0, companyId, accountNumber: '1111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    }).id;

    repos.accounts.save({
      id: 0, companyId, accountNumber: '5111',
      name: 'Doanh thu', category: AccountCategory.DoanhThu,
      nature: AccountNature.DuCo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    repos.fiscalPeriods.save({
      id: 0, companyId, year: 2026, month: 1,
      periodName: 'Tháng 1/2026', startDate: '2026-01-01', endDate: '2026-01-31',
      status: 1, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
  });

  afterAll(() => db.close());

  it('seeds standard accounts', () => {
    const cRepo = new SQLiteCompanyRepository(db);
    const seedCoId = cRepo.save({ id: 0, name: 'Seed Co', status: 1, createdAt: new Date() }).id;
    const accounts = service.seedStandardAccounts(seedCoId);
    expect(accounts.length).toBeGreaterThan(50);
    const cash = accounts.find((a) => a.accountNumber === '111');
    expect(cash).toBeDefined();
    expect(cash!.isSystem).toBe(true);
  });

  it('creates journal entry', () => {
    const entry = service.createJournalEntry({
      companyId,
      entryDate: '2026-01-15',
      entryType: JournalEntryType.ThuTien,
      description: 'Thu tiền bán hàng',
      lines: [
        { accountId, accountNumber: '1111', debitAmount: 1000000, creditAmount: 0 },
        { accountId, accountNumber: '5111', debitAmount: 0, creditAmount: 1000000 },
      ],
    });
    expect(entry.id).toBeDefined();
    expect(entry.totalDebit).toBe(1000000);
    expect(entry.totalCredit).toBe(1000000);
  });

  it('posts journal entry to ledger', () => {
    const entry = service.createJournalEntry({
      companyId,
      entryDate: '2026-01-15',
      entryType: JournalEntryType.ThuTien,
      description: 'Test post',
      lines: [
        { accountId, accountNumber: '1111', debitAmount: 500000, creditAmount: 0 },
        { accountId, accountNumber: '5111', debitAmount: 0, creditAmount: 500000 },
      ],
    });
    const posted = service.postJournalEntry(entry.id, 1);
    expect(posted.isPosted).toBe(true);

    const ledger = service.getLedgerEntries(companyId, accountId);
    expect(ledger.length).toBeGreaterThanOrEqual(1);
  });

  it('lists accounts', () => {
    const accounts = service.listAccounts(companyId);
    expect(accounts.length).toBeGreaterThanOrEqual(2);
  });

  it('manages fiscal periods', () => {
    const period = service.openNewPeriod(companyId, 2026, 3);
    expect(period.status).toBe(1);
    expect(period.periodName).toBe('Tháng 3/2026');

    const current = service.getCurrentPeriod(companyId);
    expect(current).not.toBeNull();
  });
});
