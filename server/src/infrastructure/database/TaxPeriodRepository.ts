import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { TaxPeriod } from '../../domain/entities/TaxPeriod.js';
import type { TaxPeriodRepository } from '../../domain/repositories/TaxPeriodRepository.js';
import { getDb } from './connection.js';

export class SQLiteTaxPeriodRepository implements TaxPeriodRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteTaxPeriodRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteTaxPeriodRepository.prepareQueries(this.db);
  }

  private static prepareQueries(db: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof db.prepare> | null = null;
      return {
        get: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.get as any)(...params) as unknown; },
        all: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.all as any)(...params) as unknown[]; },
        run: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.run as any)(...params); },
      };
    };
    return {
      findById: s('SELECT * FROM tax_periods WHERE id = ?'),
      insert: s(`INSERT INTO tax_periods (id, company_id, type, year, month, quarter, period_name, start_date, end_date, status, vat_method, cit_rate, is_lockable, locked_at, locked_by_user_id, finalized_at, finalized_by_user_id, unlock_reason, created_at, updated_at) VALUES (@id, @companyId, @type, @year, @month, @quarter, @periodName, @startDate, @endDate, @status, @vatMethod, @citRate, @isLockable, @lockedAt, @lockedByUserId, @finalizedAt, @finalizedByUserId, @unlockReason, @createdAt, @updatedAt)`),
      update: s(`UPDATE tax_periods SET status=@status, is_lockable=@isLockable, locked_at=@lockedAt, locked_by_user_id=@lockedByUserId, finalized_at=@finalizedAt, finalized_by_user_id=@finalizedByUserId, unlock_reason=@unlockReason, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM tax_periods WHERE id = ?'),
      findByCompanyId: s('SELECT * FROM tax_periods WHERE company_id = ? ORDER BY year DESC, month DESC'),
      findByYear: s('SELECT * FROM tax_periods WHERE company_id = ? AND year = ? ORDER BY month'),
      findByMonth: s('SELECT * FROM tax_periods WHERE company_id = ? AND year = ? AND month = ?'),
      findByQuarter: s('SELECT * FROM tax_periods WHERE company_id = ? AND year = ? AND quarter = ?'),
      findOpen: s('SELECT * FROM tax_periods WHERE company_id = ? AND status = \'open\' ORDER BY year DESC, month DESC'),
      findCurrent: s('SELECT * FROM tax_periods WHERE company_id = ? AND status = \'open\' ORDER BY year DESC, month DESC LIMIT 1'),
      findLocked: s('SELECT * FROM tax_periods WHERE company_id = ? AND status = \'locked\' ORDER BY year DESC, month DESC'),
      findFinalized: s('SELECT * FROM tax_periods WHERE company_id = ? AND status = \'finalized\' ORDER BY year DESC, month DESC'),
    };
  }

  findById(id: number): TaxPeriod | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): TaxPeriod[] {
    const stmt = this.db.prepare('SELECT * FROM tax_periods ORDER BY year DESC, month DESC');
    return (stmt.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: number): TaxPeriod[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByYear(companyId: number, year: number): TaxPeriod[] {
    return (this.stmts.findByYear.all(companyId, year) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByMonth(companyId: number, year: number, month: number): TaxPeriod | null {
    const row = this.stmts.findByMonth.get(companyId, year, month) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByQuarter(companyId: number, year: number, quarter: number): TaxPeriod | null {
    const row = this.stmts.findByQuarter.get(companyId, year, quarter) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findOpenPeriods(companyId: number): TaxPeriod[] {
    return (this.stmts.findOpen.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findCurrentPeriod(companyId: number): TaxPeriod | null {
    const row = this.stmts.findCurrent.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findLockedPeriods(companyId: number): TaxPeriod[] {
    return (this.stmts.findLocked.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findFinalizedPeriods(companyId: number): TaxPeriod[] {
    return (this.stmts.findFinalized.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: TaxPeriod): TaxPeriod {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    return entity;
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): TaxPeriod {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      type: row.type as string,
      year: row.year as number,
      month: row.month as number ?? undefined,
      quarter: row.quarter as number ?? undefined,
      periodName: row.period_name as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      status: row.status as TaxPeriod['status'],
      vatMethod: row.vat_method as TaxPeriod['vatMethod'],
      citRate: row.cit_rate as number,
      isLockable: !!(row.is_lockable as number),
      lockedAt: (row.locked_at as string) ?? undefined,
      lockedByUserId: (row.locked_by_user_id as number) ?? undefined,
      finalizedAt: (row.finalized_at as string) ?? undefined,
      finalizedByUserId: (row.finalized_by_user_id as number) ?? undefined,
      unlockReason: (row.unlock_reason as string) ?? undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: TaxPeriod) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      type: entity.type,
      year: entity.year,
      month: entity.month ?? null,
      quarter: entity.quarter ?? null,
      periodName: entity.periodName,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      vatMethod: entity.vatMethod,
      citRate: entity.citRate,
      isLockable: entity.isLockable ? 1 : 0,
      lockedAt: entity.lockedAt ?? null,
      lockedByUserId: entity.lockedByUserId ?? null,
      finalizedAt: entity.finalizedAt ?? null,
      finalizedByUserId: entity.finalizedByUserId ?? null,
      unlockReason: entity.unlockReason ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
    };
  }
}
