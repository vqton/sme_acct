import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../test/helpers/db.js';
import { UserGroupService } from './UserGroupService.js';
import { SQLiteUserGroupRepository } from '../infrastructure/database/UserGroupRepository.js';
import type { Database } from 'better-sqlite3';

describe('UserGroupService', () => {
  let db: Database;
  let service: UserGroupService;

  beforeEach(() => {
    db = createTestDb();
    const groupRepo = new SQLiteUserGroupRepository(db);
    service = new UserGroupService(groupRepo);
  });

  describe('createGroup', () => {
    it('creates a group with valid name', () => {
      const group = service.createGroup({ name: 'Phòng Kế toán', description: 'Nhân viên kế toán' });

      expect(group.id).toBeDefined();
      expect(group.name).toBe('Phòng Kế toán');
      expect(group.description).toBe('Nhân viên kế toán');
      expect(group.isActive).toBe(true);
    });

    it('rejects duplicate group name', () => {
      service.createGroup({ name: 'Phòng Kế toán' });
      expect(() => service.createGroup({ name: 'Phòng Kế toán' }))
        .toThrow('User group name already exists');
    });

    it('rejects empty name', () => {
      expect(() => service.createGroup({ name: '' })).toThrow('Group name is required');
    });
  });

  describe('listGroups', () => {
    it('returns all groups', () => {
      service.createGroup({ name: 'Phòng Kế toán' });
      service.createGroup({ name: 'Phòng Kinh doanh' });

      const groups = service.listGroups();
      expect(groups).toHaveLength(2);
    });

    it('returns empty array when no groups', () => {
      expect(service.listGroups()).toHaveLength(0);
    });
  });

  describe('getGroup', () => {
    it('returns group by id', () => {
      const created = service.createGroup({ name: 'Phòng Kế toán' });

      const group = service.getGroup(created.id);
      expect(group).toBeDefined();
      expect(group!.name).toBe('Phòng Kế toán');
    });

    it('returns null for non-existent group', () => {
      expect(service.getGroup('nonexistent')).toBeNull();
    });
  });

  describe('updateGroup', () => {
    it('updates group name and description', () => {
      const created = service.createGroup({ name: 'Phòng KT', description: 'Cũ' });

      const updated = service.updateGroup(created.id, { name: 'Phòng Kế toán', description: 'Mới' });

      expect(updated.name).toBe('Phòng Kế toán');
      expect(updated.description).toBe('Mới');
    });

    it('throws for non-existent group', () => {
      expect(() => service.updateGroup('nonexistent', { name: 'New Name' }))
        .toThrow('User group not found');
    });

    it('rejects rename to existing name', () => {
      service.createGroup({ name: 'Group A' });
      const groupB = service.createGroup({ name: 'Group B' });

      expect(() => service.updateGroup(groupB.id, { name: 'Group A' }))
        .toThrow('User group name already exists');
    });
  });

  describe('deleteGroup', () => {
    it('deletes a group', () => {
      const created = service.createGroup({ name: 'Phòng Kế toán' });

      service.deleteGroup(created.id);

      expect(service.getGroup(created.id)).toBeNull();
    });

    it('throws for non-existent group', () => {
      expect(() => service.deleteGroup('nonexistent')).toThrow('User group not found');
    });
  });

  describe('toggleGroupActive', () => {
    it('deactivates a group', () => {
      const created = service.createGroup({ name: 'Phòng Kế toán' });

      const deactivated = service.toggleGroupActive(created.id, false);
      expect(deactivated.isActive).toBe(false);
    });

    it('activates a group', () => {
      const created = service.createGroup({ name: 'Phòng Kế toán' });
      service.toggleGroupActive(created.id, false);

      const activated = service.toggleGroupActive(created.id, true);
      expect(activated.isActive).toBe(true);
    });
  });
});
