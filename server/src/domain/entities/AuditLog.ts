export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}
