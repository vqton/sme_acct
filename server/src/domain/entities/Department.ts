import {
  DepartmentType,
  DepartmentStatus,
  CostAllocationMethod,
  BudgetControlLevel,
} from '../enums/DepartmentEnums.js';

export interface Department {
  id: number;
  companyId: number;
  code: string;
  name: string;
  nameEnglish?: string;
  departmentType: DepartmentType;
  parentId?: number;
  path: string;
  depth: number;
  sortOrder: number;

  managerUserId?: number;
  managerTitle?: string;
  deputyManagerUserId?: number;

  defaultSalaryAccount?: string;
  defaultExpenseAccount?: string;
  costAllocationMethod?: CostAllocationMethod;

  hasBudgetControl: boolean;
  budgetAlertThreshold: number;
  budgetControlLevel: BudgetControlLevel;

  status: DepartmentStatus;
  effectiveDate: string;
  dissolutionDate?: string;

  createdAt: Date;
  updatedAt?: Date;
  createdByUserId?: number;
  updatedByUserId?: number;
}

export type CreateDepartmentInput = {
  companyId: number;
  code: string;
  name: string;
  nameEnglish?: string;
  departmentType?: DepartmentType;
  parentId?: number;
  sortOrder?: number;
  managerUserId?: number;
  managerTitle?: string;
  deputyManagerUserId?: number;
  defaultSalaryAccount?: string;
  defaultExpenseAccount?: string;
  costAllocationMethod?: CostAllocationMethod;
  hasBudgetControl?: boolean;
  budgetAlertThreshold?: number;
  budgetControlLevel?: BudgetControlLevel;
  effectiveDate?: string;
  createdByUserId?: number;
};

export function createDepartment(data: CreateDepartmentInput, parent?: Department): Department {
  const id = 0;
  return {
    id,
    companyId: data.companyId,
    code: data.code,
    name: data.name,
    nameEnglish: data.nameEnglish,
    departmentType: data.departmentType ?? DepartmentType.CostCenter,
    parentId: data.parentId ?? parent?.id,
    path: parent ? `${parent.path}/${id}` : `/${id}`,
    depth: parent ? parent.depth + 1 : 0,
    sortOrder: data.sortOrder ?? 0,

    managerUserId: data.managerUserId,
    managerTitle: data.managerTitle,
    deputyManagerUserId: data.deputyManagerUserId,

    defaultSalaryAccount: data.defaultSalaryAccount,
    defaultExpenseAccount: data.defaultExpenseAccount,
    costAllocationMethod: data.costAllocationMethod,

    hasBudgetControl: data.hasBudgetControl ?? false,
    budgetAlertThreshold: data.budgetAlertThreshold ?? 80,
    budgetControlLevel: data.budgetControlLevel ?? BudgetControlLevel.None,

    status: DepartmentStatus.Active,
    effectiveDate: data.effectiveDate ?? new Date().toISOString().split('T')[0],

    createdAt: new Date(),
    createdByUserId: data.createdByUserId,
  };
}

export function deactivateDepartment(dept: Department): Department {
  return { ...dept, status: DepartmentStatus.Inactive, updatedAt: new Date() };
}

export function reactivateDepartment(dept: Department): Department {
  return { ...dept, status: DepartmentStatus.Active, updatedAt: new Date() };
}

export function dissolveDepartment(dept: Department, dissolutionDate?: string): Department {
  return {
    ...dept,
    status: DepartmentStatus.Dissolved,
    dissolutionDate: dissolutionDate ?? new Date().toISOString().split('T')[0],
    updatedAt: new Date(),
  };
}

export function reparentDepartment(dept: Department, newParent: Department): Department {
  const oldPathPrefix = dept.path;
  const newPath = newParent.path + '/' + dept.id;
  const depthDelta = newParent.depth + 1 - dept.depth;
  return {
    ...dept,
    parentId: newParent.id,
    path: newPath,
    depth: newParent.depth + 1,
    updatedAt: new Date(),
    _oldPathPrefix: oldPathPrefix,
    _depthDelta: depthDelta,
  } as Department & { _oldPathPrefix: string; _depthDelta: number };
}

export function isDescendantOf(dept: Department, potentialAncestor: Department): boolean {
  return dept.path.startsWith(potentialAncestor.path + '/') || dept.path === potentialAncestor.path;
}
