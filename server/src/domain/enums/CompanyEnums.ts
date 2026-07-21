export enum CompanyType {
  CongTyTNHH1TV = 1,
  CongTyTNHH2TV = 2,
  CongTyCoPhan = 3,
  DoanhNghiepTuNhan = 4,
  CongTyHopDanh = 5,
  DoanhNghiepCoVonDauTuNN = 6,
  HopTacXa = 7,
  VanPhongLuatSu = 8,
  ChiNhanh = 9,
  VanPhongDaiDien = 10,
  HoKinhDoanh = 11,
  Other = 99,
}

export enum AccountingRegime {
  TT99 = 1,
  TT133 = 2,
}

export enum TaxCalculationMethod {
  KhauTru = 1,
  TrucTiep = 2,
  TrucTiepTrenDoanhThu = 3,
  HonHop = 4,
}

export enum InventoryMethod {
  FIFO = 1,
  BinhQuanGiaQuyen = 2,
  ThucTeDichDanh = 3,
  NhapTruocXuatSau = 4,
}

export enum RoundingMethod {
  RoundHalfUp = 1,
  RoundDown = 2,
  RoundUp = 3,
}

export enum ExchangeRateSource {
  StateBank = 1,
  CommercialBank = 2,
  Interbank = 3,
}

export enum BranchType {
  Branch = 1,
  RepresentativeOffice = 2,
  BusinessLocation = 3,
}

export enum BranchStatus {
  Active = 1,
  Suspended = 2,
  Closed = 3,
}

export enum ContributorType {
  Individual = 1,
  Organization = 2,
}

export enum ContributorCategory {
  Member = 1,
  Shareholder = 2,
  CapitalContributingMember = 3,
}

export enum DocumentType {
  BusinessRegCert = 1,
  TaxRegCert = 2,
  BankCert = 3,
  AuditReport = 4,
  Other = 99,
}

export enum LicenseType {
  BusinessRegCert = 1,
  TaxRegCert = 2,
  SealRegCert = 3,
  SubLicense = 4,
  Other = 99,
}

export enum VNeIDStatus {
  NotRegistered = 1,
  Registered = 2,
  Verified = 3,
  Revoked = 4,
}

export enum AuditAssignmentStatus {
  Assigned = 1,
  InProgress = 2,
  Completed = 3,
  Terminated = 4,
}

export function getCompanyTypeLabel(t: CompanyType): string {
  const labels: Record<CompanyType, string> = {
    [CompanyType.CongTyTNHH1TV]: 'Công ty TNHH một thành viên',
    [CompanyType.CongTyTNHH2TV]: 'Công ty TNHH hai thành viên trở lên',
    [CompanyType.CongTyCoPhan]: 'Công ty cổ phần',
    [CompanyType.DoanhNghiepTuNhan]: 'Doanh nghiệp tư nhân',
    [CompanyType.CongTyHopDanh]: 'Công ty hợp danh',
    [CompanyType.DoanhNghiepCoVonDauTuNN]: 'Doanh nghiệp có vốn đầu tư nước ngoài',
    [CompanyType.HopTacXa]: 'Hợp tác xã',
    [CompanyType.VanPhongLuatSu]: 'Văn phòng luật sư',
    [CompanyType.ChiNhanh]: 'Chi nhánh',
    [CompanyType.VanPhongDaiDien]: 'Văn phòng đại diện',
    [CompanyType.HoKinhDoanh]: 'Hộ kinh doanh',
    [CompanyType.Other]: 'Khác',
  };
  return labels[t];
}

export function getAccountingRegimeLabel(r: AccountingRegime): string {
  return r === AccountingRegime.TT99 ? 'TT 99/2025/TT-BTC' : 'TT 133/2016/TT-BTC';
}

export function getTaxCalculationMethodLabel(m: TaxCalculationMethod): string {
  const labels: Record<TaxCalculationMethod, string> = {
    [TaxCalculationMethod.KhauTru]: 'Phương pháp khấu trừ',
    [TaxCalculationMethod.TrucTiep]: 'Phương pháp trực tiếp trên GTGT',
    [TaxCalculationMethod.TrucTiepTrenDoanhThu]: 'Phương pháp trực tiếp trên doanh thu',
    [TaxCalculationMethod.HonHop]: 'Kết hợp cả khấu trừ và trực tiếp',
  };
  return labels[m];
}

export function getInventoryMethodLabel(m: InventoryMethod): string {
  const labels: Record<InventoryMethod, string> = {
    [InventoryMethod.FIFO]: 'Nhập trước xuất trước (FIFO)',
    [InventoryMethod.BinhQuanGiaQuyen]: 'Bình quân gia quyền',
    [InventoryMethod.ThucTeDichDanh]: 'Thực tế đích danh',
    [InventoryMethod.NhapTruocXuatSau]: 'Nhập trước xuất sau (LIFO)',
  };
  return labels[m];
}

export function getRoundingMethodLabel(m: RoundingMethod): string {
  const labels: Record<RoundingMethod, string> = {
    [RoundingMethod.RoundHalfUp]: 'Làm tròn 0.5 lên',
    [RoundingMethod.RoundDown]: 'Làm tròn xuống',
    [RoundingMethod.RoundUp]: 'Làm tròn lên',
  };
  return labels[m];
}

export function getBranchTypeLabel(t: BranchType): string {
  const labels: Record<BranchType, string> = {
    [BranchType.Branch]: 'Chi nhánh',
    [BranchType.RepresentativeOffice]: 'Văn phòng đại diện',
    [BranchType.BusinessLocation]: 'Địa điểm kinh doanh',
  };
  return labels[t];
}

export function getContributorCategoryLabel(c: ContributorCategory): string {
  const labels: Record<ContributorCategory, string> = {
    [ContributorCategory.Member]: 'Thành viên',
    [ContributorCategory.Shareholder]: 'Cổ đông',
    [ContributorCategory.CapitalContributingMember]: 'Thành viên góp vốn',
  };
  return labels[c];
}

export const COMPANY_TYPE_MIN_CONTRIBUTORS: Record<CompanyType, { min: number; max: number }> = {
  [CompanyType.CongTyTNHH1TV]: { min: 1, max: 1 },
  [CompanyType.CongTyTNHH2TV]: { min: 2, max: 50 },
  [CompanyType.CongTyCoPhan]: { min: 3, max: 999 },
  [CompanyType.DoanhNghiepTuNhan]: { min: 1, max: 1 },
  [CompanyType.CongTyHopDanh]: { min: 2, max: 100 },
  [CompanyType.DoanhNghiepCoVonDauTuNN]: { min: 1, max: 999 },
  [CompanyType.HopTacXa]: { min: 7, max: 999 },
  [CompanyType.VanPhongLuatSu]: { min: 2, max: 100 },
  [CompanyType.ChiNhanh]: { min: 1, max: 1 },
  [CompanyType.VanPhongDaiDien]: { min: 1, max: 1 },
  [CompanyType.HoKinhDoanh]: { min: 1, max: 1 },
  [CompanyType.Other]: { min: 1, max: 999 },
};
