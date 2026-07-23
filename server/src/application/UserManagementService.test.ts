import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../test/helpers/db.js';
import { seedUser, resetNextUserId } from '../test/helpers/auth.js';
import { UserManagementService } from './UserManagementService.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';
import { SQLiteUserProfileRepository } from '../infrastructure/database/UserProfileRepository.js';
import { SQLiteUserGroupRepository } from '../infrastructure/database/UserGroupRepository.js';
import { SQLiteRoleRepository } from '../infrastructure/database/RoleRepository.js';
import type { Database } from 'better-sqlite3';

describe('UserManagementService', () => {
  let db: Database;
  let service: UserManagementService;

  beforeEach(() => {
    db = createTestDb();
    resetNextUserId();
    const userRepo = new SQLiteUserRepository(db);
    const profileRepo = new SQLiteUserProfileRepository(db);
    const groupRepo = new SQLiteUserGroupRepository(db);
    const roleRepo = new SQLiteRoleRepository(db);
    service = new UserManagementService(userRepo, profileRepo, groupRepo, roleRepo);
  });

  describe('listUsers', () => {
    it('returns all users', () => {
      seedUser(db, { username: 'user1', email: 'u1@test.com' });
      seedUser(db, { username: 'user2', email: 'u2@test.com' });

      const users = service.listUsers();
      expect(users).toHaveLength(2);
    });

    it('returns users with profile', () => {
      seedUser(db, { id: 1, username: 'user1', email: 'u1@test.com' });
      db.prepare('INSERT INTO user_profiles (user_id, phone, position, department) VALUES (?, ?, ?, ?)')
        .run(1, '0909123456', 'Kế toán trưởng', 'Phòng Kế toán');

      const users = service.listUsers();
      expect(users[0]).toMatchObject({
        username: 'user1',
        phone: '0909123456',
        position: 'Kế toán trưởng',
        department: 'Phòng Kế toán',
      });
    });

    it('filters by search query (username)', () => {
      seedUser(db, { username: 'john_doe', email: 'john@test.com' });
      seedUser(db, { username: 'jane_doe', email: 'jane@test.com' });
      seedUser(db, { username: 'other', email: 'other@test.com' });

      const users = service.listUsers({ query: 'john' });
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('john_doe');
    });

    it('filters by email', () => {
      seedUser(db, { username: 'u1', email: 'target@test.com' });
      seedUser(db, { username: 'u2', email: 'other@test.com' });

      const users = service.listUsers({ query: 'target' });
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('target@test.com');
    });

    it('filters by full name', () => {
      seedUser(db, { username: 'u1', email: 'u1@test.com', fullName: 'Nguyễn Văn A' });
      seedUser(db, { username: 'u2', email: 'u2@test.com', fullName: 'Trần Thị B' });

      const users = service.listUsers({ query: 'Nguyễn' });
      expect(users).toHaveLength(1);
    });

    it('filters by active status', () => {
      seedUser(db, { username: 'active_user', email: 'a@test.com', isActive: true });
      seedUser(db, { username: 'inactive_user', email: 'i@test.com', isActive: false });

      const active = service.listUsers({ isActive: true });
      expect(active).toHaveLength(1);
      expect(active[0].username).toBe('active_user');

      const inactive = service.listUsers({ isActive: false });
      expect(inactive).toHaveLength(1);
      expect(inactive[0].username).toBe('inactive_user');
    });

    it('supports pagination', () => {
      for (let i = 0; i < 10; i++) {
        seedUser(db, { username: `user${i}`, email: `user${i}@test.com` });
      }

      const page1 = service.listUsers({ limit: 3, offset: 0 });
      expect(page1).toHaveLength(3);

      const page2 = service.listUsers({ limit: 3, offset: 3 });
      expect(page2).toHaveLength(3);
      expect(page2[0].username).toBe('user3');
    });
  });

  describe('getUser', () => {
    it('returns user by id with profile', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_profiles (user_id, phone, position) VALUES (?, ?, ?)')
        .run(1, '0909123456', 'Giám đốc');

      const user = service.getUser(1);
      expect(user).toBeDefined();
      expect(user!.username).toBe('testuser');
      expect(user!.phone).toBe('0909123456');
      expect(user!.position).toBe('Giám đốc');
    });

    it('returns null for non-existent user', () => {
      const user = service.getUser(9999);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates user basic fields', () => {
      seedUser(db, { id: 1, username: 'oldname', email: 'old@test.com' });

      service.updateUser(1, { fullName: 'New Name' });

      const updated = db.prepare('SELECT full_name FROM users WHERE id = ?').get(1) as any;
      expect(updated.full_name).toBe('New Name');
    });

    it('updates user profile fields', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });

      service.updateUser(1, { phone: '0909123456', position: 'Kế toán trưởng', department: 'Phòng Kế toán' });

      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(1) as any;
      expect(profile.phone).toBe('0909123456');
      expect(profile.position).toBe('Kế toán trưởng');
      expect(profile.department).toBe('Phòng Kế toán');
    });

    it('updates existing profile when it already exists', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_profiles (user_id, phone, position) VALUES (?, ?, ?)')
        .run(1, '0909123456', 'Kế toán viên');

      service.updateUser(1, { position: 'Kế toán trưởng' });

      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(1) as any;
      expect(profile.position).toBe('Kế toán trưởng');
      expect(profile.phone).toBe('0909123456');
    });

    it('throws for non-existent user', () => {
      expect(() => service.updateUser(9999, { fullName: 'New Name' }))
        .toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('deletes user from database', () => {
      seedUser(db, { id: 1, username: 'todelete', email: 'del@test.com' });

      service.deleteUser(1);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
      expect(user).toBeUndefined();
    });

    it('deletes user profile cascade', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)').run(1, '0909123456');

      service.deleteUser(1);

      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(1);
      expect(profile).toBeUndefined();
    });

    it('throws for non-existent user', () => {
      expect(() => service.deleteUser(9999)).toThrow('User not found');
    });
  });

  describe('activateUser / deactivateUser', () => {
    it('activates a user', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com', isActive: false });

      service.activateUser(1);

      const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(1) as any;
      expect(user.is_active).toBe(1);
    });

    it('deactivates a user', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com', isActive: true });

      service.deactivateUser(1);

      const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(1) as any;
      expect(user.is_active).toBe(0);
    });

    it('throws when activating non-existent user', () => {
      expect(() => service.activateUser(9999)).toThrow('User not found');
    });
  });

  describe('assignRole / removeRole', () => {
    it('assigns a role to user', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });

      service.assignRole(1, 'ke-toan-truong');

      const roles = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').all(1) as any[];
      expect(roles).toHaveLength(1);
      expect(roles[0].role).toBe('ke-toan-truong');
    });

    it('removes a role from user', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(1, 'ke-toan-truong');

      service.removeRole(1, 'ke-toan-truong');

      const roles = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').all(1) as any[];
      expect(roles).toHaveLength(0);
    });

    it('returns current roles for user', () => {
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(1, 'ke-toan-truong');
      db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(1, 'giam-doc');

      const roles = service.getUserRoles(1);
      expect(roles).toHaveLength(2);
      expect(roles).toContain('ke-toan-truong');
      expect(roles).toContain('giam-doc');
    });
  });

  describe('user groups', () => {
    it('adds user to group', () => {
      db.prepare('INSERT INTO user_groups (id, name, is_active, created_at) VALUES (?, ?, ?, ?)')
        .run(1, 'Phòng Kế toán', 1, new Date().toISOString());
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });

      service.addUserToGroup(1, 1);

      const members = db.prepare('SELECT * FROM user_group_members WHERE group_id = ?').all(1) as any[];
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(1);
    });

    it('removes user from group', () => {
      db.prepare('INSERT INTO user_groups (id, name, is_active, created_at) VALUES (?, ?, ?, ?)')
        .run(1, 'Phòng Kế toán', 1, new Date().toISOString());
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)')
        .run(1, 1, new Date().toISOString());

      service.removeUserFromGroup(1, 1);

      const members = db.prepare('SELECT * FROM user_group_members WHERE group_id = ?').all(1) as any[];
      expect(members).toHaveLength(0);
    });

    it('returns groups for a user', () => {
      db.prepare('INSERT INTO user_groups (id, name, is_active, created_at) VALUES (?, ?, ?, ?)')
        .run(1, 'Phòng Kế toán', 1, new Date().toISOString());
      db.prepare('INSERT INTO user_groups (id, name, is_active, created_at) VALUES (?, ?, ?, ?)')
        .run(2, 'Phòng Kinh doanh', 1, new Date().toISOString());
      seedUser(db, { id: 1, username: 'testuser', email: 'test@test.com' });
      db.prepare('INSERT INTO user_group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)')
        .run(1, 1, new Date().toISOString());

      const groups = service.getUserGroups(1);
      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Phòng Kế toán');
    });
  });

  describe('countUsers', () => {
    it('returns total count', () => {
      seedUser(db, { username: 'u1', email: 'u1@test.com' });
      seedUser(db, { username: 'u2', email: 'u2@test.com' });

      expect(service.countUsers()).toBe(2);
    });

    it('counts filtered by active status', () => {
      seedUser(db, { username: 'u1', email: 'u1@test.com', isActive: true });
      seedUser(db, { username: 'u2', email: 'u2@test.com', isActive: false });

      expect(service.countUsers({ isActive: true })).toBe(1);
    });
  });
});
