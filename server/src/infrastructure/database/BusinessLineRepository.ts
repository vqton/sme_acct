import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { BusinessLine } from '../../domain/entities/BusinessLine.js';
import type { BusinessLineRepository } from '../../domain/repositories/BusinessLineRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, vsic_code, vsic_level, name, is_primary, start_date, end_date, license_reference, created_at, updated_at';

export class SQLiteBusinessLineRepository implements BusinessLineRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteBusinessLineRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteBusinessLineRepository.prepareQueries(this.db);
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
      findById: s(`SELECT ${COLUMNS} FROM business_lines WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM business_lines WHERE company_id = ? ORDER BY is_primary DESC, vsic_code ASC`),
      findPrimaryByCompanyId: s(`SELECT ${COLUMNS} FROM business_lines WHERE company_id = ? AND is_primary = 1 LIMIT 1`),
      insert: s(`INSERT INTO business_lines (${COLUMNS}) VALUES (@id, @companyId, @vsicCode, @vsicLevel, @name, @isPrimary, @startDate, @endDate, @licenseReference, @createdAt, @updatedAt)`),
      update: s(`UPDATE business_lines SET vsic_code=@vsicCode, vsic_level=@vsicLevel, name=@name, is_primary=@isPrimary, start_date=@startDate, end_date=@endDate, license_reference=@licenseReference, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM business_lines WHERE id = ?'),
    };
  }

  findById(id: number): BusinessLine | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: number): BusinessLine[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findPrimaryByCompanyId(companyId: number): BusinessLine | null {
    const row = this.stmts.findPrimaryByCompanyId.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: BusinessLine): BusinessLine {
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

  private toEntity(row: Record<string, unknown>): BusinessLine {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      vsicCode: row.vsic_code as string,
      vsicLevel: row.vsic_level as number,
      name: row.name as string,
      isPrimary: !!(row.is_primary as number),
      startDate: row.start_date as string,
      endDate: row.end_date as string | undefined,
      licenseReference: row.license_reference as string | undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: BusinessLine) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      vsicCode: entity.vsicCode,
      vsicLevel: entity.vsicLevel,
      name: entity.name,
      isPrimary: entity.isPrimary ? 1 : 0,
      startDate: entity.startDate,
      endDate: entity.endDate ?? null,
      licenseReference: entity.licenseReference ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
