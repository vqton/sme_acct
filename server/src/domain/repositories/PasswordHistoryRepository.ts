export interface PasswordHistoryEntry {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
}

export interface PasswordHistoryRepository {
  save(entry: Omit<PasswordHistoryEntry, 'id' | 'createdAt'>): void;
  getRecentHashes(userId: string, limit: number): string[];
  deleteAllForUser(userId: string): void;
}
