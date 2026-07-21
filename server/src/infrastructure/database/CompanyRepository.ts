import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Company } from '../../domain/entities/Company.js';
import type { CompanyRepository } from '../../domain/repositories/CompanyRepository.js';
import { CompanyStatus } from '../../domain/entities/Company.js';
import { getDb } from '../database/connection.js';

export class SQLiteCompanyRepository implements CompanyRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteCompanyRepository['prepareQueries']>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteCompanyRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM companies WHERE id = ?'),
      findAll: s('SELECT * FROM companies'),
      findByTaxCode: s('SELECT * FROM companies WHERE tax_code = ?'),
      findByEnterpriseCode: s('SELECT * FROM companies WHERE enterprise_code = ?'),
      findByStatus: s('SELECT * FROM companies WHERE status = ?'),
      insert: s(`INSERT INTO companies (id, name, name_vietnamese, tax_code, enterprise_code, address, phone, email, website, legal_representative, status, created_at, updated_at) VALUES (@id, @name, @nameVietnamese, @taxCode, @enterpriseCode, @address, @phone, @email, @website, @legalRepresentative, @status, @createdAt, @updatedAt)`),
      update: s(`UPDATE companies SET name=@name, name_vietnamese=@nameVietnamese, tax_code=@taxCode, enterprise_code=@enterpriseCode, address=@address, phone=@phone, email=@email, website=@website, legal_representative=@legalRepresentative, status=@status, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM companies WHERE id = ?'),
    };
  }

  findById(id: string): Company | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): Company[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByTaxCode(taxCode: string): Company | null {
    const row = this.stmts.findByTaxCode.get(taxCode) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByEnterpriseCode(code: string): Company | null {
    const row = this.stmts.findByEnterpriseCode.get(code) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByStatus(status: CompanyStatus): Company[] {
    return (this.stmts.findByStatus.all(status) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: Company): Company {
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

  private toEntity(row: Record<string, unknown>): Company {
    return {
      id: row.id as string,
      name: row.name as string,
      nameVietnamese: row.name_vietnamese as string | undefined,
      taxCode: row.tax_code as string | undefined,
      enterpriseCode: row.enterprise_code as string | undefined,
      address: row.address as string | undefined,
      phone: row.phone as string | undefined,
      email: row.email as string | undefined,
      status: row.status as CompanyStatus,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: Company) {
    return {
      id: entity.id,
      name: entity.name,
      nameVietnamese: entity.nameVietnamese ?? null,
      taxCode: entity.taxCode ?? null,
      enterpriseCode: entity.enterpriseCode ?? null,
      address: entity.address ?? null,
      phone: entity.phone ?? null,
      email: entity.email ?? null,
      website: (entity as unknown as Record<string, unknown>).website ?? null,
      legalRepresentative: (entity as unknown as Record<string, unknown>).legalRepresentative ?? null,
      status: entity.status,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
    };
  }
}
