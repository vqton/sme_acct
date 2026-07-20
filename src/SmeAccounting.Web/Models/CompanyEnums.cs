namespace SmeAccounting.Web.Models;

public enum CompanyType
{
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
    Other = 99
}

public enum CompanyStatus
{
    Active = 1,
    Suspended = 2,
    Dissolved = 3,
    Bankrupt = 4,
    Converting = 5,
    Merged = 6
}

public enum AccountingRegime
{
    TT99 = 1,
    TT133 = 2
}

public enum TaxCalculationMethod
{
    KhauTru = 1,
    TrucTiep = 2,
    TrucTiepTrenDoanhThu = 3,
    HonHop = 4
}

public enum InventoryMethod
{
    FIFO = 1,
    BinhQuanGiaQuyen = 2,
    ThucTeDichDanh = 3,
    NhapTruocXuatSau = 4
}

public enum RoundingMethod
{
    RoundHalfUp = 1,
    RoundDown = 2,
    RoundUp = 3
}

public enum ExchangeRateSource
{
    StateBank = 1,
    CommercialBank = 2,
    Interbank = 3
}

public enum CompanyLicenseType
{
    BusinessRegCert = 1,
    TaxRegCert = 2,
    SealRegCert = 3,
    SubLicense = 4,
    Other = 5
}

public enum DocumentType
{
    BusinessRegCert = 1,
    TaxRegCert = 2,
    BankCert = 3,
    AuditReport = 4,
    Other = 5
}

public enum ContributorType
{
    Individual = 1,
    Organization = 2
}

public enum BranchType
{
    Branch = 1,
    RepresentativeOffice = 2,
    BusinessLocation = 3
}

public enum VNeIDStatus
{
    NotRegistered = 1,
    Registered = 2,
    Verified = 3,
    Revoked = 4
}

public enum TenantIsolationLevel
{
    SharedDatabase = 1,
    DatabasePerTenant = 2
}

public enum AuditAssignmentStatus
{
    Assigned = 1,
    InProgress = 2,
    Completed = 3,
    Terminated = 4
}
