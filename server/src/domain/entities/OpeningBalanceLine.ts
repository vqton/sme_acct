export interface OpeningBalanceLine {
  id: number;
  headerId: number;
  companyId: number;
  accountId: number;
  accountNumber: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
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
  contractId?: number;
  projectId?: number;
  costCenterId?: string;
  departmentId?: number;

  notes?: string;
  createdAt: Date;
}

export function createOBLine(data: {
  headerId: number;
  companyId: number;
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
  contractId?: number;
  projectId?: number;
  costCenterId?: string;
  departmentId?: number;
  notes?: string;
}): OpeningBalanceLine {
  const debit = data.debitAmount ?? 0;
  const credit = data.creditAmount ?? 0;
  if (debit < 0) throw new Error('Debit amount cannot be negative');
  if (credit < 0) throw new Error('Credit amount cannot be negative');

  let vndDebit = debit;
  let vndCredit = credit;
  if (data.foreignCurrencyCode && data.exchangeRate && data.exchangeRate > 0) {
    if (data.foreignDebitAmount != null) vndDebit = data.foreignDebitAmount * data.exchangeRate;
    if (data.foreignCreditAmount != null) vndCredit = data.foreignCreditAmount * data.exchangeRate;
  }

  return {
    id: 0,
    debitAmount: vndDebit,
    creditAmount: vndCredit,
    createdAt: new Date(),
    ...data,
  };
}

export function validateOBLine(line: OpeningBalanceLine): void {
  if (line.debitAmount < 0) throw new Error('Debit amount cannot be negative');
  if (line.creditAmount < 0) throw new Error('Credit amount cannot be negative');
  if (line.debitAmount > 0 && line.creditAmount > 0) throw new Error('Line cannot have both debit and credit');
}
