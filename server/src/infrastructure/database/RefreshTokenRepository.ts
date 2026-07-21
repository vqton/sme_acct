import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.js';
import type { RefreshToken } from '../../domain/entities/RefreshToken.js';

export class SQLiteRefreshTokenRepository implements RefreshTokenRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  findValid(tokenHash: string): RefreshToken | null {
    const now = new Date().toISOString();
    const row = this.db.prepare(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?',
    ).get(tokenHash, now) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findById(id: string): RefreshToken | null {
    const row = this.db.prepare(
      'SELECT * FROM refresh_tokens WHERE id = ?',
    ).get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(token: RefreshToken): void {
    this.db.prepare(
      `INSERT INTO refresh_tokens (id, user_id, company_id, token_hash, ip_address, user_agent, device_name, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      token.id,
      token.userId,
      token.companyId ?? null,
      token.tokenHash,
      token.ipAddress ?? null,
      token.userAgent ?? null,
      token.deviceName ?? null,
      token.expiresAt.toISOString(),
      token.createdAt.toISOString(),
    );
  }

  findAllActiveForUser(userId: string): RefreshToken[] {
    const now = new Date().toISOString();
    const rows = this.db.prepare(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ? ORDER BY created_at DESC',
    ).all(userId, now) as Record<string, unknown>[];
    return rows.map((r) => this.toEntity(r));
  }

  revoke(id: string): void {
    this.db.prepare(
      "UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  revokeAllForUser(userId: string): void {
    this.db.prepare(
      "UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL",
    ).run(userId);
  }

  revokeAllExcept(userId: string, excludeId: string): void {
    this.db.prepare(
      "UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ? AND id != ? AND revoked_at IS NULL",
    ).run(userId, excludeId);
  }

  touch(id: string): void {
    this.db.prepare(
      "UPDATE refresh_tokens SET last_used_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  private toEntity(row: Record<string, unknown>): RefreshToken {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      companyId: (row.company_id as string) ?? undefined,
      tokenHash: row.token_hash as string,
      ipAddress: (row.ip_address as string) ?? undefined,
      userAgent: (row.user_agent as string) ?? undefined,
      deviceName: (row.device_name as string) ?? undefined,
      expiresAt: new Date(row.expires_at as string),
      createdAt: new Date(row.created_at as string),
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at as string) : undefined,
      revokedAt: row.revoked_at ? new Date(row.revoked_at as string) : null,
    };
  }
}
