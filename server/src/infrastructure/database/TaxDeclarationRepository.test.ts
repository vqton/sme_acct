import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteTaxDeclarationRepository } from './TaxDeclarationRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { SQLiteTaxPeriodRepository } from './TaxPeriodRepository.js';
import { TaxType, DeclarationStatus, VATMethod } from '../../domain/enums/TaxEnums.js';
import { createTaxDeclaration } from '../../domain/entities/TaxDeclaration.js';
import { createTaxPeriod } from '../../domain/entities/TaxPeriod.js';

describe('SQLiteTaxDeclarationRepository', () => {
  let db: Database.Database;
  let repo: SQLiteTaxDeclarationRepository;
  let periodRepo: SQLiteTaxPeriodRepository;
  let companyId: number;
  let periodId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteTaxDeclarationRepository(db);
    periodRepo = new SQLiteTaxPeriodRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    const company = companyRepo.save({ id: 0, name: 'Tax Decl Co', status: 1, createdAt: new Date() });
    companyId = company.id;

    const p = createTaxPeriod({ companyId, year: 2026, month: 6, startDate: '2026-06-01', endDate: '2026-06-30', type: 'monthly', vatMethod: VATMethod.KhauTru });
    periodId = periodRepo.save(p).id;

    const d1 = createTaxDeclaration({ companyId, taxType: TaxType.VAT, periodId, year: 2026, month: 6, declarationType: 'monthly', vatMethod: VATMethod.KhauTru });
    repo.save({ ...d1, createdAt: new Date('2026-06-01T00:00:00Z') });

    const d2 = createTaxDeclaration({ companyId, taxType: TaxType.VAT, periodId, year: 2026, month: 6, declarationType: 'monthly', vatMethod: VATMethod.KhauTru });
    repo.save({ ...d2, status: DeclarationStatus.Submitted, submittedAt: '2026-07-10T00:00:00Z', createdAt: new Date('2026-06-15T00:00:00Z') });

    const p2 = createTaxPeriod({ companyId, year: 2026, quarter: 2, startDate: '2026-04-01', endDate: '2026-06-30', type: 'quarterly', vatMethod: VATMethod.KhauTru });
    const period2Id = periodRepo.save(p2).id;
    const d3 = createTaxDeclaration({ companyId, taxType: TaxType.CIT, periodId: period2Id, year: 2026, quarter: 2, declarationType: 'quarterly', vatMethod: VATMethod.KhauTru });
    repo.save(d3);
  });

  afterAll(() => db.close());

  it('finds declarations by company', () => {
    const all = repo.findByCompanyId(companyId);
    expect(all).toHaveLength(3);
  });

  it('finds by period id', () => {
    const byPeriod = repo.findByPeriodId(periodId);
    expect(byPeriod).toHaveLength(2);
  });

  it('finds by tax type', () => {
    const vat = repo.findByTaxType(companyId, TaxType.VAT);
    expect(vat).toHaveLength(2);
    const cit = repo.findByTaxType(companyId, TaxType.CIT);
    expect(cit).toHaveLength(1);
  });

  it('finds by year and month', () => {
    const ym = repo.findByYearAndMonth(companyId, 2026, 6);
    expect(ym).toHaveLength(2);
  });

  it('finds latest by period', () => {
    const latest = repo.findLatestByPeriod(companyId, periodId);
    expect(latest).not.toBeNull();
    expect(latest!.status).toBe(DeclarationStatus.Submitted);
  });

  it('finds submitted declarations', () => {
    const sub = repo.findSubmitted(companyId);
    expect(sub).toHaveLength(1);
    expect(sub[0].submittedAt).toBeDefined();
  });

  it('finds draft declarations', () => {
    const drafts = repo.findDraftDeclarations(companyId);
    expect(drafts).toHaveLength(2);
  });

  it('saves and retrieves declaration', () => {
    const d = createTaxDeclaration({ companyId, taxType: TaxType.VAT, periodId, year: 2026, month: 6, declarationType: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(d);
    expect(saved.id).toBeGreaterThan(0);
    expect(saved.status).toBe(DeclarationStatus.Draft);

    const fetched = repo.findById(saved.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.taxType).toBe(TaxType.VAT);
  });
});
