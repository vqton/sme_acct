import { JournalEntryType } from '../enums/AccountEnums.js';

export interface JournalLine {
  id: number;
  journalEntryId: number;
  accountId: number;
  accountNumber: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: number;
  departmentId?: number;
  projectId?: number;
}

export interface JournalEntry {
  id: number;
  companyId: number;
  entryNumber: string;
  entryDate: string;
  periodId: number;
  entryType: JournalEntryType;
  description: string;
  descriptionEnglish?: string;
  referenceNumber?: string;
  referenceDate?: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isReversed: boolean;
  reversedById?: number;
  postedAt?: string;
  createdAt: Date;
  postedByUserId?: number;
  createdByUserId?: number;
  lines: JournalLine[];
}

export type JournalEntryInput = Omit<Partial<JournalEntry>, 'lines'> & {
  companyId: number;
  entryDate: string;
  periodId: number;
  entryType: JournalEntryType;
  description: string;
  lines: Array<Omit<JournalLine, 'id' | 'journalEntryId'>>;
};

export function createJournalEntry(data: JournalEntryInput): JournalEntry {
  const totalDebit = data.lines.reduce((s, l) => s + l.debitAmount, 0);
  const totalCredit = data.lines.reduce((s, l) => s + l.creditAmount, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error('Total debit must equal total credit');
  }

  const entryId = 0;
  const lines: JournalLine[] = data.lines.map((l) => ({
    ...l,
    id: 0,
    journalEntryId: entryId,
  }));

  return {
    id: entryId,
    entryNumber: '',
    isPosted: false,
    isReversed: false,
    totalDebit,
    totalCredit,
    createdAt: new Date(),
    lines,
    companyId: data.companyId,
    entryDate: data.entryDate,
    periodId: data.periodId,
    entryType: data.entryType,
    description: data.description,
    descriptionEnglish: data.descriptionEnglish,
    referenceNumber: data.referenceNumber,
    referenceDate: data.referenceDate,
    postedByUserId: data.postedByUserId,
    createdByUserId: data.createdByUserId,
  };
}

export function postJournalEntry(entry: JournalEntry): JournalEntry {
  if (entry.isPosted) throw new Error('Journal entry already posted');
  if (entry.lines.length === 0) throw new Error('Journal entry must have at least one line');
  const totalDebit = entry.lines.reduce((s, l) => s + l.debitAmount, 0);
  const totalCredit = entry.lines.reduce((s, l) => s + l.creditAmount, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error('Total debit must equal total credit');
  }
  return {
    ...entry,
    isPosted: true,
    postedAt: new Date().toISOString(),
  };
}

export function reverseJournalEntry(entry: JournalEntry, postedByUserId: number): { reversal: JournalEntry; original: JournalEntry } {
  if (!entry.isPosted) throw new Error('Cannot reverse an unposted entry');

  const reversalLines: Array<Omit<JournalLine, 'id' | 'journalEntryId'>> = entry.lines.map((l) => ({
    accountId: l.accountId,
    accountNumber: l.accountNumber,
    description: `Đảo ngược: ${l.description || entry.description}`,
    debitAmount: l.creditAmount,
    creditAmount: l.debitAmount,
  }));

  const reversal = createJournalEntry({
    companyId: entry.companyId,
    entryDate: new Date().toISOString().split('T')[0],
    periodId: entry.periodId,
    entryType: JournalEntryType.Khac,
    description: `Đảo ngược chứng từ ${entry.entryNumber}: ${entry.description}`,
    lines: reversalLines,
    postedByUserId,
  });

  return {
    reversal: { ...reversal, isPosted: true, postedAt: new Date().toISOString() },
    original: { ...entry, isReversed: true, reversedById: reversal.id },
  };
}
