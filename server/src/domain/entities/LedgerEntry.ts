export interface LedgerEntry {
  id: number;
  companyId: number;
  accountId: number;
  accountNumber: string;
  periodId: number;
  journalEntryId: number;
  entryNumber: string;
  entryDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningDebit: number;
  runningCredit: number;
  runningBalance: number;
  costCenterId?: number;
  departmentId?: number;
  projectId?: number;
  createdAt: Date;
}

export interface AccountBalance {
  accountId: number;
  accountNumber: string;
  companyId: number;
  periodId: number;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  budgetDebit?: number;
  budgetCredit?: number;
}

export function calculateBalance(entries: LedgerEntry[], openingDebit = 0, openingCredit = 0, nature: 'DuNo' | 'DuCo' = 'DuNo'): AccountBalance {
  const periodDebit = entries.reduce((s, e) => s + e.debitAmount, 0);
  const periodCredit = entries.reduce((s, e) => s + e.creditAmount, 0);
  const opening = openingDebit - openingCredit;
  const netPeriod = periodDebit - periodCredit;
  const closing = opening + netPeriod;

  return {
    accountId: entries[0]?.accountId ?? '',
    accountNumber: entries[0]?.accountNumber ?? '',
    companyId: entries[0]?.companyId ?? '',
    periodId: entries[0]?.periodId ?? '',
    openingDebit,
    openingCredit,
    periodDebit,
    periodCredit,
    closingDebit: nature === 'DuNo' ? (closing > 0 ? closing : 0) : (closing < 0 ? -closing : 0),
    closingCredit: nature === 'DuCo' ? (closing > 0 ? closing : 0) : (closing < 0 ? -closing : 0),
  };
}
