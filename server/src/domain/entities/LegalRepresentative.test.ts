import { describe, it, expect } from 'vitest';
import { LegalRepresentative, createLegalRepresentative } from './LegalRepresentative.js';

describe('LegalRepresentative', () => {
  it('creates with required fields', () => {
    const lr = createLegalRepresentative({
      companyId: 'c1',
      fullName: 'Nguyễn Văn A',
      position: 'Giám đốc',
      isPrimary: true,
    });
    expect(lr.id).toBeDefined();
    expect(lr.fullName).toBe('Nguyễn Văn A');
    expect(lr.isPrimary).toBe(true);
    expect(lr.isActive).toBe(true);
  });

  it('has createdAt as Date', () => {
    const lr = createLegalRepresentative({
      companyId: 'c1', fullName: 'A', position: 'Director', isPrimary: false,
    });
    expect(lr.createdAt).toBeInstanceOf(Date);
  });

  it('accepts optional fields', () => {
    const lr = createLegalRepresentative({
      companyId: 'c1',
      fullName: 'Trần Thị B',
      position: 'Kế toán trưởng',
      isPrimary: false,
      vneidNumber: '001234567890',
      authorizationScope: 'Full representation',
      digitalCertSerial: 'CERT-001',
      digitalCertProvider: 'VNPT-CA',
      digitalCertExpiry: '2027-01-01',
      isActive: false,
    });
    expect(lr.vneidNumber).toBe('001234567890');
    expect(lr.digitalCertSerial).toBe('CERT-001');
    expect(lr.isActive).toBe(false);
  });
});
