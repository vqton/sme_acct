import type { RoleRepository } from '../domain/repositories/RoleRepository.js';
import type { Permission } from '../domain/entities/Role.js';

export class AuthorizationService {
  constructor(private roleRepo: RoleRepository) {}

  assignRole(userId: number, roleId: string): void {
    this.roleRepo.assignRole(userId, roleId);
  }

  removeRole(userId: number, roleId: string): void {
    this.roleRepo.removeRole(userId, roleId);
  }

  getUserRoles(userId: number): string[] {
    return this.roleRepo.getUserRoles(userId);
  }

  hasPermission(userId: number, permission: Permission): boolean {
    return this.roleRepo.hasPermission(userId, permission);
  }

  checkPermissions(userId: number, permissions: Permission[]): boolean {
    return permissions.every((p) => this.roleRepo.hasPermission(userId, p));
  }

  seedPermissions(): void {
    this.roleRepo.seedPermissions();
  }
}
