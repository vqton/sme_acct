import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteDepartmentRepository } from '../infrastructure/database/DepartmentRepository.js';
import { SQLiteUserDepartmentRepository } from '../infrastructure/database/UserDepartmentRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { DepartmentUseCases } from './DepartmentUseCases.js';
import { DepartmentType, DepartmentStatus } from '../domain/enums/DepartmentEnums.js';

describe('DepartmentUseCases', () => {
  let db: Database.Database;
  let deptRepo: SQLiteDepartmentRepository;
  let userDeptRepo: SQLiteUserDepartmentRepository;
  let useCases: DepartmentUseCases;
  const companyId = 'c-uc';

  function seedUser(id: string) {
    db.prepare('INSERT OR IGNORE INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, `user_${id}`, `${id}@test.com`, `User ${id}`, 'hash', 1, new Date().toISOString());
  }

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    deptRepo = new SQLiteDepartmentRepository(db);
    userDeptRepo = new SQLiteUserDepartmentRepository(db);
    useCases = new DepartmentUseCases(deptRepo, userDeptRepo);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyRepo.save({ id: companyId, name: 'UC Test Co', status: 1, createdAt: new Date() });
  });

  afterAll(() => db.close());

  describe('create', () => {
    it('creates root department', () => {
      const d = useCases.create({ companyId, code: 'TCKT', name: 'Tài chính Kế toán' });
      expect(d.id).toBeDefined();
      expect(d.code).toBe('TCKT');
      expect(d.depth).toBe(0);
      expect(d.path).toBe(`/${d.id}`);
    });

    it('creates child department', () => {
      const parent = useCases.create({ companyId, code: 'KD', name: 'Kinh doanh' });
      const child = useCases.create({ companyId, code: 'BH', name: 'Bán hàng', parentId: parent.id });
      expect(child.parentId).toBe(parent.id);
      expect(child.depth).toBe(1);
      expect(child.path).toBe(`${parent.path}/${child.id}`);
    });

    it('rejects duplicate code', () => {
      expect(() => useCases.create({ companyId, code: 'TCKT', name: 'Duplicate' })).toThrow('already exists');
    });

    it('rejects non-existent parent', () => {
      expect(() => useCases.create({ companyId, code: 'BAD', name: 'Bad Parent', parentId: 'nonexist' })).toThrow('not found');
    });
  });

  describe('getById / list', () => {
    it('gets by id', () => {
      const d = useCases.create({ companyId, code: 'GET', name: 'Get Test' });
      const found = useCases.getById(d.id);
      expect(found.name).toBe('Get Test');
    });

    it('throws on missing', () => {
      expect(() => useCases.getById('nonexist')).toThrow('not found');
    });

    it('lists all for company', () => {
      const list = useCases.list(companyId);
      expect(list.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('update', () => {
    it('updates department fields', () => {
      const d = useCases.create({ companyId, code: 'UPD', name: 'Original' });
      const updated = useCases.update(d.id, { name: 'Updated', nameEnglish: 'Updated EN' });
      expect(updated.name).toBe('Updated');
      expect(updated.nameEnglish).toBe('Updated EN');
      expect(updated.updatedAt).toBeDefined();
    });
  });

  describe('deactivate / reactivate', () => {
    it('deactivates department', () => {
      const d = useCases.create({ companyId, code: 'DEACT', name: 'Deactivate Me' });
      const inactive = useCases.deactivate(d.id);
      expect(inactive.status).toBe(DepartmentStatus.Inactive);
    });

    it('reactivates department', () => {
      const d = useCases.create({ companyId, code: 'REACT', name: 'Reactivate Me' });
      useCases.deactivate(d.id);
      const active = useCases.reactivate(d.id);
      expect(active.status).toBe(DepartmentStatus.Active);
    });

    it('rejects reactivate dissolved', () => {
      const d = useCases.create({ companyId, code: 'DISSOLVE2', name: 'Dissolve Me' });
      useCases.dissolve(d.id);
      expect(() => useCases.reactivate(d.id)).toThrow('Cannot reactivate dissolved');
    });
  });

  describe('dissolve', () => {
    it('dissolves empty department', () => {
      const d = useCases.create({ companyId, code: 'DISS', name: 'Dissolve' });
      const dissolved = useCases.dissolve(d.id, '2026-07-01');
      expect(dissolved.status).toBe(DepartmentStatus.Dissolved);
      expect(dissolved.dissolutionDate).toBe('2026-07-01');
    });

    it('rejects dissolve with children', () => {
      const parent = useCases.create({ companyId, code: 'DISS-P', name: 'Dissolve Parent' });
      useCases.create({ companyId, code: 'DISS-C', name: 'Dissolve Child', parentId: parent.id });
      expect(() => useCases.dissolve(parent.id)).toThrow('with children');
    });
  });

  describe('reparent', () => {
    it('moves department under new parent', () => {
      const p1 = useCases.create({ companyId, code: 'RP-P1', name: 'Parent 1' });
      const p2 = useCases.create({ companyId, code: 'RP-P2', name: 'Parent 2' });
      const child = useCases.create({ companyId, code: 'RP-C', name: 'Child', parentId: p1.id });
      const moved = useCases.reparent(child.id, p2.id);
      expect(moved.parentId).toBe(p2.id);
      expect(moved.path).toBe(`${p2.path}/${child.id}`);
    });

    it('rejects circular reference', () => {
      const parent = useCases.create({ companyId, code: 'CIRC-P', name: 'Circ Parent' });
      const child = useCases.create({ companyId, code: 'CIRC-C', name: 'Circ Child', parentId: parent.id });
      expect(() => useCases.reparent(parent.id, child.id)).toThrow('descendant');
    });
  });

  describe('delete', () => {
    it('deletes leaf department', () => {
      const d = useCases.create({ companyId, code: 'DEL', name: 'Delete Me' });
      useCases.delete(d.id);
      expect(() => useCases.getById(d.id)).toThrow('not found');
    });

    it('rejects delete with children', () => {
      const parent = useCases.create({ companyId, code: 'DEL-P', name: 'Delete Parent' });
      useCases.create({ companyId, code: 'DEL-C', name: 'Delete Child', parentId: parent.id });
      expect(() => useCases.delete(parent.id)).toThrow('with children');
    });
  });

  describe('user-department assignment', () => {
    it('assigns user to department', () => {
      seedUser('u1');
      const d = useCases.create({ companyId, code: 'ASGN', name: 'Assign' });
      const ud = useCases.assignUser({ userId: 'u1', departmentId: d.id, isPrimary: true, jobTitle: 'Head' });
      expect(ud.userId).toBe('u1');
      expect(ud.isPrimary).toBe(true);
    });

    it('removes old primary flag when setting new primary', () => {
      seedUser('u2');
      const d1 = useCases.create({ companyId, code: 'ASGN1', name: 'Assign 1' });
      const d2 = useCases.create({ companyId, code: 'ASGN2', name: 'Assign 2' });
      useCases.assignUser({ userId: 'u2', departmentId: d1.id, isPrimary: true });
      useCases.assignUser({ userId: 'u2', departmentId: d2.id, isPrimary: true });
      const list = useCases.getUserDepartments('u2');
      expect(list.filter((ud) => ud.isPrimary)).toHaveLength(1);
      expect(list.find((ud) => ud.departmentId === d2.id)!.isPrimary).toBe(true);
    });

    it('lists department users', () => {
      seedUser('u3');
      const d = useCases.create({ companyId, code: 'MEM', name: 'Members' });
      useCases.assignUser({ userId: 'u3', departmentId: d.id, isPrimary: true });
      const members = useCases.getDepartmentUsers(d.id);
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe('u3');
    });

    it('removes user from department', () => {
      seedUser('u4');
      const d1 = useCases.create({ companyId, code: 'REM1', name: 'Remove 1' });
      const d2 = useCases.create({ companyId, code: 'REM2', name: 'Remove 2' });
      useCases.assignUser({ userId: 'u4', departmentId: d1.id, isPrimary: false });
      useCases.assignUser({ userId: 'u4', departmentId: d2.id, isPrimary: true });
      useCases.removeUserFromDepartment('u4', d1.id);
      expect(useCases.getUserDepartments('u4')).toHaveLength(1);
    });

    it('rejects removing user from last department', () => {
      seedUser('u5');
      const d = useCases.create({ companyId, code: 'LAST', name: 'Last Dept' });
      useCases.assignUser({ userId: 'u5', departmentId: d.id, isPrimary: true });
      expect(() => useCases.removeUserFromDepartment('u5', d.id)).toThrow('must belong to at least 1');
    });
  });
});
