import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteAccountRepository } from './AccountRepository.js';
import { AccountCategory, AccountNature, AccountType } from '../../domain/enums/AccountEnums.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';

describe('SQLiteAccountRepository', () => {
  let db: Database.Database;
  let repo: SQLiteAccountRepository;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteAccountRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    const company = companyRepo.save({ id: 0, name: 'Test Company', status: 1, createdAt: new Date() });
    companyId = company.id;
  });

  afterAll(() => db.close());

  it('saves and finds account', () => {
    const acc = repo.save({
      id: 0, companyId, accountNumber: '1111',
      name: 'Tiền mặt VNĐ', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });
    expect(acc.id).toBeDefined();

    const found = repo.findById(acc.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Tiền mặt VNĐ');
    expect(found!.accountNumber).toBe('1111');
    expect(found!.nature).toBe(AccountNature.DuNo);
  });

  it('finds by company id', () => {
    const accounts = repo.findByCompanyId(companyId);
    expect(accounts.length).toBeGreaterThanOrEqual(1);
  });

  it('finds by account number', () => {
    const found = repo.findByAccountNumber(companyId, '1111');
    expect(found).not.toBeNull();
  });

  it('searches accounts', () => {
    const results = repo.search(companyId, 'Tiền');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('deletes account', () => {
    const acc = repo.save({
      id: 0, companyId, accountNumber: '9999',
      name: 'Test Delete', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });
    repo.delete(acc.id);
    expect(repo.findById(acc.id)).toBeNull();
  });
});