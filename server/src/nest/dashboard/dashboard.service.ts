import { Injectable, Inject } from '@nestjs/common';
import { DB_PROVIDER } from '../common/database.module.js';
import type Database from 'better-sqlite3';

export interface DashboardSummary {
  totalCompanies: number;
  activeCompanies: number;
  totalCharterCapital: number;
  totalPaidInCapital: number;
  totalLegalReps: number;
  totalContributors: number;
  totalBankAccounts: number;
}

export interface CompanyStatusCount {
  status: number;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  companiesByStatus: CompanyStatusCount[];
  recentCompanies: Record<string, unknown>[];
}

@Injectable()
export class DashboardService {
  private stmts!: Record<string, Database.Statement>;

  constructor(@Inject(DB_PROVIDER) private readonly db: Database.Database) {
    const p = (sql: string) => db.prepare(sql);
    this.stmts = {
      totalCompanies: p('SELECT COUNT(*) as c FROM companies'),
      activeCompanies: p("SELECT COUNT(*) as c FROM companies WHERE status = 1"),
      totalCharterCapital: p('SELECT COALESCE(SUM(charter_capital), 0) as s FROM companies'),
      totalPaidInCapital: p('SELECT COALESCE(SUM(paid_in_capital), 0) as s FROM companies'),
      totalLegalReps: p('SELECT COUNT(*) as c FROM legal_representatives'),
      totalContributors: p('SELECT COUNT(*) as c FROM capital_contributors'),
      totalBankAccounts: p('SELECT COUNT(*) as c FROM company_bank_accounts'),
      companiesByStatus: p('SELECT status, COUNT(*) as count FROM companies GROUP BY status ORDER BY status'),
      recentCompanies: p('SELECT id, name, status, tax_code as "taxCode", charter_capital as "charterCapital", created_at as "createdAt" FROM companies ORDER BY created_at DESC LIMIT 5'),
    };
  }

  getDashboard(): DashboardData {
    const g = (stmt: Database.Statement) => stmt.get() as Record<string, unknown>;

    const summary: DashboardSummary = {
      totalCompanies: (g(this.stmts.totalCompanies).c as number) ?? 0,
      activeCompanies: (g(this.stmts.activeCompanies).c as number) ?? 0,
      totalCharterCapital: (g(this.stmts.totalCharterCapital).s as number) ?? 0,
      totalPaidInCapital: (g(this.stmts.totalPaidInCapital).s as number) ?? 0,
      totalLegalReps: (g(this.stmts.totalLegalReps).c as number) ?? 0,
      totalContributors: (g(this.stmts.totalContributors).c as number) ?? 0,
      totalBankAccounts: (g(this.stmts.totalBankAccounts).c as number) ?? 0,
    };

    const companiesByStatus = this.stmts.companiesByStatus.all() as CompanyStatusCount[];
    const recentCompanies = this.stmts.recentCompanies.all() as Record<string, unknown>[];

    return { summary, companiesByStatus, recentCompanies };
  }
}
