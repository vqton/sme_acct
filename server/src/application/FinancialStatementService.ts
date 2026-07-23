import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { FiscalPeriodRepository } from '../domain/repositories/FiscalPeriodRepository.js';
import type { CompanyRepository } from '../domain/repositories/CompanyRepository.js';
import type { AccountBalance } from '../domain/entities/LedgerEntry.js';
import {
  FinancialStatementType,
  generateAllLines,
} from '../domain/entities/FinancialStatement.js';
import type { FinancialStatement } from '../domain/entities/FinancialStatement.js';

export class FinancialStatementService {
  constructor(
    private readonly ledgerRepo: LedgerRepository,
    private readonly fiscalPeriodRepo: FiscalPeriodRepository,
    private readonly companyRepo: CompanyRepository,
  ) {}

  generateBalanceSheet(companyId: number, periodId: number): FinancialStatement {
    return this.generateStatement(companyId, periodId, FinancialStatementType.B01_DN);
  }

  generateIncomeStatement(companyId: number, periodId: number): FinancialStatement {
    return this.generateStatement(companyId, periodId, FinancialStatementType.B02_DN);
  }

  private generateStatement(
    companyId: number,
    periodId: number,
    type: FinancialStatementType,
  ): FinancialStatement {
    const period = this.fiscalPeriodRepo.findById(periodId);
    if (!period) throw new Error(`Period ${periodId} not found`);
    if (period.companyId !== companyId) throw new Error('Period does not belong to company');

    const company = this.companyRepo.findById(companyId);
    if (!company) throw new Error(`Company ${companyId} not found`);

    const currentBalances = this.ledgerRepo.getAccountBalances(companyId, periodId);

    const prevPeriod = this.findPreviousPeriod(companyId, period.year, period.month);
    const prevBalances = prevPeriod
      ? this.ledgerRepo.getAccountBalances(companyId, prevPeriod.id)
      : [];

    const periodLabel = `Tháng ${period.month}/${period.year}`;

    return generateAllLines(type, currentBalances, prevBalances, company.name, periodLabel);
  }

  private findPreviousPeriod(companyId: number, year: number, month: number) {
    if (month > 1) {
      return this.fiscalPeriodRepo.findByMonth(companyId, year, month - 1);
    }
    return this.fiscalPeriodRepo.findByMonth(companyId, year - 1, 12);
  }
}
