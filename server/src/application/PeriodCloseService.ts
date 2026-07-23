import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { FiscalPeriodRepository } from '../domain/repositories/FiscalPeriodRepository.js';
import type { JournalEntryRepository } from '../domain/repositories/JournalEntryRepository.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { AccountBalance } from '../domain/entities/LedgerEntry.js';
import type { FiscalPeriod } from '../domain/entities/FiscalPeriod.js';
import { FiscalPeriodStatus, AccountCategory } from '../domain/enums/AccountEnums.js';
import { closePeriod as closePeriodEntity } from '../domain/entities/FiscalPeriod.js';

export interface CloseValidationResult {
  valid: boolean;
  checks: CloseCheck[];
}

export interface CloseCheck {
  name: string;
  passed: boolean;
  message?: string;
  severity?: 'error' | 'warning';
}

export class PeriodCloseService {
  constructor(
    private readonly ledgerRepo: LedgerRepository,
    private readonly fiscalPeriodRepo: FiscalPeriodRepository,
    private readonly journalEntryRepo: JournalEntryRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  validateClose(companyId: number, periodId: number): CloseValidationResult {
    const period = this.fiscalPeriodRepo.findById(periodId);
    if (!period) throw new Error('Period not found');
    if (period.companyId !== companyId) throw new Error('Period does not belong to company');

    const checks: CloseCheck[] = [];

    const unposted = this.journalEntryRepo.findUnposted(companyId)
      .filter((e) => e.periodId === periodId);
    checks.push({
      name: 'All entries posted',
      passed: unposted.length === 0,
      message: unposted.length > 0 ? `${unposted.length} unposted entries` : undefined,
      severity: 'error',
    });

    const posted = this.journalEntryRepo.findPosted(companyId)
      .filter((e) => e.periodId === periodId);
    for (const entry of posted) {
      const lines = this.journalEntryRepo.findLinesByEntryId(entry.id);
      const totalDebit = lines.reduce((s, l) => s + l.debitAmount, 0);
      const totalCredit = lines.reduce((s, l) => s + l.creditAmount, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        checks.push({
          name: `Entry ${entry.entryNumber} balanced`,
          passed: false,
          message: `Entry ${entry.entryNumber}: Debit ${totalDebit} ≠ Credit ${totalCredit}`,
          severity: 'error',
        });
      }
    }
    const balancedCheck = checks.find((c) => c.name.startsWith('Entry'));
    if (!balancedCheck && posted.length > 0) {
      checks.push({ name: 'All entries balanced', passed: true, severity: 'error' });
    }

    const balances = this.ledgerRepo.getAccountBalances(companyId, periodId);
    const totalDebit = balances.reduce((s, b) => s + b.closingDebit, 0);
    const totalCredit = balances.reduce((s, b) => s + b.closingCredit, 0);
    checks.push({
      name: 'Trial balance zero',
      passed: totalDebit === totalCredit,
      message: totalDebit !== totalCredit
        ? `Debit ${totalDebit} ≠ Credit ${totalCredit} (diff: ${totalDebit - totalCredit})`
        : undefined,
      severity: 'error',
    });

    if (period.status === FiscalPeriodStatus.Closed) {
      checks.push({
        name: 'Period not already closed',
        passed: false,
        message: 'Period is already closed',
        severity: 'error',
      });
    }

    return { valid: checks.every((c) => c.passed || c.severity !== 'error'), checks };
  }

  carryForwardBalances(companyId: number, fromPeriodId: number, toPeriodId: number): AccountBalance[] {
    const fromPeriod = this.fiscalPeriodRepo.findById(fromPeriodId);
    if (!fromPeriod) throw new Error('Source period not found');

    const toPeriod = this.fiscalPeriodRepo.findById(toPeriodId);
    if (!toPeriod) throw new Error('Target period not found');
    if (toPeriod.status !== FiscalPeriodStatus.Open) throw new Error('Target period is not open');

    const balances = this.ledgerRepo.getAccountBalances(companyId, fromPeriodId);

    const carried: AccountBalance[] = balances.map((b) => ({
      accountId: b.accountId,
      accountNumber: b.accountNumber,
      companyId,
      periodId: toPeriodId,
      openingDebit: b.closingDebit,
      openingCredit: b.closingCredit,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: b.closingDebit,
      closingCredit: b.closingCredit,
    }));

    for (const b of carried) {
      this.ledgerRepo.saveBalance(b);
    }

    return carried;
  }

  transferNetIncome(companyId: number, fromPeriodId: number, targetAccountNumber: string = '421'): number {
    const accounts = this.accountRepo.findByCompanyId(companyId);
    const balances = this.ledgerRepo.getAccountBalances(companyId, fromPeriodId);

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const acct of accounts) {
      const bal = balances.find((b) => b.accountId === acct.id);
      if (!bal) continue;
      if (acct.category === AccountCategory.DoanhThu) {
        totalRevenue += bal.closingCredit - bal.closingDebit;
      }
      if (acct.category === AccountCategory.ChiPhi) {
        totalExpense += bal.closingDebit - bal.closingCredit;
      }
    }

    const netIncome = totalRevenue - totalExpense;
    if (netIncome === 0) return 0;

    const targetAcct = accounts.find((a) => a.accountNumber === targetAccountNumber);
    if (!targetAcct) throw new Error(`Target account ${targetAccountNumber} not found`);

    const targetBal = balances.find((b) => b.accountId === targetAcct.id);
    if (!targetBal) throw new Error(`Balance for account ${targetAccountNumber} not found`);

    this.ledgerRepo.saveBalance({
      ...targetBal,
      closingCredit: targetBal.closingCredit + netIncome,
      periodCredit: targetBal.periodCredit + netIncome,
    });

    return netIncome;
  }

  closeWithValidation(companyId: number, periodId: number, userId: number, options?: {
    skipValidation?: boolean;
    carryForwardToPeriodId?: number;
    transferNetIncome?: boolean;
  }): { validation: CloseValidationResult; closedPeriod: FiscalPeriod } {
    if (!options?.skipValidation) {
      const validation = this.validateClose(companyId, periodId);
      if (!validation.valid) {
        throw new Error(`Period close validation failed: ${validation.checks.filter((c) => !c.passed && c.severity !== 'warning').map((c) => c.message).join('; ')}`);
      }
    }

    const period = this.fiscalPeriodRepo.findById(periodId);
    if (!period) throw new Error('Period not found');

    if (options?.transferNetIncome && period.month === 12) {
      this.transferNetIncome(companyId, periodId);
    }

    const closed = closePeriodEntity(period, userId);
    const saved = this.fiscalPeriodRepo.save(closed);

    if (options?.carryForwardToPeriodId) {
      this.carryForwardBalances(companyId, periodId, options.carryForwardToPeriodId);
    }

    return {
      validation: { valid: true, checks: [] },
      closedPeriod: saved,
    };
  }
}
