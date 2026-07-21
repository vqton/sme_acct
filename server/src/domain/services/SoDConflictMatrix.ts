import { ROLES } from '../entities/Role.js';

export type SoDConflictType = 'CREATOR_APPROVER' | 'CASHIER_RECORDING' | 'ADMIN_ACCOUNTING';

export interface SoDCheckResult {
  allowed: boolean;
  conflicts: {
    type: SoDConflictType;
    message: string;
  }[];
}

const ACCOUNTING_ROLES = ROLES
  .filter((r) => !r.isSystemRole && r.id !== 'kiem-soat')
  .map((r) => r.id);

export const SoDMatrix = {
  checkCreatorApprover(creatorUserId: string, approverUserId: string): SoDConflictType | null {
    if (creatorUserId === approverUserId) {
      return 'CREATOR_APPROVER';
    }
    return null;
  },

  checkCashierRecords(roleIds: string[]): SoDConflictType | null {
    if (roleIds.includes('thu-quy') && roleIds.some((r) => r !== 'thu-quy' && ACCOUNTING_ROLES.includes(r))) {
      return 'CASHIER_RECORDING';
    }
    return null;
  },

  checkSystemAdminAccounting(roleIds: string[]): SoDConflictType | null {
    if (roleIds.includes('he-thong')) {
      return 'ADMIN_ACCOUNTING';
    }
    return null;
  },

  validateAll(checks: {
    creatorUserId?: string;
    approverUserId?: string;
    roleIds?: string[];
  }): SoDCheckResult {
    const conflicts: SoDCheckResult['conflicts'] = [];

    if (checks.creatorUserId && checks.approverUserId) {
      const conflict = this.checkCreatorApprover(checks.creatorUserId, checks.approverUserId);
      if (conflict) {
        conflicts.push({
          type: conflict,
          message: 'Creator cannot approve own entries (Kế toán trưởng not self-approve)',
        });
      }
    }

    if (checks.roleIds) {
      const cashierConflict = this.checkCashierRecords(checks.roleIds);
      if (cashierConflict) {
        conflicts.push({
          type: cashierConflict,
          message: 'Cashier (Thủ quỹ) cannot record accounting entries — physical custody vs record keeping separation',
        });
      }

      const adminConflict = this.checkSystemAdminAccounting(checks.roleIds);
      if (adminConflict) {
        conflicts.push({
          type: adminConflict,
          message: 'System Admin (Quản trị hệ thống) not an accounting role per Luật Kế toán 2015',
        });
      }
    }

    return { allowed: conflicts.length === 0, conflicts };
  },

  getAccountingRoleIds(): readonly string[] {
    return ACCOUNTING_ROLES;
  },
};
