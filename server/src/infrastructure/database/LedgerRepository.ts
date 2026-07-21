import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { LedgerEntry, AccountBalance } from '../../domain/entities/LedgerEntry.js';
import type { LedgerRepository } from '../../domain/repositories/LedgerRepository.js';
import { getDb } from './connection.js';

export class SQLiteLedgerRepository implements LedgerRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteLedgerRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteLedgerRepository.prepareQueries(this.db);
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
      findByPeriodId: s('SELECT * FROM ledger_entries WHERE company_id = ? AND period_id = ? ORDER BY account_number, entry_date'),
      findByAccountId: s('SELECT * FROM ledger_entries WHERE company_id = ? AND account_id = ? ORDER BY entry_date'),
      findByAccountInPeriod: s('SELECT * FROM ledger_entries WHERE company_id = ? AND account_id = ? AND period_id = ? ORDER BY entry_date'),
      findByAccountIdDateRange: s('SELECT * FROM ledger_entries WHERE company_id = ? AND account_id = ? AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date'),
      getAccountBalance: s('SELECT * FROM account_balances WHERE company_id = ? AND account_id = ? AND period_id = ?'),
      getAccountBalances: s('SELECT * FROM account_balances WHERE company_id = ? AND period_id = ?'),
      insert: s(`INSERT INTO ledger_entries (id, company_id, account_id, account_number, period_id, journal_entry_id, entry_number, entry_date, description, debit_amount, credit_amount, running_debit, running_credit, running_balance, cost_center_id, department_id, project_id, created_at) VALUES (@id, @companyId, @accountId, @accountNumber, @periodId, @journalEntryId, @entryNumber, @entryDate, @description, @debitAmount, @creditAmount, @runningDebit, @runningCredit, @runningBalance, @costCenterId, @departmentId, @projectId, @createdAt)`),
      insertBalance: s(`INSERT OR REPLACE INTO account_balances (account_id, account_number, company_id, period_id, opening_debit, opening_credit, period_debit, period_credit, closing_debit, closing_credit) VALUES (@accountId, @accountNumber, @companyId, @periodId, @openingDebit, @openingCredit, @periodDebit, @periodCredit, @closingDebit, @closingCredit)`),
      deleteByPeriod: s('DELETE FROM ledger_entries WHERE company_id = ? AND period_id = ?'),
      deleteByJournalEntry: s('DELETE FROM ledger_entries WHERE journal_entry_id = ?'),
      deleteBalancesByPeriod: s('DELETE FROM account_balances WHERE company_id = ? AND period_id = ?'),
    };
  }

  findByPeriodId(companyId: string, periodId: string): LedgerEntry[] {
    return (this.stmts.findByPeriodId.all(companyId, periodId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByAccountId(companyId: string, accountId: string, fromDate?: string, toDate?: string): LedgerEntry[] {
    if (fromDate && toDate) {
      return (this.stmts.findByAccountIdDateRange.all(companyId, accountId, fromDate, toDate) as Record<string, unknown>[]).map((r) => this.toEntity(r));
    }
    return (this.stmts.findByAccountId.all(companyId, accountId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByAccountInPeriod(companyId: string, accountId: string, periodId: string): LedgerEntry[] {
    return (this.stmts.findByAccountInPeriod.all(companyId, accountId, periodId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  getAccountBalance(companyId: string, accountId: string, periodId: string): AccountBalance | null {
    const row = this.stmts.getAccountBalance.get(companyId, accountId, periodId) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      accountId: row.account_id as string,
      accountNumber: row.account_number as string,
      companyId: row.company_id as string,
      periodId: row.period_id as string,
      openingDebit: (row.opening_debit as number) ?? 0,
      openingCredit: (row.opening_credit as number) ?? 0,
      periodDebit: (row.period_debit as number) ?? 0,
      periodCredit: (row.period_credit as number) ?? 0,
      closingDebit: (row.closing_debit as number) ?? 0,
      closingCredit: (row.closing_credit as number) ?? 0,
    };
  }

  getAccountBalances(companyId: string, periodId: string): AccountBalance[] {
    return (this.stmts.getAccountBalances.all(companyId, periodId) as Record<string, unknown>[]).map((r) => ({
      accountId: r.account_id as string,
      accountNumber: r.account_number as string,
      companyId: r.company_id as string,
      periodId: r.period_id as string,
      openingDebit: (r.opening_debit as number) ?? 0,
      openingCredit: (r.opening_credit as number) ?? 0,
      periodDebit: (r.period_debit as number) ?? 0,
      periodCredit: (r.period_credit as number) ?? 0,
      closingDebit: (r.closing_debit as number) ?? 0,
      closingCredit: (r.closing_credit as number) ?? 0,
    }));
  }

  saveMany(entries: LedgerEntry[]): void {
    const insert = this.db.prepare(`INSERT INTO ledger_entries (id, company_id, account_id, account_number, period_id, journal_entry_id, entry_number, entry_date, description, debit_amount, credit_amount, running_debit, running_credit, running_balance, cost_center_id, department_id, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const tx = this.db.transaction(() => {
      for (const e of entries) {
        insert.run(e.id, e.companyId, e.accountId, e.accountNumber, e.periodId, e.journalEntryId, e.entryNumber, e.entryDate, e.description, e.debitAmount, e.creditAmount, e.runningDebit, e.runningCredit, e.runningBalance, e.costCenterId ?? null, e.departmentId ?? null, e.projectId ?? null, e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt);
      }
    });
    tx();
  }

  deleteByPeriodId(companyId: string, periodId: string): void {
    this.stmts.deleteByPeriod.run(companyId, periodId);
    this.stmts.deleteBalancesByPeriod.run(companyId, periodId);
  }

  saveBalance(balance: AccountBalance): void {
    this.stmts.insertBalance.run({
      accountId: balance.accountId,
      accountNumber: balance.accountNumber,
      companyId: balance.companyId,
      periodId: balance.periodId,
      openingDebit: balance.openingDebit,
      openingCredit: balance.openingCredit,
      periodDebit: balance.periodDebit,
      periodCredit: balance.periodCredit,
      closingDebit: balance.closingDebit,
      closingCredit: balance.closingCredit,
    });
  }

  deleteByJournalEntryId(journalEntryId: string): void {
    this.stmts.deleteByJournalEntry.run(journalEntryId);
  }

  private toEntity(row: Record<string, unknown>): LedgerEntry {
    return {
      id: row.id as string,
      companyId: row.company_id as string,
      accountId: row.account_id as string,
      accountNumber: row.account_number as string,
      periodId: row.period_id as string,
      journalEntryId: row.journal_entry_id as string,
      entryNumber: row.entry_number as string,
      entryDate: row.entry_date as string,
      description: row.description as string,
      debitAmount: (row.debit_amount as number) ?? 0,
      creditAmount: (row.credit_amount as number) ?? 0,
      runningDebit: (row.running_debit as number) ?? 0,
      runningCredit: (row.running_credit as number) ?? 0,
      runningBalance: (row.running_balance as number) ?? 0,
      costCenterId: row.cost_center_id as string ?? undefined,
      departmentId: row.department_id as string ?? undefined,
      projectId: row.project_id as string ?? undefined,
      createdAt: row.created_at as unknown as Date,
    };
  }
}
