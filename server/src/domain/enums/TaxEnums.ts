export enum TaxType {
  VAT = 1,
  CIT = 2,
  PIT = 3,
  License = 4,
  SCT = 5,
  Resource = 6,
  Environmental = 7,
}

export enum DeclarationStatus {
  Draft = 0,
  Computed = 1,
  Reviewed = 2,
  Signed = 3,
  Submitted = 4,
  Adjusted = 5,
  SubmissionFailed = 6,
}

export enum VATMethod {
  KhauTru = 'khau_tru',
  TrucTiep = 'truc_tiep',
  TrucTiepGTGT = 'truc_tiep_gtgt',
}

export enum TaxPeriodType {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

export enum TaxPeriodStatus {
  Open = 'open',
  Locked = 'locked',
  Finalized = 'finalized',
  Amended = 'amended',
}

export enum VatRate {
  Zero = 0,
  Five = 5,
  Eight = 8,
  Ten = 10,
}

export enum InvoicePaymentMethod {
  Cash = 'cash',
  BankTransfer = 'bank_transfer',
  CreditCard = 'credit_card',
  Other = 'other',
}

export function getTaxTypeLabel(t: TaxType): string {
  const labels: Record<TaxType, string> = {
    [TaxType.VAT]: 'Thuế GTGT',
    [TaxType.CIT]: 'Thuế TNDN',
    [TaxType.PIT]: 'Thuế TNCN',
    [TaxType.License]: 'Thuế môn bài',
    [TaxType.SCT]: 'Thuế TTĐB',
    [TaxType.Resource]: 'Thuế tài nguyên',
    [TaxType.Environmental]: 'Thuế bảo vệ môi trường',
  };
  return labels[t];
}

export function getDeclarationStatusLabel(s: DeclarationStatus): string {
  const labels: Record<DeclarationStatus, string> = {
    [DeclarationStatus.Draft]: 'Nháp',
    [DeclarationStatus.Computed]: 'Đã tính',
    [DeclarationStatus.Reviewed]: 'Đã rà soát',
    [DeclarationStatus.Signed]: 'Đã ký',
    [DeclarationStatus.Submitted]: 'Đã nộp',
    [DeclarationStatus.Adjusted]: 'Đã điều chỉnh',
    [DeclarationStatus.SubmissionFailed]: 'Nộp thất bại',
  };
  return labels[s];
}
