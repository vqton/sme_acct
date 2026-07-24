import type { Repository } from './Repository.js';
import type { OpeningBalanceHeader } from '../entities/OpeningBalanceHeader.js';
import type { OpeningBalanceLine } from '../entities/OpeningBalanceLine.js';
import type { OpeningBalanceConversionMapping } from '../entities/OpeningBalanceConversionMapping.js';
import type { OpeningBalanceStatus } from '../enums/OpeningBalanceEnums.js';

export interface OpeningBalanceRepository extends Repository<OpeningBalanceHeader, number> {
  findByCompanyId(companyId: number): OpeningBalanceHeader[];
  findByPeriodId(companyId: number, periodId: number): OpeningBalanceHeader[];
  findByBatchNumber(batchNumber: string): OpeningBalanceHeader | null;
  findByStatus(companyId: number, status: OpeningBalanceStatus): OpeningBalanceHeader[];
  findActiveBatch(companyId: number, periodId: number): OpeningBalanceHeader | null;

  getLines(headerId: number): OpeningBalanceLine[];
  saveLines(headerId: number, lines: OpeningBalanceLine[]): OpeningBalanceLine[];
  deleteLines(headerId: number): void;

  getMappings(companyId: number): OpeningBalanceConversionMapping[];
  saveMapping(mapping: OpeningBalanceConversionMapping): OpeningBalanceConversionMapping;
  deleteMapping(id: number): void;
  deleteMappingsByCompany(companyId: number): void;

  generateBatchNumber(companyId: number, year: number): string;
}
