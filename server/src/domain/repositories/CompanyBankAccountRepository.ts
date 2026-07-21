import type { CompanyBankAccount } from '../entities/CompanyBankAccount.js';

export interface CompanyBankAccountRepository {
  findById(id: string): CompanyBankAccount | null;
  findByCompanyId(companyId: string): CompanyBankAccount[];
  findPrimaryTaxPaymentByCompanyId(companyId: string): CompanyBankAccount | null;
  save(entity: CompanyBankAccount): CompanyBankAccount;
  delete(id: string): void;
}
