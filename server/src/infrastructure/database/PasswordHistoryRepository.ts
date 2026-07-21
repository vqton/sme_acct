import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { PasswordHistoryRepository } from '../../domain/repositories/PasswordHistoryRepository.js';

export class SQLitePasswordHistoryRepository implements PasswordHistoryRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  save(entry: { userId: string; passwordHash: string }): void {
    this.db.prepare(
      'INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)',
    ).run(crypto.randomUUID(), entry.userId, entry.passwordHash);
  }

  getRecentHashes(userId: string, limit: number): string[] {
    const rows = this.db.prepare(
      'SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY rowid DESC LIMIT ?',
    ).all(userId, limit) as { password_hash: string }[];
    return rows.map((r) => r.password_hash);
  }

  deleteAllForUser(userId: string): void {
    this.db.prepare('DELETE FROM password_history WHERE user_id = ?').run(userId);
  }
}
