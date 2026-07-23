export interface RefreshToken {
  id: number;
  userId: number;
  companyId?: number;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt: Date | null;
}
