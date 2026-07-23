import type { RecurringTemplateRepository } from '../domain/repositories/RecurringTemplateRepository.js';
import type { JournalEntryRepository } from '../domain/repositories/JournalEntryRepository.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { RecurringTemplate, RecurringTemplateLine } from '../domain/entities/RecurringEntry.js';
import {
  createRecurringTemplate,
  generateNextDate,
  evaluateFormula,
} from '../domain/entities/RecurringEntry.js';
import { createJournalEntry } from '../domain/entities/JournalEntry.js';
import type { JournalEntry } from '../domain/entities/JournalEntry.js';
import { JournalEntryType } from '../domain/enums/AccountEnums.js';

export class RecurringEntryService {
  constructor(
    private readonly templateRepo: RecurringTemplateRepository,
    private readonly journalEntryRepo: JournalEntryRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  createTemplate(data: Partial<RecurringTemplate> & {
    companyId: number; name: string; entryType: number;
    frequency: number; templateLines: RecurringTemplateLine[];
    startDate: string;
  }): RecurringTemplate {
    const entity = createRecurringTemplate(data as any);
    const saved = this.templateRepo.save(entity);
    this.templateRepo.saveLines(saved.id, data.templateLines);
    return this.getTemplate(saved.id);
  }

  getTemplate(id: number): RecurringTemplate {
    const tpl = this.templateRepo.findById(id);
    if (!tpl) throw new Error('Template not found');
    return tpl;
  }

  listTemplates(companyId: number): RecurringTemplate[] {
    return this.templateRepo.findByCompanyId(companyId);
  }

  generateEntry(templateId: number, periodId: number, params: Record<string, number> = {}): JournalEntry {
    const tpl = this.getTemplate(templateId);
    if (!tpl.isActive) throw new Error('Template is inactive');

    const lines = tpl.templateLines.map((l) => {
      const debitAmount = evaluateFormula(l.debitFormula, params);
      const creditAmount = evaluateFormula(l.creditFormula, params);
      return {
        accountId: l.accountId,
        accountNumber: l.accountNumber,
        description: l.description,
        debitAmount: Math.round(debitAmount),
        creditAmount: Math.round(creditAmount),
      };
    });

    const totalDebit = lines.reduce((s, l) => s + l.debitAmount, 0);
    const totalCredit = lines.reduce((s, l) => s + l.creditAmount, 0);

    if (totalDebit !== totalCredit) {
      if (Math.abs(totalDebit - totalCredit) > 1) {
        throw new Error(`Template ${tpl.name}: total debit ${totalDebit} ≠ credit ${totalCredit}`);
      }
      if (totalDebit > totalCredit) {
        lines[lines.length - 1].creditAmount += totalDebit - totalCredit;
      } else {
        lines[lines.length - 1].debitAmount += totalCredit - totalDebit;
      }
    }

    const entry = createJournalEntry({
      companyId: tpl.companyId,
      entryDate: tpl.nextGenerationDate,
      periodId,
      entryType: tpl.entryType as JournalEntryType,
      description: tpl.name,
      lines,
    });

    const saved = this.journalEntryRepo.save({
      ...entry,
      entryNumber: this.journalEntryRepo.getNextEntryNumber(tpl.companyId,
        new Date(tpl.nextGenerationDate).getFullYear(),
        new Date(tpl.nextGenerationDate).getMonth() + 1),
    });

    if (tpl.autoPost) {
      const posted = { ...saved, isPosted: true, postedAt: new Date().toISOString() };
      return this.journalEntryRepo.save(posted);
    }

    this.updateNextGeneration(tpl);

    return saved;
  }

  updateNextGeneration(tpl: RecurringTemplate): void {
    const nextDate = generateNextDate(tpl.nextGenerationDate, tpl.frequency, tpl.dayOfMonth);
    const occurrences = tpl.occurrencesGenerated + 1;

    const shouldDeactivate = (tpl.maxOccurrences && occurrences >= tpl.maxOccurrences)
      || (tpl.endDate && nextDate > tpl.endDate);

    this.templateRepo.save({
      ...tpl,
      nextGenerationDate: nextDate,
      occurrencesGenerated: occurrences,
      isActive: tpl.isActive && !shouldDeactivate,
    });
  }

  processDueEntries(asOfDate: string, periodId: number): Array<{ templateId: number; entry: JournalEntry }> {
    const dueTemplates = this.templateRepo.findDueForGeneration(asOfDate);
    const results: Array<{ templateId: number; entry: JournalEntry }> = [];

    for (const tpl of dueTemplates) {
      const entry = this.generateEntry(tpl.id, periodId);
      results.push({ templateId: tpl.id, entry });
    }

    return results;
  }
}
