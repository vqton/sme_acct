import type { Repository } from './Repository.js';
import type { JournalEntry, JournalLine } from '../entities/JournalEntry.js';

export interface JournalEntryRepository extends Repository<JournalEntry, string> {
  findByCompanyId(companyId: string): JournalEntry[];
  findByPeriodId(periodId: string): JournalEntry[];
  findByEntryNumber(companyId: string, entryNumber: string): JournalEntry | null;
  findByDateRange(companyId: string, fromDate: string, toDate: string): JournalEntry[];
  findByType(companyId: string, entryType: number): JournalEntry[];
  findPosted(companyId: string): JournalEntry[];
  findUnposted(companyId: string): JournalEntry[];
  findLinesByEntryId(entryId: string): JournalLine[];
  getNextEntryNumber(companyId: string, year: number, month: number): string;
  saveLines(entryId: string, lines: JournalLine[]): void;
  deleteLines(entryId: string): void;
}
