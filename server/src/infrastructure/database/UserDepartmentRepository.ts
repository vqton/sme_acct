import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { UserDepartment } from '../../domain/entities/UserDepartment.js';
import type { UserDepartmentRepository } from '../../domain/repositories/UserDepartmentRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'user_id, department_id, is_primary, job_title, is_active, assigned_at';

export class SQLiteUserDepartmentRepository implements UserDepartmentRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteUserDepartmentRepository.prepareQueries>;

  constructor(database?: DatabaseType) {
    this.db = database ?? getDb();
    this.stmts = SQLiteUserDepartmentRepository.prepareQueries(this.db);
  }

  private static prepareQueries(database: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof database.prepare> | null = null;
      return {
        get: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.get as any)(...params) as unknown; },
        all: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.all as any)(...params) as unknown[]; },
        run: (...params: unknown[]) => { stmt ??= database.prepare(sql); return (stmt.run as any)(...params); },
      };
    };

    return {
      findByUserId: s(`SELECT ${COLUMNS} FROM user_departments WHERE user_id = ?`),
      findByDepartmentId: s(`SELECT ${COLUMNS} FROM user_departments WHERE department_id = ?`),
      findOne: s(`SELECT ${COLUMNS} FROM user_departments WHERE user_id = ? AND department_id = ?`),
      insert: s(`INSERT INTO user_departments (${COLUMNS}) VALUES (@userId, @departmentId, @isPrimary, @jobTitle, @isActive, @assignedAt)`),
      update: s(`UPDATE user_departments SET is_primary=@isPrimary, job_title=@jobTitle, is_active=@isActive WHERE user_id=@userId AND department_id=@departmentId`),
      removePrimaryFlag: s(`UPDATE user_departments SET is_primary = 0 WHERE user_id = ? AND is_primary = 1`),
      delete: s('DELETE FROM user_departments WHERE user_id = ? AND department_id = ?'),
      countByDepartmentId: s('SELECT COUNT(*) as c FROM user_departments WHERE department_id = ?'),
    };
  }

  findByUserId(userId: number): UserDepartment[] {
    return (this.stmts.findByUserId.all(userId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByDepartmentId(departmentId: number): UserDepartment[] {
    return (this.stmts.findByDepartmentId.all(departmentId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findOne(userId: number, departmentId: number): UserDepartment | null {
    const row = this.stmts.findOne.get(userId, departmentId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: UserDepartment): UserDepartment {
    const params = this.toParams(entity);
    const existing = this.stmts.findOne.get(entity.userId, entity.departmentId) as Record<string, unknown> | undefined;
    if (existing) {
      this.stmts.update.run(params);
    } else {
      this.stmts.insert.run(params);
    }
    return entity;
  }

  removePrimaryFlag(userId: number): void {
    this.stmts.removePrimaryFlag.run(userId);
  }

  delete(userId: number, departmentId: number): void {
    this.stmts.delete.run(userId, departmentId);
  }

  countByDepartmentId(departmentId: number): number {
    return (this.stmts.countByDepartmentId.get(departmentId) as { c: number }).c;
  }

  private toEntity(row: Record<string, unknown>): UserDepartment {
    return {
      userId: row.user_id as number,
      departmentId: row.department_id as number,
      isPrimary: (row.is_primary as number) === 1,
      jobTitle: row.job_title as string | undefined,
      isActive: (row.is_active as number) === 1,
      assignedAt: row.assigned_at as unknown as Date,
    };
  }

  private toParams(entity: UserDepartment) {
    return {
      userId: entity.userId,
      departmentId: entity.departmentId,
      isPrimary: entity.isPrimary ? 1 : 0,
      jobTitle: entity.jobTitle ?? null,
      isActive: entity.isActive ? 1 : 0,
      assignedAt: entity.assignedAt instanceof Date ? entity.assignedAt.toISOString() : entity.assignedAt,
    };
  }
}
