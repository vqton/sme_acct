import Database, { type Database as DatabaseType } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import type { User } from '../../domain/entities/User.js';
import type { Company } from '../../domain/entities/Company.js';
import { CompanyStatus } from '../../domain/entities/Company.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';

let nextUserId = 1;
export function resetNextUserId() { nextUserId = 1; }

export function seedUser(db: DatabaseType, overrides?: Partial<User>): User {
  const id = overrides?.id ?? nextUserId++;
  const user: User = {
    id,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: bcrypt.hashSync('TestPass123!', 10),
    isActive: true,
    twoFactorEnabled: false,
    failedLoginAttempts: 0,
    lockoutUntil: null,
    createdAt: new Date(),
    ...overrides,
  };
  db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, two_factor_enabled, failed_login_attempts, lockout_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(user.id, user.username, user.email, user.fullName, user.passwordHash, user.isActive ? 1 : 0, user.twoFactorEnabled ? 1 : 0, user.failedLoginAttempts ?? 0, user.lockoutUntil?.toISOString() ?? null, user.createdAt.toISOString());
  return user;
}

export function seedCompany(db: DatabaseType, overrides?: Partial<Company>): Company {
  const repo = new SQLiteCompanyRepository(db);
  return repo.save({
    id: 0,
    name: overrides?.name ?? 'Test Company',
    status: overrides?.status ?? CompanyStatus.Active,
    createdAt: overrides?.createdAt ?? new Date(),
    ...overrides,
  } as Company);
}

export function countAuditLogs(db: DatabaseType): number {
  return (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number }).c;
}

export function insertCompany(db: DatabaseType, name: string): Company {
  const id = (db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS next FROM companies').get() as { next: number }).next;
  db.prepare('INSERT INTO companies (id, name, status, created_at) VALUES (?, ?, ?, ?)')
    .run(id, name, 1, new Date().toISOString());
  return { id, name, status: CompanyStatus.Active, createdAt: new Date() };
}
