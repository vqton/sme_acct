import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { CapitalContributor } from '../../domain/entities/CapitalContributor.js';
import type { CapitalContributorRepository } from '../../domain/repositories/CapitalContributorRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, contributor_type, full_name, id_number, contributor_category, capital_contribution, ownership_ratio, contribution_date, contribution_certificate, is_founder, created_at, updated_at';

export class SQLiteCapitalContributorRepository implements CapitalContributorRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteCapitalContributorRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteCapitalContributorRepository.prepareQueries(this.db);
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
      findById: s(`SELECT ${COLUMNS} FROM capital_contributors WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM capital_contributors WHERE company_id = ? ORDER BY ownership_ratio DESC`),
      insert: s(`INSERT INTO capital_contributors (${COLUMNS}) VALUES (@id, @companyId, @contributorType, @fullName, @idNumber, @contributorCategory, @capitalContribution, @ownershipRatio, @contributionDate, @contributionCertificate, @isFounder, @createdAt, @updatedAt)`),
      update: s(`UPDATE capital_contributors SET contributor_type=@contributorType, full_name=@fullName, id_number=@idNumber, contributor_category=@contributorCategory, capital_contribution=@capitalContribution, ownership_ratio=@ownershipRatio, contribution_date=@contributionDate, contribution_certificate=@contributionCertificate, is_founder=@isFounder, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM capital_contributors WHERE id = ?'),
    };
  }

  findById(id: string): CapitalContributor | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: string): CapitalContributor[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: CapitalContributor): CapitalContributor {
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

  private toEntity(row: Record<string, unknown>): CapitalContributor {
    return {
      id: row.id as string,
      companyId: row.company_id as string,
      contributorType: row.contributor_type as number,
      fullName: row.full_name as string,
      idNumber: row.id_number as string | undefined,
      contributorCategory: row.contributor_category as number,
      capitalContribution: row.capital_contribution as number,
      ownershipRatio: row.ownership_ratio as number,
      contributionDate: row.contribution_date as string,
      contributionCertificate: row.contribution_certificate as string | undefined,
      isFounder: !!(row.is_founder as number),
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: CapitalContributor) {
    return {
      id: entity.id,
      companyId: entity.companyId,
      contributorType: entity.contributorType,
      fullName: entity.fullName,
      idNumber: entity.idNumber ?? null,
      contributorCategory: entity.contributorCategory,
      capitalContribution: entity.capitalContribution,
      ownershipRatio: entity.ownershipRatio,
      contributionDate: entity.contributionDate,
      contributionCertificate: entity.contributionCertificate ?? null,
      isFounder: entity.isFounder ? 1 : 0,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
