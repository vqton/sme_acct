import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteDepartmentRepository } from './DepartmentRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { DepartmentType, DepartmentStatus } from '../../domain/enums/DepartmentEnums.js';

describe('SQLiteDepartmentRepository', () => {
  let db: Database.Database;
  let repo: SQLiteDepartmentRepository;
  const companyId = 'c-dept';

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteDepartmentRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({ id: companyId, name: 'Dept Test Co', status: 1, createdAt: new Date() });
  });

  afterAll(() => db.close());

  function makeDept(overrides: Record<string, unknown> = {}) {
    return repo.save({
      id: overrides.id as string ?? crypto.randomUUID(),
      companyId: companyId,
      code: overrides.code as string ?? 'DEPT',
      name: overrides.name as string ?? 'Test Department',
      nameEnglish: overrides.nameEnglish as string | undefined,
      departmentType: (overrides.departmentType as number) ?? DepartmentType.CostCenter,
      parentId: overrides.parentId as string | undefined,
      path: overrides.path as string ?? `/${overrides.id as string ?? crypto.randomUUID()}`,
      depth: overrides.depth as number ?? 0,
      sortOrder: overrides.sortOrder as number ?? 0,
      managerUserId: overrides.managerUserId as string | undefined,
      managerTitle: overrides.managerTitle as string | undefined,
      deputyManagerUserId: overrides.deputyManagerUserId as string | undefined,
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
      createdByUserId: overrides.createdByUserId as string | undefined,
      updatedByUserId: undefined,
    });
  }

  it('saves and finds by id', () => {
    makeDept({ id: 'd-root', code: 'ROOT', name: 'Root', path: '/d-root' });
    const found = repo.findById('d-root');
    expect(found).not.toBeNull();
    expect(found!.code).toBe('ROOT');
    expect(found!.status).toBe(DepartmentStatus.Active);
  });

  it('finds by company', () => {
    const depts = repo.findByCompanyId(companyId);
    expect(depts.length).toBeGreaterThanOrEqual(1);
  });

  it('finds by code unique within company', () => {
    makeDept({ id: 'd-code', code: 'UNIQUE', name: 'Unique Dept', path: '/d-code' });
    const found = repo.findByCode(companyId, 'UNIQUE');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Unique Dept');
  });

  it('returns null for unknown code', () => {
    expect(repo.findByCode(companyId, 'NONEXIST')).toBeNull();
  });

  it('finds children', () => {
    const parent = makeDept({ id: 'd-parent', code: 'PARENT', name: 'Parent', path: '/d-parent' });
    const child = makeDept({ id: 'd-child', code: 'CHILD', name: 'Child', parentId: 'd-parent', path: '/d-parent/d-child', depth: 1 });
    const children = repo.findChildren('d-parent');
    expect(children.length).toBe(1);
    expect(children[0].id).toBe('d-child');
  });

  it('finds subtree by path prefix', () => {
    const subtree = repo.findSubtree('/d-parent');
    expect(subtree.length).toBeGreaterThanOrEqual(1);
  });

  it('updates existing entity', () => {
    makeDept({ id: 'd-upd', code: 'UPD', name: 'Original', path: '/d-upd' });
    repo.save({
      id: 'd-upd', companyId, code: 'UPD', name: 'Updated', departmentType: DepartmentType.ProfitCenter,
      path: '/d-upd', depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: true, budgetAlertThreshold: 90, budgetControlLevel: 3,
      effectiveDate: '2026-01-01', createdAt: new Date(), updatedAt: new Date(),
    });
    const found = repo.findById('d-upd');
    expect(found!.name).toBe('Updated');
    expect(found!.departmentType).toBe(DepartmentType.ProfitCenter);
    expect(found!.hasBudgetControl).toBe(true);
  });

  it('updates subtree paths', () => {
    const oldRoot = '/d-parent';
    const newRoot = '/d-newparent';
    repo.updateSubtreePaths(oldRoot, newRoot, 1);
    const child = repo.findById('d-child');
    expect(child!.path).toBe('/d-newparent/d-child');
    expect(child!.depth).toBe(2);
  });

  it('deletes department', () => {
    makeDept({ id: 'd-del', code: 'DEL', name: 'Delete Me', path: '/d-del' });
    repo.delete('d-del');
    expect(repo.findById('d-del')).toBeNull();
  });
});
