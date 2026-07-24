import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { OpeningBalanceRepository } from '../../domain/repositories/OpeningBalanceRepository.js';
import type { OpeningBalanceHeader } from '../../domain/entities/OpeningBalanceHeader.js';
import type { OpeningBalanceLine } from '../../domain/entities/OpeningBalanceLine.js';
import type { OpeningBalanceConversionMapping } from '../../domain/entities/OpeningBalanceConversionMapping.js';
import { OpeningBalanceStatus, ConversionType } from '../../domain/enums/OpeningBalanceEnums.js';
import { getDb } from './connection.js';

export class SQLiteOpeningBalanceRepository implements OpeningBalanceRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteOpeningBalanceRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteOpeningBalanceRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM opening_balance_headers WHERE id = ?'),
      findAll: s('SELECT * FROM opening_balance_headers'),
      findByCompanyId: s('SELECT * FROM opening_balance_headers WHERE company_id = ? ORDER BY created_at DESC'),
      findByPeriodId: s('SELECT * FROM opening_balance_headers WHERE company_id = ? AND period_id = ? ORDER BY created_at DESC'),
      findByBatchNumber: s('SELECT * FROM opening_balance_headers WHERE batch_number = ?'),
      findByStatus: s('SELECT * FROM opening_balance_headers WHERE company_id = ? AND status = ? ORDER BY created_at DESC'),
      findActiveBatch: s('SELECT * FROM opening_balance_headers WHERE company_id = ? AND period_id = ? AND is_locked = 0 AND status != 4 ORDER BY created_at DESC LIMIT 1'),
      insert: s(`INSERT INTO opening_balance_headers (company_id, period_id, batch_number, entry_date, description, total_debit, total_credit, status, import_source, source_db_name, source_db_version, is_locked, locked_at, locked_by_user_id, created_by_user_id, created_at, updated_at, approved_by_user_id, approved_at, rejection_reason) VALUES (@companyId, @periodId, @batchNumber, @entryDate, @description, @totalDebit, @totalCredit, @status, @importSource, @sourceDbName, @sourceDbVersion, @isLocked, @lockedAt, @lockedByUserId, @createdByUserId, @createdAt, @updatedAt, @approvedByUserId, @approvedAt, @rejectionReason)`),
      update: s(`UPDATE opening_balance_headers SET company_id=@companyId, period_id=@periodId, batch_number=@batchNumber, entry_date=@entryDate, description=@description, total_debit=@totalDebit, total_credit=@totalCredit, status=@status, import_source=@importSource, source_db_name=@sourceDbName, source_db_version=@sourceDbVersion, is_locked=@isLocked, locked_at=@lockedAt, locked_by_user_id=@lockedByUserId, updated_at=@updatedAt, approved_by_user_id=@approvedByUserId, approved_at=@approvedAt, rejection_reason=@rejectionReason WHERE id=@id`),
      delete: s('DELETE FROM opening_balance_headers WHERE id = ?'),
      getLines: s('SELECT * FROM opening_balance_lines WHERE header_id = ? ORDER BY id'),
      insertLine: s(`INSERT INTO opening_balance_lines (header_id, company_id, account_id, account_number, account_name, debit_amount, credit_amount, foreign_currency_code, foreign_debit_amount, foreign_credit_amount, exchange_rate, bank_account_id, customer_id, supplier_id, employee_id, inventory_item_id, fixed_asset_id, tool_id, prepaid_expense_id, contract_id, project_id, cost_center_id, department_id, notes, created_at) VALUES (@headerId, @companyId, @accountId, @accountNumber, @accountName, @debitAmount, @creditAmount, @foreignCurrencyCode, @foreignDebitAmount, @foreignCreditAmount, @exchangeRate, @bankAccountId, @customerId, @supplierId, @employeeId, @inventoryItemId, @fixedAssetId, @toolId, @prepaidExpenseId, @contractId, @projectId, @costCenterId, @departmentId, @notes, @createdAt)`),
      deleteLines: s('DELETE FROM opening_balance_lines WHERE header_id = ?'),
      getMappings: s('SELECT * FROM opening_balance_conversion_mappings WHERE company_id = ?'),
      insertMapping: s(`INSERT INTO opening_balance_conversion_mappings (company_id, old_account_number, new_account_number, conversion_type, split_ratio, old_account_name, new_account_name, created_at) VALUES (@companyId, @oldAccountNumber, @newAccountNumber, @conversionType, @splitRatio, @oldAccountName, @newAccountName, @createdAt)`),
      deleteMapping: s('DELETE FROM opening_balance_conversion_mappings WHERE id = ?'),
      deleteMappingsByCompany: s('DELETE FROM opening_balance_conversion_mappings WHERE company_id = ?'),
      batchCountByPeriod: s('SELECT COUNT(*) as cnt FROM opening_balance_headers WHERE company_id = ? AND period_id = ? AND id <= ?'),
    };
  }

  findById(id: number): OpeningBalanceHeader | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): OpeningBalanceHeader[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: number): OpeningBalanceHeader[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByPeriodId(companyId: number, periodId: number): OpeningBalanceHeader[] {
    return (this.stmts.findByPeriodId.all(companyId, periodId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByBatchNumber(batchNumber: string): OpeningBalanceHeader | null {
    const row = this.stmts.findByBatchNumber.get(batchNumber) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByStatus(companyId: number, status: OpeningBalanceStatus): OpeningBalanceHeader[] {
    return (this.stmts.findByStatus.all(companyId, status) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findActiveBatch(companyId: number, periodId: number): OpeningBalanceHeader | null {
    const row = this.stmts.findActiveBatch.get(companyId, periodId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  save(entity: OpeningBalanceHeader): OpeningBalanceHeader {
    const params = this.toParams(entity);
    if (entity.id) {
      params.updatedAt = new Date().toISOString();
      this.stmts.update.run(params);
    } else {
      params.createdAt = entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt;
      if (!entity.batchNumber) {
        const year = new Date(entity.entryDate).getFullYear();
        params.batchNumber = this.generateBatchNumber(entity.companyId, year);
      }
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    return entity;
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  getLines(headerId: number): OpeningBalanceLine[] {
    return (this.stmts.getLines.all(headerId) as Record<string, unknown>[]).map((r) => this.lineToEntity(r));
  }

  saveLines(headerId: number, lines: OpeningBalanceLine[]): OpeningBalanceLine[] {
    const insert = this.db.transaction((items: OpeningBalanceLine[]) => {
      this.stmts.deleteLines.run(headerId);
      return items.map((line) => {
        const params = this.lineToParams(line);
        params.createdAt = line.createdAt instanceof Date ? line.createdAt.toISOString() : line.createdAt;
        const result = this.stmts.insertLine.run(params);
        return { ...line, id: Number(result.lastInsertRowid) };
      });
    });
    return insert(lines);
  }

  deleteLines(headerId: number): void {
    this.stmts.deleteLines.run(headerId);
  }

  getMappings(companyId: number): OpeningBalanceConversionMapping[] {
    return (this.stmts.getMappings.all(companyId) as Record<string, unknown>[]).map((r) => this.mappingToEntity(r));
  }

  saveMapping(mapping: OpeningBalanceConversionMapping): OpeningBalanceConversionMapping {
    const params = {
      companyId: mapping.companyId,
      oldAccountNumber: mapping.oldAccountNumber,
      newAccountNumber: mapping.newAccountNumber,
      conversionType: mapping.conversionType,
      splitRatio: mapping.splitRatio ?? null,
      oldAccountName: mapping.oldAccountName ?? null,
      newAccountName: mapping.newAccountName ?? null,
      createdAt: mapping.createdAt instanceof Date ? mapping.createdAt.toISOString() : mapping.createdAt,
    };
    const result = this.stmts.insertMapping.run(params);
    return { ...mapping, id: Number(result.lastInsertRowid) };
  }

  deleteMapping(id: number): void {
    this.stmts.deleteMapping.run(id);
  }

  deleteMappingsByCompany(companyId: number): void {
    this.stmts.deleteMappingsByCompany.run(companyId);
  }

  generateBatchNumber(companyId: number, year: number): string {
    const rows = this.stmts.batchCountByPeriod.all(companyId, `${year}`, 999999) as { cnt: number }[];
    const count = (rows[0]?.cnt ?? 0) + 1;
    return `OB-${year}-${String(count).padStart(5, '0')}`;
  }

  private toEntity(row: Record<string, unknown>): OpeningBalanceHeader {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      periodId: row.period_id as number,
      batchNumber: row.batch_number as string,
      entryDate: row.entry_date as string,
      description: row.description as string ?? undefined,
      totalDebit: (row.total_debit as number) ?? 0,
      totalCredit: (row.total_credit as number) ?? 0,
      status: (row.status as number) as OpeningBalanceStatus,
      importSource: row.import_source as string as any,
      sourceDbName: row.source_db_name as string ?? undefined,
      sourceDbVersion: row.source_db_version as string ?? undefined,
      isLocked: !!(row.is_locked as number),
      lockedAt: row.locked_at as string ?? undefined,
      lockedByUserId: row.locked_by_user_id as number ?? undefined,
      createdByUserId: row.created_by_user_id as number,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
      approvedByUserId: row.approved_by_user_id as number ?? undefined,
      approvedAt: row.approved_at as string ?? undefined,
      rejectionReason: row.rejection_reason as string ?? undefined,
    };
  }

  private toParams(entity: OpeningBalanceHeader) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      periodId: entity.periodId,
      batchNumber: entity.batchNumber,
      entryDate: entity.entryDate,
      description: entity.description ?? null,
      totalDebit: entity.totalDebit ?? 0,
      totalCredit: entity.totalCredit ?? 0,
      status: entity.status,
      importSource: entity.importSource,
      sourceDbName: entity.sourceDbName ?? null,
      sourceDbVersion: entity.sourceDbVersion ?? null,
      isLocked: entity.isLocked ? 1 : 0,
      lockedAt: entity.lockedAt ?? null,
      lockedByUserId: entity.lockedByUserId ?? null,
      createdByUserId: entity.createdByUserId,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
      approvedByUserId: entity.approvedByUserId ?? null,
      approvedAt: entity.approvedAt ?? null,
      rejectionReason: entity.rejectionReason ?? null,
    };
  }

  private lineToEntity(row: Record<string, unknown>): OpeningBalanceLine {
    return {
      id: row.id as number,
      headerId: row.header_id as number,
      companyId: row.company_id as number,
      accountId: row.account_id as number,
      accountNumber: row.account_number as string,
      accountName: row.account_name as string,
      debitAmount: (row.debit_amount as number) ?? 0,
      creditAmount: (row.credit_amount as number) ?? 0,
      foreignCurrencyCode: row.foreign_currency_code as string ?? undefined,
      foreignDebitAmount: row.foreign_debit_amount as number ?? undefined,
      foreignCreditAmount: row.foreign_credit_amount as number ?? undefined,
      exchangeRate: (row.exchange_rate as number) ?? 1,
      bankAccountId: row.bank_account_id as number ?? undefined,
      customerId: row.customer_id as number ?? undefined,
      supplierId: row.supplier_id as number ?? undefined,
      employeeId: row.employee_id as number ?? undefined,
      inventoryItemId: row.inventory_item_id as number ?? undefined,
      fixedAssetId: row.fixed_asset_id as number ?? undefined,
      toolId: row.tool_id as number ?? undefined,
      prepaidExpenseId: row.prepaid_expense_id as number ?? undefined,
      contractId: row.contract_id as number ?? undefined,
      projectId: row.project_id as number ?? undefined,
      costCenterId: row.cost_center_id as string ?? undefined,
      departmentId: row.department_id as number ?? undefined,
      notes: row.notes as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
    };
  }

  private lineToParams(line: OpeningBalanceLine) {
    return {
      headerId: line.headerId,
      companyId: line.companyId,
      accountId: line.accountId,
      accountNumber: line.accountNumber,
      accountName: line.accountName,
      debitAmount: line.debitAmount ?? 0,
      creditAmount: line.creditAmount ?? 0,
      foreignCurrencyCode: line.foreignCurrencyCode ?? null,
      foreignDebitAmount: line.foreignDebitAmount ?? null,
      foreignCreditAmount: line.foreignCreditAmount ?? null,
      exchangeRate: line.exchangeRate ?? 1,
      bankAccountId: line.bankAccountId ?? null,
      customerId: line.customerId ?? null,
      supplierId: line.supplierId ?? null,
      employeeId: line.employeeId ?? null,
      inventoryItemId: line.inventoryItemId ?? null,
      fixedAssetId: line.fixedAssetId ?? null,
      toolId: line.toolId ?? null,
      prepaidExpenseId: line.prepaidExpenseId ?? null,
      contractId: line.contractId ?? null,
      projectId: line.projectId ?? null,
      costCenterId: line.costCenterId ?? null,
      departmentId: line.departmentId ?? null,
      notes: line.notes ?? null,
      createdAt: line.createdAt instanceof Date ? line.createdAt.toISOString() : line.createdAt,
    };
  }

  private mappingToEntity(row: Record<string, unknown>): OpeningBalanceConversionMapping {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      oldAccountNumber: row.old_account_number as string,
      newAccountNumber: row.new_account_number as string,
      conversionType: row.conversion_type as string as ConversionType,
      splitRatio: row.split_ratio as number ?? undefined,
      oldAccountName: row.old_account_name as string ?? undefined,
      newAccountName: row.new_account_name as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
    };
  }
}
