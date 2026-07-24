import { describe, it, expect } from 'vitest';
import {
  TaxType, DeclarationStatus, VATMethod, TaxPeriodType,
  VatRate, TaxPeriodStatus, InvoicePaymentMethod,
  getTaxTypeLabel, getDeclarationStatusLabel,
} from './TaxEnums.js';

describe('TaxEnums', () => {
  it('TaxType has all expected values', () => {
    expect(TaxType.VAT).toBe(1);
    expect(TaxType.CIT).toBe(2);
    expect(TaxType.PIT).toBe(3);
    expect(TaxType.License).toBe(4);
    expect(TaxType.SCT).toBe(5);
    expect(TaxType.Resource).toBe(6);
    expect(TaxType.Environmental).toBe(7);
  });

  it('DeclarationStatus has correct transitions', () => {
    expect(DeclarationStatus.Draft).toBe(0);
    expect(DeclarationStatus.Computed).toBe(1);
    expect(DeclarationStatus.Reviewed).toBe(2);
    expect(DeclarationStatus.Signed).toBe(3);
    expect(DeclarationStatus.Submitted).toBe(4);
    expect(DeclarationStatus.Adjusted).toBe(5);
    expect(DeclarationStatus.SubmissionFailed).toBe(6);
  });

  it('VATMethod has khau_tru and truc_tiep', () => {
    expect(VATMethod.KhauTru).toBe('khau_tru');
    expect(VATMethod.TrucTiep).toBe('truc_tiep');
    expect(VATMethod.TrucTiepGTGT).toBe('truc_tiep_gtgt');
  });

  it('VatRate enum has standard rates', () => {
    expect(VatRate.Zero).toBe(0);
    expect(VatRate.Five).toBe(5);
    expect(VatRate.Eight).toBe(8);
    expect(VatRate.Ten).toBe(10);
  });

  it('getTaxTypeLabel returns Vietnamese labels', () => {
    expect(getTaxTypeLabel(TaxType.VAT)).toBe('Thuế GTGT');
    expect(getTaxTypeLabel(TaxType.CIT)).toBe('Thuế TNDN');
    expect(getTaxTypeLabel(TaxType.PIT)).toBe('Thuế TNCN');
    expect(getTaxTypeLabel(TaxType.License)).toBe('Thuế môn bài');
  });

  it('getDeclarationStatusLabel returns Vietnamese labels', () => {
    expect(getDeclarationStatusLabel(DeclarationStatus.Draft)).toBe('Nháp');
    expect(getDeclarationStatusLabel(DeclarationStatus.Computed)).toBe('Đã tính');
    expect(getDeclarationStatusLabel(DeclarationStatus.Submitted)).toBe('Đã nộp');
    expect(getDeclarationStatusLabel(DeclarationStatus.SubmissionFailed)).toBe('Nộp thất bại');
  });
});
