import type { CompanyBankAccount } from '../entities/CompanyBankAccount.js';

export interface CompanyBankAccountRepository {
  findById(id: number): CompanyBankAccount | null;
  findByCompanyId(companyId: number): CompanyBankAccount[];
  findPrimaryTaxPaymentByCompanyId(companyId: number): CompanyBankAccount | null;
  save(entity: CompanyBankAccount): CompanyBankAccount;
  delete(id: number): void;
}
