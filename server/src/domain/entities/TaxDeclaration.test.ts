import { describe, it, expect } from 'vitest';
import { createTaxDeclaration } from './TaxDeclaration.js';
import { TaxType, DeclarationStatus, VatRate, InvoicePaymentMethod, VATMethod } from '../enums/TaxEnums.js';

describe('TaxDeclaration', () => {
  const base = {
    companyId: 1,
    taxType: TaxType.VAT,
    periodId: 1,
    year: 2026,
    month: 6,
    declarationType: 'monthly' as const,
    vatMethod: VATMethod.KhauTru,
  };

  it('creates VAT declaration with Draft status', () => {
    const d = createTaxDeclaration(base);
    expect(d.status).toBe(DeclarationStatus.Draft);
    expect(d.taxType).toBe(TaxType.VAT);
    expect(d.periodName).toBe('Tháng 6/2026');
  });

  it('computes output VAT', () => {
    const d = createTaxDeclaration({ ...base, lines: [
      { rate: VatRate.Ten, taxableAmount: 100_000_000, vatAmount: 10_000_000 },
      { rate: VatRate.Eight, taxableAmount: 50_000_000, vatAmount: 4_000_000 },
    ]});
    expect(d.totalOutputVat).toBe(14_000_000);
    expect(d.totalTaxableAmount).toBe(150_000_000);
  });

  it('computes input VAT deductible', () => {
    const d = createTaxDeclaration({ ...base, inputLines: [
      { rate: VatRate.Ten, taxableAmount: 30_000_000, vatAmount: 3_000_000 },
      { rate: VatRate.Five, taxableAmount: 20_000_000, vatAmount: 1_000_000 },
    ]});
    expect(d.totalInputVat).toBe(4_000_000);
  });

  it('computes net VAT payable (output - input)', () => {
    const d = createTaxDeclaration({ ...base, lines: [
      { rate: VatRate.Ten, taxableAmount: 100_000_000, vatAmount: 10_000_000 },
    ], inputLines: [
      { rate: VatRate.Ten, taxableAmount: 30_000_000, vatAmount: 3_000_000 },
    ]});
    expect(d.netVatPayable).toBe(7_000_000);
  });

  it('handles CIT declaration', () => {
    const d = createTaxDeclaration({ ...base, taxType: TaxType.CIT, revenue: 1_000_000_000, expenses: 700_000_000 });
    expect(d.taxType).toBe(TaxType.CIT);
    expect(d.netIncome).toBe(300_000_000);
    expect(d.citPayable).toBe(60_000_000); // 20% rate
  });

  it('handles PIT declaration', () => {
    const d = createTaxDeclaration({ ...base, taxType: TaxType.PIT, totalIncome: 500_000_000, totalDeductions: 200_000_000, totalPitWithheld: 20_000_000 });
    expect(d.taxableIncome).toBe(300_000_000);
    expect(d.netPitPayable).toBe(10_000_000);
  });

  it('computes totals from invoice-based input', () => {
    const d = createTaxDeclaration({ ...base, invoices: [
      { date: '2026-06-01', number: 'INV001', sellerTaxCode: '123456789', rate: VatRate.Ten, taxableAmount: 50_000_000, vatAmount: 5_000_000, paymentMethod: InvoicePaymentMethod.BankTransfer },
      { date: '2026-06-15', number: 'INV002', sellerTaxCode: '987654321', rate: VatRate.Eight, taxableAmount: 20_000_000, vatAmount: 1_600_000, paymentMethod: InvoicePaymentMethod.Cash },
    ]});
    expect(d.invoices).toHaveLength(2);
    expect(d.totalInputVat).toBe(6_600_000);
    expect(d.totalTaxableAmount).toBe(70_000_000);
  });
});
