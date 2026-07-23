export interface CompanyBankAccount {
  id: number;
  companyId: number;
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
  data: Omit<CompanyBankAccount, 'id' | 'createdAt' | 'isActive'> & { id?: number; createdAt?: Date; isActive?: boolean },
): CompanyBankAccount {
  return {
    id: 0,
    isActive: true,
    createdAt: new Date(),
    ...data,
  };
}
