import type { Account } from '../domain/entities/Account.js';
import type { JournalEntry, JournalLine } from '../domain/entities/JournalEntry.js';
import type { FiscalPeriod } from '../domain/entities/FiscalPeriod.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { JournalEntryRepository } from '../domain/repositories/JournalEntryRepository.js';
import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { FiscalPeriodRepository } from '../domain/repositories/FiscalPeriodRepository.js';
import type { AccountBalance, LedgerEntry } from '../domain/entities/LedgerEntry.js';
import { AccountNature, FiscalPeriodStatus, STANDARD_ACCOUNTS, ACCOUNT_CATEGORY_NATURE } from '../domain/enums/AccountEnums.js';
import { createAccount } from '../domain/entities/Account.js';
import { createJournalEntry, postJournalEntry, reverseJournalEntry } from '../domain/entities/JournalEntry.js';
import { createFiscalPeriod, closePeriod, lockPeriod } from '../domain/entities/FiscalPeriod.js';

export interface AccountingRepos {
  accounts: AccountRepository;
  journalEntries: JournalEntryRepository;
  ledger: LedgerRepository;
  fiscalPeriods: FiscalPeriodRepository;
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
    const entity = createAccount(data as any);
    return this.repos.accounts.save(entity);
  }

  updateAccount(id: number, data: Partial<Account>): Account {
    const existing = this.getAccount(id);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    return this.repos.accounts.save(updated);
  }

  deleteAccount(id: number): void {
    const children = this.repos.accounts.findByParentId(id);
    if (children.length > 0) throw new Error('Cannot delete account with child accounts');
    this.repos.accounts.delete(id);
  }

  seedStandardAccounts(companyId: number): Account[] {
    const existing = this.repos.accounts.findByCompanyId(companyId);
    if (existing.length > 0) return existing;


    const created: Account[] = [];

    for (const def of STANDARD_ACCOUNTS) {
      const parent = def.parent ? created.find((a) => a.accountNumber === def.parent) : undefined;
      const nature = ACCOUNT_CATEGORY_NATURE[def.category];
      const acc = createAccount({
        companyId,
        accountNumber: def.number,
        name: def.name,
        category: def.category,
        nature,
        parentId: parent?.id,
        isSystem: true,
        type: def.parent ? (def.number.length >= 4 ? 3 : 2) : 1,
        allowTransactions: def.number.length >= 4,
      });
      created.push(this.repos.accounts.save(acc));
    }
    return created;
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
