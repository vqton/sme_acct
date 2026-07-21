import { JournalEntryType } from '../enums/AccountEnums.js';

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountNumber: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string;
  departmentId?: string;
  projectId?: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  entryDate: string;
  periodId: string;
  entryType: JournalEntryType;
  description: string;
  descriptionEnglish?: string;
  referenceNumber?: string;
  referenceDate?: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  isReversed: boolean;
  reversedById?: string;
  postedAt?: string;
  createdAt: Date;
  postedByUserId?: string;
  createdByUserId?: string;
  lines: JournalLine[];
}

export type JournalEntryInput = Omit<Partial<JournalEntry>, 'lines'> & {
  companyId: string;
  entryDate: string;
  periodId: string;
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

  const entryId = crypto.randomUUID();
  const lines: JournalLine[] = data.lines.map((l) => ({
    ...l,
    id: crypto.randomUUID(),
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

export function reverseJournalEntry(entry: JournalEntry, postedByUserId: string): { reversal: JournalEntry; original: JournalEntry } {
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
    entryType: JournalEntryType.DieuChinh,
    description: `Đảo ngược chứng từ ${entry.entryNumber}: ${entry.description}`,
    lines: reversalLines,
    postedByUserId,
  });

  return {
    reversal: { ...reversal, isPosted: true, postedAt: new Date().toISOString() },
    original: { ...entry, isReversed: true, reversedById: reversal.id },
  };
}
