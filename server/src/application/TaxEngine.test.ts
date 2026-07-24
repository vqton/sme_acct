import { describe, it, expect } from 'vitest';
import { TaxEngine } from './TaxEngine.js';
import { VATMethod, VatRate, TaxType } from '../domain/enums/TaxEnums.js';

describe('TaxEngine', () => {
  describe('computeVatKhauTru', () => {
    it('computes VAT payable = output - input', () => {
      const result = TaxEngine.computeVatKhauTru([
        { rate: VatRate.Ten, taxableAmount: 100_000_000 },
        { rate: VatRate.Eight, taxableAmount: 50_000_000 },
      ], [
        { rate: VatRate.Ten, taxableAmount: 30_000_000 },
      ]);
      expect(result.outputVat).toBe(14_000_000); // 10M + 4M
      expect(result.inputVat).toBe(3_000_000);
      expect(result.vatPayable).toBe(11_000_000);
    });

    it('returns 0 when input VAT exceeds output VAT', () => {
      const result = TaxEngine.computeVatKhauTru([
        { rate: VatRate.Ten, taxableAmount: 10_000_000 },
      ], [
        { rate: VatRate.Ten, taxableAmount: 50_000_000 },
      ]);
      expect(result.outputVat).toBe(1_000_000);
      expect(result.inputVat).toBe(5_000_000);
      expect(result.vatPayable).toBe(0);
      expect(result.creditCarryForward).toBe(4_000_000);
    });

    it('handles multiple input rates', () => {
      const result = TaxEngine.computeVatKhauTru([
        { rate: VatRate.Ten, taxableAmount: 200_000_000 },
      ], [
        { rate: VatRate.Ten, taxableAmount: 30_000_000 },
        { rate: VatRate.Five, taxableAmount: 10_000_000 },
        { rate: VatRate.Eight, taxableAmount: 20_000_000 },
      ]);
      expect(result.outputVat).toBe(20_000_000);
      expect(result.inputVat).toBe(3_000_000 + 500_000 + 1_600_000);
      expect(result.vatPayable).toBe(20_000_000 - 5_100_000);
    });

    it('handles zero rate', () => {
      const result = TaxEngine.computeVatKhauTru([
        { rate: VatRate.Zero, taxableAmount: 500_000_000 },
      ], []);
      expect(result.outputVat).toBe(0);
      expect(result.vatPayable).toBe(0);
    });
  });

  describe('computeVatTrucTiep', () => {
    it('computes VAT directly as (revenue - expenses) * rate', () => {
      const result = TaxEngine.computeVatTrucTiep(1_000_000_000, 700_000_000, 10);
      expect(result.vatAmount).toBe(30_000_000);
    });

    it('handles zero expenses', () => {
      const result = TaxEngine.computeVatTrucTiep(500_000_000, 0, 5);
      expect(result.vatAmount).toBe(25_000_000);
    });

    it('returns 0 when expenses > revenue', () => {
      const result = TaxEngine.computeVatTrucTiep(100_000_000, 200_000_000, 5);
      expect(result.vatAmount).toBe(0);
    });
  });

  describe('computeVatTrucTiepGTGT', () => {
    it('computes VAT as revenue * 1% for trading', () => {
      const result = TaxEngine.computeVatTrucTiepGTGT(1_000_000_000, 'trading');
      expect(result.vatAmount).toBe(10_000_000);
    });

    it('computes VAT as revenue * 5% for services', () => {
      const result = TaxEngine.computeVatTrucTiepGTGT(200_000_000, 'services');
      expect(result.vatAmount).toBe(10_000_000);
    });

    it('computes VAT as revenue * 2% for manufacturing', () => {
      const result = TaxEngine.computeVatTrucTiepGTGT(500_000_000, 'manufacturing');
      expect(result.vatAmount).toBe(10_000_000);
    });

    it('computes VAT as revenue * 3% for construction', () => {
      const result = TaxEngine.computeVatTrucTiepGTGT(300_000_000, 'construction');
      expect(result.vatAmount).toBe(9_000_000);
    });
  });

  describe('computeCit', () => {
    it('computes CIT at 20% standard rate', () => {
      const result = TaxEngine.computeCit(1_000_000_000, 600_000_000);
      expect(result.netIncome).toBe(400_000_000);
      expect(result.citPayable).toBe(80_000_000);
    });

    it('supports custom CIT rate', () => {
      const result = TaxEngine.computeCit(1_000_000_000, 600_000_000, 15);
      expect(result.citPayable).toBe(60_000_000);
    });

    it('handles loss (no CIT)', () => {
      const result = TaxEngine.computeCit(500_000_000, 700_000_000);
      expect(result.netIncome).toBe(-200_000_000);
      expect(result.citPayable).toBe(0);
    });

    it('handles adjusted provisional CIT', () => {
      const result = TaxEngine.computeCit(2_000_000_000, 1_500_000_000, 20, 80_000_000);
      expect(result.netIncome).toBe(500_000_000);
      expect(result.provisionalCIT).toBe(80_000_000);
      expect(result.finalizationCIT).toBe(20_000_000);
    });
  });

  describe('computePit', () => {
    it('computes PIT at 0.1% for income from investment', () => {
      const result = TaxEngine.computePit(100_000_000, 'investment');
      expect(result.taxPayable).toBe(100_000);
    });

    it('computes PIT at 10% for income from royalties', () => {
      const result = TaxEngine.computePit(50_000_000, 'royalties');
      expect(result.taxPayable).toBe(5_000_000);
    });

    it('handles rental income at 5%', () => {
      const result = TaxEngine.computePit(20_000_000, 'rental');
      expect(result.taxPayable).toBe(1_000_000);
    });
  });

  describe('computeSct', () => {
    it('computes SCT on domestic cigarettes', () => {
      const result = TaxEngine.computeSct(175_000_000, 'cigarettes');
      expect(result.sctRate).toBe(75);
      expect(result.sctPayable).toBe(75_000_000);
    });

    it('computes SCT on beer', () => {
      const result = TaxEngine.computeSct(180_000_000, 'beer');
      expect(result.sctPayable).toBe(80_000_000);
    });

    it('handles low-alcohol beverages', () => {
      const result = TaxEngine.computeSct(135_000_000, 'alcohol_low');
      expect(result.sctPayable).toBe(35_000_000);
    });
  });

  describe('computeResourceTax', () => {
    it('computes resource tax on coal', () => {
      const result = TaxEngine.computeResourceTax(10_000, 1_000_000, 'coal');
      expect(result.taxRate).toBe(7);
      expect(result.taxPayable).toBe(700_000_000);
    });

    it('computes resource tax on aquatic products', () => {
      const result = TaxEngine.computeResourceTax(5_000, 500_000, 'aquatic');
      expect(result.taxRate).toBe(2);
      expect(result.taxPayable).toBe(50_000_000);
    });
  });

  describe('computeEnvironmentalTax', () => {
    it('computes environmental tax on gasoline', () => {
      const result = TaxEngine.computeEnvironmentalTax([
        { product: 'gasoline', units: 10_000 },
      ]);
      expect(result.totalPayable).toBe(40_000_000);
    });

    it('computes environmental tax on multiple products', () => {
      const result = TaxEngine.computeEnvironmentalTax([
        { product: 'gasoline', units: 5_000 },
        { product: 'diesel', units: 3_000 },
        { product: 'plastic_bags', units: 100 },
      ]);
      expect(result.totalPayable).toBe(5_000 * 4_000 + 3_000 * 2_000 + 100 * 50_000);
    });

    it('handles unknown products as zero', () => {
      const result = TaxEngine.computeEnvironmentalTax([
        { product: 'unknown', units: 100 },
      ]);
      expect(result.totalPayable).toBe(0);
    });
  });
});
