import { describe, it, expect } from 'vitest';
import { SoDMatrix } from './SoDConflictMatrix.js';

describe('SoDConflictMatrix', () => {
  describe('checkCreatorApprover', () => {
    it('blocks same user as creator and approver', () => {
      const result = SoDMatrix.checkCreatorApprover('user-1', 'user-1');
      expect(result).toBe('CREATOR_APPROVER');
    });

    it('allows different users as creator and approver', () => {
      const result = SoDMatrix.checkCreatorApprover('user-1', 'user-2');
      expect(result).toBeNull();
    });
  });

  describe('checkCashierRecords', () => {
    it('blocks cashier who also has accounting role from recording', () => {
      const result = SoDMatrix.checkCashierRecords(['thu-quy', 'ke-toan-tong-hop']);
      expect(result).toBe('CASHIER_RECORDING');
    });

    it('allows cashier without accounting roles', () => {
      const result = SoDMatrix.checkCashierRecords(['thu-quy']);
      expect(result).toBeNull();
    });

    it('allows non-cashier accountant roles', () => {
      const result = SoDMatrix.checkCashierRecords(['ke-toan-tong-hop']);
      expect(result).toBeNull();
    });
  });

  describe('checkSystemAdminAccounting', () => {
    it('flags system admin roles', () => {
      const result = SoDMatrix.checkSystemAdminAccounting(['he-thong']);
      expect(result).toBe('ADMIN_ACCOUNTING');
    });

    it('does not flag non-admin roles', () => {
      const result = SoDMatrix.checkSystemAdminAccounting(['ke-toan-truong']);
      expect(result).toBeNull();
    });
  });

  describe('validateAll', () => {
    it('passes with no conflicts', () => {
      const result = SoDMatrix.validateAll({
        creatorUserId: 'user-1',
        approverUserId: 'user-2',
        roleIds: ['ke-toan-tong-hop'],
      });
      expect(result.allowed).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('reports creator-approver conflict', () => {
      const result = SoDMatrix.validateAll({
        creatorUserId: 'user-1',
        approverUserId: 'user-1',
      });
      expect(result.allowed).toBe(false);
      expect(result.conflicts.map((c) => c.type)).toContain('CREATOR_APPROVER');
    });

    it('reports cashier-recording conflict', () => {
      const result = SoDMatrix.validateAll({
        roleIds: ['thu-quy', 'ke-toan-vien'],
      });
      expect(result.allowed).toBe(false);
      expect(result.conflicts.map((c) => c.type)).toContain('CASHIER_RECORDING');
    });

    it('reports admin-accounting conflict', () => {
      const result = SoDMatrix.validateAll({
        roleIds: ['he-thong'],
      });
      expect(result.allowed).toBe(false);
      expect(result.conflicts.map((c) => c.type)).toContain('ADMIN_ACCOUNTING');
    });

    it('reports multiple conflicts at once', () => {
      const result = SoDMatrix.validateAll({
        creatorUserId: 'user-1',
        approverUserId: 'user-1',
        roleIds: ['he-thong'],
      });
      expect(result.allowed).toBe(false);
      expect(result.conflicts).toHaveLength(2);
    });
  });

  describe('getAccountingRoleIds', () => {
    it('excludes system admin and controller', () => {
      const ids = SoDMatrix.getAccountingRoleIds();
      expect(ids).not.toContain('he-thong');
      expect(ids).not.toContain('kiem-soat');
      expect(ids.length).toBeGreaterThan(0);
    });
  });
});
