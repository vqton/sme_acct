import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { RoleSeeder } from './RoleSeeder.js';
import { SQLiteUserRepository } from './UserRepository.js';
import { SQLiteRoleRepository } from './RoleRepository.js';
import { ROLES } from '../../domain/entities/Role.js';

function createDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

describe('RoleSeeder', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createDb();
    process.env.SUPER_ADMIN_PASSWORD = 'TestAdminPass1!';
  });

  afterEach(() => {
    delete process.env.SUPER_ADMIN_PASSWORD;
    delete process.env.SUPER_ADMIN_USERNAME;
    delete process.env.SUPER_ADMIN_EMAIL;
  });

  it('seeds all roles with correct permissions from domain config', () => {
    const seeder = new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db));
    seeder.seed();

    for (const role of ROLES) {
      const rows = db.prepare('SELECT permission FROM role_permissions WHERE role = ?').all(role.id) as { permission: string }[];
      const perms = rows.map((r) => r.permission);
      expect(perms.sort()).toEqual([...role.permissions].sort());
    }
  });

  it('creates super admin user with he-thong role', () => {
    const seeder = new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db));
    seeder.seed();

    const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as { id: number } | undefined;
    expect(admin).toBeDefined();

    const roles = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').all(admin!.id) as { role: string }[];
    expect(roles.map((r) => r.role)).toContain('he-thong');
  });

  it('is idempotent — running twice does not duplicate rows', () => {
    const seeder = new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db));
    seeder.seed();
    seeder.seed();

    const users = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
    expect(users.c).toBe(1);

    const roles = db.prepare('SELECT COUNT(*) as c FROM user_roles').get() as { c: number };
    expect(roles.c).toBe(1);

    const perms = db.prepare('SELECT COUNT(*) as c FROM role_permissions').get() as { c: number };
    expect(perms.c).toBe(ROLES.reduce((sum, r) => sum + r.permissions.length, 0));
  });

  it('does not overwrite existing admin user password', () => {
    const userRepo = new SQLiteUserRepository(db);
    const roleRepo = new SQLiteRoleRepository(db);

    const seeder1 = new RoleSeeder(userRepo, roleRepo);
    seeder1.seed();
    const first = userRepo.findByUsername('admin');

    const seeder2 = new RoleSeeder(userRepo, roleRepo);
    seeder2.seed();
    const second = userRepo.findByUsername('admin');

    expect(first!.passwordHash).toBe(second!.passwordHash);
  });

  it('respects env vars for super admin credentials', () => {
    process.env.SUPER_ADMIN_USERNAME = 'super';
    process.env.SUPER_ADMIN_EMAIL = 'super@test.vn';
    process.env.SUPER_ADMIN_PASSWORD = 'SuperSecret1!';

    const seeder = new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db));
    seeder.seed();

    const admin = db.prepare('SELECT username, email FROM users WHERE username = ?').get('super') as { username: string; email: string } | undefined;
    expect(admin).toBeDefined();
    expect(admin!.email).toBe('super@test.vn');

    const roles = db.prepare('SELECT role FROM user_roles WHERE user_id = (SELECT id FROM users WHERE username = ?)').all('super') as { role: string }[];
    expect(roles.map((r) => r.role)).toContain('he-thong');
  });

  it('seeds all 11 Vietnamese accounting roles', () => {
    const seeder = new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db));
    seeder.seed();

    const rowCount = db.prepare('SELECT COUNT(DISTINCT role) as c FROM role_permissions').get() as { c: number };
    expect(rowCount.c).toBe(ROLES.length);
  });
});
