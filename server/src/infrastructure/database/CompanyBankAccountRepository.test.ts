import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteCompanyBankAccountRepository } from './CompanyBankAccountRepository.js';
import { createCompanyBankAccount } from '../../domain/entities/CompanyBankAccount.js';

describe('SQLiteCompanyBankAccountRepository', () => {
  let db: Database.Database;
  let repo: SQLiteCompanyBankAccountRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    db.prepare(`INSERT INTO companies (id, name, status) VALUES ('c1', 'Test Co', 1)`).run();
    repo = new SQLiteCompanyBankAccountRepository(db);
  });

  it('saves and finds bank account', () => {
    const ba = createCompanyBankAccount({
      companyId: 'c1',
      accountNumber: '1234567890',
      accountName: 'Test Co A/C',
      bankName: 'Vietcombank',
      bankBranch: 'CN TP HCM',
      swiftCode: 'VCBVVNVX',
      currencyCode: 'VND',
      isPrimaryTaxPayment: true,
      openedDate: '2024-01-15',
    });
    repo.save(ba);
    const found = repo.findById(ba.id);
    expect(found).not.toBeNull();
    expect(found!.accountNumber).toBe('1234567890');
    expect(found!.isPrimaryTaxPayment).toBe(true);
  });

  it('finds primary tax payment account', () => {
    const ba1 = createCompanyBankAccount({
      companyId: 'c1', accountNumber: '111', accountName: 'Primary', bankName: 'VCB',
      currencyCode: 'VND', isPrimaryTaxPayment: true, openedDate: '2024-01-15',
    });
    const ba2 = createCompanyBankAccount({
      companyId: 'c1', accountNumber: '222', accountName: 'Secondary', bankName: 'BIDV',
      currencyCode: 'VND', isPrimaryTaxPayment: false, openedDate: '2024-01-15',
    });
    repo.save(ba1);
    repo.save(ba2);

    const primary = repo.findPrimaryTaxPaymentByCompanyId('c1');
    expect(primary).not.toBeNull();
    expect(primary!.accountNumber).toBe('111');
  });

  it('returns null when no primary tax account set', () => {
    const ba = createCompanyBankAccount({
      companyId: 'c1', accountNumber: '111', accountName: 'A', bankName: 'VCB',
      currencyCode: 'VND', isPrimaryTaxPayment: false, openedDate: '2024-01-15',
    });
    repo.save(ba);
    expect(repo.findPrimaryTaxPaymentByCompanyId('c1')).toBeNull();
  });
});
