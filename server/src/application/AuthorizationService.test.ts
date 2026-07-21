import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../test/helpers/db.js';
import { seedUser } from '../test/helpers/auth.js';
import { AuthorizationService } from './AuthorizationService.js';
import { SQLiteRoleRepository } from '../infrastructure/database/RoleRepository.js';

describe('AuthorizationService', () => {
  let db: ReturnType<typeof createTestDb>;
  let authz: AuthorizationService;
  let roleRepo: SQLiteRoleRepository;

  beforeEach(() => {
    db = createTestDb();
    roleRepo = new SQLiteRoleRepository(db);
    authz = new AuthorizationService(roleRepo);
  });

  describe('roles', () => {
    it('creates and assigns Vietnamese accounting role to user', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-tong-hop');

      const roles = authz.getUserRoles(user.id);
      expect(roles).toContain('ke-toan-tong-hop');
    });

    it('removes role from user', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-vien');
      authz.removeRole(user.id, 'ke-toan-vien');

      expect(authz.getUserRoles(user.id)).not.toContain('ke-toan-vien');
    });

    it('allows multiple roles per user', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-tong-hop');
      authz.assignRole(user.id, 'thu-quy');

      const roles = authz.getUserRoles(user.id);
      expect(roles).toContain('ke-toan-tong-hop');
      expect(roles).toContain('thu-quy');
    });

    it('does not duplicate role assignment', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-vien');
      authz.assignRole(user.id, 'ke-toan-vien');

      expect(authz.getUserRoles(user.id).filter((r) => r === 'ke-toan-vien').length).toBe(1);
    });
  });

  describe('permissions by Vietnamese accounting role', () => {
    it('he-thong (System Admin) has all permissions', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'he-thong');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:create')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:delete')).toBe(true);
      expect(authz.hasPermission(user.id, 'settings:manage')).toBe(true);
    });

    it('ke-toan-truong (Chief Accountant) has approve + view, no delete', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-truong');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'transaction:approve')).toBe(true);
      expect(authz.hasPermission(user.id, 'settings:manage')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:delete')).toBe(false);
    });

    it('ke-toan-tong-hop (General Accountant) has CRU + reports', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-tong-hop');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:create')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:update')).toBe(true);
      expect(authz.hasPermission(user.id, 'report:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:delete')).toBe(false);
      expect(authz.hasPermission(user.id, 'transaction:approve')).toBe(false);
    });

    it('ke-toan-vien (Staff Accountant) has read + create only', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-vien');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:create')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:delete')).toBe(false);
      expect(authz.hasPermission(user.id, 'transaction:approve')).toBe(false);
      expect(authz.hasPermission(user.id, 'report:read')).toBe(false);
    });

    it('thu-quy (Cashier) has company:read only', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'thu-quy');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:create')).toBe(false);
      expect(authz.hasPermission(user.id, 'company:update')).toBe(false);
    });

    it('kiem-soat (Controller) has read-only audit access', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'kiem-soat');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'report:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'audit:view')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:create')).toBe(false);
      expect(authz.hasPermission(user.id, 'company:update')).toBe(false);
    });

    it('user with no roles has no permissions', () => {
      const user = seedUser(db);
      expect(authz.hasPermission(user.id, 'company:read')).toBe(false);
    });

    it('permissions from multiple roles are cumulative', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-vien');
      authz.assignRole(user.id, 'ke-toan-tong-hop');

      expect(authz.hasPermission(user.id, 'company:read')).toBe(true);
      expect(authz.hasPermission(user.id, 'company:update')).toBe(true);
      expect(authz.hasPermission(user.id, 'transaction:approve')).toBe(false);
    });

    it('checkPermissions requires ALL specified permissions', () => {
      const user = seedUser(db);
      authz.assignRole(user.id, 'ke-toan-tong-hop');

      expect(authz.checkPermissions(user.id, ['company:read', 'company:create'])).toBe(true);
      expect(authz.checkPermissions(user.id, ['company:read', 'company:delete'])).toBe(false);
    });
  });

  describe('seedPermissions', () => {
    it('seeds all Vietnamese accounting roles with correct permissions', () => {
      authz.seedPermissions();

      const perms = roleRepo.getRolePermissions('he-thong');
      expect(perms.length).toBeGreaterThan(0);
      expect(perms).toContain('company:read');

      const thuQuyPerms = roleRepo.getRolePermissions('thu-quy');
      expect(thuQuyPerms).toEqual(['company:read']);
    });
  });
});
