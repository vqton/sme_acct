import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Department } from '../../domain/entities/Department.js';
import type { DepartmentRepository } from '../../domain/repositories/DepartmentRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, code, name, name_english, department_type, parent_id, path, depth, sort_order, manager_user_id, manager_title, deputy_manager_user_id, default_salary_account, default_expense_account, cost_allocation_method, has_budget_control, budget_alert_threshold, budget_control_level, status, effective_date, dissolution_date, created_at, updated_at, created_by_user_id, updated_by_user_id';

export class SQLiteDepartmentRepository implements DepartmentRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteDepartmentRepository.prepareQueries>;

  constructor(database?: DatabaseType) {
    this.db = database ?? getDb();
    this.stmts = SQLiteDepartmentRepository.prepareQueries(this.db);
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
      findById: s(`SELECT ${COLUMNS} FROM departments WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM departments WHERE company_id = ? ORDER BY depth, sort_order, code`),
      findByCode: s(`SELECT ${COLUMNS} FROM departments WHERE company_id = ? AND code = ?`),
      findChildren: s(`SELECT ${COLUMNS} FROM departments WHERE parent_id = ? ORDER BY sort_order, code`),
      findSubtree: s(`SELECT ${COLUMNS} FROM departments WHERE path LIKE ? ORDER BY depth, sort_order`),
      findAncestors: s(`SELECT ${COLUMNS} FROM departments WHERE company_id = ? AND ? LIKE (path || '/%') ORDER BY depth`),
      insert: s(`INSERT INTO departments (${COLUMNS}) VALUES (@id, @companyId, @code, @name, @nameEnglish, @departmentType, @parentId, @path, @depth, @sortOrder, @managerUserId, @managerTitle, @deputyManagerUserId, @defaultSalaryAccount, @defaultExpenseAccount, @costAllocationMethod, @hasBudgetControl, @budgetAlertThreshold, @budgetControlLevel, @status, @effectiveDate, @dissolutionDate, @createdAt, @updatedAt, @createdByUserId, @updatedByUserId)`),
      update: s(`UPDATE departments SET code=@code, name=@name, name_english=@nameEnglish, department_type=@departmentType, parent_id=@parentId, path=@path, depth=@depth, sort_order=@sortOrder, manager_user_id=@managerUserId, manager_title=@managerTitle, deputy_manager_user_id=@deputyManagerUserId, default_salary_account=@defaultSalaryAccount, default_expense_account=@defaultExpenseAccount, cost_allocation_method=@costAllocationMethod, has_budget_control=@hasBudgetControl, budget_alert_threshold=@budgetAlertThreshold, budget_control_level=@budgetControlLevel, status=@status, effective_date=@effectiveDate, dissolution_date=@dissolutionDate, updated_at=@updatedAt, updated_by_user_id=@updatedByUserId WHERE id=@id`),
      updateSubtreePaths: s(`UPDATE departments SET path = REPLACE(path, ?, ?), depth = depth + ?, updated_at = datetime('now') WHERE path LIKE ?`),
      delete: s('DELETE FROM departments WHERE id = ?'),
    };
  }

  findById(id: number): Department | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: number): Department[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCode(companyId: number, code: string): Department | null {
    const row = this.stmts.findByCode.get(companyId, code) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findChildren(parentId: number): Department[] {
    return (this.stmts.findChildren.all(parentId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findSubtree(pathPrefix: string): Department[] {
    return (this.stmts.findSubtree.all(pathPrefix + '%') as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findAncestors(path: string, companyId: number): Department[] {
    return (this.stmts.findAncestors.get(companyId, path) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: Department): Department {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
      const oldPath = entity.path;
      entity.path = entity.path.replace(/\/0$/, `/${entity.id}`);
      if (entity.path !== oldPath) {
        this.stmts.update.run(this.toParams(entity));
      }
    }
    return entity;
  }

  updateSubtreePaths(oldPathPrefix: string, newPathPrefix: string, depthDelta: number): void {
    this.stmts.updateSubtreePaths.run(oldPathPrefix, newPathPrefix, depthDelta, oldPathPrefix + '%');
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): Department {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      code: row.code as string,
      name: row.name as string,
      nameEnglish: row.name_english as string | undefined,
      departmentType: row.department_type as number,
      parentId: row.parent_id as number | undefined,
      path: row.path as string,
      depth: row.depth as number,
      sortOrder: row.sort_order as number,
      managerUserId: row.manager_user_id as number | undefined,
      managerTitle: row.manager_title as string | undefined,
      deputyManagerUserId: row.deputy_manager_user_id as number | undefined,
      defaultSalaryAccount: row.default_salary_account as string | undefined,
      defaultExpenseAccount: row.default_expense_account as string | undefined,
      costAllocationMethod: row.cost_allocation_method as number | undefined,
      hasBudgetControl: (row.has_budget_control as number) === 1,
      budgetAlertThreshold: row.budget_alert_threshold as number,
      budgetControlLevel: row.budget_control_level as number,
      status: row.status as number,
      effectiveDate: row.effective_date as string,
      dissolutionDate: row.dissolution_date as string | undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
      createdByUserId: row.created_by_user_id as number | undefined,
      updatedByUserId: row.updated_by_user_id as number | undefined,
    };
  }

  private toParams(entity: Department) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      code: entity.code,
      name: entity.name,
      nameEnglish: entity.nameEnglish ?? null,
      departmentType: entity.departmentType,
      parentId: entity.parentId ?? null,
      path: entity.path,
      depth: entity.depth,
      sortOrder: entity.sortOrder,
      managerUserId: entity.managerUserId ?? null,
      managerTitle: entity.managerTitle ?? null,
      deputyManagerUserId: entity.deputyManagerUserId ?? null,
      defaultSalaryAccount: entity.defaultSalaryAccount ?? null,
      defaultExpenseAccount: entity.defaultExpenseAccount ?? null,
      costAllocationMethod: entity.costAllocationMethod ?? null,
      hasBudgetControl: entity.hasBudgetControl ? 1 : 0,
      budgetAlertThreshold: entity.budgetAlertThreshold,
      budgetControlLevel: entity.budgetControlLevel,
      status: entity.status,
      effectiveDate: entity.effectiveDate,
      dissolutionDate: entity.dissolutionDate ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
      createdByUserId: entity.createdByUserId ?? null,
      updatedByUserId: entity.updatedByUserId ?? null,
    };
  }
}
