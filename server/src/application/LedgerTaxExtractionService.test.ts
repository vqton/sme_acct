import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteLedgerRepository } from '../infrastructure/database/LedgerRepository.js';
import { SQLiteAccountRepository } from '../infrastructure/database/AccountRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { LedgerTaxExtractionService } from './LedgerTaxExtractionService.js';
import { TaxType } from '../domain/enums/TaxEnums.js';

describe('LedgerTaxExtractionService', () => {
  let db: Database.Database;
  let ledgerRepo: SQLiteLedgerRepository;
  let accountRepo: SQLiteAccountRepository;
  let service: LedgerTaxExtractionService;
  let companyId: number;
  let periodId = 1;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = OFF');
    runMigrations(db);

    ledgerRepo = new SQLiteLedgerRepository(db);
    accountRepo = new SQLiteAccountRepository(db);
    service = new LedgerTaxExtractionService(accountRepo, ledgerRepo);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'AutoFill Co', status: 1, createdAt: new Date() }).id;

    // Create standard VAT accounts
    const accts = [
      { id: 0, companyId, accountNumber: '1331', name: 'Thuế GTGT được khấu trừ', category: 3, nature: 1, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
      { id: 0, companyId, accountNumber: '33311', name: 'Thuế GTGT đầu ra', category: 6, nature: 2, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
      { id: 0, companyId, accountNumber: '5111', name: 'Doanh thu bán hàng hóa', category: 7, nature: 2, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
      { id: 0, companyId, accountNumber: '632', name: 'Giá vốn hàng bán', category: 11, nature: 1, type: 1, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
      { id: 0, companyId, accountNumber: '6421', name: 'Chi phí nhân viên', category: 11, nature: 1, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
      { id: 0, companyId, accountNumber: '3334', name: 'Thuế TNDN phải nộp', category: 6, nature: 2, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, createdAt: new Date() },
    ];
    const savedAccounts = accts.map(a => accountRepo.save(a));

    // Populate account_balances directly (what getAccountBalances reads)
    const insertBalance = db.prepare(`INSERT INTO account_balances (account_id, account_number, company_id, period_id, opening_debit, opening_credit, period_debit, period_credit, closing_debit, closing_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    insertBalance.run(savedAccounts[0].id, '1331', companyId, periodId, 0, 0, 3_000_000, 0, 3_000_000, 0);
    insertBalance.run(savedAccounts[1].id, '33311', companyId, periodId, 0, 0, 0, 10_000_000, 0, 10_000_000);
    insertBalance.run(savedAccounts[2].id, '5111', companyId, periodId, 0, 0, 0, 100_000_000, 0, 100_000_000);
    insertBalance.run(savedAccounts[3].id, '632', companyId, periodId, 0, 0, 60_000_000, 0, 60_000_000, 0);
    insertBalance.run(savedAccounts[4].id, '6421', companyId, periodId, 0, 0, 5_000_000, 0, 5_000_000, 0);
  });

  afterAll(() => db.close());

  it('extracts output VAT from ledger', () => {
    const result = service.extractVatForPeriod(companyId, periodId);
    expect(result.outputVat).toBe(10_000_000);
    expect(result.inputVat).toBe(3_000_000);
    expect(result.vatPayable).toBe(7_000_000);
  });

  it('extracts revenue and expenses for CIT', () => {
    const result = service.extractCitForPeriod(companyId, periodId);
    expect(result.revenue).toBe(100_000_000);
    expect(result.expenses).toBe(65_000_000);
    expect(result.netIncome).toBe(35_000_000);
  });

  it('finds VAT account numbers by prefix', () => {
    const vatAccounts = service.findAccountsByPrefix(companyId, '133');
    expect(vatAccounts.length).toBeGreaterThanOrEqual(1);
    expect(vatAccounts[0].accountNumber).toBe('1331');
  });

  it('returns zero when no VAT entries exist', () => {
    const result = service.extractVatForPeriod(companyId, 9999);
    expect(result.outputVat).toBe(0);
    expect(result.inputVat).toBe(0);
    expect(result.vatPayable).toBe(0);
  });

  it('extracts tax type data for all supported types', () => {
    const cit = service.extractTaxData(companyId, periodId, TaxType.CIT);
    expect(cit.cit!.revenue).toBe(100_000_000);

    const vat = service.extractTaxData(companyId, periodId, TaxType.VAT);
    expect(vat.vat!.outputVat).toBe(10_000_000);
  });
});
