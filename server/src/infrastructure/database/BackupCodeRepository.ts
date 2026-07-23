import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { BackupCodeRepository } from '../../domain/repositories/BackupCodeRepository.js';
import type { BackupCode } from '../../domain/entities/BackupCode.js';

export class SQLiteBackupCodeRepository implements BackupCodeRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  savemany(userId: number, codeHashes: string[]): void {
    const insert = this.db.prepare(
      'INSERT INTO backup_codes (user_id, code_hash) VALUES (?, ?)',
    );
    const many = this.db.transaction((hashes: string[]) => {
      for (const hash of hashes) {
        insert.run(userId, hash);
      }
    });
    many(codeHashes);
  }

  findValid(userId: number, codeHash: string): BackupCode | null {
    const row = this.db.prepare(
      'SELECT * FROM backup_codes WHERE user_id = ? AND code_hash = ? AND used_at IS NULL',
    ).get(userId, codeHash) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      id: row.id as number,
      userId: row.user_id as number,
      codeHash: row.code_hash as string,
      usedAt: row.used_at ? new Date(row.used_at as string) : null,
      createdAt: new Date(row.created_at as string),
    };
  }

  markUsed(id: number): void {
    this.db.prepare("UPDATE backup_codes SET used_at = datetime('now') WHERE id = ?").run(id);
  }

  deleteAllForUser(userId: number): void {
    this.db.prepare('DELETE FROM backup_codes WHERE user_id = ?').run(userId);
  }
}
