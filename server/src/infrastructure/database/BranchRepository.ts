import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Branch } from '../../domain/entities/Branch.js';
import type { BranchRepository } from '../../domain/repositories/BranchRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, branch_type, name, address, tax_code, phone, manager_name, status, date_opened, date_closed, created_at, updated_at';

export class SQLiteBranchRepository implements BranchRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteBranchRepository.prepareQueries>;

  constructor(database?: DatabaseType) {
    this.db = database ?? getDb();
    this.stmts = SQLiteBranchRepository.prepareQueries(this.db);
  }

  private static prepareQueries(database: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof database.prepare> | null = null;
      return {
        get: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.get as any)(...params) as unknown; },
        all: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.all as any)(...params) as unknown[]; },
        run: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.run as any)(...params); },
      };
    };

    return {
      findById: s(`SELECT ${COLUMNS} FROM company_branches WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM company_branches WHERE company_id = ? ORDER BY branch_type, name`),
      insert: s(`INSERT INTO company_branches (${COLUMNS}) VALUES (@id, @companyId, @branchType, @name, @address, @taxCode, @phone, @managerName, @status, @dateOpened, @dateClosed, @createdAt, @updatedAt)`),
      update: s(`UPDATE company_branches SET branch_type=@branchType, name=@name, address=@address, tax_code=@taxCode, phone=@phone, manager_name=@managerName, status=@status, date_opened=@dateOpened, date_closed=@dateClosed, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM company_branches WHERE id = ?'),
    };
  }

  findById(id: string): Branch | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: string): Branch[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: Branch): Branch {
    const params = this.toParams(entity);
    const existing = this.stmts.findById.get(entity.id);
    if (existing) { this.stmts.update.run(params); } else { this.stmts.insert.run(params); }
    return entity;
  }

  delete(id: string): void { this.stmts.delete.run(id); }

  private toEntity(row: Record<string, unknown>): Branch {
    return {
      id: row.id as string, companyId: row.company_id as string,
      branchType: row.branch_type as number, name: row.name as string,
      address: row.address as string | undefined, taxCode: row.tax_code as string | undefined,
      phone: row.phone as string | undefined, managerName: row.manager_name as string | undefined,
      status: row.status as number, dateOpened: row.date_opened as string,
      dateClosed: row.date_closed as string | undefined,
      createdAt: row.created_at as unknown as Date, updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: Branch) {
    return {
      id: entity.id, companyId: entity.companyId, branchType: entity.branchType, name: entity.name,
      address: entity.address ?? null, taxCode: entity.taxCode ?? null, phone: entity.phone ?? null,
      managerName: entity.managerName ?? null, status: entity.status, dateOpened: entity.dateOpened,
      dateClosed: entity.dateClosed ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
