import type { Role, Permission } from '../entities/Role.js';

export interface RoleRepository {
  assignRole(userId: string, role: Role): void;
  removeRole(userId: string, role: Role): void;
  getUserRoles(userId: string): Role[];
  getRolePermissions(role: Role): Permission[];
  hasPermission(userId: string, permission: Permission): boolean;
  seedPermissions(): void;
}
