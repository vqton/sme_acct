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
  const companyId = 1;
  const userId1 = 1;
  const userId2 = 2;
  const userId3 = 3;
  const userIdDel = 4;
  const deptIdSales = 1;
  const deptIdMkt = 2;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    repo = new SQLiteUserDepartmentRepository(db);
    deptRepo = new SQLiteDepartmentRepository(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({ id: 0, name: 'UserDept Co', status: 1, createdAt: new Date() });

    // Seed users for FK references
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertUser.run(userId1, 'u1', 'u1@t.com', 'U1', 'hash', 1, new Date().toISOString());
    insertUser.run(userId2, 'u2', 'u2@t.com', 'U2', 'hash', 1, new Date().toISOString());
    insertUser.run(userId3, 'u3', 'u3@t.com', 'U3', 'hash', 1, new Date().toISOString());
    insertUser.run(userIdDel, 'udel', 'udel@t.com', 'UDel', 'hash', 1, new Date().toISOString());

    deptRepo.save({
      id: 0, companyId, code: 'SALES', name: 'Sales', departmentType: 2,
      path: '/1', depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: false, budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
    deptRepo.save({
      id: 0, companyId, code: 'MKT', name: 'Marketing', departmentType: 1,
      path: '/2', depth: 0, sortOrder: 0, status: DepartmentStatus.Active,
      hasBudgetControl: false, budgetAlertThreshold: 80, budgetControlLevel: 1,
      effectiveDate: '2026-01-01', createdAt: new Date(),
    });
  });

  afterAll(() => db.close());

  it('saves user-department assignment', () => {
    const ud = repo.save({ userId: userId1, departmentId: deptIdSales, isPrimary: true, isActive: true, assignedAt: new Date(), jobTitle: 'Trưởng phòng' });
    expect(ud.userId).toBe(userId1);
    expect(ud.isPrimary).toBe(true);
  });

  it('finds by user id', () => {
    repo.save({ userId: userId2, departmentId: deptIdMkt, isPrimary: true, isActive: true, assignedAt: new Date() });
    const list = repo.findByUserId(userId2);
    expect(list).toHaveLength(1);
    expect(list[0].departmentId).toBe(deptIdMkt);
  });

  it('finds by department id', () => {
    const list = repo.findByDepartmentId(deptIdSales);
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe(userId1);
  });

  it('finds one record', () => {
    const found = repo.findOne(userId1, deptIdSales);
    expect(found).not.toBeNull();
    expect(found!.jobTitle).toBe('Trưởng phòng');
  });

  it('returns null for non-existent pair', () => {
    expect(repo.findOne(userId1, deptIdMkt)).toBeNull();
  });

  it('removes primary flag', () => {
    repo.save({ userId: userId3, departmentId: deptIdSales, isPrimary: true, isActive: true, assignedAt: new Date() });
    repo.removePrimaryFlag(userId3);
    const ud = repo.findOne(userId3, deptIdSales);
    expect(ud!.isPrimary).toBe(false);
  });

  it('counts members by department', () => {
    const count = repo.countByDepartmentId(deptIdSales);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('deletes assignment', () => {
    repo.save({ userId: userIdDel, departmentId: deptIdSales, isPrimary: false, isActive: true, assignedAt: new Date() });
    repo.delete(userIdDel, deptIdSales);
    expect(repo.findOne(userIdDel, deptIdSales)).toBeNull();
  });
});
