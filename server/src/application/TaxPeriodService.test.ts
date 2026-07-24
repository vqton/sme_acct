import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteTaxPeriodRepository } from '../infrastructure/database/TaxPeriodRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { TaxPeriodService } from './TaxPeriodService.js';
import { TaxPeriodStatus, VATMethod } from '../domain/enums/TaxEnums.js';
import { createTaxPeriod } from '../domain/entities/TaxPeriod.js';

describe('TaxPeriodService', () => {
  let db: Database.Database;
  let repo: SQLiteTaxPeriodRepository;
  let service: TaxPeriodService;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteTaxPeriodRepository(db);
    service = new TaxPeriodService(repo);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Period Co', status: 1, createdAt: new Date() }).id;
  });

  afterAll(() => db.close());

  it('creates monthly tax periods for a year', () => {
    const periods = service.createPeriodsForYear(companyId, 2026, 'monthly');
    expect(periods).toHaveLength(12);
    expect(periods[0].periodName).toBe('Tháng 1/2026');
    expect(periods[11].periodName).toBe('Tháng 12/2026');
  });

  it('creates quarterly tax periods for a year', () => {
    const periods = service.createPeriodsForYear(companyId, 2026, 'quarterly');
    expect(periods).toHaveLength(4);
    expect(periods[0].periodName).toBe('Quý 1/2026');
    expect(periods[3].periodName).toBe('Quý 4/2026');
  });

  it('creates yearly tax period', () => {
    const periods = service.createPeriodsForYear(companyId, 2026, 'yearly');
    expect(periods).toHaveLength(1);
    expect(periods[0].periodName).toBe('Năm 2026');
  });

  it('locks period', () => {
    const p = createTaxPeriod({ companyId, year: 2026, month: 1, startDate: '2026-01-01', endDate: '2026-01-31', type: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(p);
    const locked = service.lockPeriod(saved.id, 1);
    expect(locked.status).toBe(TaxPeriodStatus.Locked);
  });

  it('finalizes period', () => {
    const p = createTaxPeriod({ companyId, year: 2026, month: 2, startDate: '2026-02-01', endDate: '2026-02-28', type: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(p);
    const locked = service.lockPeriod(saved.id, 1);
    const finalized = service.finalizePeriod(locked.id, 1);
    expect(finalized.status).toBe(TaxPeriodStatus.Finalized);
  });

  it('unlocks and amends period', () => {
    const p = createTaxPeriod({ companyId, year: 2026, month: 3, startDate: '2026-03-01', endDate: '2026-03-31', type: 'monthly', vatMethod: VATMethod.KhauTru });
    const saved = repo.save(p);
    const locked = service.lockPeriod(saved.id, 1);
    const unlocked = service.unlockPeriod(locked.id, 1, 'Need adjustment');
    expect(unlocked.status).toBe(TaxPeriodStatus.Amended);
    expect(unlocked.unlockReason).toBe('Need adjustment');
  });

  it('throws when finding non-existent period', () => {
    expect(() => service.lockPeriod(9999, 1)).toThrow('not found');
  });

  it('gets current open period', () => {
    const periods = service.createPeriodsForYear(companyId, 2027, 'monthly');
    const current = service.getCurrentOpenPeriod(companyId);
    expect(current).not.toBeNull();
    expect(current!.status).toBe(TaxPeriodStatus.Open);
  });
});
