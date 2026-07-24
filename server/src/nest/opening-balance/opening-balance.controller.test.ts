import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { SQLiteOpeningBalanceRepository } from '../../infrastructure/database/OpeningBalanceRepository.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLiteFiscalPeriodRepository } from '../../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteJournalEntryRepository } from '../../infrastructure/database/JournalEntryRepository.js';
import { OpeningBalanceService } from '../../application/OpeningBalanceService.js';
import { OpeningBalanceController } from './opening-balance.controller.js';
import { AccountCategory, AccountNature, AccountType } from '../../domain/enums/AccountEnums.js';

describe('OpeningBalanceController', () => {
  let db: Database.Database;
  let controller: OpeningBalanceController;
  let companyId: number;
  let periodId: number;
  let accountId1111: number;
  let accountId3311: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = OFF');
    runMigrations(db);

    const obRepo = new SQLiteOpeningBalanceRepository(db);
    const accountRepo = new SQLiteAccountRepository(db);
    const periodRepo = new SQLiteFiscalPeriodRepository(db);
    const ledgerRepo = new SQLiteLedgerRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const journalRepo = new SQLiteJournalEntryRepository(db);
    const companyRepo = new SQLiteCompanyRepository(db);

    const service = new OpeningBalanceService(obRepo, accountRepo, periodRepo, ledgerRepo, auditRepo, journalRepo);
    controller = new OpeningBalanceController(service);

    companyId = companyRepo.save({ id: 0, name: 'OB Ctrl Co', status: 1, createdAt: new Date() }).id;

    accountId1111 = accountRepo.save({
      id: 0, companyId, accountNumber: '1111',
      name: 'Tiền mặt', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    }).id;

    accountId3311 = accountRepo.save({
      id: 0, companyId, accountNumber: '3311',
      name: 'Phải trả NCC', category: AccountCategory.NoPhaiTra,
      nature: AccountNature.DuCo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true, currency: 'VND',
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    }).id;

    const period = periodRepo.save({
      id: 0, companyId, year: 2026, month: 1,
      periodName: 'Tháng 1/2026', startDate: '2026-01-01', endDate: '2026-01-31',
      status: 1, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    periodId = period.id;
  });

  afterAll(() => db.close());

  it('POST /opening-balance creates with balanced lines', () => {
    const result = controller.create({
      companyId,
      periodId,
      entryDate: '2026-01-01',
      userId: 1,
      lines: [
        { accountId: accountId1111, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 1000000, creditAmount: 0 },
        { accountId: accountId3311, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 1000000 },
      ],
    });

    expect(result.header.batchNumber).toMatch(/^OB-2026-/);
    expect(result.header.totalDebit).toBe(1000000);
    expect(result.header.totalCredit).toBe(1000000);
    expect(result.lines.length).toBe(2);
  });

  it('GET /opening-balance/:id returns detail', () => {
    const { header } = controller.create({
      companyId,
      periodId,
      entryDate: '2026-01-01',
      userId: 1,
      lines: [
        { accountId: accountId1111, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 500000, creditAmount: 0 },
        { accountId: accountId3311, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 500000 },
      ],
    });

    const detail = controller.getDetail(String(header.id));
    expect(detail.header.id).toBe(header.id);
    expect(detail.lines.length).toBe(2);
  });

  it('GET /opening-balance/company/:companyId lists by company', () => {
    const list = controller.listByCompany(String(companyId));
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].companyId).toBe(companyId);
  });

  it('GET /opening-balance/company/:companyId/period/:periodId lists by period', () => {
    const list = controller.listByPeriod(String(companyId), String(periodId));
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].periodId).toBe(periodId);
  });

  it('POST /opening-balance/:id/lock locks and unlocks', () => {
    const { header } = controller.create({
      companyId,
      periodId,
      entryDate: '2026-01-01',
      userId: 1,
      lines: [
        { accountId: accountId1111, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 2000000, creditAmount: 0 },
        { accountId: accountId3311, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 2000000 },
      ],
    });

    const locked = controller.lock(String(header.id), { userId: 1 });
    expect(locked.isLocked).toBe(true);

    const unlocked = controller.unlock(String(header.id), { userId: 1 });
    expect(unlocked.isLocked).toBe(false);
  });

  it('POST /opening-balance/:id/submit submits and rejects', () => {
    const { header } = controller.create({
      companyId,
      periodId,
      entryDate: '2026-01-01',
      userId: 1,
      lines: [
        { accountId: accountId1111, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 1000000, creditAmount: 0 },
        { accountId: accountId3311, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 1000000 },
      ],
    });

    const submitted = controller.submit(String(header.id));
    expect(submitted.status).toBe(1);

    const approved = controller.approve(String(header.id), { userId: 1 });
    expect(approved.status).toBe(2);
  });

  it('DELETE /opening-balance/:id deletes draft', () => {
    const { header } = controller.create({
      companyId,
      periodId,
      entryDate: '2026-01-01',
      userId: 1,
      lines: [
        { accountId: accountId1111, accountNumber: '1111', accountName: 'Tiền mặt', debitAmount: 300000, creditAmount: 0 },
        { accountId: accountId3311, accountNumber: '3311', accountName: 'Phải trả NCC', debitAmount: 0, creditAmount: 300000 },
      ],
    });

    controller.delete(String(header.id));
    expect(() => controller.getDetail(String(header.id))).toThrow('not found');
  });
});
