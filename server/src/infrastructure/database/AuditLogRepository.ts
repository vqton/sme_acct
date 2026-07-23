import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { AuditLog } from '../../domain/entities/AuditLog.js';
import type { AuditLogRepository } from '../../domain/repositories/AuditLogRepository.js';
import { getDb } from './connection.js';

export class SQLiteAuditLogRepository implements AuditLogRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteAuditLogRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteAuditLogRepository.prepareQueries(this.db);
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
      findByCompanyId: s('SELECT * FROM audit_logs WHERE company_id = ? ORDER BY created_at DESC'),
      insert: s(`INSERT INTO audit_logs (company_id, user_id, action, resource, resource_id, detail, ip_address, user_agent) VALUES (@companyId, @userId, @action, @resource, @resourceId, @detail, @ipAddress, @userAgent)`),
    };
  }

  findByCompanyId(companyId: number): AuditLog[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(log: AuditLog): AuditLog {
    const resource = log.entityType ?? log.resource ?? null;
    const resourceId = (log.entityId != null ? String(log.entityId) : null) ?? (log.resourceId != null ? String(log.resourceId) : null) ?? null;
    const result = this.stmts.insert.run({
      companyId: log.companyId ?? null,
      userId: log.userId ?? null,
      action: log.action,
      resource,
      resourceId,
      detail: log.detail ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
    });
    log.id = Number(result.lastInsertRowid);
    return log;
  }

  private toEntity(row: Record<string, unknown>): AuditLog {
    return {
      id: row.id as number,
      companyId: row.company_id as number | undefined,
      userId: row.user_id as number | undefined,
      action: row.action as string,
      entityType: row.resource as string | undefined,
      entityId: row.resource_id ? Number(row.resource_id) : undefined,
      resource: row.resource as string | undefined,
      resourceId: row.resource_id as string | undefined,
      detail: row.detail as string | undefined,
      ipAddress: row.ip_address as string | undefined,
      userAgent: row.user_agent as string | undefined,
      createdAt: row.created_at as string,
    };
  }
}
