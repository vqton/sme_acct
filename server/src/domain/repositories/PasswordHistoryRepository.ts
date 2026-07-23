export interface PasswordHistoryEntry {
  id: number;
  userId: number;
  passwordHash: string;
  createdAt: Date;
}

export interface PasswordHistoryRepository {
  save(entry: Omit<PasswordHistoryEntry, 'id' | 'createdAt'>): void;
  getRecentHashes(userId: number, limit: number): string[];
  deleteAllForUser(userId: number): void;
}
