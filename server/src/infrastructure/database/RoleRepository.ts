import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.js';
import { ROLES, getRolePermissions, type Permission } from '../../domain/entities/Role.js';

export class SQLiteRoleRepository implements RoleRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  assignRole(userId: string, roleId: string): void {
    this.db.prepare(
      'INSERT OR IGNORE INTO user_roles (user_id, role) VALUES (?, ?)',
    ).run(userId, roleId);
  }

  removeRole(userId: string, roleId: string): void {
    this.db.prepare(
      'DELETE FROM user_roles WHERE user_id = ? AND role = ?',
    ).run(userId, roleId);
  }

  getUserRoles(userId: string): string[] {
    const rows = this.db.prepare(
      'SELECT role FROM user_roles WHERE user_id = ?',
    ).all(userId) as { role: string }[];
    const validIds = ROLES.map((r) => r.id);
    return rows.map((r) => r.role).filter((r) => validIds.includes(r));
  }

  getRolePermissions(roleId: string): Permission[] {
    return [...getRolePermissions(roleId)];
  }

  hasPermission(userId: string, permission: Permission): boolean {
    const roles = this.getUserRoles(userId);
    return roles.some((roleId) => {
      const perms = getRolePermissions(roleId);
      return (perms as readonly string[]).includes(permission);
    });
  }

  seedPermissions(): void {
    for (const role of ROLES) {
      for (const permission of role.permissions) {
        this.db.prepare(
          'INSERT OR IGNORE INTO role_permissions (role, permission) VALUES (?, ?)',
        ).run(role.id, permission);
      }
    }
  }
}
