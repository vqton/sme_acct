import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteDepartmentRepository } from './DepartmentRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { DepartmentType, DepartmentStatus } from '../../domain/enums/DepartmentEnums.js';

describe('SQLiteDepartmentRepository', () => {
  let db: Database.Database;
  let repo: SQLiteDepartmentRepository;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteDepartmentRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    const company = companyRepo.save({ id: 0, name: 'Dept Test Co', status: 1, createdAt: new Date() });
    companyId = company.id;
  });

  afterAll(() => db.close());

  function makeDept(overrides: Record<string, unknown> = {}) {
    const dept = repo.save({
      id: 0,
      companyId,
      code: overrides.code as string ?? 'DEPT',
      name: overrides.name as string ?? 'Test Department',
      nameEnglish: overrides.nameEnglish as string | undefined,
      departmentType: (overrides.departmentType as number) ?? DepartmentType.CostCenter,
      parentId: overrides.parentId as number | undefined,
      path: overrides.path as string ?? '',
      depth: overrides.depth as number ?? 0,
      sortOrder: overrides.sortOrder as number ?? 0,
      managerUserId: overrides.managerUserId as number | undefined,
      managerTitle: overrides.managerTitle as string | undefined,
      deputyManagerUserId: overrides.deputyManagerUserId as number | undefined,
      defaultSalaryAccount: overrides.defaultSalaryAccount as string | undefined,
      defaultExpenseAccount: overrides.defaultExpenseAccount as string | undefined,
      costAllocationMethod: undefined,
      hasBudgetControl: false,
      budgetAlertThreshold: 80,
      budgetControlLevel: 1,
      status: DepartmentStatus.Active,
      effectiveDate: overrides.effectiveDate as string ?? '2026-01-01',
      dissolutionDate: undefined,
      createdAt: new Date(),
      updatedAt: undefined,
      createdByUserId: overrides.createdByUserId as number | undefined,
      updatedByUserId: undefined,
    });
    dept.path = `/${dept.id}`;
    repo.save(dept);
    return dept;
  }

  it('saves and finds by id', () => {
    const dept = makeDept({ code: 'ROOT', name: 'Root' });
    const found = repo.findById(dept.id);
    expect(found).not.toBeNull();
    expect(found!.code).toBe('ROOT');
    expect(found!.status).toBe(DepartmentStatus.Active);
  });

  it('finds by company', () => {
    const depts = repo.findByCompanyId(companyId);
    expect(depts.length).toBeGreaterThanOrEqual(1);
  });

  it('finds by code unique within company', () => {
    const dept = makeDept({ code: 'UNIQUE', name: 'Unique Dept' });
    const found = repo.findByCode(companyId, 'UNIQUE');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Unique Dept');
  });

  it('returns null for unknown code', () => {
    expect(repo.findByCode(companyId, 'NONEXIST')).toBeNull();
  });

  it('finds children', () => {
    const parent = makeDept({ code: 'PARENT', name: 'Parent' });
    const child = makeDept({ code: 'CHILD', name: 'Child', parentId: parent.id, depth: 1 });
    const children = repo.findChildren(parent.id);
    expect(children.length).toBe(1);
    expect(children[0].id).toBe(child.id);
  });

  it('finds subtree by path prefix', () => {
    const parent = repo.save({
      id: 0, companyId, code: 'SUBTREE', name: 'Subtree Root',
      departmentType: DepartmentType.CostCenter, path: '', depth: 0,
      sortOrder: 0, status: DepartmentStatus.Active, hasBudgetControl: false,
      budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
    parent.path = `/${parent.id}`;
    repo.save(parent);
    const child = makeDept({ code: 'STC', name: 'ST Child', parentId: parent.id, depth: 1 });
    const subtree = repo.findSubtree(`/${parent.id}`);
    expect(subtree.length).toBeGreaterThanOrEqual(1);
  });

  it('updates existing entity', () => {
    const dept = makeDept({ code: 'UPD', name: 'Original' });
    repo.save({
      id: dept.id, companyId, code: 'UPD', name: 'Updated', departmentType: DepartmentType.ProfitCenter,
      path: dept.path, depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: true, budgetAlertThreshold: 90, budgetControlLevel: 3,
      effectiveDate: '2026-01-01', createdAt: new Date(), updatedAt: new Date(),
    });
    const found = repo.findById(dept.id);
    expect(found!.name).toBe('Updated');
    expect(found!.departmentType).toBe(DepartmentType.ProfitCenter);
    expect(found!.hasBudgetControl).toBe(true);
  });

  it('updates subtree paths', () => {
    const root = makeDept({ code: 'UPDSUB', name: 'Update Sub Root' });
    const child = repo.save({
      id: 0, companyId, code: 'USC', name: 'US Child',
      parentId: root.id, path: `${root.path}/${root.id + 1}`, depth: 1,
      departmentType: DepartmentType.CostCenter, sortOrder: 0,
      status: DepartmentStatus.Active, hasBudgetControl: false,
      budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
    child.path = `${root.path}/${child.id}`;
    repo.save(child);
    const newPath = `/moved`;
    repo.updateSubtreePaths(root.path, newPath, 1);
    const updatedChild = repo.findById(child.id);
    expect(updatedChild!.path).toBe(`${newPath}/${child.id}`);
    expect(updatedChild!.depth).toBe(2);
  });

  it('deletes department', () => {
    const dept = makeDept({ code: 'DEL', name: 'Delete Me' });
    repo.delete(dept.id);
    expect(repo.findById(dept.id)).toBeNull();
  });
});
