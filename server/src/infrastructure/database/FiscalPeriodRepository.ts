import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { FiscalPeriod } from '../../domain/entities/FiscalPeriod.js';
import type { FiscalPeriodRepository } from '../../domain/repositories/FiscalPeriodRepository.js';
import { getDb } from './connection.js';

export class SQLiteFiscalPeriodRepository implements FiscalPeriodRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteFiscalPeriodRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteFiscalPeriodRepository.prepareQueries(this.db);
  }

  private static prepareQueries(db: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof db.prepare> | null = null;
      return {
        get: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.get as any)(...params) as unknown;
        },
        all: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.all as any)(...params) as unknown[];
        },
        run: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.run as any)(...params);
        },
      };
    };

    return {
      findById: s('SELECT * FROM fiscal_periods WHERE id = ?'),
      findAll: s('SELECT * FROM fiscal_periods ORDER BY year DESC, month DESC'),
      findByCompanyId: s('SELECT * FROM fiscal_periods WHERE company_id = ? ORDER BY year, month'),
      findByYear: s('SELECT * FROM fiscal_periods WHERE company_id = ? AND year = ? ORDER BY month'),
      findByMonth: s('SELECT * FROM fiscal_periods WHERE company_id = ? AND year = ? AND month = ?'),
      findOpenPeriods: s('SELECT * FROM fiscal_periods WHERE company_id = ? AND status = 1 ORDER BY year DESC, month DESC'),
      findCurrentPeriod: s('SELECT * FROM fiscal_periods WHERE company_id = ? AND status = 1 ORDER BY year DESC, month DESC LIMIT 1'),
      findLatestClosedPeriod: s('SELECT * FROM fiscal_periods WHERE company_id = ? AND status = 2 ORDER BY year DESC, month DESC LIMIT 1'),
      insert: s(`INSERT INTO fiscal_periods (id, company_id, year, month, period_name, start_date, end_date, status, is_opening_balance_period, closed_at, closed_by_user_id, created_at, updated_at) VALUES (@id, @companyId, @year, @month, @periodName, @startDate, @endDate, @status, @isOpeningBalancePeriod, @closedAt, @closedByUserId, @createdAt, @updatedAt)`),
      update: s(`UPDATE fiscal_periods SET year=@year, month=@month, period_name=@periodName, start_date=@startDate, end_date=@endDate, status=@status, is_opening_balance_period=@isOpeningBalancePeriod, closed_at=@closedAt, closed_by_user_id=@closedByUserId, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM fiscal_periods WHERE id = ?'),
    };
  }

  findById(id: string): FiscalPeriod | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): FiscalPeriod[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: string): FiscalPeriod[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByYear(companyId: string, year: number): FiscalPeriod[] {
    return (this.stmts.findByYear.all(companyId, year) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByMonth(companyId: string, year: number, month: number): FiscalPeriod | null {
    const row = this.stmts.findByMonth.get(companyId, year, month) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findOpenPeriods(companyId: string): FiscalPeriod[] {
    return (this.stmts.findOpenPeriods.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findCurrentPeriod(companyId: string): FiscalPeriod | null {
    const row = this.stmts.findCurrentPeriod.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findLatestClosedPeriod(companyId: string): FiscalPeriod | null {
    const row = this.stmts.findLatestClosedPeriod.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: FiscalPeriod): FiscalPeriod {
    const params = this.toParams(entity);
    const existing = this.stmts.findById.get(entity.id);
    if (existing) {
      this.stmts.update.run(params);
    } else {
      this.stmts.insert.run(params);
    }
    return entity;
  }

  delete(id: string): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): FiscalPeriod {
    return {
      id: row.id as string,
      companyId: row.company_id as string,
      year: row.year as number,
      month: row.month as number,
      periodName: row.period_name as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      status: row.status as number,
      isOpeningBalancePeriod: !!(row.is_opening_balance_period as number),
      closedAt: row.closed_at as string ?? undefined,
      closedByUserId: row.closed_by_user_id as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: FiscalPeriod) {
    return {
      id: entity.id,
      companyId: entity.companyId,
      year: entity.year,
      month: entity.month,
      periodName: entity.periodName,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      isOpeningBalancePeriod: entity.isOpeningBalancePeriod ? 1 : 0,
      closedAt: entity.closedAt ?? null,
      closedByUserId: entity.closedByUserId ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
    };
  }
}
