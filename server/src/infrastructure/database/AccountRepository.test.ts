import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteAccountRepository } from './AccountRepository.js';
import { AccountCategory, AccountNature, AccountType } from '../../domain/enums/AccountEnums.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';

describe('SQLiteAccountRepository', () => {
  let db: Database.Database;
  let repo: SQLiteAccountRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteAccountRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({
      id: 'c1', name: 'Test Company', status: 1, createdAt: new Date(),
    });
  });

  afterAll(() => db.close());

  it('saves and finds account', () => {
    const acc = repo.save({
      id: 'a1', companyId: 'c1', accountNumber: '1111',
      name: 'Tiền mặt VNĐ', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });
    expect(acc.id).toBe('a1');

    const found = repo.findById('a1');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Tiền mặt VNĐ');
    expect(found!.accountNumber).toBe('1111');
    expect(found!.nature).toBe(AccountNature.DuNo);
  });

  it('finds by company id', () => {
    const accounts = repo.findByCompanyId('c1');
    expect(accounts.length).toBeGreaterThanOrEqual(1);
  });

  it('finds by account number', () => {
    const found = repo.findByAccountNumber('c1', '1111');
    expect(found).not.toBeNull();
  });

  it('searches accounts', () => {
    const results = repo.search('c1', 'Tiền');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('deletes account', () => {
    repo.save({
      id: 'a-del', companyId: 'c1', accountNumber: '9999',
      name: 'Test Delete', category: AccountCategory.TaiSan,
      nature: AccountNature.DuNo, type: AccountType.TaiKhoanChiTiet,
      isActive: true, isSystem: false, allowTransactions: true,
      openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0,
      closingDebit: 0, closingCredit: 0,
      createdAt: new Date(),
    });
    repo.delete('a-del');
    expect(repo.findById('a-del')).toBeNull();
  });
});
