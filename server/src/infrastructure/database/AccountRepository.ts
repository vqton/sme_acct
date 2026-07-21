import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Account } from '../../domain/entities/Account.js';
import type { AccountRepository } from '../../domain/repositories/AccountRepository.js';
import { getDb } from './connection.js';

export class SQLiteAccountRepository implements AccountRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteAccountRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteAccountRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM accounts WHERE id = ?'),
      findAll: s('SELECT * FROM accounts'),
      findByCompanyId: s('SELECT * FROM accounts WHERE company_id = ? ORDER BY account_number'),
      findByAccountNumber: s('SELECT * FROM accounts WHERE company_id = ? AND account_number = ?'),
      findByParentId: s('SELECT * FROM accounts WHERE parent_id = ? ORDER BY account_number'),
      findByCategory: s('SELECT * FROM accounts WHERE company_id = ? AND category = ? ORDER BY account_number'),
      findByType: s('SELECT * FROM accounts WHERE company_id = ? AND type = ? ORDER BY account_number'),
      findActive: s('SELECT * FROM accounts WHERE company_id = ? AND is_active = 1 ORDER BY account_number'),
      findSystem: s('SELECT * FROM accounts WHERE company_id = ? AND is_system = 1 ORDER BY account_number'),
      findLeafAccounts: s('SELECT * FROM accounts WHERE company_id = ? AND parent_id IS NOT NULL AND allow_transactions = 1 ORDER BY account_number'),
      search: s('SELECT * FROM accounts WHERE company_id = ? AND (account_number LIKE ? OR name LIKE ?) ORDER BY account_number'),
      insert: s(`INSERT INTO accounts (id, company_id, account_number, name, name_english, category, nature, type, parent_id, is_active, is_system, allow_transactions, opening_debit, opening_credit, debit_amount, credit_amount, closing_debit, closing_credit, description, created_at, updated_at) VALUES (@id, @companyId, @accountNumber, @name, @nameEnglish, @category, @nature, @type, @parentId, @isActive, @isSystem, @allowTransactions, @openingDebit, @openingCredit, @debitAmount, @creditAmount, @closingDebit, @closingCredit, @description, @createdAt, @updatedAt)`),
      update: s(`UPDATE accounts SET company_id=@companyId, account_number=@accountNumber, name=@name, name_english=@nameEnglish, category=@category, nature=@nature, type=@type, parent_id=@parentId, is_active=@isActive, is_system=@isSystem, allow_transactions=@allowTransactions, opening_debit=@openingDebit, opening_credit=@openingCredit, debit_amount=@debitAmount, credit_amount=@creditAmount, closing_debit=@closingDebit, closing_credit=@closingCredit, description=@description, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM accounts WHERE id = ?'),
    };
  }

  findById(id: string): Account | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): Account[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: string): Account[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByAccountNumber(companyId: string, accountNumber: string): Account | null {
    const row = this.stmts.findByAccountNumber.get(companyId, accountNumber) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByParentId(parentId: string): Account[] {
    return (this.stmts.findByParentId.all(parentId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCategory(companyId: string, category: number): Account[] {
    return (this.stmts.findByCategory.all(companyId, category) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByType(companyId: string, type: number): Account[] {
    return (this.stmts.findByType.all(companyId, type) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findActive(companyId: string): Account[] {
    return (this.stmts.findActive.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findSystem(companyId: string): Account[] {
    return (this.stmts.findSystem.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findLeafAccounts(companyId: string): Account[] {
    return (this.stmts.findLeafAccounts.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  search(companyId: string, query: string): Account[] {
    const pattern = `%${query}%`;
    return (this.stmts.search.all(companyId, pattern, pattern) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: Account): Account {
    const params = this.toParams(entity);
    const existing = this.stmts.findById.get(entity.id);
    if (existing) {
      this.stmts.update.run(params);
    } else {
      params.createdAt = entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt;
      this.stmts.insert.run(params);
    }
    return entity;
  }

  delete(id: string): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): Account {
    return {
      id: row.id as string,
      companyId: row.company_id as string,
      accountNumber: row.account_number as string,
      name: row.name as string,
      nameEnglish: row.name_english as string ?? undefined,
      category: row.category as number,
      nature: row.nature as number,
      type: row.type as number,
      parentId: row.parent_id as string ?? undefined,
      isActive: !!(row.is_active as number),
      isSystem: !!(row.is_system as number),
      allowTransactions: !!(row.allow_transactions as number),
      openingDebit: (row.opening_debit as number) ?? 0,
      openingCredit: (row.opening_credit as number) ?? 0,
      debitAmount: (row.debit_amount as number) ?? 0,
      creditAmount: (row.credit_amount as number) ?? 0,
      closingDebit: (row.closing_debit as number) ?? 0,
      closingCredit: (row.closing_credit as number) ?? 0,
      description: row.description as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: Account) {
    return {
      id: entity.id,
      companyId: entity.companyId,
      accountNumber: entity.accountNumber,
      name: entity.name,
      nameEnglish: entity.nameEnglish ?? null,
      category: entity.category,
      nature: entity.nature,
      type: entity.type,
      parentId: entity.parentId ?? null,
      isActive: entity.isActive ? 1 : 0,
      isSystem: entity.isSystem ? 1 : 0,
      allowTransactions: entity.allowTransactions ? 1 : 0,
      openingDebit: entity.openingDebit ?? 0,
      openingCredit: entity.openingCredit ?? 0,
      debitAmount: entity.debitAmount ?? 0,
      creditAmount: entity.creditAmount ?? 0,
      closingDebit: entity.closingDebit ?? 0,
      closingCredit: entity.closingCredit ?? 0,
      description: entity.description ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
    };
  }
}
