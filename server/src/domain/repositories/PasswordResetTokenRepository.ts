export interface PasswordResetToken {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetTokenRepository {
  save(entry: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'>): void;
  findValid(tokenHash: string): PasswordResetToken | null;
  markUsed(id: number): void;
  deleteExpired(): void;
}
