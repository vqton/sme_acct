export interface CompanyBankAccount {
  id: string;
  companyId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankBranch?: string;
  swiftCode?: string;
  currencyCode: string;
  isPrimaryTaxPayment: boolean;
  isActive: boolean;
  openedDate: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createCompanyBankAccount(
  data: Omit<CompanyBankAccount, 'id' | 'createdAt' | 'isActive'> & { id?: string; createdAt?: Date; isActive?: boolean },
): CompanyBankAccount {
  return {
    id: crypto.randomUUID(),
    isActive: true,
    createdAt: new Date(),
    ...data,
  };
}
