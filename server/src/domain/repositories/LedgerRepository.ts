import type { LedgerEntry, AccountBalance } from '../entities/LedgerEntry.js';

export interface LedgerRepository {
  findByPeriodId(companyId: string, periodId: string): LedgerEntry[];
  findByAccountId(companyId: string, accountId: string, fromDate?: string, toDate?: string): LedgerEntry[];
  findByAccountInPeriod(companyId: string, accountId: string, periodId: string): LedgerEntry[];
  getAccountBalance(companyId: string, accountId: string, periodId: string): AccountBalance | null;
  getAccountBalances(companyId: string, periodId: string): AccountBalance[];
  saveMany(entries: LedgerEntry[]): void;
  saveBalance(balance: AccountBalance): void;
  deleteByPeriodId(companyId: string, periodId: string): void;
  deleteByJournalEntryId(journalEntryId: string): void;
}
