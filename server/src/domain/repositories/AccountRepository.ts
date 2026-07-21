import type { Repository } from './Repository.js';
import type { Account } from '../entities/Account.js';

export interface AccountRepository extends Repository<Account, string> {
  findByCompanyId(companyId: string): Account[];
  findByAccountNumber(companyId: string, accountNumber: string): Account | null;
  findByParentId(parentId: string): Account[];
  findByCategory(companyId: string, category: number): Account[];
  findByType(companyId: string, type: number): Account[];
  findActive(companyId: string): Account[];
  findSystem(companyId: string): Account[];
  findLeafAccounts(companyId: string): Account[];
  search(companyId: string, query: string): Account[];
}
