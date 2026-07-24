import type { TaxDeclarationRepository } from '../domain/repositories/TaxDeclarationRepository.js';
import type { TaxPeriodRepository } from '../domain/repositories/TaxPeriodRepository.js';
import type { TaxDeclaration } from '../domain/entities/TaxDeclaration.js';
import { TaxType, DeclarationStatus, VATMethod } from '../domain/enums/TaxEnums.js';
import { createTaxDeclaration } from '../domain/entities/TaxDeclaration.js';
import { TaxEngine, type VatInputLine } from './TaxEngine.js';

export interface VatDeclarationInput {
  outputLines: VatInputLine[];
  inputLines: VatInputLine[];
  invoices?: TaxDeclaration['invoices'];
  declarationType?: string;
}

export interface DeclarationCreateInput {
  companyId: number;
  periodId: number;
  taxType: TaxType;
  declarationType?: string;
}

export class TaxDeclarationService {
  constructor(
    private declRepo: TaxDeclarationRepository,
    private periodRepo: TaxPeriodRepository,
  ) {}

  createEmptyDeclaration(input: DeclarationCreateInput): TaxDeclaration {
    const period = this.periodRepo.findById(input.periodId);
    if (!period) throw new Error('Tax period not found');

    const d = createTaxDeclaration({
      companyId: input.companyId,
      taxType: input.taxType,
      periodId: input.periodId,
      year: period.year,
      month: period.month,
      quarter: period.quarter,
      declarationType: input.declarationType ?? period.type,
      vatMethod: period.vatMethod,
    });
    return this.declRepo.save(d);
  }

  createVatDeclaration(
    companyId: number,
    periodId: number,
    input: VatDeclarationInput,
  ): TaxDeclaration {
    const period = this.periodRepo.findById(periodId);
    if (!period) throw new Error('Tax period not found');

    const result = TaxEngine.computeVatKhauTru(input.outputLines, input.inputLines);

    const d = createTaxDeclaration({
      companyId,
      taxType: TaxType.VAT,
      periodId,
      year: period.year,
      month: period.month,
      quarter: period.quarter,
      declarationType: input.declarationType ?? period.type,
      vatMethod: period.vatMethod ?? VATMethod.KhauTru,
      lines: result.outputLines.map(l => ({ rate: l.rate, taxableAmount: l.taxableAmount, vatAmount: l.vatAmount })),
      inputLines: input.inputLines.map(l => ({ rate: l.rate, taxableAmount: l.taxableAmount, vatAmount: Math.round(l.taxableAmount * (l.rate) / 100) })),
      invoices: input.invoices,
    });
    return this.declRepo.save(d);
  }

  submitDeclaration(declarationId: number): TaxDeclaration {
    const d = this.declRepo.findById(declarationId);
    if (!d) throw new Error('Declaration not found');
    if (d.status !== DeclarationStatus.Draft) throw new Error('Cannot submit: declaration is not in Draft status');

    const updated = { ...d, status: DeclarationStatus.Submitted, submittedAt: new Date().toISOString() };
    return this.declRepo.save(updated);
  }

  createAdjustmentDeclaration(originalId: number, input: VatDeclarationInput): TaxDeclaration {
    const original = this.declRepo.findById(originalId);
    if (!original) throw new Error('Original declaration not found');

    const result = TaxEngine.computeVatKhauTru(input.outputLines, input.inputLines);

    const d = createTaxDeclaration({
      companyId: original.companyId,
      taxType: original.taxType,
      periodId: original.periodId,
      year: original.year,
      month: original.month,
      quarter: original.quarter,
      declarationType: original.declarationType,
      vatMethod: original.vatMethod,
      lines: result.outputLines.map(l => ({ rate: l.rate, taxableAmount: l.taxableAmount, vatAmount: l.vatAmount })),
      inputLines: input.inputLines.map(l => ({ rate: l.rate, taxableAmount: l.taxableAmount, vatAmount: Math.round(l.taxableAmount * (l.rate) / 100) })),
      invoices: input.invoices,
    });
    return this.declRepo.save({ ...d, adjustedDeclarationId: originalId });
  }

  getDeclaration(id: number): TaxDeclaration | null {
    return this.declRepo.findById(id);
  }

  getDeclarationsByPeriod(periodId: number): TaxDeclaration[] {
    return this.declRepo.findByPeriodId(periodId);
  }

  getDeclarationsByCompany(companyId: number): TaxDeclaration[] {
    return this.declRepo.findByCompanyId(companyId);
  }
}
