import type { OpeningBalanceRepository } from '../domain/repositories/OpeningBalanceRepository.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { FiscalPeriodRepository } from '../domain/repositories/FiscalPeriodRepository.js';
import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { AuditLogRepository } from '../domain/repositories/AuditLogRepository.js';
import type { JournalEntryRepository } from '../domain/repositories/JournalEntryRepository.js';
import type { OpeningBalanceHeader } from '../domain/entities/OpeningBalanceHeader.js';
import type { OpeningBalanceLine } from '../domain/entities/OpeningBalanceLine.js';
import {
  createOBHeader, lockOBHeader, unlockOBHeader,
  approveOBHeader, rejectOBHeader, submitOBHeaderForApproval,
} from '../domain/entities/OpeningBalanceHeader.js';
import { createOBLine } from '../domain/entities/OpeningBalanceLine.js';
import { OpeningBalanceStatus, OpeningBalanceImportSource } from '../domain/enums/OpeningBalanceEnums.js';
import { FiscalPeriodStatus } from '../domain/enums/AccountEnums.js';

export interface CreateOBLineInput {
  accountId: number;
  accountNumber: string;
  accountName: string;
  debitAmount?: number;
  creditAmount?: number;
  foreignCurrencyCode?: string;
  foreignDebitAmount?: number;
  foreignCreditAmount?: number;
  exchangeRate?: number;
  bankAccountId?: number;
  customerId?: number;
  supplierId?: number;
  employeeId?: number;
  inventoryItemId?: number;
  fixedAssetId?: number;
  toolId?: number;
  prepaidExpenseId?: number;
}

export interface OBAuditLogInput {
  companyId: number;
  headerId?: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  userId: number;
  ipAddress?: string;
}

export class OpeningBalanceService {
  constructor(
    private readonly obRepo: OpeningBalanceRepository,
    private readonly accountRepo: AccountRepository,
    private readonly periodRepo: FiscalPeriodRepository,
    private readonly ledgerRepo: LedgerRepository,
    private readonly auditRepo: AuditLogRepository,
    private readonly journalRepo: JournalEntryRepository,
  ) {}

