import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { AccountingService } from './AccountingService.js';
import {
  AccountCategory, AccountNature, AccountType, AccountingRegime, JournalEntryType,
  STANDARD_ACCOUNTS_TT99, STANDARD_ACCOUNTS_TT133,
} from '../domain/enums/AccountEnums.js';

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
      auditLogs: new SQLiteAuditLogRepository(db),
    };
    service = new AccountingService(repos);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Acct Test Co', status: 1, createdAt: new Date() }).id;

    accountId = repos.accounts.save({
      id: 0, companyId, accountNumber: '1111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    }).id;

    repos.accounts.save({
      id: 0, companyId, accountNumber: '5111',
      name: 'Doanh thu', category: AccountCategory.DoanhThu,
      nature: AccountNature.DuCo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
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

  // ─── Account Seeding ──────────────────────────────────────

  it('seeds TT 99 standard accounts', () => {
    const cRepo = new SQLiteCompanyRepository(db);
    const seedCoId = cRepo.save({ id: 0, name: 'Seed TT99 Co', status: 1, createdAt: new Date() }).id;
    const accounts = service.seedStandardAccounts(seedCoId);
    expect(accounts.length).toBe(184);
    expect(accounts[0].accountNumber).toBe('111');
    expect(accounts.every((a) => a.isSystem)).toBe(true);
  });

  it('seeds TT 133 standard accounts', () => {
    const cRepo = new SQLiteCompanyRepository(db);
    const seedCoId = cRepo.save({ id: 0, name: 'Seed TT133 Co', status: 1, createdAt: new Date() }).id;
    const accounts = service.seedStandardAccounts(seedCoId, AccountingRegime.TT133);
    expect(accounts.length).toBe(50);
  });

  it('idempotent — does not re-seed if accounts exist', () => {
    const accounts = service.seedStandardAccounts(companyId);
    expect(accounts.length).toBeGreaterThanOrEqual(2);
  });

  it('throws on unknown regime', () => {
    expect(() => service.seedStandardAccounts(0, 99 as AccountingRegime))
      .toThrow('Unsupported accounting regime');
  });

  // ─── Hierarchy Validation ──────────────────────────────────

  it('validates account hierarchy format', () => {
    const parent = service.createStandardAccount(companyId, { accountNumber: '113', name: 'Test', category: AccountCategory.TaiSan });
    const err = () => service.createStandardAccount(companyId, { accountNumber: '1131', name: 'Child', category: AccountCategory.TaiSan, parentId: 99999 });
    expect(err).toThrow('Parent account not found');
  });

  it('allows valid child accounts', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '999', name: 'Test Parent', category: AccountCategory.TaiSan });
    const child = service.createStandardAccount(companyId, { accountNumber: '9991', name: 'Test Child', category: AccountCategory.TaiSan, parentId: acc.id });
    expect(child.parentId).toBe(acc.id);
  });

  it('rejects circular parent reference', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '881', name: 'Circular Parent', category: AccountCategory.TaiSan });
    const child = service.createStandardAccount(companyId, { accountNumber: '8811', name: 'Circular Child', category: AccountCategory.TaiSan, parentId: acc.id });
    expect(() => service.updateAccount(child.id, { parentId: child.id }))
      .toThrow('account cannot be its own parent');
  });

  // ─── Posting Restriction ───────────────────────────────────

  it('allows posting to leaf accounts only', () => {
    const parent = service.createStandardAccount(companyId, { accountNumber: '771', name: 'Parent No Post', category: AccountCategory.TaiSan });
    service.createStandardAccount(companyId, { accountNumber: '7711', name: 'Leaf Can Post', category: AccountCategory.TaiSan, parentId: parent.id });
    expect(parent.allowTransactions).toBe(false);
    const leaf = service.listAccounts(companyId).find((a) => a.accountNumber === '7711');
    expect(leaf!.allowTransactions).toBe(true);
  });

  // ─── Audit Log ─────────────────────────────────────────────

  it('logs account creation', () => {
    const logs = service.getAuditLogs(companyId);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const creationLogs = logs.filter((l) => l.action === 'ACCOUNT_CREATE');
    expect(creationLogs.length).toBeGreaterThanOrEqual(1);
  });

  it('logs account updates', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '661', name: 'Audit Test', category: AccountCategory.TaiSan });
    service.updateAccount(acc.id, { name: 'Audit Test Updated' });
    const logs = service.getAuditLogs(companyId);
    const updateLogs = logs.filter((l) => l.action === 'ACCOUNT_UPDATE' && l.entityId === acc.id);
    expect(updateLogs.length).toBeGreaterThanOrEqual(1);
  });

  it('logs account deletion', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '662', name: 'Delete Audit', category: AccountCategory.TaiSan });
    service.deleteAccount(acc.id);
    const logs = service.getAuditLogs(companyId);
    const deleteLogs = logs.filter((l) => l.action === 'ACCOUNT_DELETE' && l.entityId === acc.id);
    expect(deleteLogs.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Existing Behaviors ────────────────────────────────────

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

  // ─── Deactivation Workflow ────────────────────────────────

  it('deactivates an account', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '781', name: 'To Deactivate', category: AccountCategory.TaiSan });
    const deactivated = service.deactivateAccount(acc.id, 'No longer needed');
    expect(deactivated.isActive).toBe(false);
    expect(deactivated.description).toContain('[DEACTIVATED]');
  });

  it('throws on deactivate account with ledger transactions', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '772', name: 'Has Txns', category: AccountCategory.TaiSan });
    service.createStandardAccount(companyId, { accountNumber: '7721', name: 'Has Txns Leaf', category: AccountCategory.TaiSan, parentId: acc.id });
    const deptParent = service.createStandardAccount(companyId, { accountNumber: '773', name: 'Dept Parent', category: AccountCategory.NoPhaiTra });
    service.createStandardAccount(companyId, { accountNumber: '7731', name: 'Dept Leaf', category: AccountCategory.NoPhaiTra, parentId: deptParent.id });
    const leaf = service.listAccounts(companyId).find((a) => a.accountNumber === '7721')!;
    const dept = service.listAccounts(companyId).find((a) => a.accountNumber === '7731')!;
    service.createJournalEntry({
      companyId, entryDate: '2026-01-15', entryType: JournalEntryType.ThuTien,
      description: 'Txn for deactivation test',
      lines: [
        { accountId: leaf.id, accountNumber: '7721', debitAmount: 100000, creditAmount: 0 },
        { accountId: dept.id, accountNumber: '7731', debitAmount: 0, creditAmount: 100000 },
      ],
    });
    expect(() => service.deactivateAccount(leaf.id)).toThrow('journal entry');
  });

  it('reactivates an account', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '776', name: 'To Reactivate', category: AccountCategory.TaiSan });
    service.deactivateAccount(acc.id, 'Temp deactivate');
    const reactivated = service.reactivateAccount(acc.id);
    expect(reactivated.isActive).toBe(true);
  });

  it('throws on deactivate parent with active children', () => {
    const parent = service.createStandardAccount(companyId, { accountNumber: '774', name: 'Parent With Kids', category: AccountCategory.TaiSan });
    service.createStandardAccount(companyId, { accountNumber: '7741', name: 'Kid', category: AccountCategory.TaiSan, parentId: parent.id });
    expect(() => service.deactivateAccount(parent.id)).toThrow('active child accounts');
  });

  // ─── Deletion with Transaction Check ──────────────────────

  it('throws on delete account with ledger transactions', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '775', name: 'Del Has Txns', category: AccountCategory.TaiSan });
    service.createStandardAccount(companyId, { accountNumber: '7751', name: 'Del Has Txns Leaf', category: AccountCategory.TaiSan, parentId: acc.id });
    const deptParent = service.createStandardAccount(companyId, { accountNumber: '778', name: 'Del Dept Parent', category: AccountCategory.NoPhaiTra });
    service.createStandardAccount(companyId, { accountNumber: '7781', name: 'Del Dept Leaf', category: AccountCategory.NoPhaiTra, parentId: deptParent.id });
    const leaf = service.listAccounts(companyId).find((a) => a.accountNumber === '7751')!;
    const dept = service.listAccounts(companyId).find((a) => a.accountNumber === '7781')!;
    service.createJournalEntry({
      companyId, entryDate: '2026-01-15', entryType: JournalEntryType.ThuTien,
      description: 'Txn for delete test',
      lines: [
        { accountId: leaf.id, accountNumber: '7751', debitAmount: 200000, creditAmount: 0 },
        { accountId: dept.id, accountNumber: '7781', debitAmount: 0, creditAmount: 200000 },
      ],
    });
    expect(() => service.deleteAccount(leaf.id)).toThrow('journal entry');
  });

  it('deletes account with no transactions', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '779', name: 'Safe Delete', category: AccountCategory.TaiSan });
    expect(() => service.deleteAccount(acc.id)).not.toThrow();
  });

  // ─── Paginated Search ─────────────────────────────────────

  it('searches accounts with pagination', () => {
    const result = service.searchAccounts(companyId, 'tiền', { page: 1, pageSize: 10 });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('filters accounts by category', () => {
    const result = service.searchAccounts(companyId, '', { category: AccountCategory.TaiSan });
    expect(result.data.every((a) => a.category === AccountCategory.TaiSan)).toBe(true);
  });

  it('filters active accounts only', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '780', name: 'Inactive Filter', category: AccountCategory.TaiSan });
    service.deactivateAccount(acc.id);
    const result = service.searchAccounts(companyId, '', { activeOnly: true });
    expect(result.data.find((a) => a.id === acc.id)).toBeUndefined();
  });

  it('paginates correctly', () => {
    const all = service.searchAccounts(companyId, '', { page: 1, pageSize: 5 });
    expect(all.data.length).toBeLessThanOrEqual(5);
    expect(all.totalPages).toBeGreaterThanOrEqual(1);
  });

  // ─── Multi-Currency ──────────────────────────────────────

  it('creates account with default VND currency', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '790', name: 'VND Account', category: AccountCategory.TaiSan });
    expect(acc.currency).toBe('VND');
  });

  it('creates account with explicit currency', () => {
    const acc = service.createStandardAccount(companyId, {
      accountNumber: '791', name: 'USD Account', category: AccountCategory.TaiSan,
      currency: 'USD',
    });
    expect(acc.currency).toBe('USD');
  });

  it('creates account with EUR currency', () => {
    const acc = service.createStandardAccount(companyId, {
      accountNumber: '792', name: 'EUR Account', category: AccountCategory.TaiSan,
      currency: 'EUR',
    });
    expect(acc.currency).toBe('EUR');
  });

  it('cannot change account number after ledger transactions', () => {
    const acc = service.createStandardAccount(companyId, { accountNumber: '793', name: 'Locked Number', category: AccountCategory.TaiSan, allowTransactions: true });
    const offset = service.createStandardAccount(companyId, { accountNumber: '794', name: 'Offset', category: AccountCategory.NoPhaiTra, allowTransactions: true });
    service.createJournalEntry({
      companyId, entryDate: '2026-01-15', entryType: JournalEntryType.ThuTien,
      description: 'Lock number test',
      lines: [
        { accountId: acc.id, accountNumber: '793', debitAmount: 50000, creditAmount: 0 },
        { accountId: offset.id, accountNumber: '794', debitAmount: 0, creditAmount: 50000 },
      ],
    });
    expect(() => service.updateAccount(acc.id, { accountNumber: '793X' })).toThrow('account number');
  });
});
