import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { UserProfile } from '../../domain/entities/UserProfile.js';
import type { UserProfileRepository } from '../../domain/repositories/UserProfileRepository.js';
import { getDb } from './connection.js';

export class SQLiteUserProfileRepository implements UserProfileRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  findByUserId(userId: string): UserProfile | null {
    const row = this.db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.toEntity(row);
  }

  save(profile: UserProfile): UserProfile {
    const existing = this.db.prepare('SELECT user_id FROM user_profiles WHERE user_id = ?').get(profile.userId);
    if (existing) {
      this.db.prepare(`
        UPDATE user_profiles SET phone=@phone, position=@position, department=@department,
          avatar_url=@avatarUrl, notes=@notes, updated_at=@updatedAt
        WHERE user_id=@userId
      `).run(this.toParams(profile));
    } else {
      this.db.prepare(`
        INSERT INTO user_profiles (user_id, phone, position, department, avatar_url, notes, updated_at)
        VALUES (@userId, @phone, @position, @department, @avatarUrl, @notes, @updatedAt)
      `).run(this.toParams(profile));
    }
    return profile;
  }

  delete(userId: string): void {
    this.db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(userId);
  }

  private toEntity(row: Record<string, unknown>): UserProfile {
    return {
      userId: row.user_id as string,
      phone: (row.phone as string) ?? undefined,
      position: (row.position as string) ?? undefined,
      department: (row.department as string) ?? undefined,
      avatarUrl: (row.avatar_url as string) ?? undefined,
      notes: (row.notes as string) ?? undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
    };
  }

  private toParams(profile: UserProfile) {
    return {
      userId: profile.userId,
      phone: profile.phone ?? null,
      position: profile.position ?? null,
      department: profile.department ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      notes: profile.notes ?? null,
      updatedAt: profile.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
