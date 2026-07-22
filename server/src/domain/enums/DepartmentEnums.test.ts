import { describe, it, expect } from 'vitest';
import {
  DepartmentType,
  DepartmentStatus,
  CostAllocationMethod,
  BudgetControlLevel,
} from './DepartmentEnums.js';

describe('DepartmentType', () => {
  it('has 4 types', () => {
    expect(DepartmentType.CostCenter).toBe(1);
    expect(DepartmentType.ProfitCenter).toBe(2);
    expect(DepartmentType.InvestmentCenter).toBe(3);
    expect(DepartmentType.SupportCenter).toBe(4);
  });
});

describe('DepartmentStatus', () => {
  it('has 3 statuses', () => {
    expect(DepartmentStatus.Active).toBe(1);
    expect(DepartmentStatus.Inactive).toBe(2);
    expect(DepartmentStatus.Dissolved).toBe(3);
  });
});

describe('CostAllocationMethod', () => {
  it('has 3 methods', () => {
    expect(CostAllocationMethod.Direct).toBe(1);
    expect(CostAllocationMethod.StepDown).toBe(2);
    expect(CostAllocationMethod.Reciprocal).toBe(3);
  });
});

describe('BudgetControlLevel', () => {
  it('has 3 levels', () => {
    expect(BudgetControlLevel.None).toBe(1);
    expect(BudgetControlLevel.Soft).toBe(2);
    expect(BudgetControlLevel.Hard).toBe(3);
  });
});
