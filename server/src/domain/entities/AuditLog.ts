export interface AuditLog {
  id?: number;
  companyId?: number;
  userId?: number | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  resource?: string | null;
  resourceId?: string | number | null;
  detail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date | string;
}

export interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}
