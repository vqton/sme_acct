import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteTaxPeriodRepository } from './TaxPeriodRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { TaxPeriodStatus, VATMethod } from '../../domain/enums/TaxEnums.js';
import { createTaxPeriod } from '../../domain/entities/TaxPeriod.js';

describe('SQLiteTaxPeriodRepository', () => {
  let db: Database.Database;
  let repo: SQLiteTaxPeriodRepository;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteTaxPeriodRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    const company = companyRepo.save({ id: 0, name: 'Tax Test Co', status: 1, createdAt: new Date() });
    companyId = company.id;

    const p1 = createTaxPeriod({ companyId, year: 2026, month: 6, startDate: '2026-06-01', endDate: '2026-06-30', type: 'monthly', vatMethod: VATMethod.KhauTru });
    repo.save({ ...p1, status: TaxPeriodStatus.Open });

    const p2 = createTaxPeriod({ companyId, year: 2026, month: 5, startDate: '2026-05-01', endDate: '2026-05-31', type: 'monthly', vatMethod: VATMethod.KhauTru });
    repo.save({ ...p2, status: TaxPeriodStatus.Locked, lockedAt: '2026-06-10T00:00:00Z' });

    const p3 = createTaxPeriod({ companyId, year: 2026, month: 4, startDate: '2026-04-01', endDate: '2026-04-30', type: 'monthly', vatMethod: VATMethod.KhauTru });
    repo.save({ ...p3, status: TaxPeriodStatus.Finalized, finalizedAt: '2026-05-15T00:00:00Z', finalizedByUserId: 1 });
  });

  afterAll(() => db.close());

  it('finds by month', () => {
    const p = repo.findByMonth(companyId, 2026, 6);
    expect(p).not.toBeNull();
    expect(p!.status).toBe(TaxPeriodStatus.Open);
  });

  it('finds open periods', () => {
    const open = repo.findOpenPeriods(companyId);
    expect(open).toHaveLength(1);
    expect(open[0].month).toBe(6);
  });

  it('finds current period (first open)', () => {
    const cur = repo.findCurrentPeriod(companyId);
    expect(cur).not.toBeNull();
    expect(cur!.status).toBe(TaxPeriodStatus.Open);
  });

  it('finds locked periods', () => {
    const locked = repo.findLockedPeriods(companyId);
    expect(locked).toHaveLength(1);
    expect(locked[0].month).toBe(5);
  });

  it('finds finalized periods', () => {
    const finalized = repo.findFinalizedPeriods(companyId);
    expect(finalized).toHaveLength(1);
    expect(finalized[0].month).toBe(4);
  });

  it('finds all periods for company', () => {
    const all = repo.findByCompanyId(companyId);
    expect(all).toHaveLength(3);
  });

  it('saves and updates period', () => {
    const p = createTaxPeriod({ companyId, year: 2026, month: 7, startDate: '2026-07-01', endDate: '2026-07-31', type: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(p);
    expect(saved.id).toBeGreaterThan(0);

    const updated = repo.save({ ...saved, status: TaxPeriodStatus.Locked });
    expect(updated.status).toBe(TaxPeriodStatus.Locked);

    const fetched = repo.findById(saved.id);
    expect(fetched!.status).toBe(TaxPeriodStatus.Locked);
  });

  it('deletes period', () => {
    const p = createTaxPeriod({ companyId, year: 2026, month: 12, startDate: '2026-12-01', endDate: '2026-12-31', type: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(p);
    repo.delete(saved.id);
    expect(repo.findById(saved.id)).toBeNull();
  });
});
