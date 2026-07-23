import type { Repository } from './Repository.js';
import type { JournalEntry, JournalLine } from '../entities/JournalEntry.js';

export interface JournalEntryRepository extends Repository<JournalEntry, number> {
  findByCompanyId(companyId: number): JournalEntry[];
  findByPeriodId(periodId: number): JournalEntry[];
  findByEntryNumber(companyId: number, entryNumber: string): JournalEntry | null;
  findByDateRange(companyId: number, fromDate: string, toDate: string): JournalEntry[];
  findByType(companyId: number, entryType: number): JournalEntry[];
  findPosted(companyId: number): JournalEntry[];
  findUnposted(companyId: number): JournalEntry[];
  findLinesByEntryId(entryId: number): JournalLine[];
  findLinesByAccountId(accountId: number): JournalLine[];
  getNextEntryNumber(companyId: number, year: number, month: number): string;
  saveLines(entryId: number, lines: JournalLine[]): void;
  deleteLines(entryId: number): void;
}
