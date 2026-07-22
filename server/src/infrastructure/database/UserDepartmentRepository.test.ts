import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteUserDepartmentRepository } from './UserDepartmentRepository.js';
import { SQLiteCompanyRepository } from './CompanyRepository.js';
import { SQLiteDepartmentRepository } from './DepartmentRepository.js';
import { DepartmentStatus } from '../../domain/enums/DepartmentEnums.js';

describe('SQLiteUserDepartmentRepository', () => {
  let db: Database.Database;
  let repo: SQLiteUserDepartmentRepository;
  let deptRepo: SQLiteDepartmentRepository;
  const companyId = 'c-ud';

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteUserDepartmentRepository(db);
    deptRepo = new SQLiteDepartmentRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({ id: companyId, name: 'UserDept Co', status: 1, createdAt: new Date() });

    // Seed users for FK references
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertUser.run('u1', 'u1', 'u1@t.com', 'U1', 'hash', 1, new Date().toISOString());
    insertUser.run('u2', 'u2', 'u2@t.com', 'U2', 'hash', 1, new Date().toISOString());
    insertUser.run('u3', 'u3', 'u3@t.com', 'U3', 'hash', 1, new Date().toISOString());
    insertUser.run('u-del', 'udel', 'udel@t.com', 'UDel', 'hash', 1, new Date().toISOString());

    deptRepo.save({
      id: 'd-sales', companyId, code: 'SALES', name: 'Sales', departmentType: 2,
      path: '/d-sales', depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: false, budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
    deptRepo.save({
      id: 'd-mkt', companyId, code: 'MKT', name: 'Marketing', departmentType: 1,
      path: '/d-mkt', depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: false, budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
  });

  afterAll(() => db.close());

  it('saves user-department assignment', () => {
    const ud = repo.save({ userId: 'u1', departmentId: 'd-sales', isPrimary: true, isActive: true, assignedAt: new Date(), jobTitle: 'Trưởng phòng' });
    expect(ud.userId).toBe('u1');
    expect(ud.isPrimary).toBe(true);
  });

  it('finds by user id', () => {
    repo.save({ userId: 'u2', departmentId: 'd-mkt', isPrimary: true, isActive: true, assignedAt: new Date() });
    const list = repo.findByUserId('u2');
    expect(list).toHaveLength(1);
    expect(list[0].departmentId).toBe('d-mkt');
  });

  it('finds by department id', () => {
    const list = repo.findByDepartmentId('d-sales');
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe('u1');
  });

  it('finds one record', () => {
    const found = repo.findOne('u1', 'd-sales');
    expect(found).not.toBeNull();
    expect(found!.jobTitle).toBe('Trưởng phòng');
  });

  it('returns null for non-existent pair', () => {
    expect(repo.findOne('u1', 'd-mkt')).toBeNull();
  });

  it('removes primary flag', () => {
    repo.save({ userId: 'u3', departmentId: 'd-sales', isPrimary: true, isActive: true, assignedAt: new Date() });
    repo.removePrimaryFlag('u3');
    const ud = repo.findOne('u3', 'd-sales');
    expect(ud!.isPrimary).toBe(false);
  });

  it('counts members by department', () => {
    const count = repo.countByDepartmentId('d-sales');
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('deletes assignment', () => {
    repo.save({ userId: 'u-del', departmentId: 'd-sales', isPrimary: false, isActive: true, assignedAt: new Date() });
    repo.delete('u-del', 'd-sales');
    expect(repo.findOne('u-del', 'd-sales')).toBeNull();
  });
});
