export interface RefreshToken {
  id: string;
  userId: string;
  companyId?: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt: Date | null;
}
