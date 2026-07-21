import type { AuditLog } from '../entities/AuditLog.js';

export interface AuditLogRepository {
  save(entry: Omit<AuditLog, 'id' | 'createdAt'>): void;
}
