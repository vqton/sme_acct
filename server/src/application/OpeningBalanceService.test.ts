import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteOpeningBalanceRepository } from '../infrastructure/database/OpeningBalanceRepository.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { SQLiteFiscalPeriodRepository } from '../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteJournalEntryRepository } from '../infrastructure/database/JournalEntryRepository.js';
import { OpeningBalanceService } from './OpeningBalanceService.js';
import { AccountCategory, AccountNature, AccountType } from '../domain/enums/AccountEnums.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';
import type { Account } from '../domain/entities/Account.js';

describe('OpeningBalanceService', () => {
  let db: Database.Database;
  let service: OpeningBalanceService;
  let companyId: number;
  let periodId: number;
  let account1111: Account;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const obRepo = new SQLiteOpeningBalanceRepository(db);
    const accountRepo = new SQLiteAccountRepository(db);
    const companyRepo = new SQLiteCompanyRepository(db);
    const periodRepo = new SQLiteFiscalPeriodRepository(db);
    const ledgerRepo = new SQLiteLedgerRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const journalRepo = new SQLiteJournalEntryRepository(db);
    const userRepo = new SQLiteUserRepository(db);

    service = new OpeningBalanceService(obRepo, accountRepo, periodRepo, ledgerRepo, auditRepo, journalRepo);

    companyId = companyRepo.save({ id: 0, name: 'OB Test Co', status: 1, createdAt: new Date() }).id;

    userRepo.save({
      id: 0,
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin',
      passwordHash: 'x',
      isActive: true,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date(),
    });

    account1111 = accountRepo.save({
      id: 0, companyId, accountNumber: '1111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    accountRepo.save({
      id: 0, companyId, accountNumber: '3311',
      name: 'Phải trả NCC', category: AccountCategory.NoPhaiTra,
      nature: AccountNature.DuCo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    accountRepo.save({
      id: 0, companyId, accountNumber: '1121',
      name: 'TGNH VND', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });

    const period = periodRepo.save({
      id: 0, companyId, year: 2026, month: 1,
      periodName: 'Tháng 1/2026', startDate: '2026-01-01', endDate: '2026-01-31',
      status: 1, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    periodId = period.id;
  });

  afterAll(() => db.close());

  describe('createOpeningBalance', () => {
    it('creates opening balance with balanced lines', () => {
      const result = service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 1000000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 1000000 },
      ]);

      expect(result.header.batchNumber).toMatch(/^OB-2026-/);
      expect(result.header.totalDebit).toBe(1000000);
      expect(result.header.totalCredit).toBe(1000000);
      expect(result.lines.length).toBe(2);
    });

    it('throws on unbalanced entries', () => {
      expect(() => service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 1000000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 500000 },
      ])).toThrow('không khớp');
    });

    it('throws for inactive account', () => {
      const acct = service['accountRepo'].findById(account1111.id)!;
      service['accountRepo'].save({ ...acct, isActive: false, updatedAt: new Date() });
      expect(() => service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 100000, creditAmount: 0 },
      ])).toThrow('không hoạt động');
      service['accountRepo'].save({ ...acct, isActive: true, updatedAt: new Date() });
    });
  });

  describe('lockOpeningBalance', () => {
    it('locks and updates account opening balances', () => {
      const { header } = service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 2000000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 2000000 },
      ]);

      const locked = service.lockOpeningBalance(header.id, 1);
      expect(locked.isLocked).toBe(true);

      const acct = service['accountRepo'].findById(account1111.id);
      expect(acct?.openingDebit).toBe(2000000);
    });

    it('throws when locking already locked', () => {
      const { header } = service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 500000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 500000 },
      ]);
      service.lockOpeningBalance(header.id, 1);
      expect(() => service.lockOpeningBalance(header.id, 1)).toThrow('already locked');
    });
  });

  describe('getOpeningBalanceDetail', () => {
    it('returns header with lines', () => {
      const { header } = service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 3000000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 3000000 },
      ]);

      const detail = service.getOpeningBalanceDetail(header.id);
      expect(detail.header.batchNumber).toBe(header.batchNumber);
      expect(detail.lines.length).toBe(2);
    });

    it('throws for non-existent header', () => {
      expect(() => service.getOpeningBalanceDetail(99999)).toThrow('not found');
    });
  });

  describe('submitForApproval', () => {
    it('submits and returns to draft on rejection', () => {
      const { header } = service.createOpeningBalance(companyId, periodId, '2026-01-01', 1, [
        { accountId: account1111.id, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 1000000, creditAmount: 0 },
        { accountId: 2, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 1000000 },
      ]);

      const submitted = service.submitForApproval(header.id);
      expect(submitted.status).toBe(1);

      const rejected = service.rejectApproval(header.id, 1, 'Kiểm tra lại số dư');
      expect(rejected.status).toBe(0);
      expect(rejected.rejectionReason).toBe('Kiểm tra lại số dư');
    });
  });
});
