import { TaxType, DeclarationStatus, VatRate, InvoicePaymentMethod, VATMethod } from '../enums/TaxEnums.js';

export interface VatLine {
  rate: VatRate;
  taxableAmount: number;
  vatAmount: number;
}

export interface InvoiceLine {
  date: string;
  number: string;
  sellerTaxCode: string;
  rate: VatRate;
  taxableAmount: number;
  vatAmount: number;
  paymentMethod: InvoicePaymentMethod;
}

export interface TaxDeclarationInput {
  companyId: number;
  taxType: TaxType;
  periodId: number;
  year: number;
  month?: number;
  quarter?: number;
  declarationType: string;
  vatMethod: VATMethod;
  lines?: VatLine[];
  inputLines?: VatLine[];
  invoices?: InvoiceLine[];
  revenue?: number;
  expenses?: number;
  totalIncome?: number;
  totalDeductions?: number;
  totalPitWithheld?: number;
  citRate?: number;
}

export interface TaxDeclaration {
  id: number;
  companyId: number;
  taxType: TaxType;
  periodId: number;
  year: number;
  month?: number;
  quarter?: number;
  declarationType: string;
  periodName: string;
  vatMethod: VATMethod;
  status: DeclarationStatus;
  lines: VatLine[];
  inputLines: VatLine[];
  invoices: InvoiceLine[];
  totalOutputVat: number;
  totalInputVat: number;
  totalTaxableAmount: number;
  netVatPayable: number;
  revenue?: number;
  expenses?: number;
  netIncome?: number;
  citPayable?: number;
  totalIncome?: number;
  totalDeductions?: number;
  taxableIncome?: number;
  totalPitWithheld?: number;
  netPitPayable?: number;
  citRate: number;
  createdAt: Date;
  submittedAt?: string;
  adjustedDeclarationId?: number;
}

export function createTaxDeclaration(data: TaxDeclarationInput): TaxDeclaration {
  const periodName = data.declarationType === 'yearly'
    ? `Năm ${data.year}`
    : data.declarationType === 'quarterly'
      ? `Quý ${data.quarter}/${data.year}`
      : `Tháng ${data.month}/${data.year}`;

  const lines = data.lines ?? [];
  const inputLines = data.inputLines ?? [];
  const invoices = data.invoices ?? [];

  const totalOutputVat = lines.reduce((s, l) => s + l.vatAmount, 0);
  const totalInputVat = [...inputLines, ...invoices.map(i => ({ vatAmount: i.vatAmount } as VatLine))].reduce((s, l) => s + l.vatAmount, 0);

  const fromLines = lines.reduce((s, l) => s + l.taxableAmount, 0);
  const fromInput = inputLines.reduce((s, l) => s + l.taxableAmount, 0);
  const fromInvoices = invoices.reduce((s, l) => s + l.taxableAmount, 0);
  const totalTaxableAmount = fromLines + fromInput + fromInvoices;

  const netVatPayable = Math.max(0, totalOutputVat - totalInputVat);

  const netIncome = data.revenue !== undefined && data.expenses !== undefined
    ? data.revenue - data.expenses
    : undefined;
  const citRate = data.citRate ?? 20;
  const citPayable = netIncome !== undefined
    ? Math.max(0, netIncome * citRate / 100)
    : undefined;

  const taxableIncome = data.totalIncome !== undefined && data.totalDeductions !== undefined
    ? data.totalIncome - data.totalDeductions
    : undefined;
  const totalPitWithheld = data.totalPitWithheld ?? 0;
  const netPitPayable = taxableIncome !== undefined
    ? Math.max(0, taxableIncome * 0.1 - totalPitWithheld)
    : undefined;

  return {
    id: 0,
    status: DeclarationStatus.Draft,
    lines,
    inputLines,
    invoices,
    totalOutputVat,
    totalInputVat,
    totalTaxableAmount,
    netVatPayable,
    netIncome,
    citRate,
    citPayable,
    taxableIncome,
    netPitPayable,
    periodName,
    companyId: data.companyId,
    taxType: data.taxType,
    periodId: data.periodId,
    year: data.year,
    month: data.month,
    quarter: data.quarter,
    declarationType: data.declarationType,
    vatMethod: data.vatMethod,
    revenue: data.revenue,
    expenses: data.expenses,
    totalIncome: data.totalIncome,
    totalDeductions: data.totalDeductions,
    totalPitWithheld,
    createdAt: new Date(),
  };
}
