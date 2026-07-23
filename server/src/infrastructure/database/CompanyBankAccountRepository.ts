import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { CompanyBankAccount } from '../../domain/entities/CompanyBankAccount.js';
import type { CompanyBankAccountRepository } from '../../domain/repositories/CompanyBankAccountRepository.js';
import { getDb } from './connection.js';

const COLUMNS = 'id, company_id, account_number, account_name, bank_name, bank_branch, swift_code, currency_code, is_primary_tax_payment, is_active, opened_date, created_at, updated_at';

export class SQLiteCompanyBankAccountRepository implements CompanyBankAccountRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteCompanyBankAccountRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteCompanyBankAccountRepository.prepareQueries(this.db);
  }

  private static prepareQueries(db: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof db.prepare> | null = null;
      return {
        get: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.get as any)(...params) as unknown; },
        all: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.all as any)(...params) as unknown[]; },
        run: (...params: unknown[]) => { stmt ??= db.prepare(sql); return (stmt.run as any)(...params); },
      };
    };

    return {
      findById: s(`SELECT ${COLUMNS} FROM company_bank_accounts WHERE id = ?`),
      findByCompanyId: s(`SELECT ${COLUMNS} FROM company_bank_accounts WHERE company_id = ? ORDER BY is_primary_tax_payment DESC, is_active DESC`),
      findPrimaryTaxPaymentByCompanyId: s(`SELECT ${COLUMNS} FROM company_bank_accounts WHERE company_id = ? AND is_primary_tax_payment = 1 AND is_active = 1 LIMIT 1`),
      insert: s(`INSERT INTO company_bank_accounts (${COLUMNS}) VALUES (@id, @companyId, @accountNumber, @accountName, @bankName, @bankBranch, @swiftCode, @currencyCode, @isPrimaryTaxPayment, @isActive, @openedDate, @createdAt, @updatedAt)`),
      update: s(`UPDATE company_bank_accounts SET account_number=@accountNumber, account_name=@accountName, bank_name=@bankName, bank_branch=@bankBranch, swift_code=@swiftCode, currency_code=@currencyCode, is_primary_tax_payment=@isPrimaryTaxPayment, is_active=@isActive, opened_date=@openedDate, updated_at=@updatedAt WHERE id=@id`),
      delete: s('DELETE FROM company_bank_accounts WHERE id = ?'),
    };
  }

  findById(id: number): CompanyBankAccount | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByCompanyId(companyId: number): CompanyBankAccount[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findPrimaryTaxPaymentByCompanyId(companyId: number): CompanyBankAccount | null {
    const row = this.stmts.findPrimaryTaxPaymentByCompanyId.get(companyId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: CompanyBankAccount): CompanyBankAccount {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    return entity;
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): CompanyBankAccount {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      accountNumber: row.account_number as string,
      accountName: row.account_name as string,
      bankName: row.bank_name as string,
      bankBranch: row.bank_branch as string | undefined,
      swiftCode: row.swift_code as string | undefined,
      currencyCode: row.currency_code as string,
      isPrimaryTaxPayment: !!(row.is_primary_tax_payment as number),
      isActive: !!(row.is_active as number),
      openedDate: row.opened_date as string,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
    };
  }

  private toParams(entity: CompanyBankAccount) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      accountNumber: entity.accountNumber,
      accountName: entity.accountName,
      bankName: entity.bankName,
      bankBranch: entity.bankBranch ?? null,
      swiftCode: entity.swiftCode ?? null,
      currencyCode: entity.currencyCode,
      isPrimaryTaxPayment: entity.isPrimaryTaxPayment ? 1 : 0,
      isActive: entity.isActive ? 1 : 0,
      openedDate: entity.openedDate,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : null,
    };
  }
}
