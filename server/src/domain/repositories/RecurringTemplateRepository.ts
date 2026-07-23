import type { Repository } from './Repository.js';
import type { RecurringTemplate } from '../entities/RecurringEntry.js';

export interface RecurringTemplateRepository extends Repository<RecurringTemplate, number> {
  findByCompanyId(companyId: number): RecurringTemplate[];
  findActive(companyId: number): RecurringTemplate[];
  findDueForGeneration(asOfDate: string): RecurringTemplate[];
  saveLines(templateId: number, lines: RecurringTemplate['templateLines']): void;
  deleteLines(templateId: number): void;
}
