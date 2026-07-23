import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { RecurringTemplateRepository } from '../../domain/repositories/RecurringTemplateRepository.js';
import type { RecurringTemplate, RecurringTemplateLine } from '../../domain/entities/RecurringEntry.js';
import { RecurringFrequency } from '../../domain/entities/RecurringEntry.js';
import { getDb } from './connection.js';

export class SQLiteRecurringTemplateRepository implements RecurringTemplateRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteRecurringTemplateRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteRecurringTemplateRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM recurring_templates WHERE id = ?'),
      findAll: s('SELECT * FROM recurring_templates ORDER BY name'),
      findByCompanyId: s('SELECT * FROM recurring_templates WHERE company_id = ? ORDER BY name'),
      findActive: s('SELECT * FROM recurring_templates WHERE company_id = ? AND is_active = 1 ORDER BY next_generation_date'),
      findDueForGeneration: s('SELECT * FROM recurring_templates WHERE is_active = 1 AND next_generation_date <= ? ORDER BY next_generation_date'),
      insert: s(`INSERT INTO recurring_templates (company_id, name, description, entry_type, frequency,
        day_of_month, total_debit_formula, total_credit_formula, start_date, end_date,
        max_occurrences, occurrences_generated, next_generation_date, is_active, auto_post, created_at)
        VALUES (@companyId, @name, @description, @entryType, @frequency, @dayOfMonth,
        @totalDebitFormula, @totalCreditFormula, @startDate, @endDate,
        @maxOccurrences, @occurrencesGenerated, @nextGenerationDate, @isActive, @autoPost, datetime('now'))`),
      update: s(`UPDATE recurring_templates SET name=@name, description=@description, entry_type=@entryType,
        frequency=@frequency, day_of_month=@dayOfMonth, total_debit_formula=@totalDebitFormula,
        total_credit_formula=@totalCreditFormula, start_date=@startDate, end_date=@endDate,
        max_occurrences=@maxOccurrences, occurrences_generated=@occurrencesGenerated,
        next_generation_date=@nextGenerationDate, is_active=@isActive, auto_post=@autoPost
        WHERE id=@id`),
      delete: s('DELETE FROM recurring_templates WHERE id = ?'),
      insertLine: s(`INSERT INTO recurring_template_lines (template_id, account_id, account_number, description,
        debit_formula, credit_formula, line_index) VALUES (@templateId, @accountId, @accountNumber,
        @description, @debitFormula, @creditFormula, @lineIndex)`),
      deleteLines: s('DELETE FROM recurring_template_lines WHERE template_id = ?'),
      loadLines: s('SELECT * FROM recurring_template_lines WHERE template_id = ? ORDER BY line_index'),
    };
  }

  findById(id: number): RecurringTemplate | null {
    const row = this.stmts.findById.get(id) as any;
    if (!row) return null;
    return this.mapRow(row);
  }

  findAll(): RecurringTemplate[] {
    return (this.stmts.findAll.all() as any[]).map((r: any) => this.mapRow(r));
  }

  findByCompanyId(companyId: number): RecurringTemplate[] {
    return (this.stmts.findByCompanyId.all(companyId) as any[]).map((r: any) => this.mapRow(r));
  }

  findActive(companyId: number): RecurringTemplate[] {
    return (this.stmts.findActive.all(companyId) as any[]).map((r: any) => this.mapRow(r));
  }

  findDueForGeneration(asOfDate: string): RecurringTemplate[] {
    return (this.stmts.findDueForGeneration.all(asOfDate) as any[]).map((r: any) => this.mapRow(r));
  }

  save(entity: RecurringTemplate): RecurringTemplate {
    const data = {
      companyId: entity.companyId,
      name: entity.name,
      description: entity.description ?? null,
      entryType: entity.entryType,
      frequency: entity.frequency,
      dayOfMonth: entity.dayOfMonth,
      totalDebitFormula: entity.totalDebitFormula ?? '',
      totalCreditFormula: entity.totalCreditFormula ?? '',
      startDate: entity.startDate,
      endDate: entity.endDate ?? null,
      maxOccurrences: entity.maxOccurrences ?? null,
      occurrencesGenerated: entity.occurrencesGenerated,
      nextGenerationDate: entity.nextGenerationDate,
      isActive: entity.isActive ? 1 : 0,
      autoPost: entity.autoPost ? 1 : 0,
    };

    if (entity.id) {
      this.stmts.update.run({ ...data, id: entity.id });
      return entity;
    }

    const result = this.stmts.insert.run(data);
    return { ...entity, id: Number(result.lastInsertRowid) };
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  saveLines(templateId: number, lines: RecurringTemplateLine[]): void {
    this.stmts.deleteLines.run(templateId);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      this.stmts.insertLine.run({
        templateId,
        accountId: l.accountId,
        accountNumber: l.accountNumber,
        description: l.description ?? null,
        debitFormula: l.debitFormula,
        creditFormula: l.creditFormula,
        lineIndex: i,
      });
    }
  }

  deleteLines(templateId: number): void {
    this.stmts.deleteLines.run(templateId);
  }

  private loadLines(templateId: number): RecurringTemplateLine[] {
    return (this.stmts.loadLines.all(templateId) as any[]).map((r: any) => ({
      accountId: r.account_id,
      accountNumber: r.account_number,
      description: r.description,
      debitFormula: r.debit_formula,
      creditFormula: r.credit_formula,
    }));
  }

  private mapRow(row: any): RecurringTemplate {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      description: row.description,
      entryType: row.entry_type,
      frequency: row.frequency as RecurringFrequency,
      dayOfMonth: row.day_of_month,
      totalDebitFormula: row.total_debit_formula ?? '',
      totalCreditFormula: row.total_credit_formula ?? '',
      startDate: row.start_date,
      endDate: row.end_date,
      maxOccurrences: row.max_occurrences,
      occurrencesGenerated: row.occurrences_generated ?? 0,
      nextGenerationDate: row.next_generation_date,
      isActive: !!row.is_active,
      autoPost: !!row.auto_post,
      createdAt: new Date(row.created_at),
      templateLines: this.loadLines(row.id),
    };
  }
}
