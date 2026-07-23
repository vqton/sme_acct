import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { CompanyLicense } from '../../domain/entities/CompanyLicense.js';
import type { CompanyLicenseRepository } from '../../domain/repositories/CompanyLicenseRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, license_type, license_number, issued_by, date_issued, date_expiry, file_url, notes, created_at, updated_at';

export class SQLiteCompanyLicenseRepository implements CompanyLicenseRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteCompanyLicenseRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteCompanyLicenseRepository.prepareQueries(this.db);
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
      findById: s(`SELECT ${COLUMNS} FROM company_licenses WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM company_licenses WHERE company_id = ? ORDER BY date_issued DESC`),
      insert: s(`INSERT INTO company_licenses (${COLUMNS}) VALUES (@id, @companyId, @licenseType, @licenseNumber, @issuedBy, @dateIssued, @dateExpiry, @fileUrl, @notes, @createdAt, @updatedAt)`),
      update: s(`UPDATE company_licenses SET license_type=@licenseType, license_number=@licenseNumber, issued_by=@issuedBy, date_issued=@dateIssued, date_expiry=@dateExpiry, file_url=@fileUrl, notes=@notes, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM company_licenses WHERE id = ?'),
    };
  }

  findById(id: number): CompanyLicense | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: number): CompanyLicense[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: CompanyLicense): CompanyLicense {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    return entity;
  }

  delete(id: number): void { this.stmts.delete.run(id); }

  private toEntity(row: Record<string, unknown>): CompanyLicense {
    return {
      id: row.id as number, companyId: row.company_id as number,
      licenseType: row.license_type as number, licenseNumber: row.license_number as string,
      issuedBy: row.issued_by as string, dateIssued: row.date_issued as string,
      dateExpiry: row.date_expiry as string | undefined, fileUrl: row.file_url as string | undefined,
      notes: row.notes as string | undefined,
      createdAt: row.created_at as unknown as Date, updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: CompanyLicense) {
    return {
      id: entity.id || null, companyId: entity.companyId, licenseType: entity.licenseType,
      licenseNumber: entity.licenseNumber, issuedBy: entity.issuedBy, dateIssued: entity.dateIssued,
      dateExpiry: entity.dateExpiry ?? null, fileUrl: entity.fileUrl ?? null, notes: entity.notes ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
