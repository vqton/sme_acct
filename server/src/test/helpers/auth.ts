import Database, { type Database as DatabaseType } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import type { User } from '../../domain/entities/User.js';

export function seedUser(db: DatabaseType, overrides?: Partial<User>): User {
  const id = overrides?.id ?? crypto.randomUUID();
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

export function countAuditLogs(db: DatabaseType): number {
  return (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number }).c;
}
