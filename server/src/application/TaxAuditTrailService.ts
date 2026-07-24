import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { TaxType, DeclarationStatus } from '../domain/enums/TaxEnums.js';

export interface TaxAuditEntry {
  id: number;
  declarationId: number;
  companyId: number;
  taxType: TaxType;
  fromStatus: DeclarationStatus;
  toStatus: DeclarationStatus;
  changedByUserId: number;
  comment?: string;
  createdAt: Date;
}

export interface TaxAuditLogInput {
  declarationId: number;
  companyId: number;
  taxType: TaxType;
  fromStatus: DeclarationStatus;
  toStatus: DeclarationStatus;
  changedByUserId: number;
  comment?: string;
}

export class TaxAuditTrailService {
  private db: DatabaseType;
  private insertStmt: ReturnType<typeof Database.prototype.prepare>;
  private queryByDeclStmt: ReturnType<typeof Database.prototype.prepare>;
  private queryByCompanyStmt: ReturnType<typeof Database.prototype.prepare>;

  constructor(db?: DatabaseType) {
    this.db = db ?? new Database(':memory:');
    this.ensureTable();
    this.insertStmt = this.db.prepare(`INSERT INTO tax_audit_trail (declaration_id, company_id, tax_type, from_status, to_status, changed_by_user_id, comment, created_at) VALUES (@declarationId, @companyId, @taxType, @fromStatus, @toStatus, @changedByUserId, @comment, @createdAt)`);
    this.queryByDeclStmt = this.db.prepare('SELECT * FROM tax_audit_trail WHERE declaration_id = ? ORDER BY created_at ASC');
    this.queryByCompanyStmt = this.db.prepare('SELECT * FROM tax_audit_trail WHERE company_id = ? ORDER BY created_at DESC');
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tax_audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        declaration_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        tax_type INTEGER NOT NULL,
        from_status INTEGER NOT NULL,
        to_status INTEGER NOT NULL,
        changed_by_user_id INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tax_audit_declaration ON tax_audit_trail(declaration_id)
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tax_audit_company ON tax_audit_trail(company_id)
    `);
  }

  logChange(input: TaxAuditLogInput): void {
    this.insertStmt.run({
      declarationId: input.declarationId,
      companyId: input.companyId,
      taxType: input.taxType,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedByUserId: input.changedByUserId,
      comment: input.comment ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  getHistory(declarationId: number): TaxAuditEntry[] {
    return (this.queryByDeclStmt.all(declarationId) as Record<string, unknown>[]).map(this.toEntity);
  }

  getCompanyHistory(companyId: number): TaxAuditEntry[] {
    return (this.queryByCompanyStmt.all(companyId) as Record<string, unknown>[]).map(this.toEntity);
  }

  private toEntity(row: Record<string, unknown>): TaxAuditEntry {
    return {
      id: row.id as number,
      declarationId: row.declaration_id as number,
      companyId: row.company_id as number,
      taxType: row.tax_type as TaxType,
      fromStatus: row.from_status as DeclarationStatus,
      toStatus: row.to_status as DeclarationStatus,
      changedByUserId: row.changed_by_user_id as number,
      comment: row.comment as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
    };
  }
}
