import type { AuditLog } from '../entities/AuditLog.js';

export interface AuditLogRepository {
  save(log: AuditLog): AuditLog;
  findByCompanyId(companyId: number): AuditLog[];
}

export type { AuditLog };
