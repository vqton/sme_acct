import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { LegalRepresentative } from '../../domain/entities/LegalRepresentative.js';
import type { LegalRepresentativeRepository } from '../../domain/repositories/LegalRepresentativeRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, full_name, vneid_number, position, is_primary, authorization_scope, digital_cert_serial, digital_cert_provider, digital_cert_expiry, vneid_verified_at, is_active, created_at, updated_at';

export class SQLLegalRepresentativeRepository implements LegalRepresentativeRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLLegalRepresentativeRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLLegalRepresentativeRepository.prepareQueries(this.db);
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
      findById: s(`SELECT ${COLUMNS} FROM legal_representatives WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM legal_representatives WHERE company_id = ? ORDER BY is_primary DESC, created_at ASC`),
      findPrimaryByCompanyId: s(`SELECT ${COLUMNS} FROM legal_representatives WHERE company_id = ? AND is_primary = 1 AND is_active = 1 LIMIT 1`),
      insert: s(`INSERT INTO legal_representatives (${COLUMNS}) VALUES (@id, @companyId, @fullName, @vneidNumber, @position, @isPrimary, @authorizationScope, @digitalCertSerial, @digitalCertProvider, @digitalCertExpiry, @vneidVerifiedAt, @isActive, @createdAt, @updatedAt)`),
      update: s(`UPDATE legal_representatives SET full_name=@fullName, vneid_number=@vneidNumber, position=@position, is_primary=@isPrimary, authorization_scope=@authorizationScope, digital_cert_serial=@digitalCertSerial, digital_cert_provider=@digitalCertProvider, digital_cert_expiry=@digitalCertExpiry, vneid_verified_at=@vneidVerifiedAt, is_active=@isActive, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM legal_representatives WHERE id = ?'),
    };
  }

  findById(id: string): LegalRepresentative | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: string): LegalRepresentative[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findPrimaryByCompanyId(companyId: string): LegalRepresentative | null {
    const row = this.stmts.findPrimaryByCompanyId.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: LegalRepresentative): LegalRepresentative {
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

  private toEntity(row: Record<string, unknown>): LegalRepresentative {
    return {
      id: row.id as string,
      companyId: row.company_id as string,
      fullName: row.full_name as string,
      vneidNumber: row.vneid_number as string | undefined,
      position: row.position as string,
      isPrimary: !!(row.is_primary as number),
      authorizationScope: row.authorization_scope as string | undefined,
      digitalCertSerial: row.digital_cert_serial as string | undefined,
      digitalCertProvider: row.digital_cert_provider as string | undefined,
      digitalCertExpiry: row.digital_cert_expiry as string | undefined,
      vneidVerifiedAt: row.vneid_verified_at as string | undefined,
      isActive: !!(row.is_active as number),
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: LegalRepresentative) {
    return {
      id: entity.id,
      companyId: entity.companyId,
      fullName: entity.fullName,
      vneidNumber: entity.vneidNumber ?? null,
      position: entity.position,
      isPrimary: entity.isPrimary ? 1 : 0,
      authorizationScope: entity.authorizationScope ?? null,
      digitalCertSerial: entity.digitalCertSerial ?? null,
      digitalCertProvider: entity.digitalCertProvider ?? null,
      digitalCertExpiry: entity.digitalCertExpiry ?? null,
      vneidVerifiedAt: entity.vneidVerifiedAt ?? null,
      isActive: entity.isActive ? 1 : 0,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
