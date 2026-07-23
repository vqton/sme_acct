import type { Repository } from './Repository.js';
import type { Account } from '../entities/Account.js';

export interface AccountRepository extends Repository<Account, number> {
  findByCompanyId(companyId: number): Account[];
  findByAccountNumber(companyId: number, accountNumber: string): Account | null;
  findByParentId(parentId: number): Account[];
  findByCategory(companyId: number, category: number): Account[];
  findByType(companyId: number, type: number): Account[];
  findActive(companyId: number): Account[];
  findSystem(companyId: number): Account[];
  findLeafAccounts(companyId: number): Account[];
  search(companyId: number, query: string): Account[];
}
