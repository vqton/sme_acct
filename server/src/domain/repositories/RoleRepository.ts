import type { Role, Permission } from '../entities/Role.js';

export interface RoleRepository {
  assignRole(userId: number, role: Role): void;
  removeRole(userId: number, role: Role): void;
  getUserRoles(userId: number): Role[];
  getRolePermissions(role: Role): Permission[];
  hasPermission(userId: number, permission: Permission): boolean;
  seedPermissions(): void;
}
