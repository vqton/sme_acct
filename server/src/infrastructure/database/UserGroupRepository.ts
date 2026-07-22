import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { UserGroup } from '../../domain/entities/UserGroup.js';
import type { UserGroupMember } from '../../domain/entities/UserGroupMember.js';
import type { UserGroupRepository } from '../../domain/repositories/UserGroupRepository.js';
import { getDb } from './connection.js';

export class SQLiteUserGroupRepository implements UserGroupRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  findById(id: string): UserGroup | null {
    const row = this.db.prepare('SELECT * FROM user_groups WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): UserGroup[] {
    return (this.db.prepare('SELECT * FROM user_groups ORDER BY name').all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(group: UserGroup): UserGroup {
    const existing = this.db.prepare('SELECT id FROM user_groups WHERE id = ?').get(group.id);
    if (existing) {
      this.db.prepare(`
        UPDATE user_groups SET name=@name, description=@description, is_active=@isActive, updated_at=@updatedAt
        WHERE id=@id
      `).run(this.toParams(group));
    } else {
      this.db.prepare(`
        INSERT INTO user_groups (id, name, description, is_active, created_at, updated_at)
        VALUES (@id, @name, @description, @isActive, @createdAt, @updatedAt)
      `).run(this.toParams(group));
    }
    return group;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM user_groups WHERE id = ?').run(id);
  }

  getMembers(groupId: string): UserGroupMember[] {
    return this.db.prepare('SELECT * FROM user_group_members WHERE group_id = ?').all(groupId) as UserGroupMember[];
  }

  addMember(member: UserGroupMember): void {
    this.db.prepare('INSERT INTO user_group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)')
      .run(member.groupId, member.userId, member.joinedAt.toISOString());
  }

  removeMember(groupId: string, userId: string): void {
    this.db.prepare('DELETE FROM user_group_members WHERE group_id = ? AND user_id = ?').run(groupId, userId);
  }

  getGroupsForUser(userId: string): UserGroup[] {
    const rows = this.db.prepare(`
      SELECT g.* FROM user_groups g
      JOIN user_group_members m ON g.id = m.group_id
      WHERE m.user_id = ?
      ORDER BY g.name
    `).all(userId) as Record<string, unknown>[];
    return rows.map((r) => this.toEntity(r));
  }

  private toEntity(row: Record<string, unknown>): UserGroup {
    return {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) ?? undefined,
      isActive: !!(row.is_active as number),
      createdAt: new Date(row.created_at as string),
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
    };
  }

  private toParams(group: UserGroup) {
    return {
      id: group.id,
      name: group.name,
      description: group.description ?? null,
      isActive: group.isActive ? 1 : 0,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
