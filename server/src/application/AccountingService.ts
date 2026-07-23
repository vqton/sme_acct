import type { Account } from '../domain/entities/Account.js';
import type { JournalEntry } from '../domain/entities/JournalEntry.js';
import type { FiscalPeriod } from '../domain/entities/FiscalPeriod.js';
import type { AuditLog } from '../domain/entities/AuditLog.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { JournalEntryRepository } from '../domain/repositories/JournalEntryRepository.js';
import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { FiscalPeriodRepository } from '../domain/repositories/FiscalPeriodRepository.js';
import type { AuditLogRepository } from '../domain/repositories/AuditLogRepository.js';
import type { AccountBalance, LedgerEntry } from '../domain/entities/LedgerEntry.js';
import {
  AccountCategory, AccountNature, AccountType, FiscalPeriodStatus, AccountingRegime,
  STANDARD_ACCOUNTS_TT99, STANDARD_ACCOUNTS_TT133, ACCOUNT_CATEGORY_NATURE,
} from '../domain/enums/AccountEnums.js';
import { createAccount } from '../domain/entities/Account.js';
import { createJournalEntry, postJournalEntry, reverseJournalEntry } from '../domain/entities/JournalEntry.js';
import { createFiscalPeriod, closePeriod } from '../domain/entities/FiscalPeriod.js';

export interface AccountingRepos {
  accounts: AccountRepository;
  journalEntries: JournalEntryRepository;
  ledger: LedgerRepository;
  fiscalPeriods: FiscalPeriodRepository;
  auditLogs: AuditLogRepository;
}

