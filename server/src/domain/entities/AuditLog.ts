export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resource: string | null;
  resourceId: number | null;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}
