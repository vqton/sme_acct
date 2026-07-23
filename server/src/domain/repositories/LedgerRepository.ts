import type { LedgerEntry, AccountBalance } from '../entities/LedgerEntry.js';

export interface LedgerRepository {
  findByPeriodId(companyId: number, periodId: number): LedgerEntry[];
  findByAccountId(companyId: number, accountId: number, fromDate?: string, toDate?: string): LedgerEntry[];
  findByAccountInPeriod(companyId: number, accountId: number, periodId: number): LedgerEntry[];
  getAccountBalance(companyId: number, accountId: number, periodId: number): AccountBalance | null;
  getAccountBalances(companyId: number, periodId: number): AccountBalance[];
  saveMany(entries: LedgerEntry[]): void;
  saveBalance(balance: AccountBalance): void;
  deleteByPeriodId(companyId: number, periodId: number): void;
  deleteByJournalEntryId(journalEntryId: number): void;
}
