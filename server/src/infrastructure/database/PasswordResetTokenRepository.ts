import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { PasswordResetTokenRepository, PasswordResetToken } from '../../domain/repositories/PasswordResetTokenRepository.js';

export class SQLitePasswordResetTokenRepository implements PasswordResetTokenRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  save(entry: { userId: number; tokenHash: string; expiresAt: Date }): void {
    this.db.prepare(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    ).run(entry.userId, entry.tokenHash, entry.expiresAt.toISOString());
  }

  findValid(tokenHash: string): PasswordResetToken | null {
    const now = new Date().toISOString();
    const row = this.db.prepare(
      'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
    ).get(tokenHash, now) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  markUsed(id: number): void {
    this.db.prepare(
      "UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  deleteExpired(): void {
    this.db.prepare(
      "DELETE FROM password_reset_tokens WHERE expires_at < datetime('now') OR used_at IS NOT NULL",
    ).run();
  }

  private toEntity(row: Record<string, unknown>): PasswordResetToken {
    return {
      id: row.id as number,
      userId: row.user_id as number,
      tokenHash: row.token_hash as string,
      expiresAt: new Date(row.expires_at as string),
      createdAt: new Date(row.created_at as string),
      usedAt: row.used_at ? new Date(row.used_at as string) : null,
    };
  }
}
