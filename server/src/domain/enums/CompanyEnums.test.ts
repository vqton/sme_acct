import { describe, it, expect } from 'vitest';
import {
  CompanyType,
  AccountingRegime,
  TaxCalculationMethod,
  InventoryMethod,
  RoundingMethod,
  ExchangeRateSource,
  BranchType,
  BranchStatus,
  ContributorType,
  ContributorCategory,
  DocumentType,
  LicenseType,
  VNeIDStatus,
  AuditAssignmentStatus,
  getCompanyTypeLabel,
  getAccountingRegimeLabel,
  getTaxCalculationMethodLabel,
  getInventoryMethodLabel,
  getRoundingMethodLabel,
  getBranchTypeLabel,
  getContributorCategoryLabel,
  COMPANY_TYPE_MIN_CONTRIBUTORS,
} from './CompanyEnums.js';

describe('CompanyEnums', () => {
  describe('CompanyType', () => {
    it('has 12 values', () => {
      const vals = Object.values(CompanyType).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(12);
    });

    it('returns correct label for each type', () => {
      expect(getCompanyTypeLabel(CompanyType.CongTyTNHH1TV)).toBe('Công ty TNHH một thành viên');
      expect(getCompanyTypeLabel(CompanyType.CongTyCoPhan)).toBe('Công ty cổ phần');
      expect(getCompanyTypeLabel(CompanyType.DoanhNghiepTuNhan)).toBe('Doanh nghiệp tư nhân');
      expect(getCompanyTypeLabel(CompanyType.Other)).toBe('Khác');
    });
  });

  describe('AccountingRegime', () => {
    it('has TT99 and TT133', () => {
      expect(AccountingRegime.TT99).toBe(1);
      expect(AccountingRegime.TT133).toBe(2);
    });

    it('returns correct regime label', () => {
      expect(getAccountingRegimeLabel(AccountingRegime.TT99)).toContain('99');
      expect(getAccountingRegimeLabel(AccountingRegime.TT133)).toContain('133');
    });
  });

  describe('TaxCalculationMethod', () => {
    it('has all 4 methods', () => {
      const vals = Object.values(TaxCalculationMethod).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(4);
    });

    it('returns correct label for each method', () => {
      expect(getTaxCalculationMethodLabel(TaxCalculationMethod.KhauTru)).toBe('Phương pháp khấu trừ');
      expect(getTaxCalculationMethodLabel(TaxCalculationMethod.TrucTiep)).toBe('Phương pháp trực tiếp trên GTGT');
      expect(getTaxCalculationMethodLabel(TaxCalculationMethod.TrucTiepTrenDoanhThu)).toBe('Phương pháp trực tiếp trên doanh thu');
      expect(getTaxCalculationMethodLabel(TaxCalculationMethod.HonHop)).toBe('Kết hợp cả khấu trừ và trực tiếp');
    });
  });

  describe('InventoryMethod', () => {
    it('has all 4 methods', () => {
      const vals = Object.values(InventoryMethod).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(4);
    });
  });

  describe('RoundingMethod', () => {
    it('has 3 values', () => {
      const vals = Object.values(RoundingMethod).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(3);
    });
  });

  describe('ExchangeRateSource', () => {
    it('has 3 sources', () => {
      const vals = Object.values(ExchangeRateSource).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(3);
    });
  });

  describe('BranchType', () => {
    it('has 3 types', () => {
      const vals = Object.values(BranchType).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(3);
    });

    it('returns correct branch type label', () => {
      expect(getBranchTypeLabel(BranchType.Branch)).toBe('Chi nhánh');
      expect(getBranchTypeLabel(BranchType.RepresentativeOffice)).toBe('Văn phòng đại diện');
    });
  });

  describe('BranchStatus', () => {
    it('has 3 statuses', () => {
      const vals = Object.values(BranchStatus).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(3);
    });
  });

  describe('ContributorType', () => {
    it('has individual and organization', () => {
      expect(ContributorType.Individual).toBe(1);
      expect(ContributorType.Organization).toBe(2);
    });
  });

  describe('ContributorCategory', () => {
    it('has member, shareholder, capitalContributingMember', () => {
      const vals = Object.values(ContributorCategory).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(3);
    });

    it('returns correct label', () => {
      expect(getContributorCategoryLabel(ContributorCategory.Shareholder)).toBe('Cổ đông');
    });
  });

  describe('DocumentType', () => {
    it('has 5 types', () => {
      const vals = Object.values(DocumentType).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(5);
    });
  });

  describe('LicenseType', () => {
    it('has 5 types', () => {
      const vals = Object.values(LicenseType).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(5);
    });
  });

  describe('VNeIDStatus', () => {
    it('has 4 statuses', () => {
      const vals = Object.values(VNeIDStatus).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(4);
    });
  });

  describe('AuditAssignmentStatus', () => {
    it('has 4 statuses', () => {
      const vals = Object.values(AuditAssignmentStatus).filter((v) => typeof v === 'number');
      expect(vals).toHaveLength(4);
    });
  });

  describe('COMPANY_TYPE_MIN_CONTRIBUTORS', () => {
    it('DNTN has max 1 contributor', () => {
      expect(COMPANY_TYPE_MIN_CONTRIBUTORS[CompanyType.DoanhNghiepTuNhan].max).toBe(1);
    });

    it('CTCP requires minimum 3', () => {
      expect(COMPANY_TYPE_MIN_CONTRIBUTORS[CompanyType.CongTyCoPhan].min).toBe(3);
    });

    it('TNHH1TV has exactly 1', () => {
      const c = COMPANY_TYPE_MIN_CONTRIBUTORS[CompanyType.CongTyTNHH1TV];
      expect(c.min).toBe(1);
      expect(c.max).toBe(1);
    });

    it('all CompanyTypes have entry', () => {
      const typeCount = Object.values(CompanyType).filter((v) => typeof v === 'number').length;
      expect(Object.keys(COMPANY_TYPE_MIN_CONTRIBUTORS)).toHaveLength(typeCount);
    });
  });
});
