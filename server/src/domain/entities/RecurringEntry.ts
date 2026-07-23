import type { JournalLine } from './JournalEntry.js';

export enum RecurringFrequency {
  Monthly = 1,
  Quarterly = 3,
  SemiAnnually = 6,
  Annually = 12,
}

export interface RecurringTemplateLine {
  accountId: number;
  accountNumber: string;
  description?: string;
  debitFormula: string;
  creditFormula: string;
  costCenterId?: number;
  departmentId?: number;
}

export interface RecurringTemplate {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  entryType: number;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  templateLines: RecurringTemplateLine[];
  totalDebitFormula: string;
  totalCreditFormula: string;
  startDate: string;
  endDate?: string;
  maxOccurrences?: number;
  occurrencesGenerated: number;
  nextGenerationDate: string;
  isActive: boolean;
  autoPost: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export function createRecurringTemplate(data: Partial<RecurringTemplate> & {
  companyId: number;
  name: string;
  entryType: number;
  frequency: RecurringFrequency;
  templateLines: RecurringTemplateLine[];
  startDate: string;
}): RecurringTemplate {
  return {
    id: 0,
    dayOfMonth: 1,
    totalDebitFormula: '',
    totalCreditFormula: '',
    occurrencesGenerated: 0,
    nextGenerationDate: data.startDate,
    isActive: true,
    autoPost: false,
    createdAt: new Date(),
    ...data,
  };
}

export function generateNextDate(currentDate: string, frequency: RecurringFrequency, dayOfMonth: number): string {
  const d = new Date(currentDate);
  const totalMonths = d.getMonth() + frequency;
  const targetYear = d.getFullYear() + Math.floor(totalMonths / 12);
  const targetMonth = totalMonths % 12;
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(dayOfMonth, lastDay);
  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}

export function evaluateFormula(formula: string, params: Record<string, number>): number {
  const trimmed = formula.trim();
  if (!trimmed) return 0;

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*\*\s*\{(\w+)\}$/);
  if (match) {
    const multiplier = parseFloat(match[1]);
    const paramName = match[2];
    return Math.round(multiplier * (params[paramName] ?? 0));
  }

  const fixedMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (fixedMatch) {
    return Math.round(parseFloat(fixedMatch[1]));
  }

  const paramMatch = trimmed.match(/^\{(\w+)\}$/);
  if (paramMatch) {
    return params[paramMatch[1]] ?? 0;
  }

  if (trimmed.includes('+')) {
    return trimmed.split('+').reduce((sum, part) => sum + evaluateFormula(part.trim(), params), 0);
  }

  return 0;
}
