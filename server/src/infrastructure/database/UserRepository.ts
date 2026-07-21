import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import { getDb } from '../database/connection.js';

export class SQLiteUserRepository implements UserRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteUserRepository['prepareQueries']>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteUserRepository.prepareQueries(this.db);
  }

  private static prepareQueries(db: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof db.prepare> | null = null;
      return {
        get: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.get as any)(...params) as unknown;
        },
        all: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.all as any)(...params) as unknown[];
        },
        run: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.run as any)(...params);
        },
      };
    };

    return {
      findById: s('SELECT * FROM users WHERE id = ?'),
      findAll: s('SELECT * FROM users'),
      findByUsername: s('SELECT * FROM users WHERE username = ?'),
      findByEmail: s('SELECT * FROM users WHERE email = ?'),
      insert: s(`INSERT INTO users (id, username, email, full_name, password_hash, is_active, two_factor_enabled, totp_secret, failed_login_attempts, lockout_until, created_at, updated_at) VALUES (@id, @username, @email, @fullName, @passwordHash, @isActive, @twoFactorEnabled, @totpSecret, @failedLoginAttempts, @lockoutUntil, @createdAt, @updatedAt)`),
      update: s(`UPDATE users SET username=@username, email=@email, full_name=@fullName, password_hash=@passwordHash, is_active=@isActive, two_factor_enabled=@twoFactorEnabled, totp_secret=@totpSecret, failed_login_attempts=@failedLoginAttempts, lockout_until=@lockoutUntil, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM users WHERE id = ?'),
    };
  }

  findById(id: string): User | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): User[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByUsername(username: string): User | null {
    const row = this.stmts.findByUsername.get(username) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.stmts.findByEmail.get(email) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: User): User {
    const params = this.toParams(entity);
    const existing = this.stmts.findById.get(entity.id);
    if (existing) {
      this.stmts.update.run(params);
    } else {
      this.stmts.insert.run(params);
    }
    return entity;
  }

  delete(id: string): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      username: row.username as string,
      email: row.email as string,
      fullName: row.full_name as string,
      passwordHash: row.password_hash as string,
      isActive: !!(row.is_active as number),
      twoFactorEnabled: !!(row.two_factor_enabled as number),
      totpSecret: (row.totp_secret as string) ?? undefined,
      failedLoginAttempts: (row.failed_login_attempts as number) ?? 0,
      lockoutUntil: row.lockout_until ? new Date(row.lockout_until as string) : null,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: User) {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      fullName: entity.fullName,
      passwordHash: entity.passwordHash,
      isActive: entity.isActive ? 1 : 0,
      twoFactorEnabled: entity.twoFactorEnabled ? 1 : 0,
      totpSecret: entity.totpSecret ?? null,
      failedLoginAttempts: entity.failedLoginAttempts ?? 0,
      lockoutUntil: entity.lockoutUntil instanceof Date ? entity.lockoutUntil.toISOString() : (entity.lockoutUntil ?? null),
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
    };
  }
}
