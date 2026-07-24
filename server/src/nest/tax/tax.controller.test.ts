import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { SQLiteTaxDeclarationRepository } from '../../infrastructure/database/TaxDeclarationRepository.js';
import { SQLiteTaxPeriodRepository } from '../../infrastructure/database/TaxPeriodRepository.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { TaxDeclarationService } from '../../application/TaxDeclarationService.js';
import { TaxPeriodService } from '../../application/TaxPeriodService.js';
import { TaxCalendarService } from '../../application/TaxCalendarService.js';
import { LedgerTaxExtractionService } from '../../application/LedgerTaxExtractionService.js';
import { TaxAuditTrailService } from '../../application/TaxAuditTrailService.js';
import { TaxController } from './tax.controller.js';
import { TaxType, VATMethod, DeclarationStatus } from '../../domain/enums/TaxEnums.js';
import { createTaxPeriod } from '../../domain/entities/TaxPeriod.js';

describe('TaxController', () => {
  let db: Database.Database;
  let declRepo: SQLiteTaxDeclarationRepository;
  let periodRepo: SQLiteTaxPeriodRepository;
  let accountRepo: SQLiteAccountRepository;
  let ledgerRepo: SQLiteLedgerRepository;
  let declService: TaxDeclarationService;
  let periodService: TaxPeriodService;
  let calendarService: TaxCalendarService;
  let extractionService: LedgerTaxExtractionService;
  let auditTrailService: TaxAuditTrailService;
  let controller: TaxController;
  let companyId: number;
  let periodId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = OFF');
    runMigrations(db);

    declRepo = new SQLiteTaxDeclarationRepository(db);
    periodRepo = new SQLiteTaxPeriodRepository(db);
    accountRepo = new SQLiteAccountRepository(db);
    ledgerRepo = new SQLiteLedgerRepository(db);
    declService = new TaxDeclarationService(declRepo, periodRepo);
    periodService = new TaxPeriodService(periodRepo);
    calendarService = new TaxCalendarService();
    extractionService = new LedgerTaxExtractionService(accountRepo, ledgerRepo);
    auditTrailService = new TaxAuditTrailService(db);
    controller = new TaxController(declService, periodService, calendarService, extractionService, auditTrailService);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Tax Controller Co', status: 1, createdAt: new Date() }).id;

    const p = createTaxPeriod({ companyId, year: 2026, month: 6, startDate: '2026-06-01', endDate: '2026-06-30', type: 'monthly', vatMethod: VATMethod.KhauTru });
    periodId = periodRepo.save(p).id;
  });

  afterAll(() => db.close());

  it('GET /tax/periods creates and lists periods', () => {
    const result = controller.createPeriods({ companyId, year: 2026, type: 'monthly' });
    expect(result.length).toBe(12);

    const periods = controller.getPeriods(String(companyId), '2026');
    expect(periods.length).toBeGreaterThanOrEqual(12);
  });

  it('POST /tax/declarations creates declaration', () => {
    const result = controller.createDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    expect(result.status).toBe(0);
    expect(result.periodId).toBe(periodId);
  });

  it('GET /tax/declarations lists by company', () => {
    const list = controller.listDeclarations(String(companyId), String(periodId));
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /tax/calendar/:companyId/:year returns calendar', () => {
    const cal = controller.getCalendar(String(companyId), '2026');
    expect(cal.length).toBeGreaterThanOrEqual(12);
  });

  it('GET /tax/declarations/:id gets single declaration', () => {
    const d = controller.createDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    const fetched = controller.getDeclaration(String(d.id));
    expect(fetched!.id).toBe(d.id);
  });

  it('POST /tax/declarations/vat computes and saves VAT', () => {
    const result = controller.createVatDeclaration(String(companyId), {
      periodId,
      outputLines: [{ rate: 10, taxableAmount: 100_000_000 }],
      inputLines: [{ rate: 10, taxableAmount: 30_000_000 }],
    });
    expect(result.netVatPayable).toBe(7_000_000);
  });

  it('POST /tax/declarations/:id/submit submits declaration', () => {
    const d = controller.createDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    const sub = controller.submitDeclaration(String(d.id));
    expect(sub.status).toBe(4);
  });

  it('GET /tax/calendar/:companyId/:year/upcoming returns upcoming deadlines', () => {
    const upcoming = controller.getUpcomingDeadlines(String(companyId), '2026', '30');
    expect(Array.isArray(upcoming)).toBe(true);
  });

  describe('auto-fill', () => {
    beforeAll(() => {
      const savedAccounts = [
        { id: 0, companyId, accountNumber: '1331', name: 'VAT input', category: 3, nature: 1, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, currency: 'VND', createdAt: new Date() },
        { id: 0, companyId, accountNumber: '33311', name: 'VAT output', category: 6, nature: 2, type: 2, isActive: true, isSystem: true, allowTransactions: true, openingDebit: 0, openingCredit: 0, debitAmount: 0, creditAmount: 0, closingDebit: 0, closingCredit: 0, currency: 'VND', createdAt: new Date() },
      ].map(a => accountRepo.save(a));

      const insert = db.prepare(`INSERT INTO account_balances (account_id, account_number, company_id, period_id, opening_debit, opening_credit, period_debit, period_credit, closing_debit, closing_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      insert.run(savedAccounts[0].id, '1331', companyId, periodId, 0, 0, 5_000_000, 0, 5_000_000, 0);
      insert.run(savedAccounts[1].id, '33311', companyId, periodId, 0, 0, 0, 15_000_000, 0, 15_000_000);
    });

    it('auto-fills VAT from ledger', () => {
      const result = controller.autoFillVat(String(companyId), String(periodId));
      expect(result.outputVat).toBe(15_000_000);
      expect(result.inputVat).toBe(5_000_000);
    });

    it('auto-fills CIT from ledger', () => {
      const result = controller.autoFillCit(String(companyId), String(periodId));
      expect(result.revenue).toBe(0);
    });
  });

  describe('audit trail', () => {
    it('logs and retrieves audit entries', () => {
      const d = controller.createDeclaration({ companyId, periodId, taxType: TaxType.VAT });
      const sub = controller.submitDeclaration(String(d.id));
      const audit = controller.getDeclarationAudit(String(d.id));
      expect(audit.length).toBe(1);
      expect(audit[0].fromStatus).toBe(DeclarationStatus.Draft);
      expect(audit[0].toStatus).toBe(DeclarationStatus.Submitted);
    });

    it('retrieves company audit trail', () => {
      const companyAudit = controller.getCompanyAudit(String(companyId));
      expect(companyAudit.length).toBeGreaterThanOrEqual(1);
    });
  });
});
