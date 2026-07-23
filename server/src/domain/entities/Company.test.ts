import { describe, it, expect } from 'vitest';
import { Company, CompanyStatus, createCompany, getStatusLabel } from './Company.js';
import { CompanyType } from '../enums/CompanyEnums.js';

describe('Company', () => {
  describe('createCompany', () => {
    it('creates with required name and status', () => {
      const c = createCompany({ name: 'Test Co', status: CompanyStatus.Active });
      expect(c.id).toBeDefined();
      expect(c.name).toBe('Test Co');
      expect(c.status).toBe(CompanyStatus.Active);
      expect(c.createdAt).toBeInstanceOf(Date);
    });

    it('includes optional fields when provided', () => {
      const c = createCompany({
        name: 'Test Co',
        status: CompanyStatus.Active,
        nameVietnamese: 'Công ty Thử nghiệm',
        nameEnglish: 'Test Company Ltd',
        companyType: CompanyType.CongTyTNHH1TV,
        taxCode: '0123456789',
        enterpriseCode: '2501234567',
      });
      expect(c.nameVietnamese).toBe('Công ty Thử nghiệm');
      expect(c.nameEnglish).toBe('Test Company Ltd');
      expect(c.companyType).toBe(CompanyType.CongTyTNHH1TV);
      expect(c.taxCode).toBe('0123456789');
      expect(c.enterpriseCode).toBe('2501234567');
    });

    it('sets id as placeholder for auto-increment', () => {
      const c1 = createCompany({ name: 'A', status: CompanyStatus.Active });
      const c2 = createCompany({ name: 'B', status: CompanyStatus.Active });
      expect(c1.id).toBe(0);
      expect(c2.id).toBe(0);
    });
  });

  describe('CompanyStatus', () => {
    it('has all 6 statuses', () => {
      expect(CompanyStatus.Active).toBe(1);
      expect(CompanyStatus.Suspended).toBe(2);
      expect(CompanyStatus.Dissolved).toBe(3);
      expect(CompanyStatus.Bankrupt).toBe(4);
      expect(CompanyStatus.Merged).toBe(5);
      expect(CompanyStatus.Converting).toBe(6);
    });
  });

  describe('getStatusLabel', () => {
    it('returns Vietnamese label for each status', () => {
      expect(getStatusLabel(CompanyStatus.Active)).toContain('hoạt động');
      expect(getStatusLabel(CompanyStatus.Suspended)).toContain('ngừng');
      expect(getStatusLabel(CompanyStatus.Dissolved)).toContain('giải thể');
      expect(getStatusLabel(CompanyStatus.Bankrupt)).toContain('Phá sản');
      expect(getStatusLabel(CompanyStatus.Merged)).toContain('sáp nhập');
      expect(getStatusLabel(CompanyStatus.Converting)).toContain('chuyển đổi');
    });
  });

  describe('Company interface shape', () => {
    it('accepts full company with all fields', () => {
      const c: Company = {
        id: 1,
        name: 'Full Co',
        nameVietnamese: 'Cty đầy đủ',
        nameEnglish: 'Full Co Ltd',
        abbreviatedName: 'FCL',
        taxCode: '0123456789',
        enterpriseCode: '2501234567',
        companyType: CompanyType.CongTyCoPhan,
        address: '123 Street',
        headOfficeAddress: '123 Main St',
        headOfficeProvinceCode: '01',
        headOfficeDistrictCode: '001',
        headOfficeWardCode: '00001',
        phone: '0909123456',
        email: 'info@fullco.com',
        website: 'https://fullco.com',
        logoUrl: 'https://cdn.fullco.com/logo.png',
        charterCapital: 10_000_000_000,
        paidInCapital: 8_000_000_000,
        dateOfEstablishment: '2024-01-15',
        dateOfOperationCommencement: '2024-02-01',
        status: CompanyStatus.Active,
        reasonForDissolution: undefined,
        taxOfficeId: 'TO-01',
        taxOfficeName: 'Cục Thuế TP HCM',
        taxDepartment: 'Phòng Tổng hợp',
        managedByTaxAuthorityCode: 'CT-HCM',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-06-01'),
        createdByUserId: 1,
        updatedByUserId: 2,
        firstPeriodStartDate: '2024-01-01',
        closedPeriodCount: 5,
      };
      expect(c.name).toBe('Full Co');
      expect(c.charterCapital).toBe(10_000_000_000);
      expect(c.closedPeriodCount).toBe(5);
    });
  });
});
