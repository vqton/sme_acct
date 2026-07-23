import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../database/connection.js';
import type { UserCompanyRepository } from '../../domain/repositories/UserCompanyRepository.js';
import { UserCompany } from '../../domain/entities/UserCompany.js';

export class SQLiteUserCompanyRepository implements UserCompanyRepository {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
  }

  findByUserId(userId: number): UserCompany[] {
    const rows = this.db
      .prepare(
        'SELECT user_id, company_id, role, is_active, joined_at FROM user_companies WHERE user_id = ?',
      )
      .all(userId) as {
      user_id: number;
      company_id: number;
      role: string | null;
      is_active: number;
      joined_at: string;
    }[];
    return rows.map((r) => ({
      userId: r.user_id,
      companyId: r.company_id,
      role: r.role ?? undefined,
      isActive: r.is_active === 1,
      joinedAt: new Date(r.joined_at),
    }));
  }

  findByUserIdAndCompanyId(
    userId: number,
    companyId: number,
  ): UserCompany | null {
    const row = this.db
      .prepare(
        'SELECT user_id, company_id, role, is_active, joined_at FROM user_companies WHERE user_id = ? AND company_id = ?',
      )
      .get(userId, companyId) as {
      user_id: number;
      company_id: number;
      role: string | null;
      is_active: number;
      joined_at: string;
    } | undefined;
    if (!row) return null;
    return {
      userId: row.user_id,
      companyId: row.company_id,
      role: row.role ?? undefined,
      isActive: row.is_active === 1,
      joinedAt: new Date(row.joined_at),
    };
  }

  create(uc: UserCompany): void {
    this.db
      .prepare(
        'INSERT INTO user_companies (user_id, company_id, role, is_active, joined_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(
        uc.userId,
        uc.companyId,
        uc.role ?? null,
        uc.isActive ? 1 : 0,
        uc.joinedAt.toISOString(),
      );
  }
}
