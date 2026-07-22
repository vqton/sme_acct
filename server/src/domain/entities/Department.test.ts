import { describe, it, expect } from 'vitest';
import {
  createDepartment,
  deactivateDepartment,
  reactivateDepartment,
  dissolveDepartment,
  reparentDepartment,
  isDescendantOf,
} from './Department.js';
import {
  DepartmentType,
  DepartmentStatus,
  CostAllocationMethod,
  BudgetControlLevel,
} from '../enums/DepartmentEnums.js';

describe('Department', () => {
  const baseInput = {
    companyId: 'c1',
    code: 'TCKT',
    name: 'Trung tâm Kế toán – Tài chính',
    createdByUserId: 'u1',
  };

  describe('createDepartment', () => {
    it('creates root department with defaults', () => {
      const d = createDepartment(baseInput);
      expect(d.id).toBeDefined();
      expect(d.code).toBe('TCKT');
      expect(d.name).toBe('Trung tâm Kế toán – Tài chính');
      expect(d.departmentType).toBe(DepartmentType.CostCenter);
      expect(d.path).toBe(`/${d.id}`);
      expect(d.depth).toBe(0);
      expect(d.status).toBe(DepartmentStatus.Active);
      expect(d.hasBudgetControl).toBe(false);
      expect(d.budgetAlertThreshold).toBe(80);
      expect(d.budgetControlLevel).toBe(BudgetControlLevel.None);
      expect(d.sortOrder).toBe(0);
      expect(d.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.createdAt).toBeInstanceOf(Date);
      expect(d.createdByUserId).toBe('u1');
    });

    it('creates child department with computed path and depth', () => {
      const parent = createDepartment({ ...baseInput, code: 'PARENT' });
      const child = createDepartment(
        { ...baseInput, code: 'CHILD', parentId: parent.id },
        parent,
      );
      expect(child.parentId).toBe(parent.id);
      expect(child.path).toBe(`${parent.path}/${child.id}`);
      expect(child.depth).toBe(parent.depth + 1);
    });

    it('accepts all optional fields', () => {
      const d = createDepartment({
        ...baseInput,
        departmentType: DepartmentType.ProfitCenter,
        sortOrder: 5,
        managerUserId: 'm1',
        managerTitle: 'Kế toán trưởng',
        deputyManagerUserId: 'd1',
        defaultSalaryAccount: '6421',
        defaultExpenseAccount: '642',
        costAllocationMethod: CostAllocationMethod.Direct,
        hasBudgetControl: true,
        budgetAlertThreshold: 90,
        budgetControlLevel: BudgetControlLevel.Hard,
        effectiveDate: '2024-01-01',
      });
      expect(d.departmentType).toBe(DepartmentType.ProfitCenter);
      expect(d.sortOrder).toBe(5);
      expect(d.managerUserId).toBe('m1');
      expect(d.managerTitle).toBe('Kế toán trưởng');
      expect(d.defaultSalaryAccount).toBe('6421');
      expect(d.hasBudgetControl).toBe(true);
      expect(d.budgetAlertThreshold).toBe(90);
      expect(d.budgetControlLevel).toBe(BudgetControlLevel.Hard);
      expect(d.effectiveDate).toBe('2024-01-01');
    });
  });

  describe('deactivateDepartment / reactivateDepartment', () => {
    it('sets status to Inactive', () => {
      const d = createDepartment(baseInput);
      const inactive = deactivateDepartment(d);
      expect(inactive.status).toBe(DepartmentStatus.Inactive);
      expect(inactive.updatedAt).toBeDefined();
    });

    it('reactivates to Active', () => {
      const d = createDepartment(baseInput);
      const inactive = deactivateDepartment(d);
      const active = reactivateDepartment(inactive);
      expect(active.status).toBe(DepartmentStatus.Active);
    });
  });

  describe('dissolveDepartment', () => {
    it('sets status to Dissolved with terminal state', () => {
      const d = createDepartment(baseInput);
      const dissolved = dissolveDepartment(d, '2026-07-01');
      expect(dissolved.status).toBe(DepartmentStatus.Dissolved);
      expect(dissolved.dissolutionDate).toBe('2026-07-01');
      expect(dissolved.updatedAt).toBeDefined();
    });

    it('defaults dissolutionDate to today', () => {
      const d = createDepartment(baseInput);
      const dissolved = dissolveDepartment(d);
      expect(dissolved.dissolutionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isDescendantOf', () => {
    it('detects ancestor relationship', () => {
      const root = createDepartment(baseInput);
      const child = createDepartment({ ...baseInput, code: 'CHILD' }, root);
      child.path = `${root.path}/${child.id}`;
      expect(isDescendantOf(child, root)).toBe(true);
      expect(isDescendantOf(root, child)).toBe(false);
    });
  });
});
