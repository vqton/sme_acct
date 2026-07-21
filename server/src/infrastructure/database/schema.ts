import type { Database } from 'better-sqlite3';
import { getDb } from './connection.js';

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_vietnamese TEXT,
      tax_code TEXT,
      enterprise_code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      legal_representative TEXT,
      status INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_companies (
      user_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      role TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, company_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL UNIQUE,
      fiscal_year_start_month INTEGER NOT NULL DEFAULT 1,
      currency_code TEXT NOT NULL DEFAULT 'VND',
      decimal_places INTEGER NOT NULL DEFAULT 2,
      accounting_regime INTEGER NOT NULL DEFAULT 1,
      tax_calculation_method INTEGER NOT NULL DEFAULT 1,
      rounding_method INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id TEXT,
      token_hash TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      device_name TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT,
      revoked_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id TEXT,
      detail TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      PRIMARY KEY (user_id, role)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    )
  `);

  // Migration: add account lockout columns to users
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = userCols.map((c) => c.name);
  if (!colNames.includes('failed_login_attempts')) {
    db.exec("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0");
  }
  if (!colNames.includes('lockout_until')) {
    db.exec("ALTER TABLE users ADD COLUMN lockout_until TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: add userAgent to audit_logs
  const auditCols = db.prepare("PRAGMA table_info(audit_logs)").all() as { name: string }[];
  const auditColNames = auditCols.map((c) => c.name);
  if (!auditColNames.includes('user_agent')) {
    db.exec("ALTER TABLE audit_logs ADD COLUMN user_agent TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      used_at TEXT
    )
  `);

  // Migration: add 2FA columns to users
  if (!colNames.includes('two_factor_enabled')) {
    db.exec("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 0");
  }
  if (!colNames.includes('totp_secret')) {
    db.exec("ALTER TABLE users ADD COLUMN totp_secret TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS backup_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export function initDatabase(): void {
  runMigrations(getDb());
}
