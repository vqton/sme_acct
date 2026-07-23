import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { JournalEntry, JournalLine } from '../../domain/entities/JournalEntry.js';
import type { JournalEntryRepository } from '../../domain/repositories/JournalEntryRepository.js';
import { getDb } from './connection.js';

export class SQLiteJournalEntryRepository implements JournalEntryRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteJournalEntryRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteJournalEntryRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM journal_entries WHERE id = ?'),
      findAll: s('SELECT * FROM journal_entries ORDER BY created_at DESC'),
      findByCompanyId: s('SELECT * FROM journal_entries WHERE company_id = ? ORDER BY entry_date DESC, entry_number DESC'),
      findByPeriodId: s('SELECT * FROM journal_entries WHERE period_id = ? ORDER BY entry_date, entry_number'),
      findByEntryNumber: s('SELECT * FROM journal_entries WHERE company_id = ? AND entry_number = ?'),
      findByDateRange: s('SELECT * FROM journal_entries WHERE company_id = ? AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date, entry_number'),
      findByType: s('SELECT * FROM journal_entries WHERE company_id = ? AND entry_type = ? ORDER BY entry_date DESC'),
      findPosted: s('SELECT * FROM journal_entries WHERE company_id = ? AND is_posted = 1 ORDER BY entry_date DESC'),
      findUnposted: s('SELECT * FROM journal_entries WHERE company_id = ? AND is_posted = 0 ORDER BY entry_date DESC'),
      findLinesByEntryId: s('SELECT * FROM journal_entry_lines WHERE journal_entry_id = ? ORDER BY line_index'),
      getMaxEntryNumber: s('SELECT entry_number FROM journal_entries WHERE company_id = ? AND strftime(\'%Y\', entry_date) = ? ORDER BY entry_number DESC LIMIT 1'),
      insert: s(`INSERT INTO journal_entries (id, company_id, entry_number, entry_date, period_id, entry_type, description, description_english, reference_number, reference_date, total_debit, total_credit, is_posted, is_reversed, reversed_by_id, posted_at, posted_by_user_id, created_by_user_id, created_at) VALUES (@id, @companyId, @entryNumber, @entryDate, @periodId, @entryType, @description, @descriptionEnglish, @referenceNumber, @referenceDate, @totalDebit, @totalCredit, @isPosted, @isReversed, @reversedById, @postedAt, @postedByUserId, @createdByUserId, @createdAt)`),
      update: s(`UPDATE journal_entries SET entry_number=@entryNumber, entry_date=@entryDate, period_id=@periodId, entry_type=@entryType, description=@description, description_english=@descriptionEnglish, reference_number=@referenceNumber, reference_date=@referenceDate, total_debit=@totalDebit, total_credit=@totalCredit, is_posted=@isPosted, is_reversed=@isReversed, reversed_by_id=@reversedById, posted_at=@postedAt, posted_by_user_id=@postedByUserId WHERE id=@id`),
      delete: s('DELETE FROM journal_entries WHERE id = ?'),
      insertLine: s(`INSERT INTO journal_entry_lines (journal_entry_id, account_id, account_number, description, debit_amount, credit_amount, cost_center_id, department_id, project_id, line_index) VALUES (@journalEntryId, @accountId, @accountNumber, @description, @debitAmount, @creditAmount, @costCenterId, @departmentId, @projectId, @lineIndex)`),
      deleteLines: s('DELETE FROM journal_entry_lines WHERE journal_entry_id = ?'),
    };
  }

  findById(id: number): JournalEntry | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.toEntity(row);
  }

  findAll(): JournalEntry[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: number): JournalEntry[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByPeriodId(periodId: number): JournalEntry[] {
    return (this.stmts.findByPeriodId.all(periodId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByEntryNumber(companyId: number, entryNumber: string): JournalEntry | null {
    const row = this.stmts.findByEntryNumber.get(companyId, entryNumber) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByDateRange(companyId: number, fromDate: string, toDate: string): JournalEntry[] {
    return (this.stmts.findByDateRange.all(companyId, fromDate, toDate) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByType(companyId: number, entryType: number): JournalEntry[] {
    return (this.stmts.findByType.all(companyId, entryType) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findPosted(companyId: number): JournalEntry[] {
    return (this.stmts.findPosted.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findUnposted(companyId: number): JournalEntry[] {
    return (this.stmts.findUnposted.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findLinesByEntryId(entryId: number): JournalLine[] {
    return (this.stmts.findLinesByEntryId.all(entryId) as Record<string, unknown>[]).map((r) => ({
      id: r.id as number,
      journalEntryId: r.journal_entry_id as number,
      accountId: r.account_id as number,
      accountNumber: r.account_number as string,
      description: r.description as string ?? undefined,
      debitAmount: (r.debit_amount as number) ?? 0,
      creditAmount: (r.credit_amount as number) ?? 0,
      costCenterId: r.cost_center_id as number ?? undefined,
      departmentId: r.department_id as number ?? undefined,
      projectId: r.project_id as number ?? undefined,
    }));
  }

  getNextEntryNumber(companyId: number, year: number, month: number): string {
    const prefix = `PC${year}${String(month).padStart(2, '0')}`;
    const row = this.stmts.getMaxEntryNumber.get(companyId, String(year)) as { entry_number: string } | undefined;
    let seq = 1;
    if (row?.entry_number) {
      const parts = row.entry_number.split('-');
      seq = (parseInt(parts[parts.length - 1] ?? '0', 10) || 0) + 1;
    }
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  save(entity: JournalEntry): JournalEntry {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    this.saveLines(entity.id, entity.lines);
    return entity;
  }

  saveLines(entryId: number, lines: JournalLine[]): void {
    this.stmts.deleteLines.run(entryId);
    for (let i = 0; i < lines.length; i++) {
      this.stmts.insertLine.run({
        journalEntryId: entryId,
        accountId: lines[i].accountId,
        accountNumber: lines[i].accountNumber,
        description: lines[i].description ?? null,
        debitAmount: lines[i].debitAmount,
        creditAmount: lines[i].creditAmount,
        costCenterId: lines[i].costCenterId ?? null,
        departmentId: lines[i].departmentId ?? null,
        projectId: lines[i].projectId ?? null,
        lineIndex: i,
      });
    }
  }

  deleteLines(entryId: number): void {
    this.stmts.deleteLines.run(entryId);
  }

  delete(id: number): void {
    this.deleteLines(id);
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): JournalEntry {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      entryNumber: row.entry_number as string,
      entryDate: row.entry_date as string,
      periodId: row.period_id as number,
      entryType: row.entry_type as number,
      description: row.description as string,
      descriptionEnglish: row.description_english as string ?? undefined,
      referenceNumber: row.reference_number as string ?? undefined,
      referenceDate: row.reference_date as string ?? undefined,
      totalDebit: (row.total_debit as number) ?? 0,
      totalCredit: (row.total_credit as number) ?? 0,
      isPosted: !!(row.is_posted as number),
      isReversed: !!(row.is_reversed as number),
      reversedById: row.reversed_by_id as number ?? undefined,
      postedAt: row.posted_at as string ?? undefined,
      postedByUserId: row.posted_by_user_id as number ?? undefined,
      createdByUserId: row.created_by_user_id as number ?? undefined,
      createdAt: row.created_at as unknown as Date,
      lines: [],
    };
  }

  private toParams(entity: JournalEntry) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      entryNumber: entity.entryNumber,
      entryDate: entity.entryDate,
      periodId: entity.periodId,
      entryType: entity.entryType,
      description: entity.description,
      descriptionEnglish: entity.descriptionEnglish ?? null,
      referenceNumber: entity.referenceNumber ?? null,
      referenceDate: entity.referenceDate ?? null,
      totalDebit: entity.totalDebit,
      totalCredit: entity.totalCredit,
      isPosted: entity.isPosted ? 1 : 0,
      isReversed: entity.isReversed ? 1 : 0,
      reversedById: entity.reversedById ?? null,
      postedAt: entity.postedAt ?? null,
      postedByUserId: entity.postedByUserId ?? null,
      createdByUserId: entity.createdByUserId ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
    };
  }
}
