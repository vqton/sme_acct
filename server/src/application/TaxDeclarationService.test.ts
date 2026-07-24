import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteTaxDeclarationRepository } from '../infrastructure/database/TaxDeclarationRepository.js';
import { SQLiteTaxPeriodRepository } from '../infrastructure/database/TaxPeriodRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { TaxDeclarationService } from './TaxDeclarationService.js';
import { TaxType, DeclarationStatus, VATMethod, VatRate } from '../domain/enums/TaxEnums.js';
import { createTaxPeriod } from '../domain/entities/TaxPeriod.js';

describe('TaxDeclarationService', () => {
  let db: Database.Database;
  let declRepo: SQLiteTaxDeclarationRepository;
  let periodRepo: SQLiteTaxPeriodRepository;
  let service: TaxDeclarationService;
  let companyId: number;
  let periodId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    declRepo = new SQLiteTaxDeclarationRepository(db);
    periodRepo = new SQLiteTaxPeriodRepository(db);
    service = new TaxDeclarationService(declRepo, periodRepo);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Decl Service Co', status: 1, createdAt: new Date() }).id;

    const p = createTaxPeriod({ companyId, year: 2026, month: 6, startDate: '2026-06-01', endDate: '2026-06-30', type: 'monthly', vatMethod: VATMethod.KhauTru });
    periodId = periodRepo.save(p).id;
  });

  afterAll(() => db.close());

  it('creates empty VAT declaration', () => {
    const d = service.createEmptyDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    expect(d.status).toBe(DeclarationStatus.Draft);
    expect(d.taxType).toBe(TaxType.VAT);
    expect(d.periodId).toBe(periodId);
  });

  it('creates VAT declaration with lines using engine', () => {
    const d = service.createVatDeclaration(companyId, periodId, {
      outputLines: [
        { rate: VatRate.Ten, taxableAmount: 100_000_000 },
        { rate: VatRate.Eight, taxableAmount: 50_000_000 },
      ],
      inputLines: [
        { rate: VatRate.Ten, taxableAmount: 30_000_000 },
      ],
    });
    expect(d.totalOutputVat).toBe(14_000_000);
    expect(d.totalInputVat).toBe(3_000_000);
    expect(d.netVatPayable).toBe(11_000_000);
    expect(d.id).toBeGreaterThan(0);
  });

  it('computes declaration using engine and saves', () => {
    const d = service.createVatDeclaration(companyId, periodId, {
      outputLines: [{ rate: VatRate.Ten, taxableAmount: 200_000_000 }],
      inputLines: [{ rate: VatRate.Ten, taxableAmount: 50_000_000 }],
    });
    expect(d.netVatPayable).toBe(15_000_000);
    expect(d.totalOutputVat).toBe(20_000_000);
    expect(d.totalInputVat).toBe(5_000_000);
  });

  it('submits draft declaration', () => {
    const d = service.createEmptyDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    const submitted = service.submitDeclaration(d.id);
    expect(submitted.status).toBe(DeclarationStatus.Submitted);
    expect(submitted.submittedAt).toBeDefined();
  });

  it('throws when submitting non-draft', () => {
    const d = service.createEmptyDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    service.submitDeclaration(d.id);
    expect(() => service.submitDeclaration(d.id)).toThrow(/not in Draft status/);
  });

  it('creates adjustment declaration', () => {
    const d = service.createEmptyDeclaration({ companyId, periodId, taxType: TaxType.VAT });
    service.submitDeclaration(d.id);
    const adj = service.createAdjustmentDeclaration(d.id, {
      outputLines: [{ rate: VatRate.Ten, taxableAmount: 120_000_000 }],
      inputLines: [{ rate: VatRate.Ten, taxableAmount: 30_000_000 }],
    });
    expect(adj.status).toBe(DeclarationStatus.Draft);
    expect(adj.adjustedDeclarationId).toBe(d.id);
    expect(adj.totalOutputVat).toBe(12_000_000);
  });

  it('finds declarations by period', () => {
    const all = service.getDeclarationsByPeriod(periodId);
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
