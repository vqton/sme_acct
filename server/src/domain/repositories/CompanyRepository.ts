import { Repository } from './Repository.js';
import { Company, CompanyStatus } from '../entities/Company.js';

export interface CompanyRepository extends Repository<Company, string> {
  findByTaxCode(taxCode: string): Company | null;
  findByEnterpriseCode(code: string): Company | null;
  findByStatus(status: CompanyStatus): Company[];
}