export interface SearchOptions {
  page?: number;
  pageSize?: number;
  category?: number;
  activeOnly?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class AccountingService {
  constructor(private repos: AccountingRepos) {}

  // ─── Accounts ───────────────────────────────────────────

  listAccounts(companyId: number): Account[] {
    return this.repos.accounts.findByCompanyId(companyId);
  }

  getAccount(id: number): Account {
    const acc = this.repos.accounts.findById(id);
    if (!acc) throw new Error('Account not found');
    return acc;
  }

  getAccountByNumber(companyId: number, number: string): Account | null {
    return this.repos.accounts.findByAccountNumber(companyId, number);
  }

  createAccount(data: Partial<Account> & { companyId: number; accountNumber: string; name: string; category: number; nature: number }): Account {
    const existing = this.repos.accounts.findByAccountNumber(data.companyId, data.accountNumber);
    if (existing) throw new Error(`Account ${data.accountNumber} already exists`);
    if (data.parentId) {
      this.validateAccountHierarchy(data.companyId, data.accountNumber, data.parentId);
    }
    const entity = createAccount(data as any);
    const saved = this.repos.accounts.save(entity);
    this.logAudit({
      companyId: data.companyId,
      action: 'ACCOUNT_CREATE',
      entityType: 'account',
      entityId: saved.id,
      detail: `Created account ${data.accountNumber} - ${data.name}`,
    });
    return saved;
  }

  createStandardAccount(companyId: number, data: {
    accountNumber: string; name: string; category: number;
    nature?: number; parentId?: number; type?: number;
    isSystem?: boolean; allowTransactions?: boolean;
  }): Account {
    if (data.parentId) {
      this.validateAccountHierarchy(companyId, data.accountNumber, data.parentId);
    }
    const existing = this.repos.accounts.findByAccountNumber(companyId, data.accountNumber);
    if (existing) throw new Error(`Account ${data.accountNumber} already exists`);
    const nature = data.nature ?? ACCOUNT_CATEGORY_NATURE[data.category as AccountCategory];
    const entity = createAccount({
      companyId,
      accountNumber: data.accountNumber,
      name: data.name,
      category: data.category,
      nature,
      type: data.type ?? (data.parentId ? AccountType.TaiKhoanCon : AccountType.TaiKhoanMe),
      parentId: data.parentId,
      isSystem: data.isSystem ?? false,
      allowTransactions: data.allowTransactions ?? !!data.parentId,
      isActive: true,
      openingDebit: 0,
      openingCredit: 0,
      debitAmount: 0,
      creditAmount: 0,
      closingDebit: 0,
      closingCredit: 0,
      createdAt: new Date(),
    } as any);
    const saved = this.repos.accounts.save(entity);
    this.logAudit({
      companyId,
      action: 'ACCOUNT_CREATE',
      entityType: 'account',
      entityId: saved.id,
      detail: `Created account ${data.accountNumber} - ${data.name}`,
    });
    return saved;
  }

  updateAccount(id: number, data: Partial<Account>): Account {
    const existing = this.getAccount(id);
    if (data.parentId !== undefined && data.parentId !== existing.parentId) {
      if (data.parentId === id) throw new Error('Circular parent reference: account cannot be its own parent');
      this.validateAccountHierarchy(existing.companyId, existing.accountNumber, data.parentId);
    }
    const updated = { ...existing, ...data, updatedAt: new Date() };
    const saved = this.repos.accounts.save(updated);
    this.logAudit({
      companyId: existing.companyId,
      action: 'ACCOUNT_UPDATE',
      entityType: 'account',
      entityId: saved.id,
      detail: `Updated account ${saved.accountNumber}`,
    });
    return saved;
  }

  deleteAccount(id: number): void {
    const acc = this.repos.accounts.findById(id);
    if (!acc) return;
    const children = this.repos.accounts.findByParentId(id);
    if (children.length > 0) throw new Error('Cannot delete account with child accounts');
    const ledgerEntries = this.repos.ledger.findByAccountId(acc.companyId, id);
    if (ledgerEntries.length > 0) throw new Error('Cannot delete account with ledger transactions');
    const journalLines = this.repos.journalEntries.findLinesByAccountId(id);
    if (journalLines.length > 0) throw new Error('Cannot delete account with journal entry references');
    this.repos.accounts.delete(id);
    this.logAudit({
      companyId: acc.companyId,
      action: 'ACCOUNT_DELETE',
      entityType: 'account',
      entityId: id,
      detail: `Deleted account ${acc.accountNumber} - ${acc.name}`,
    });
  }

  // ─── Deactivation Workflow ─────────────────────────────

  deactivateAccount(id: number, reason?: string): Account {
    const acc = this.repos.accounts.findById(id);
    if (!acc) throw new Error('Account not found');
    if (!acc.isActive) return acc;
    const children = this.repos.accounts.findByParentId(id);
    const activeChildren = children.filter((c) => c.isActive);
    if (activeChildren.length > 0) throw new Error('Cannot deactivate account with active child accounts');
    const ledgerEntries = this.repos.ledger.findByAccountId(acc.companyId, id);
    if (ledgerEntries.length > 0) throw new Error('Cannot deactivate account with ledger transactions');
    const journalLines = this.repos.journalEntries.findLinesByAccountId(id);
    if (journalLines.length > 0) throw new Error('Cannot deactivate account with journal entry references');
    const updated = {
      ...acc,
      isActive: false,
      description: reason ? `[DEACTIVATED] ${reason}` : '[DEACTIVATED]',
      updatedAt: new Date(),
    };
    const saved = this.repos.accounts.save(updated);
    this.logAudit({
      companyId: acc.companyId,
      action: 'ACCOUNT_DEACTIVATE',
      entityType: 'account',
      entityId: id,
      detail: `Deactivated account ${acc.accountNumber} - ${acc.name}${reason ? `: ${reason}` : ''}`,
    });
    return saved;
  }

  reactivateAccount(id: number): Account {
    const acc = this.repos.accounts.findById(id);
    if (!acc) throw new Error('Account not found');
    if (acc.isActive) return acc;
    const updated = {
      ...acc,
      isActive: true,
      description: acc.description?.replace(/^\[DEACTIVATED\].*$/, '').trim() || undefined,
      updatedAt: new Date(),
    };
    const saved = this.repos.accounts.save(updated);
    this.logAudit({
      companyId: acc.companyId,
      action: 'ACCOUNT_REACTIVATE',
      entityType: 'account',
      entityId: id,
      detail: `Reactivated account ${acc.accountNumber} - ${acc.name}`,
    });
    return saved;
  }

  searchAccounts(companyId: number, query: string, opts: SearchOptions = {}): PaginatedResult<Account> {
    const { page = 1, pageSize = 20, category, activeOnly } = opts;
    let accounts = query
      ? this.repos.accounts.search(companyId, query)
      : this.repos.accounts.findByCompanyId(companyId);
    if (category) accounts = accounts.filter((a) => a.category === category);
    if (activeOnly) accounts = accounts.filter((a) => a.isActive);
    const total = accounts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = accounts.slice(start, start + pageSize);
    return { data, total, page, pageSize, totalPages };
  }

  seedStandardAccounts(companyId: number, regime: AccountingRegime = AccountingRegime.TT99): Account[] {
    const existing = this.repos.accounts.findByCompanyId(companyId);
    if (existing.length > 0) return existing;

    let standardAccounts: Array<{ number: string; name: string; category: number; parent?: string }>;
    switch (regime) {
      case AccountingRegime.TT99:
        standardAccounts = STANDARD_ACCOUNTS_TT99;
        break;
      case AccountingRegime.TT133:
        standardAccounts = STANDARD_ACCOUNTS_TT133;
        break;
      case AccountingRegime.TT58:
        throw new Error('TT 58 does not use a standard chart of accounts');
      default:
        throw new Error('Unsupported accounting regime');
    }

    const created: Account[] = [];
    for (const def of standardAccounts) {
      const parent = def.parent ? created.find((a) => a.accountNumber === def.parent) : undefined;
      const nature = ACCOUNT_CATEGORY_NATURE[def.category as AccountCategory];
      const acc = createAccount({
        companyId,
        accountNumber: def.number,
        name: def.name,
        category: def.category,
        nature,
        parentId: parent?.id,
        isSystem: true,
        type: def.parent ? (def.number.length >= 4 ? AccountType.TaiKhoanChiTiet : AccountType.TaiKhoanCon) : AccountType.TaiKhoanMe,
        allowTransactions: def.number.length >= 4,
        isActive: true,
        openingDebit: 0,
        openingCredit: 0,
        debitAmount: 0,
        creditAmount: 0,
        closingDebit: 0,
        closingCredit: 0,
        createdAt: new Date(),
      });
      created.push(this.repos.accounts.save(acc));
    }
    this.logAudit({
      companyId,
      action: 'ACCOUNT_SEED',
      entityType: 'account',
      detail: `Seeded ${created.length} accounts for regime ${regime}`,
    });
    return created;
  }

  // ─── Hierarchy Validation ───────────────────────────────

  validateAccountHierarchy(companyId: number, accountNumber: string, parentId: number): void {
    if (!/^\d+$/.test(accountNumber)) {
      throw new Error(`Invalid account number format: ${accountNumber}`);
    }
    const parent = this.repos.accounts.findById(parentId);
    if (!parent) throw new Error('Parent account not found');
    if (parent.companyId !== companyId) throw new Error('Parent account belongs to a different company');
    if (accountNumber.length <= parent.accountNumber.length) {
      throw new Error(`Child account number length (${accountNumber.length}) must exceed parent length (${parent.accountNumber.length})`);
    }
    if (!accountNumber.startsWith(parent.accountNumber)) {
      throw new Error(`Child account ${accountNumber} must start with parent number ${parent.accountNumber}`);
    }
    let current: Account | null = parent;
    while (current) {
      if (current.parentId) {
        const ancestor = this.repos.accounts.findById(current.parentId);
        if (ancestor && ancestor.accountNumber === accountNumber) {
          throw new Error('Circular parent reference detected');
        }
        current = ancestor;
      } else {
        current = null;
      }
    }
  }

  // ─── Audit Log ──────────────────────────────────────────

  getAuditLogs(companyId: number): AuditLog[] {
    return this.repos.auditLogs.findByCompanyId(companyId);
  }

  private logAudit(data: { companyId: number; action: string; entityType: string; entityId?: number; detail?: string }): void {
    this.repos.auditLogs.save({
      id: 0,
      companyId: data.companyId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      detail: data.detail,
      createdAt: new Date(),
    });
  }

  // ─── Journal Entries ────────────────────────────────────

  listJournalEntries(companyId: number): JournalEntry[] {
    return this.repos.journalEntries.findByCompanyId(companyId);
  }

  getJournalEntry(id: number): JournalEntry {
    const entry = this.repos.journalEntries.findById(id);
    if (!entry) throw new Error('Journal entry not found');
    entry.lines = this.repos.journalEntries.findLinesByEntryId(id);
    return entry;
  }

  createJournalEntry(data: {
    companyId: number; entryDate: string; entryType: number;
    description: string; periodId?: number; lines: Array<{ accountId: number; accountNumber: string; debitAmount: number; creditAmount: number; description?: string }>;
  }): JournalEntry {
    let periodId = data.periodId;
    if (!periodId) {
      const current = this.repos.fiscalPeriods.findCurrentPeriod(data.companyId);
      if (!current) throw new Error('No open fiscal period found');
      periodId = current.id;
    }

    const period = this.repos.fiscalPeriods.findById(periodId);
    if (!period) throw new Error('Fiscal period not found');
    if (period.status !== FiscalPeriodStatus.Open) throw new Error('Fiscal period is not open');

    for (const line of data.lines) {
      const acc = this.repos.accounts.findById(line.accountId);
      if (!acc) throw new Error(`Account ${line.accountNumber} not found`);
      if (!acc.allowTransactions) throw new Error(`Account ${line.accountNumber} does not allow transactions`);
    }

    const year = new Date(data.entryDate).getFullYear();
    const month = new Date(data.entryDate).getMonth() + 1;
    const entryNumber = this.repos.journalEntries.getNextEntryNumber(data.companyId, year, month);

    const baseEntry = createJournalEntry({
      companyId: data.companyId,
      entryDate: data.entryDate,
      periodId,
      entryType: data.entryType as any,
      description: data.description,
      lines: data.lines.map((l) => ({
        accountId: l.accountId, accountNumber: l.accountNumber,
        debitAmount: l.debitAmount, creditAmount: l.creditAmount,
        description: l.description,
      })),
    });

    return this.repos.journalEntries.save({
      ...baseEntry,
      entryNumber: entryNumber,
    });
  }

  postJournalEntry(id: number, userId: number): JournalEntry {
    const entry = this.getJournalEntry(id);
    const posted = postJournalEntry(entry);
    posted.postedByUserId = userId;
    posted.postedAt = new Date().toISOString();

    const saved = this.repos.journalEntries.save(posted);
    this.postToLedger(saved);
    return saved;
  }

  reverseJournalEntry(id: number, userId: number): { reversal: JournalEntry; original: JournalEntry } {
    const entry = this.getJournalEntry(id);
    const result = reverseJournalEntry(entry, userId);
    const savedReversal = this.repos.journalEntries.save(result.reversal);
    const savedOriginal = this.repos.journalEntries.save(result.original);
    this.postToLedger(savedReversal);
    return { reversal: savedReversal, original: savedOriginal };
  }

  deleteJournalEntry(id: number): void {
    const entry = this.repos.journalEntries.findById(id);
    if (!entry) return;
    if (entry.isPosted) throw new Error('Cannot delete a posted entry. Reverse it instead.');
    this.repos.ledger.deleteByJournalEntryId(id);
    this.repos.journalEntries.delete(id);
  }

  // ─── Ledger ─────────────────────────────────────────────

  private postToLedger(entry: JournalEntry): void {
    this.repos.ledger.deleteByJournalEntryId(entry.id);

    const accounts = this.repos.accounts.findByCompanyId(entry.companyId);
    const period = this.repos.fiscalPeriods.findById(entry.periodId);
    if (!period) return;

    const entries: LedgerEntry[] = [];
    let runningBalances: Record<string, { debit: number; credit: number }> = {};

    const existingLedger = this.repos.ledger.findByPeriodId(entry.companyId, entry.periodId);
    for (const le of existingLedger) {
      runningBalances[le.accountId] ??= { debit: 0, credit: 0 };
      runningBalances[le.accountId].debit += le.debitAmount;
      runningBalances[le.accountId].credit += le.creditAmount;
    }

    for (const line of entry.lines) {
      const acc = accounts.find((a) => a.id === line.accountId);
      runningBalances[line.accountId] ??= { debit: 0, credit: 0 };
      runningBalances[line.accountId].debit += line.debitAmount;
      runningBalances[line.accountId].credit += line.creditAmount;
      const rb = runningBalances[line.accountId];
      const nature = acc?.nature ?? AccountNature.DuNo;
      const runningBalance = nature === AccountNature.DuNo
        ? rb.debit - rb.credit
        : rb.credit - rb.debit;

      entries.push({
        id: 0,
        companyId: entry.companyId,
        accountId: line.accountId,
        accountNumber: line.accountNumber,
        periodId: entry.periodId,
        journalEntryId: entry.id,
        entryNumber: entry.entryNumber,
        entryDate: entry.entryDate,
        description: line.description ?? entry.description,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        runningDebit: rb.debit,
        runningCredit: rb.credit,
        runningBalance,
        createdAt: new Date(),
      });
    }

    this.repos.ledger.saveMany(entries);
    this.updateAccountBalances(entry.companyId, entry.periodId);
  }

  private updateAccountBalances(companyId: number, periodId: number): void {
    const period = this.repos.fiscalPeriods.findById(periodId);
    if (!period) return;

    const accounts = this.repos.accounts.findByCompanyId(companyId);
    const ledgerEntries = this.repos.ledger.findByPeriodId(companyId, periodId);

    for (const acc of accounts) {
      const accEntries = ledgerEntries.filter((e) => e.accountId === acc.id);
      const periodDebit = accEntries.reduce((s, e) => s + e.debitAmount, 0);
      const periodCredit = accEntries.reduce((s, e) => s + e.creditAmount, 0);

      const prevPeriod = this.repos.fiscalPeriods.findByMonth(companyId, period.year, period.month - 1);
      let openingDebit = acc.openingDebit ?? 0;
      let openingCredit = acc.openingCredit ?? 0;
      if (prevPeriod) {
        const prevBal = this.repos.ledger.getAccountBalance(companyId, acc.id, prevPeriod.id);
        if (prevBal) {
          openingDebit = prevBal.closingDebit;
          openingCredit = prevBal.closingCredit;
        }
      }

      const opening = openingDebit - openingCredit;
      const netPeriod = periodDebit - periodCredit;
      const closing = opening + netPeriod;
      const nature = acc.nature;

      const closingDebit = nature === AccountNature.DuNo ? (closing > 0 ? closing : 0) : (closing < 0 ? -closing : 0);
      const closingCredit = nature === AccountNature.DuCo ? (closing > 0 ? closing : 0) : (closing < 0 ? -closing : 0);

      const balance: AccountBalance = {
        accountId: acc.id, accountNumber: acc.accountNumber,
        companyId, periodId,
        openingDebit, openingCredit,
        periodDebit, periodCredit,
        closingDebit, closingCredit,
      };

      this.repos.ledger.saveBalance(balance);
    }
  }

  getLedgerEntries(companyId: number, accountId?: number, periodId?: number): LedgerEntry[] {
    if (accountId && periodId) {
      return this.repos.ledger.findByAccountInPeriod(companyId, accountId, periodId);
    }
    if (accountId) {
      return this.repos.ledger.findByAccountId(companyId, accountId);
    }
    if (periodId) {
      return this.repos.ledger.findByPeriodId(companyId, periodId);
    }
    const periods = this.repos.fiscalPeriods.findByCompanyId(companyId);
    if (periods.length === 0) return [];
    return this.repos.ledger.findByPeriodId(companyId, periods[0].id);
  }

  getAccountBalance(companyId: number, accountId: number, periodId: number): AccountBalance | null {
    return this.repos.ledger.getAccountBalance(companyId, accountId, periodId);
  }

  getTrialBalance(companyId: number, periodId: number): AccountBalance[] {
    return this.repos.ledger.getAccountBalances(companyId, periodId);
  }

  // ─── Fiscal Periods ─────────────────────────────────────

  getFiscalPeriods(companyId: number): FiscalPeriod[] {
    return this.repos.fiscalPeriods.findByCompanyId(companyId);
  }

  getCurrentPeriod(companyId: number): FiscalPeriod | null {
    return this.repos.fiscalPeriods.findCurrentPeriod(companyId);
  }

  openNewPeriod(companyId: number, year: number, month: number): FiscalPeriod {
    const existing = this.repos.fiscalPeriods.findByMonth(companyId, year, month);
    if (existing) throw new Error('Period already exists');

    const daysInMonth = new Date(year, month, 0).getDate();
    const period = createFiscalPeriod({
      companyId, year, month,
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`,
    });
    return this.repos.fiscalPeriods.save(period);
  }

  closeFiscalPeriod(periodId: number, userId: number): FiscalPeriod {
    const period = this.repos.fiscalPeriods.findById(periodId);
    if (!period) throw new Error('Period not found');
    const closed = closePeriod(period, userId);
    return this.repos.fiscalPeriods.save(closed);
  }
}