  createOpeningBalance(
    companyId: number,
    periodId: number,
    entryDate: string,
    userId: number,
    lines: CreateOBLineInput[],
    options?: {
      description?: string;
      importSource?: OpeningBalanceImportSource;
      sourceDbName?: string;
      sourceDbVersion?: string;
    },
  ): { header: OpeningBalanceHeader; lines: OpeningBalanceLine[] } {
    const period = this.periodRepo.findById(periodId);
    if (!period) throw new Error('Fiscal period not found');
    if (period.status === FiscalPeriodStatus.Closed) throw new Error('Fiscal period is closed');

    for (const l of lines) {
      const acct = this.accountRepo.findById(l.accountId);
      if (!acct) throw new Error(`Account ${l.accountNumber} not found`);
      if (!acct.isActive) throw new Error(`Account ${l.accountNumber} is not active (không hoạt động)`);
    }

    const totalDebit = lines.reduce((s, l) => s + (l.debitAmount ?? 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.creditAmount ?? 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Tổng Dư Nợ (${totalDebit}) không khớp Tổng Dư Có (${totalCredit}). Chênh lệch: ${totalDebit - totalCredit}`);
    }

    const header = createOBHeader({
      companyId,
      periodId,
      entryDate,
      createdByUserId: userId,
      description: options?.description,
      importSource: options?.importSource,
      totalDebit,
      totalCredit,
    });

    const savedHeader = this.obRepo.save(header);

    const obLines = lines.map((l) => createOBLine({
      headerId: savedHeader.id,
      companyId,
      accountId: l.accountId,
      accountNumber: l.accountNumber,
      accountName: l.accountName,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
      foreignCurrencyCode: l.foreignCurrencyCode,
      foreignDebitAmount: l.foreignDebitAmount,
      foreignCreditAmount: l.foreignCreditAmount,
      exchangeRate: l.exchangeRate,
      bankAccountId: l.bankAccountId,
      customerId: l.customerId,
      supplierId: l.supplierId,
      employeeId: l.employeeId,
      inventoryItemId: l.inventoryItemId,
      fixedAssetId: l.fixedAssetId,
      toolId: l.toolId,
      prepaidExpenseId: l.prepaidExpenseId,
    }));

    const savedLines = this.obRepo.saveLines(savedHeader.id, obLines);

    const updatedHeader = this.obRepo.findById(savedHeader.id)!;
    this.audit({
      companyId,
      headerId: updatedHeader.id,
      action: 'created',
      newValue: JSON.stringify({ lines: lines.length, totalDebit, totalCredit, batchNumber: updatedHeader.batchNumber }),
      userId,
    });

    return { header: updatedHeader, lines: savedLines };
  }

  getOpeningBalanceDetail(headerId: number): { header: OpeningBalanceHeader; lines: OpeningBalanceLine[] } {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Opening balance header not found');
    const lines = this.obRepo.getLines(headerId);
    return { header, lines };
  }

  listByCompany(companyId: number): OpeningBalanceHeader[] {
    return this.obRepo.findByCompanyId(companyId);
  }

  listByPeriod(companyId: number, periodId: number): OpeningBalanceHeader[] {
    return this.obRepo.findByPeriodId(companyId, periodId);
  }

  lockOpeningBalance(headerId: number, userId: number): OpeningBalanceHeader {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');

    const locked = lockOBHeader(header, userId);
    const saved = this.obRepo.save(locked);

    const lines = this.obRepo.getLines(headerId);
    for (const line of lines) {
      const acct = this.accountRepo.findById(line.accountId);
      if (acct) {
        const updated = {
          ...acct,
          openingDebit: (acct.openingDebit ?? 0) + line.debitAmount,
          openingCredit: (acct.openingCredit ?? 0) + line.creditAmount,
          updatedAt: new Date(),
        };
        this.accountRepo.save(updated);
      }
    }

    this.updateAccountBalances(lines, header.companyId, header.periodId);

    this.audit({
      companyId: header.companyId,
      headerId,
      action: 'locked',
      userId,
    });

    return saved;
  }

  unlockOpeningBalance(headerId: number, userId: number, reason?: string): OpeningBalanceHeader {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');

    const lines = this.obRepo.getLines(headerId);
    for (const line of lines) {
      const acct = this.accountRepo.findById(line.accountId);
      if (acct) {
        const updated = {
          ...acct,
          openingDebit: Math.max(0, (acct.openingDebit ?? 0) - line.debitAmount),
          openingCredit: Math.max(0, (acct.openingCredit ?? 0) - line.creditAmount),
          updatedAt: new Date(),
        };
        this.accountRepo.save(updated);
      }
    }

    const unlocked = unlockOBHeader(header, userId);
    const saved = this.obRepo.save(unlocked);

    this.audit({
      companyId: header.companyId,
      headerId,
      action: 'unlocked',
      newValue: reason,
      userId,
    });

    return saved;
  }

  submitForApproval(headerId: number): OpeningBalanceHeader {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');
    const submitted = submitOBHeaderForApproval(header);
    return this.obRepo.save(submitted);
  }

  approveOpeningBalance(headerId: number, userId: number): OpeningBalanceHeader {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');
    const approved = approveOBHeader(header, userId);
    const saved = this.obRepo.save(approved);

    this.audit({
      companyId: header.companyId,
      headerId,
      action: 'approved',
      userId,
    });

    return saved;
  }

  rejectApproval(headerId: number, userId: number, reason: string): OpeningBalanceHeader {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');
    const rejected = rejectOBHeader(header, userId, reason);
    return this.obRepo.save(rejected);
  }

  deleteOpeningBalance(headerId: number): void {
    const header = this.obRepo.findById(headerId);
    if (!header) throw new Error('Header not found');
    if (header.isLocked) throw new Error('Cannot delete locked opening balance');
    if (header.status === OpeningBalanceStatus.PeriodClosed) throw new Error('Cannot delete: period is closed');

    this.obRepo.deleteLines(headerId);
    this.obRepo.delete(headerId);
  }

  private updateAccountBalances(lines: OpeningBalanceLine[], companyId: number, periodId: number): void {
    for (const line of lines) {
      const bal = this.ledgerRepo.getAccountBalance(companyId, line.accountId, periodId);
      if (bal) {
        this.ledgerRepo.saveBalance({
          ...bal,
          openingDebit: bal.openingDebit + line.debitAmount,
          openingCredit: bal.openingCredit + line.creditAmount,
          closingDebit: bal.closingDebit + line.debitAmount,
          closingCredit: bal.closingCredit + line.creditAmount,
        });
      } else {
        this.ledgerRepo.saveBalance({
          accountId: line.accountId,
          accountNumber: line.accountNumber,
          companyId,
          periodId,
          openingDebit: line.debitAmount,
          openingCredit: line.creditAmount,
          periodDebit: 0,
          periodCredit: 0,
          closingDebit: line.debitAmount,
          closingCredit: line.creditAmount,
        });
      }
    }
  }

  private audit(input: OBAuditLogInput): void {
    this.auditRepo.save({
      id: 0,
      companyId: input.companyId,
      action: `OB_${input.action.toUpperCase()}`,
      entityType: 'opening_balance',
      entityId: input.headerId,
      detail: input.newValue ?? input.action,
      createdAt: new Date(),
    });
  }
}
