import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteFiscalPeriodRepository } from './FiscalPeriodRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { FiscalPeriodStatus } from '../../domain/enums/AccountEnums.js';

describe('SQLiteFiscalPeriodRepository', () => {
  let db: Database.Database;
  let repo: SQLiteFiscalPeriodRepository;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteFiscalPeriodRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    const company = companyRepo.save({ id: 0, name: 'Test FP Co', status: 1, createdAt: new Date() });
    companyId = company.id;

    repo.save({
      id: 0, companyId, year: 2026, month: 1,
      periodName: 'Tháng 1/2026', startDate: '2026-01-01', endDate: '2026-01-31',
      status: FiscalPeriodStatus.Open, isOpeningBalancePeriod: false,
      createdAt: new Date(),
    });
    repo.save({
      id: 0, companyId, year: 2026, month: 2,
      periodName: 'Tháng 2/2026', startDate: '2026-02-01', endDate: '2026-02-28',
      status: FiscalPeriodStatus.Closed, isOpeningBalancePeriod: false,
      closedAt: '2026-02-28T23:59:59Z', closedByUserId: 1,
      createdAt: new Date(),
    });
  });

  afterAll(() => db.close());

  it('finds by month', () => {
    const p = repo.findByMonth(companyId, 2026, 1);
    expect(p).not.toBeNull();
    expect(p!.periodName).toBe('Tháng 1/2026');
  });

  it('finds open periods', () => {
    const open = repo.findOpenPeriods(companyId);
    expect(open).toHaveLength(1);
    expect(open[0].month).toBe(1);
  });

  it('finds current period', () => {
    const cur = repo.findCurrentPeriod(companyId);
    expect(cur).not.toBeNull();
  });

  it('finds latest closed period', () => {
    const closed = repo.findLatestClosedPeriod(companyId);
    expect(closed).not.toBeNull();
    expect(closed!.month).toBe(2);
  });

  it('finds by year', () => {
    const periods = repo.findByYear(companyId, 2026);
    expect(periods).toHaveLength(2);
  });
});