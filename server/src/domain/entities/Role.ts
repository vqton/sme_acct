export const PERMISSIONS = [
  'company:read',
  'company:create',
  'company:update',
  'company:delete',
  'department:read',
  'department:create',
  'department:update',
  'department:delete',
  'user:read',
  'user:create',
  'user:update',
  'user:delete',
  'report:read',
  'transaction:approve',
  'settings:manage',
  'audit:view',
] as const;
export type Permission = typeof PERMISSIONS[number];

export const ALL_PERMISSIONS: readonly Permission[] = [...PERMISSIONS];

export interface RoleDefinition {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  permissions: readonly Permission[];
  isSystemRole: boolean;
}

const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'he-thong',
    name: 'System Admin',
    nameVi: 'Quản trị hệ thống',
    description: 'Full access. Technical administration — not an accounting role per Luật Kế toán 2015',
    permissions: ALL_PERMISSIONS,
    isSystemRole: true,
  },
  {
    id: 'giam-doc',
    name: 'Director',
    nameVi: 'Giám đốc',
    description: 'Day-to-day management. Can view and approve all operations',
    permissions: ['company:read', 'company:create', 'company:update', 'company:delete', 'user:read', 'report:read', 'transaction:approve', 'settings:manage', 'audit:view'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-truong',
    name: 'Chief Accountant',
    nameVi: 'Kế toán trưởng',
    description: 'Head of accounting. Legally responsible per Luật Kế toán 88/2015 Điều 54-55. Cannot self-approve own entries',
    permissions: ['company:read', 'company:create', 'company:update', 'department:read', 'department:create', 'department:update', 'user:read', 'report:read', 'transaction:approve', 'settings:manage', 'audit:view'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-tong-hop',
    name: 'General Accountant',
    nameVi: 'Kế toán tổng hợp',
    description: 'General ledger, financial reports, month/year-end closing',
    permissions: ['company:read', 'company:create', 'company:update', 'department:read', 'user:read', 'report:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-thue',
    name: 'Tax Accountant',
    nameVi: 'Kế toán thuế',
    description: 'Tax declarations, VAT, CIT, PIT. Tax feature only',
    permissions: ['company:read', 'report:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-cong-no',
    name: 'AP/AR Accountant',
    nameVi: 'Kế toán công nợ',
    description: 'Accounts payable and receivable management',
    permissions: ['company:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-kho',
    name: 'Inventory Accountant',
    nameVi: 'Kế toán kho',
    description: 'Inventory management, stock tracking',
    permissions: ['company:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-tien-luong',
    name: 'Payroll Accountant',
    nameVi: 'Kế toán tiền lương',
    description: 'Payroll, salary calculations, insurance',
    permissions: ['company:read', 'report:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'thu-quy',
    name: 'Cashier',
    nameVi: 'Thủ quỹ',
    description: 'Cash management only. Cannot edit/delete approved entries. Physical custody vs record keeping separation',
    permissions: ['company:read'] as const,
    isSystemRole: false,
  },
  {
    id: 'ke-toan-vien',
    name: 'Staff Accountant',
    nameVi: 'Kế toán viên',
    description: 'Basic data entry. No approve, no delete, no export',
    permissions: ['company:read', 'company:create'] as const,
    isSystemRole: false,
  },
  {
    id: 'kiem-soat',
    name: 'Controller',
    nameVi: 'Kiểm soát viên',
    description: 'Independent oversight. Read-only audit access. Per Luật Doanh nghiệp 2020',
    permissions: ['company:read', 'report:read', 'audit:view'] as const,
    isSystemRole: false,
  },
];

export const ROLES: readonly RoleDefinition[] = SYSTEM_ROLES;
export type Role = RoleDefinition['id'];

export function getRoleById(id: string): RoleDefinition | undefined {
  return SYSTEM_ROLES.find((r) => r.id === id);
}

export function getRolePermissions(roleId: string): readonly Permission[] {
  const role = getRoleById(roleId);
  return role?.permissions ?? [];
}

export function hasPermission(roleId: string, permission: Permission): boolean {
  const perms = getRolePermissions(roleId);
  return (perms as readonly string[]).includes(permission);
}

export function hasAnyPermission(roleIds: string[], permission: Permission): boolean {
  return roleIds.some((r) => hasPermission(r, permission));
}

export function hasAllPermissions(roleIds: string[], permissions: Permission[]): boolean {
  return permissions.every((p) => hasAnyPermission(roleIds, p));
}
