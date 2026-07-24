import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { TaxDeclaration } from '../../domain/entities/TaxDeclaration.js';
import type { TaxDeclarationRepository } from '../../domain/repositories/TaxDeclarationRepository.js';
import type { TaxType } from '../../domain/enums/TaxEnums.js';
import { getDb } from './connection.js';

export class SQLiteTaxDeclarationRepository implements TaxDeclarationRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteTaxDeclarationRepository.prepareQueries>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteTaxDeclarationRepository.prepareQueries(this.db);
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
      findById: s('SELECT * FROM tax_declarations WHERE id = ?'),
      findByCompanyId: s('SELECT * FROM tax_declarations WHERE company_id = ? ORDER BY year DESC, month DESC'),
      findByPeriodId: s('SELECT * FROM tax_declarations WHERE period_id = ? ORDER BY year DESC, month DESC'),
      findByTaxType: s('SELECT * FROM tax_declarations WHERE company_id = ? AND tax_type = ? ORDER BY year DESC, month DESC'),
      findByYear: s('SELECT * FROM tax_declarations WHERE company_id = ? AND year = ? ORDER BY month'),
      findByYearMonth: s('SELECT * FROM tax_declarations WHERE company_id = ? AND year = ? AND month = ?'),
      findLatestByPeriod: s('SELECT * FROM tax_declarations WHERE company_id = ? AND period_id = ? ORDER BY created_at DESC LIMIT 1'),
      findSubmitted: s('SELECT * FROM tax_declarations WHERE company_id = ? AND status = 4 ORDER BY year DESC, month DESC'),
      findDraft: s('SELECT * FROM tax_declarations WHERE company_id = ? AND status = 0 ORDER BY year DESC, month DESC'),
      insert: s(`INSERT INTO tax_declarations (id, company_id, tax_type, period_id, year, month, quarter, declaration_type, period_name, vat_method, status, lines, input_lines, invoices, total_output_vat, total_input_vat, total_taxable_amount, net_vat_payable, revenue, expenses, net_income, cit_payable, total_income, total_deductions, taxable_income, total_pit_withheld, net_pit_payable, cit_rate, created_at, submitted_at, adjusted_declaration_id) VALUES (@id, @companyId, @taxType, @periodId, @year, @month, @quarter, @declarationType, @periodName, @vatMethod, @status, @lines, @inputLines, @invoices, @totalOutputVat, @totalInputVat, @totalTaxableAmount, @netVatPayable, @revenue, @expenses, @netIncome, @citPayable, @totalIncome, @totalDeductions, @taxableIncome, @totalPitWithheld, @netPitPayable, @citRate, @createdAt, @submittedAt, @adjustedDeclarationId)`),
      update: s(`UPDATE tax_declarations SET status=@status, total_output_vat=@totalOutputVat, total_input_vat=@totalInputVat, total_taxable_amount=@totalTaxableAmount, net_vat_payable=@netVatPayable, lines=@lines, input_lines=@inputLines, invoices=@invoices, submitted_at=@submittedAt WHERE id=@id`),
      delete: s('DELETE FROM tax_declarations WHERE id = ?'),
    };
  }

  findById(id: number): TaxDeclaration | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): TaxDeclaration[] {
    const stmt = this.db.prepare('SELECT * FROM tax_declarations ORDER BY year DESC, month DESC');
    return (stmt.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByCompanyId(companyId: number): TaxDeclaration[] {
    return (this.stmts.findByCompanyId.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByPeriodId(periodId: number): TaxDeclaration[] {
    return (this.stmts.findByPeriodId.all(periodId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByTaxType(companyId: number, taxType: TaxType): TaxDeclaration[] {
    return (this.stmts.findByTaxType.all(companyId, taxType) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByYear(companyId: number, year: number): TaxDeclaration[] {
    return (this.stmts.findByYear.all(companyId, year) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByYearAndMonth(companyId: number, year: number, month: number): TaxDeclaration[] {
    return (this.stmts.findByYearMonth.all(companyId, year, month) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findLatestByPeriod(companyId: number, periodId: number): TaxDeclaration | null {
    const row = this.stmts.findLatestByPeriod.get(companyId, periodId) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findSubmitted(companyId: number): TaxDeclaration[] {
    return (this.stmts.findSubmitted.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findDraftDeclarations(companyId: number): TaxDeclaration[] {
    return (this.stmts.findDraft.all(companyId) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: TaxDeclaration): TaxDeclaration {
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

  private toEntity(row: Record<string, unknown>): TaxDeclaration {
    return {
      id: row.id as number,
      companyId: row.company_id as number,
      taxType: row.tax_type as TaxType,
      periodId: row.period_id as number,
      year: row.year as number,
      month: row.month as number ?? undefined,
      quarter: row.quarter as number ?? undefined,
      declarationType: row.declaration_type as string,
      periodName: row.period_name as string,
      vatMethod: row.vat_method as TaxDeclaration['vatMethod'],
      status: row.status as number,
      lines: JSON.parse(row.lines as string),
      inputLines: JSON.parse(row.input_lines as string),
      invoices: JSON.parse(row.invoices as string),
      totalOutputVat: row.total_output_vat as number,
      totalInputVat: row.total_input_vat as number,
      totalTaxableAmount: row.total_taxable_amount as number,
      netVatPayable: row.net_vat_payable as number,
      revenue: (row.revenue as number) ?? undefined,
      expenses: (row.expenses as number) ?? undefined,
      netIncome: (row.net_income as number) ?? undefined,
      citPayable: (row.cit_payable as number) ?? undefined,
      totalIncome: (row.total_income as number) ?? undefined,
      totalDeductions: (row.total_deductions as number) ?? undefined,
      taxableIncome: (row.taxable_income as number) ?? undefined,
      totalPitWithheld: (row.total_pit_withheld as number) ?? undefined,
      netPitPayable: (row.net_pit_payable as number) ?? undefined,
      citRate: row.cit_rate as number,
      createdAt: row.created_at as unknown as Date,
      submittedAt: (row.submitted_at as string) ?? undefined,
      adjustedDeclarationId: (row.adjusted_declaration_id as number) ?? undefined,
    };
  }

  private toParams(entity: TaxDeclaration) {
    return {
      id: entity.id || null,
      companyId: entity.companyId,
      taxType: entity.taxType,
      periodId: entity.periodId,
      year: entity.year,
      month: entity.month ?? null,
      quarter: entity.quarter ?? null,
      declarationType: entity.declarationType,
      periodName: entity.periodName,
      vatMethod: entity.vatMethod,
      status: entity.status,
      lines: JSON.stringify(entity.lines),
      inputLines: JSON.stringify(entity.inputLines),
      invoices: JSON.stringify(entity.invoices),
      totalOutputVat: entity.totalOutputVat,
      totalInputVat: entity.totalInputVat,
      totalTaxableAmount: entity.totalTaxableAmount,
      netVatPayable: entity.netVatPayable,
      revenue: entity.revenue ?? null,
      expenses: entity.expenses ?? null,
      netIncome: entity.netIncome ?? null,
      citPayable: entity.citPayable ?? null,
      totalIncome: entity.totalIncome ?? null,
      totalDeductions: entity.totalDeductions ?? null,
      taxableIncome: entity.taxableIncome ?? null,
      totalPitWithheld: entity.totalPitWithheld ?? null,
      netPitPayable: entity.netPitPayable ?? null,
      citRate: entity.citRate,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      submittedAt: entity.submittedAt ?? null,
      adjustedDeclarationId: entity.adjustedDeclarationId ?? null,
    };
  }
}
