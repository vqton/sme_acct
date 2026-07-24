import type { VatRate } from '../domain/enums/TaxEnums.js';

export interface VatInputLine {
  rate: VatRate;
  taxableAmount: number;
}

export interface VatOutputLine {
  rate: VatRate;
  taxableAmount: number;
  vatAmount: number;
}

export interface VatResultKhauTru {
  outputLines: VatOutputLine[];
  outputVat: number;
  inputVat: number;
  vatPayable: number;
  creditCarryForward: number;
}

export interface VatResultTrucTiep {
  revenue: number;
  expenses: number;
  rate: number;
  vatAmount: number;
}

export interface VatResultTrucTiepGTGT {
  revenue: number;
  sector: string;
  rate: number;
  vatAmount: number;
}

export interface CitResult {
  revenue: number;
  expenses: number;
  netIncome: number;
  citRate: number;
  citPayable: number;
  provisionalCIT?: number;
  finalizationCIT?: number;
}

export interface PitResult {
  income: number;
  category: string;
  rate: number;
  taxPayable: number;
}

export interface SctResult {
  taxablePrice: number;
  sctRate: number;
  sctPayable: number;
  exciseDeductible: number;
}

export interface ResourceTaxResult {
  output: number;
  taxPrice: number;
  taxRate: number;
  taxPayable: number;
}

export interface EnvironmentalTaxResult {
  lines: Array<{ product: string; units: number; ratePerUnit: number; taxAmount: number }>;
  totalPayable: number;
}

const VAT_RATES: Record<VatRate, number> = {
  0: 0,
  5: 5,
  8: 8,
  10: 10,
};

const TRUC_TIEP_GTGT_RATES: Record<string, number> = {
  trading: 1,
  services: 5,
  manufacturing: 2,
  construction: 3,
  transport: 3,
  'food-beverage': 3,
  other: 2,
};

const PIT_RATES: Record<string, number> = {
  investment: 0.1,
  royalties: 10,
  rental: 5,
  lottery: 10,
  franchise: 5,
};

const SCT_RATES: Record<string, number> = {
  cigarettes: 75,
  beer: 80,
  alcohol_high: 65,
  alcohol_low: 35,
  cars_small: 35,
  cars_medium: 50,
  cars_large: 60,
  cars_luxury: 150,
  air_conditioner: 10,
};

const RESOURCE_TAX_RATES: Record<string, number> = {
  crude_oil: 10,
  natural_gas: 5,
  coal: 7,
  metal_ore: 7,
  non_metal_ore: 5,
  forest: 5,
  aquatic: 2,
  natural_water: 5,
};

const ENVIRONMENTAL_TAX_RATES: Record<string, number> = {
  gasoline: 4_000,
  diesel: 2_000,
  kerosene: 1_000,
  fuel_oil: 2_000,
  lubricant: 2_000,
  coal: 30_000,
  plastic_bags: 50_000,
  herbicide: 500,
  pesticide: 500,
  refrigerant: 5_000,
};

function computeVatAmount(taxableAmount: number, rate: VatRate): number {
  return Math.round(taxableAmount * VAT_RATES[rate] / 100);
}

export class TaxEngine {
  static computeVatKhauTru(
    outputLines: VatInputLine[],
    inputLines: VatInputLine[],
  ): VatResultKhauTru {
    const outputDetails: VatOutputLine[] = outputLines.map(l => ({
      rate: l.rate,
      taxableAmount: l.taxableAmount,
      vatAmount: computeVatAmount(l.taxableAmount, l.rate),
    }));

    const outputVat = outputDetails.reduce((s, l) => s + l.vatAmount, 0);
    const inputVat = inputLines.reduce((s, l) => s + computeVatAmount(l.taxableAmount, l.rate), 0);

    const net = outputVat - inputVat;
    return {
      outputLines: outputDetails,
      outputVat,
      inputVat,
      vatPayable: Math.max(0, net),
      creditCarryForward: Math.max(0, -net),
    };
  }

  static computeVatTrucTiep(revenue: number, expenses: number, rate: number): VatResultTrucTiep {
    const vatAmount = Math.max(0, Math.round((revenue - expenses) * rate / 100));
    return { revenue, expenses, rate, vatAmount };
  }

  static computeVatTrucTiepGTGT(revenue: number, sector: string): VatResultTrucTiepGTGT {
    const rate = TRUC_TIEP_GTGT_RATES[sector] ?? 2;
    const vatAmount = Math.round(revenue * rate / 100);
    return { revenue, sector, rate, vatAmount };
  }

  static computeCit(
    revenue: number,
    expenses: number,
    citRate = 20,
    provisionalPaid = 0,
  ): CitResult {
    const netIncome = revenue - expenses;
    const citPayable = Math.max(0, Math.round(netIncome * citRate / 100));
    return {
      revenue,
      expenses,
      netIncome,
      citRate,
      citPayable,
      provisionalCIT: provisionalPaid > 0 ? provisionalPaid : undefined,
      finalizationCIT: citPayable - provisionalPaid > 0 ? citPayable - provisionalPaid : 0,
    };
  }

  static computePit(income: number, category: string): PitResult {
    const rate = PIT_RATES[category] ?? 10;
    const taxPayable = Math.round(income * rate / 100);
    return { income, category, rate, taxPayable };
  }

  /**
   * SCT = taxablePrice / (1 + rate) × rate
   * For domestic goods: taxablePrice = selling price (ex-VAT)
   * For imported: taxablePrice = import price + import duty
   */
  static computeSct(taxablePrice: number, productCategory: string, exciseDeductible = 0): SctResult {
    const sctRate = SCT_RATES[productCategory] ?? 10;
    const exclusivePrice = Math.round(taxablePrice / (1 + sctRate / 100));
    const sctPayable = Math.round(exclusivePrice * sctRate / 100);
    return {
      taxablePrice,
      sctRate,
      sctPayable,
      exciseDeductible,
    };
  }

  /**
   * Resource tax = output × taxPrice × taxRate / 100
   */
  static computeResourceTax(output: number, taxPrice: number, resourceType: string): ResourceTaxResult {
    const taxRate = RESOURCE_TAX_RATES[resourceType] ?? 5;
    const taxPayable = Math.round(output * taxPrice * taxRate / 100);
    return { output, taxPrice, taxRate, taxPayable };
  }

  /**
   * Environmental tax = sum(units × ratePerUnit)
   */
  static computeEnvironmentalTax(
    lines: Array<{ product: string; units: number }>,
  ): EnvironmentalTaxResult {
    const computed = lines.map(l => {
      const ratePerUnit = ENVIRONMENTAL_TAX_RATES[l.product] ?? 0;
      return { product: l.product, units: l.units, ratePerUnit, taxAmount: Math.round(l.units * ratePerUnit) };
    });
    return { lines: computed, totalPayable: computed.reduce((s, l) => s + l.taxAmount, 0) };
  }
}
