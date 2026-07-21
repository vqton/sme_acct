import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { AuditLogRepository } from '../../domain/repositories/AuditLogRepository.js';
import type { AuditLog } from '../../domain/entities/AuditLog.js';
import { getDb } from '../database/connection.js';

export class SQLiteAuditLogRepository implements AuditLogRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  save(entry: Omit<AuditLog, 'id' | 'createdAt'>): void {
    this.db.prepare(
      'INSERT INTO audit_logs (id, user_id, action, resource, resource_id, detail, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(crypto.randomUUID(), entry.userId, entry.action, entry.resource, entry.resourceId, entry.detail, entry.ipAddress, entry.userAgent);
  }
}
