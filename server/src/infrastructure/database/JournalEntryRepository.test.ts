import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteAccountRepository } from './AccountRepository.js';
import { SQLiteJournalEntryRepository } from './JournalEntryRepository.js';
import { SQLiteFiscalPeriodRepository } from './FiscalPeriodRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { AccountCategory, AccountNature, AccountType, JournalEntryType, FiscalPeriodStatus } from '../../domain/enums/AccountEnums.js';

describe('SQLiteJournalEntryRepository', () => {
  let db: Database.Database;
  let repo: SQLiteJournalEntryRepository;
  let accRepo: SQLiteAccountRepository;
  let periodRepo: SQLiteFiscalPeriodRepository;
  let accountId: string;
  let periodId: string;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteJournalEntryRepository(db);
    accRepo = new SQLiteAccountRepository(db);
    periodRepo = new SQLiteFiscalPeriodRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({
      id: 'c-je', name: 'Test Company JE', status: 1, createdAt: new Date(),
    });

    accountId = accRepo.save({
      id: 'je-acc-1', companyId: 'c-je', accountNumber: '1111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    }).id;

    periodId = periodRepo.save({
      id: 'je-per-1', companyId: 'c-je', year: 2026, month: 1,
      periodName: 'Tháng 1/2026',
      startDate: '2026-01-01', endDate: '2026-01-31',
      status: FiscalPeriodStatus.Open, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    }).id;
  });

  afterAll(() => db.close());

  it('saves and finds journal entry', () => {
    const entry = repo.save({
      id: 'je-1', companyId: 'c-je', entryNumber: 'PC202601-0001',
      entryDate: '2026-01-15', periodId, entryType: JournalEntryType.ThuTien,
      description: 'Thu tiền bán hàng',
      totalDebit: 1000, totalCredit: 1000,
      isPosted: false, isReversed: false,
      createdAt: new Date(),
      lines: [
        { id: 'jl-1', journalEntryId: 'je-1', accountId, accountNumber: '1111', debitAmount: 1000, creditAmount: 0 },
        { id: 'jl-2', journalEntryId: 'je-1', accountId: 'je-acc-1', accountNumber: '5111', debitAmount: 0, creditAmount: 1000 },
      ],
    });
    expect(entry.id).toBe('je-1');

    const found = repo.findById('je-1');
    expect(found).not.toBeNull();
    expect(found!.description).toBe('Thu tiền bán hàng');

    const lines = repo.findLinesByEntryId('je-1');
    expect(lines).toHaveLength(2);
  });

  it('generates next entry number', () => {
    const num = repo.getNextEntryNumber('c-je', 2026, 1);
    expect(num).toContain('PC202601');
  });

  it('finds by company and period', () => {
    const entries = repo.findByCompanyId('c-je');
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });
});
