# BRD: Company Module — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-20
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft — Not PROD Ready

---

## 1. Executive Summary

SmeAccounting Company Module manages the enterprise master data — the legal entity aggregate that every transaction, tax filing, and report ties back to. It is the root of multi-tenancy and the source of truth for regulatory compliance (tax code, legal reps, charter capital, business lines).

### Verdict: NOT PROD-READY

Current implementation is a **skeleton**. It stores 12 fields on `Company`, 7 fields on `CompanySettings`, and a many-to-many `UserCompany` link. A Vietnamese SME accounting system requires **60+ fields** across **10+ related entities**.

### 5 Blocking Gaps (cannot legally operate without)

| # | Gap | Law Reference | Impact |
|---|---|---|---|
| BG-01 | No VNeID / National Digital Identity linkage | NĐ 69/2024/NĐ-CP (01/07/2025) | Cannot perform tax e-transactions — system is non-functional |
| BG-02 | No enterprise code (mã doanh nghiệp) field | Luật DN 2020 Điều 29, NĐ 168/2025 | Cannot identify company in state records |
| BG-03 | No charter capital (vốn điều lệ) + contributor tracking | Luật DN 2020 Điều 30, 34, 36 | Cannot verify capital structure — illegal for credit institutions |
| BG-04 | Single legal rep field (must support multiple per Luật DN) | Luật DN 2020 Điều 12, 13 | Single rep field violates law allowing multiple legal reps |
| BG-05 | No accounting regime (chế độ kế toán) selection | TT 99/2025/TT-BTC, TT 133/2016 | Cannot determine which chart of accounts, report templates, or rounding rules apply |

### 18 Major Gaps (blocking PROD, not legally fatal individually)

| # | Gap | Severity |
|---|---|---|
| MG-01 | No company type enum (tNHH, cT CP, DNTN, etc.) | High |
| MG-02 | No Vietnamese name + English name + abbreviated name | Medium |
| MG-03 | No former names history | Low |
| MG-04 | No date of establishment / commencement | Medium |
| MG-05 | No status lifecycle (active, suspended, dissolved, bankrupt) | High |
| MG-06 | No business lines with VSIC codes | Medium |
| MG-07 | No branch / representative office management | Medium |
| MG-08 | No bank accounts for tax payment | High |
| MG-09 | No tax authority assignment | Medium |
| MG-10 | No licenses & permits tracking | Low |
| MG-11 | No company seal (con dấu) image | Medium |
| MG-12 | No business registration certificate document store | Medium |
| MG-13 | No audit firm assignment | Low |
| MG-14 | No capital contributor / shareholder registry | High |
| MG-15 | No tax calculation method (khấu trừ vs trực tiếp) on settings | High |
| MG-16 | No inventory method enum validation | Medium |
| MG-17 | No decimal place rules per VAS 01 | Medium |
| MG-18 | No multi-currency default rate source (NHNN vs commercial bank) | Low |

### Effort Estimate

**8–12 weeks** for 1 senior backend + 1 frontend developer to reach PROD readiness, assuming:

- **Phase 1** (Weeks 1–4): Core data model expansion + blocking gaps
- **Phase 2** (Weeks 5–8): Branch management, bank accounts, document management
- **Phase 3** (Weeks 9–12): VNeID, audit firm assignment, migration scripts, reporting

---

## 2. Regulatory Compliance Index

| Document | Status | Key Company-Related Requirements | Current Compliance |
|---|---|---|---|
| Luật Doanh nghiệp 2020 (59/2020/QH14) | Active | Enterprise code, legal reps, charter capital, business lines, company seal, branches | **Partial** (name + tax code only) |
| NĐ 168/2025/NĐ-CP (Đăng ký doanh nghiệp) | Active, replaces NĐ 01/2021 | Registration certificate fields, VSIC codes, enterprise info disclosure | **Missing** |
| TT 99/2025/TT-BTC (Chế độ kế toán) | Active from 01/01/2026, replaces TT 200/2014 | Accounting regime selection, fiscal year, currency, rounding, inventory method, tax method | **Partial** (settings exist but missing regime + tax calc method) |
| TT 133/2016/TT-BTC (SME accounting) | Active (optional for SMEs) | Alternative accounting regime — fewer report templates, simpler chart of accounts | **Not supported** (no regime toggle) |
| NĐ 69/2024/NĐ-CP (Định danh điện tử) | Active | VNeID for tax transactions, organization digital identity | **Missing** |
| VAS 01 — Chuẩn mực chung | Active | Going concern, consistency, matching principle, decimal precision | **Partial** (decimal places on settings, no enforcement) |
| NĐ 23/2025/NĐ-CP (Chữ ký số) | Active | Digital signature for legal reps on tax filings | **Missing** |
| Luật Kế toán 88/2015/QH13 Điều 10, 11, 13 | Active (amended) | Accounting unit definition, fiscal year, currency, measurement | **Partial** |
| NĐ 174/2016/NĐ-CP Điều 4, 5 | Active | Accounting unit types, organization of accounting work | **Missing** |

---

## 3. Current State Analysis

### 3.1 Current Data Model

```
Company
├── Id (Guid)
├── Name (string, 400)
├── TaxCode (string?, 100) — unique index with filter
├── Address (string?, 500)
├── Phone (string?, 100)
├── Email (string?, 256)
├── Website (string?, 200)
├── LegalRepresentative (string?, 200) — SINGLE field, plain text
├── RepPosition (string?, 200) — plain text
├── LogoUrl (string?, 512)
├── IsActive (bool)
├── CreatedAt / UpdatedAt (DateTime)
│
└── CompanySettings (1:1)
    ├── FiscalYearStartMonth (int, 1–12)
    ├── CurrencyCode (string, default "VND")
    ├── DecimalPlaces (int, default 2)
    ├── InventoryMethod (string?)
    ├── TaxMethod (string?)
    ├── EnableMultiCurrency (bool)
    └── EnableDepartmentManagement (bool)

UserCompany (many-to-many link)
├── UserId (string)
├── CompanyId (Guid)
```

### 3.2 What Exists (Minimal Viability)

| Component | Status | Notes |
|---|---|---|
| Basic company info CRUD | ✅ Implemented | Name, TaxCode, Address, Phone, Email, Website |
| Settings CRUD | ✅ Implemented | Fiscal year, currency, decimals, inventory/tax method |
| Company-user association | ✅ Implemented | UserCompany join table |
| Admin controller | ✅ Implemented | CompanyController in Admin area |
| Unique tax code constraint | ✅ Implemented | Index with filter on TaxCode |
| Cascading relationships | ✅ Implemented | EF Core cascade deletes |

### 3.3 What Is Missing (Complete)

| Domain Area | Current State | Target State |
|---|---|---|
| Enterprise identity | Name + TaxCode only | Enterprise code, tax code, 3 name fields, former names, status lifecycle |
| Company type | Not tracked | Enum: 1TV, 2TV, cT CP, DNTN, cT HĐ, cT NH, HTX, văn phòng LS, etc. |
| Legal representatives | Single text field | 1..N with typed person reference, VNeID link, digital cert, authorization scope |
| Capital structure | Not tracked | Charter capital, paid-in capital, contributors with ratios, capital change history |
| Business lines | Not tracked | 1..N with VSIC code, primary flag, start/end date |
| Branches / RO | Not tracked | 1..N with address, tax code, headcount, status |
| Bank accounts | Not tracked | 1..N for tax payment, IBAN, swift, bank name, branch |
| Tax authority | Not tracked | Tax office (Cục Thuế / Chi cục Thuế), tax department |
| Fiscal settings | Partial | Missing: accounting regime (TT99/TT133), tax calc method (khấu trừ/trực tiếp), rounding method |
| Documents | Not tracked | Business registration certificate, seal registration, licenses |
| Company seal | Not tracked | Image, registration number, date |
| Audit firm | Not tracked | Auditor entity, assignment period, audit report references |
| Multi-tenant isolation | Partial | CompanyId on UserCompany but not applied globally |

---

## 4. Target Data Model (Conceptual)

### 4.1 Company Aggregate Root

```
Company (Aggregate Root)
│
├── Core Identity
│   ├── Id (Guid)
│   ├── EnterpriseCode (string, 15) — mã doanh nghiệp do Sở KHĐT cấp
│   ├── TaxCode (string, 15) — mã số thuế (unique, required)
│   ├── CompanyType (CompanyType enum)
│   ├── NameVietnamese (string, 400) — tên công ty bằng tiếng Việt
│   ├── NameEnglish (string?, 400) — tên công ty bằng tiếng Anh
│   ├── AbbreviatedName (string?, 100) — tên viết tắt
│   ├── FormerNames (List<FormerName>) — lịch sử tên cũ
│   ├── CharterCapital (decimal, 18,2) — vốn điều lệ
│   ├── PaidInCapital (decimal, 18,2) — vốn đã góp
│   ├── DateOfEstablishment (DateTime) — ngày thành lập
│   ├── DateOfOperationCommencement (DateTime?) — ngày bắt đầu hoạt động
│   ├── Status (CompanyStatus enum + timestamps)
│   └── ReasonForDissolution (string?) — lý do giải thể (if dissolved)
│
├── Contact & Address
│   ├── HeadOfficeAddress (string, 500) — trụ sở chính
│   ├── HeadOfficeProvinceId (string) — tỉnh/thành phố
│   ├── HeadOfficeDistrictId (string) — quận/huyện
│   ├── HeadOfficeWardId (string) — phường/xã
│   ├── Phone (string?, 100)
│   ├── Email (string?, 256)
│   ├── Website (string?, 200)
│   └── LogoUrl (string?, 512)
│
├── Legal Representatives (List<LegalRepresentative>)
│   ├── FullName (string, 200)
│   ├── VNeIDNumber (string, 12) — số định danh cá nhân
│   ├── Position (string, 200) — chức danh
│   ├── IsPrimary (bool) — người đại diện theo pháp luật chính
│   ├── AuthorizationScope (string?) — phạm vi đại diện
│   ├── DigitalCertSerial (string?) — serial chứng thư số
│   ├── DigitalCertProvider (string?) — nhà cung cấp chứng thư số
│   ├── DigitalCertExpiry (DateTime?)
│   ├── VNeIDVerifiedAt (DateTime?) — thời gian xác thực VNeID
│   └── IsActive (bool)
│
├── Business Lines (List<BusinessLine>)
│   ├── VsicCode (string, 10) — mã ngành VSIC cấp 4
│   ├── VsicLevel (int, 2-6) — cấp độ VSIC
│   ├── Name (string, 500) — tên ngành
│   ├── IsPrimary (bool) — ngành nghề kinh doanh chính
│   ├── StartDate (DateTime)
│   ├── EndDate (DateTime?)
│   └── LicenseReference (string?) — số giấy phép con (nếu có)
│
├── Capital Contributors (List<CapitalContributor>)
│   ├── ContributorType (ContributorType enum): Individual | Organization
│   ├── FullName / OrganizationName (string, 200)
│   ├── IdNumber / TaxCode (string, 15) — CMND/CCCD or MST
│   ├── ContributorType (enum: Member | Shareholder | CapitalContributingMember)
│   ├── CapitalContribution (decimal, 18,2) — số vốn góp
│   ├── OwnershipRatio (decimal, 5,2) — tỷ lệ sở hữu %
│   ├── ContributionDate (DateTime) — ngày góp vốn
│   ├── ContributionCertificate (string?) — số giấy chứng nhận góp vốn
│   └── IsFounder (bool) — sáng lập viên
│
├── Branches & Representative Offices (List<Branch>)
│   ├── BranchType (enum: Branch | RepresentativeOffice | BusinessLocation)
│   ├── Name (string, 400)
│   ├── Address (string, 500)
│   ├── TaxCode (string?, 15) — mã số thuế chi nhánh (riêng)
│   ├── Phone (string?, 100)
│   ├── ManagerName (string?, 200)
│   ├── Status (BranchStatus enum)
│   ├── DateOpened (DateTime)
│   └── DateClosed (DateTime?)
│
├── Bank Accounts (List<CompanyBankAccount>)
│   ├── AccountNumber (string, 50)
│   ├── AccountName (string, 200)
│   ├── BankName (string, 200)
│   ├── BankBranch (string?, 200)
│   ├── SwiftCode (string?, 20)
│   ├── CurrencyCode (string, 3) = "VND"
│   ├── IsPrimaryTaxPayment (bool) — tài khoản nộp thuế chính
│   ├── IsActive (bool)
│   └── OpenedDate (DateTime)
│
├── Tax Authority Assignment
│   ├── TaxOfficeId (string) — mã cơ quan thuế (Cục Thuế / Chi cục Thuế)
│   ├── TaxOfficeName (string, 200)
│   ├── TaxDepartment (string?) — đội/phòng thuế quản lý
│   └── ManagedByTaxAuthorityCode (string?) — mã cơ quan quản lý thuế
│
├── Company Settings (1:1)
│   ├── FiscalYearStartMonth (int, 1–12)
│   ├── CurrencyCode (string, 3, default "VND")
│   ├── DecimalPlaces (int, 0–6, default 0 per TT 99)
│   ├── RoundingMethod (enum: RoundHalfUp | RoundDown | RoundUp)
│   ├── AccountingRegime (enum: TT99 | TT133) — chế độ kế toán áp dụng
│   ├── TaxCalculationMethod (enum: KhauTru | TrucTiep | HonHop) — pp tính thuế
│   ├── InventoryMethod (enum: FIFO | LIFO | BinhQuanGiaQuyen | ThucTeDichDanh | NhapTruocXuatSau)
│   ├── TaxMethod (enum: TrucTiepGTGT | KhauTruGTGT) — pp tính thuế GTGT
│   ├── EnableMultiCurrency (bool)
│   ├── EnableDepartmentManagement (bool, default true)
│   ├── DefaultExchangeRateSource (enum: StateBank | CommercialBank | Interbank)
│   └── LastPeriodClosed (DateTime?) — kỳ kế toán đã khóa gần nhất
│
├── Licenses & Permits (List<CompanyLicense>)
│   ├── LicenseType (enum: BusinessRegCert | TaxRegCert | SealRegCert | SubLicense | Other)
│   ├── LicenseNumber (string, 100)
│   ├── IssuedBy (string, 200) — cơ quan cấp
│   ├── DateIssued (DateTime)
│   ├── DateExpiry (DateTime?)
│   ├── FileUrl (string?) — scanned document url
│   └── Notes (string?)
│
├── Company Seal (1:0..1)
│   ├── SealRegistrationNumber (string?, 50)
│   ├── SealImageUrl (string?)
│   ├── IssuedBy (string?, 200)
│   ├── DateRegistered (DateTime?)
│   └── Notes (string?)
│
├── Document Management (List<CompanyDocument>)
│   ├── DocumentType (enum: BusinessRegCert | TaxRegCert | BankCert | AuditReport | Other)
│   ├── FileName (string, 500)
│   ├── FileUrl (string, 1000)
│   ├── FileSize (long)
│   ├── ContentType (string, 100)
│   ├── ExpiryDate (DateTime?)
│   └── UploadedAt (DateTime)
│
├── Audit Firm Assignment (List<AuditAssignment>)
│   ├── AuditFirmName (string, 200)
│   ├── AuditFirmTaxCode (string?, 15)
│   ├── AuditFirmAddress (string?, 500)
│   ├── AssignmentYear (int)
│   ├── EngagementPartner (string?, 200)
│   ├── AuditStartDate (DateTime?)
│   ├── AuditEndDate (DateTime?)
│   ├── AuditReportReference (string?)
│   └── Status (enum: Assigned | InProgress | Completed | Terminated)
│
├── VNeID Registration
│   ├── VNeIDOrganizationId (string?) — mã tổ chức trên VNeID
│   ├── VNeIDRegistrationDate (DateTime?)
│   ├── VNeIDStatus (enum: NotRegistered | Registered | Verified | Revoked)
│   └── LastVNeIDSyncAt (DateTime?)
│
└── Lifecycle
    ├── CreatedAt (DateTime)
    ├── UpdatedAt (DateTime?)
    ├── CreatedByUserId (string)
    ├── UpdatedByUserId (string?)
    ├── FirstPeriodStartDate (DateTime?) — kỳ kế toán đầu tiên
    └── ClosedPeriodCount (int) — số kỳ đã khóa
```

### 4.2 Enumerations

```csharp
public enum CompanyType
{
    CongTyTNHH1TV = 1,        // Công ty TNHH một thành viên
    CongTyTNHH2TV = 2,        // Công ty TNHH hai thành viên trở lên
    CongTyCoPhan = 3,         // Công ty cổ phần
    DoanhNghiepTuNhan = 4,    // Doanh nghiệp tư nhân
    CongTyHopDanh = 5,        // Công ty hợp danh
    DoanhNghiepCoVonDauTuNN = 6, // Doanh nghiệp có vốn đầu tư nước ngoài
    HopTacXa = 7,             // Hợp tác xã
    VanPhongLuatSu = 8,       // Văn phòng luật sư
    ChiNhanh = 9,             // Chi nhánh
    VanPhongDaiDien = 10,     // Văn phòng đại diện
    HoKinhDoanh = 11,         // Hộ kinh doanh
    Other = 99
}

public enum CompanyStatus
{
    Active = 1,           // Đang hoạt động
    Suspended = 2,        // Tạm ngừng hoạt động
    Dissolved = 3,        // Giải thể
    Bankrupt = 4,         // Phá sản
    Converting = 5,       // Đang chuyển đổi loại hình
    Merged = 6,           // Sáp nhập
}

public enum AccountingRegime
{
    TT99 = 1,    // TT 99/2025/TT-BTC (replaces TT 200/2014) — enterprise accounting
    TT133 = 2,   // TT 133/2016/TT-BTC — SME accounting (simplified)
}

public enum TaxCalculationMethod
{
    KhauTru = 1,              // Phương pháp khấu trừ
    TrucTiep = 2,             // Phương pháp trực tiếp trên GTGT
    TrucTiepTrenDoanhThu = 3, // Phương pháp trực tiếp trên doanh thu
    HonHop = 4,               // Kết hợp cả khấu trừ và trực tiếp
}

public enum InventoryMethod
{
    FIFO = 1,                 // Nhập trước xuất trước
    BinhQuanGiaQuyen = 2,     // Bình quân gia quyền
    ThucTeDichDanh = 3,       // Thực tế đích danh
    NhapTruocXuatSau = 4,     // Nhập trước xuất sau (LIFO — VAS allowed)
}

public enum RoundingMethod
{
    RoundHalfUp = 1,          // Làm tròn 0.5 lên (thông thường)
    RoundDown = 2,            // Làm tròn xuống
    RoundUp = 3,              // Làm tròn lên
}

public enum ExchangeRateSource
{
    StateBank = 1,            // Ngân hàng Nhà nước Việt Nam
    CommercialBank = 2,       // Ngân hàng thương mại (mua vào)
    Interbank = 3,            // Liên ngân hàng
}

public enum TenantIsolationLevel
{
    SharedDatabase = 1,       // Mỗi công ty một schema (current)
    DatabasePerTenant = 2,    // Mỗi công ty một database riêng
}
```

### 4.3 Entity Relationship Diagram (Text)

```
Company (root) ───1:1─── CompanySettings
  │
  ├──1:N─── FormerName
  ├──1:N─── LegalRepresentative
  ├──1:N─── BusinessLine
  ├──1:N─── CapitalContributor
  ├──1:N─── Branch (Branch | RepresentativeOffice | BusinessLocation)
  ├──1:N─── CompanyBankAccount
  ├──1:N─── CompanyLicense
  ├──1:N─── CompanyDocument
  ├──1:N─── AuditAssignment
  ├──0:1─── CompanySeal
  ├──1:N─── UserCompany (→ ApplicationUser)
  └──1:N─── [Tenant-scoped entities: ChartOfAccount, JournalEntry, Invoice, ...]
```

---

## 5. Functional Requirements

### FR-01: Company Registration (Initial Setup)

| ID | Requirement | Priority |
|---|---|---|
| FR-01.1 | System SHALL capture enterprise code, tax code, both name fields, abbreviated name at registration | P0 |
| FR-01.2 | System SHALL validate enterprise code format per NĐ 168/2025 (10 digits, leading year digits) | P0 |
| FR-01.3 | System SHALL validate tax code format (10–13 digits, MST format) | P0 |
| FR-01.4 | System SHALL enforce unique tax code across all companies (existing constraint maintained) | P0 |
| FR-01.5 | System SHALL auto-generate enterprise code suggestion based on registration data | P2 |
| FR-01.6 | System SHALL require company type selection from enum during registration | P0 |
| FR-01.7 | System SHALL allow onboarding wizard: step 1 identity, step 2 legal reps, step 3 business lines, step 4 settings | P1 |

### FR-02: Company Profile Management

| ID | Requirement | Priority |
|---|---|---|
| FR-02.1 | System SHALL display company overview dashboard: status, tax code, legal reps, charter capital | P0 |
| FR-02.2 | System SHALL allow editing all profile fields with audit trail (who changed what, when) | P0 |
| FR-02.3 | System SHALL track former names when company name changes (preserve history) | P1 |
| FR-02.4 | System SHALL mandate correction reason when changing legal identity data (tax code, enterprise code, name) | P1 |
| FR-02.5 | System SHALL support address input via Vietnamese administrative hierarchy (Province → District → Ward) | P1 |
| FR-02.6 | System SHALL display company status with timestamp and allow status transitions per lifecycle | P0 |
| FR-02.7 | System SHALL require electronic approval from Chief Accountant for critical info changes | P2 |

### FR-03: Company Type & Status Lifecycle

| ID | Requirement | Priority |
|---|---|---|
| FR-03.1 | System SHALL support all CompanyType values from Luật DN 2020 | P0 |
| FR-03.2 | System SHALL enforce type-specific validation rules (e.g., CTCP requires >= 3 shareholders) | P1 |
| FR-03.3 | System SHALL support status transitions: Active → Suspended → Active, Active → Dissolved, Active → Bankrupt | P0 |
| FR-03.4 | System SHALL block all financial operations (save/approve/post) when status is Suspended or Dissolved | P0 |
| FR-03.5 | System SHALL record reason + effective date for each status change | P1 |
| FR-03.6 | System SHALL support company type conversion (chuyển đổi loại hình) with full audit trail | P2 |

### FR-04: Legal Representative Management

| ID | Requirement | Priority |
|---|---|---|
| FR-04.1 | System SHALL support multiple legal representatives (1..N) per Luật DN 2020 Điều 12, 13 | P0 |
| FR-04.2 | System SHALL require at least one legal representative designated as primary | P0 |
| FR-04.3 | System SHALL capture VNeID number for each legal representative | P0 |
| FR-04.4 | System SHALL validate VNeID number format (12 digits) | P0 |
| FR-04.5 | System SHALL store digital certificate serial number, provider, and expiry date | P1 |
| FR-04.6 | System SHALL alert when digital certificate is within 30 days of expiry | P2 |
| FR-04.7 | System SHALL track VNeID verification status and date | P1 |
| FR-04.8 | System SHALL support authorization scope (limited vs full representation) per Điều 13 | P1 |
| FR-04.9 | System SHALL require at least one active legal rep at all times — block removal of last active rep | P1 |

### FR-05: Business Lines Management

| ID | Requirement | Priority |
|---|---|---|
| FR-05.1 | System SHALL support multiple business lines per company | P0 |
| FR-05.2 | System SHALL include VSIC code (Mã ngành kinh tế Việt Nam) for each line | P0 |
| FR-05.3 | System SHALL validate VSIC code against official VSIC 2018 classification | P1 |
| FR-05.4 | System SHALL support VSIC hierarchy traversal (level 2 → 4 → 6) | P2 |
| FR-05.5 | System SHALL enforce exactly one primary business line | P1 |
| FR-05.6 | System SHALL track start date and optional end date for each line | P1 |
| FR-05.7 | System SHALL link sub-license references for conditional business lines (ngành nghề có điều kiện) | P2 |

### FR-06: Capital Structure & Contributors

| ID | Requirement | Priority |
|---|---|---|
| FR-06.1 | System SHALL track charter capital (vốn điều lệ) and paid-in capital (vốn đã góp) | P0 |
| FR-06.2 | System SHALL maintain list of capital contributors with contribution amount and ownership ratio | P0 |
| FR-06.3 | System SHALL validate total ownership ratio sums to 100% (±0.01 tolerance) | P1 |
| FR-06.4 | System SHALL calculate ownership ratio automatically from contribution amounts | P1 |
| FR-06.5 | System SHALL track capital contribution date and certificate reference | P1 |
| FR-06.6 | System SHALL support founder designation for founding shareholders | P2 |
| FR-06.7 | System SHALL maintain capital change history — preserve all previous charter capital values | P1 |
| FR-06.8 | System SHALL enforce constrained logic: CTCP must have >= 3 shareholders, DNTN has 1 owner | P1 |

### FR-07: Branch / Representative Office Management

| ID | Requirement | Priority |
|---|---|---|
| FR-07.1 | System SHALL support adding branches, representative offices, and business locations | P0 |
| FR-07.2 | System SHALL capture separate tax code for each branch (if applicable per law) | P1 |
| FR-07.3 | System SHALL track branch status independent of parent company | P1 |
| FR-07.4 | System SHALL associate users to branches for access scoping | P2 |

### FR-08: Bank Account Management

| ID | Requirement | Priority |
|---|---|---|
| FR-08.1 | System SHALL support multiple bank accounts per company | P0 |
| FR-08.2 | System SHALL require marking exactly one account as primary for tax payment | P0 |
| FR-08.3 | System SHALL capture IBAN-equivalent (STK), bank name, branch, SWIFT code | P1 |
| FR-08.4 | System SHALL support per-account currency tracking | P2 |

### FR-09: Company Settings

| ID | Requirement | Priority |
|---|---|---|
| FR-09.1 | System SHALL enforce AccountingRegime selection (TT99 vs TT133) — drives chart of accounts + report templates | P0 |
| FR-09.2 | System SHALL enforce TaxCalculationMethod selection — drives VAT tracking | P0 |
| FR-09.3 | System SHALL set default DecimalPlaces = 0 per TT 99/2025 (VND is integer, non-decimal currency) | P0 |
| FR-09.4 | System SHALL provide RoundingMethod selection for VND conversion | P1 |
| FR-09.5 | System SHALL support default exchange rate source selection | P2 |
| FR-09.6 | System SHALL enforce that decimal places cannot be changed after first period close | P1 |
| FR-09.7 | System SHALL track last closed period date — prevent posting to closed periods | P1 |
| FR-09.8 | System SHALL support all InventoryMethod values per VAS 02 | P1 |

### FR-10: Tax Authority Assignment

| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | System SHALL store assigned tax office (Cục Thuế / Chi cục Thuế) | P0 |
| FR-10.2 | System SHALL use tax office for official report headers and tax filing routing | P1 |
| FR-10.3 | System SHALL support tax department/team within tax office | P2 |

### FR-11: License & Permit Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-11.1 | System SHALL store business registration certificate info (number, issuer, date) | P0 |
| FR-11.2 | System SHALL support expiry date tracking with 30-day pre-expiry alerts | P1 |
| FR-11.3 | System SHALL support scanned document upload for each license | P2 |

### FR-12: Company Document Management

| ID | Requirement | Priority |
|---|---|---|
| FR-12.1 | System SHALL allow upload of business registration certificate, tax registration cert, other official docs | P1 |
| FR-12.2 | System SHALL enforce file size limits (max 10MB per file) | P2 |
| FR-12.3 | System SHALL support expiry-aware document management with alerts | P2 |

### FR-13: Company Seal

| ID | Requirement | Priority |
|---|---|---|
| FR-13.1 | System SHALL store seal registration number and image | P1 |
| FR-13.2 | System SHALL track seal issuance authority and date | P2 |

### FR-14: Audit Firm Assignment

| ID | Requirement | Priority |
|---|---|---|
| FR-14.1 | System SHALL support annual audit firm assignment | P2 |
| FR-14.2 | System SHALL track audit engagement partner, dates, status | P2 |
| FR-14.3 | System SHALL link to audit report document | P2 |

### FR-15: VNeID Integration

| ID | Requirement | Priority |
|---|---|---|
| FR-15.1 | System SHALL store VNeID organization identifier | P0 |
| FR-15.2 | System SHALL support VNeID registration status tracking | P0 |
| FR-15.3 | System SHALL periodically sync VNeID status (daily via background job) | P1 |
| FR-15.4 | System SHALL block tax transactions when VNeID status is not Verified | P0 |
| FR-15.5 | System SHALL integrate with VNeID API for legal rep verification (adapter pattern per ADR-0001) | P0 |

### FR-16: Tenant Isolation & Multi-Company

| ID | Requirement | Priority |
|---|---|---|
| FR-16.1 | System SHALL enforce data isolation by CompanyId at the query level for all tenant-scoped entities | P0 |
| FR-16.2 | System SHALL support user context switching between multiple companies (same user, different tenant) | P1 |
| FR-16.3 | System SHALL log company context for all audit entries | P1 |
| FR-16.4 | System SHALL support branch-scoped access within a company | P2 |

### FR-17: Export & Reporting

| ID | Requirement | Priority |
|---|---|---|
| FR-17.1 | System SHALL export company profile as PDF (for regulatory submission) | P1 |
| FR-17.2 | System SHALL generate company info XML/JSON for tax authority data exchange | P2 |
| FR-17.3 | System SHALL provide capital structure report | P2 |
| FR-17.4 | System SHALL provide legal representative listing report | P2 |

### FR-18: Audit Trail

| ID | Requirement | Priority |
|---|---|---|
| FR-18.1 | System SHALL log all changes to company aggregate entities with before/after values | P0 |
| FR-18.2 | System SHALL require reason code for changes to legally significant fields (tax code, enterprise code, name, charter capital, legal reps) | P0 |
| FR-18.3 | System SHALL preserve all historical versions of company identity data | P1 |

---

## 6. Gap Analysis Matrix

| Gap ID | Description | Severity | Current State | Target State | Law Reference | Effort |
|---|---|---|---|---|---|---|
| G-01 | No enterprise code field | **Blocking** | Missing | Store mã doanh nghiệp (10 digits) | NĐ 168/2025, Luật DN Điều 29 | 2d |
| G-02 | No company type enum | High | Missing | Enum with 11+ types | Luật DN 2020 | 3d |
| G-03 | Single legal rep field | **Blocking** | Text field only | 1..N typed legal reps with VNeID | Luật DN Điều 12-13 | 3w |
| G-04 | No charter capital tracking | **Blocking** | Missing | Charter + paid-in capital + change history | Luật DN Điều 30, 34 | 2w |
| G-05 | No capital contributors | High | Missing | Member/shareholder registry with ratios | Luật DN Điều 36, 47, 114 | 3w |
| G-06 | No Vietnamese/English name split | Medium | Single Name field | NameVietnamese + NameEnglish + AbbreviatedName | NĐ 168/2025 | 1d |
| G-07 | No former name tracking | Low | Missing | FormerName entity with timestamps | Good practice + DN registry | 2d |
| G-08 | No date fields | Medium | Missing | Establishment + commencement dates | NĐ 168/2025 | 1d |
| G-09 | No company status lifecycle | **Blocking** | IsActive bool only | Multi-status enum + transition rules | Luật DN Điều 22, 77, 207 | 1w |
| G-10 | No business lines | Medium | Missing | 1..N BusinessLine with VSIC codes | NĐ 168/2025, Luật DN Điều 29 | 2w |
| G-11 | No branch management | Medium | Missing | Branch/RO/Location entity | Luật DN Điều 43-45 | 2w |
| G-12 | No bank accounts | High | Missing | 1..N BankAccount with tax payment flag | TT 99/2025, Luật QLT | 1w |
| G-13 | No tax authority assignment | Medium | Missing | TaxOfficeId + department | TT 86/2024/TT-BTC | 2d |
| G-14 | No accounting regime selection | **Blocking** | Missing | TT99 vs TT133 toggle | TT 99/2025, TT 133/2016 | 3d |
| G-15 | No tax calc method | **Blocking** | TaxMethod free text | TaxCalculationMethod enum | TT 99/2025 Điều 12, Luật GTGT | 3d |
| G-16 | Decimal rules non-compliant | High | DecimalPlaces default 2 | Default 0 per TT 99/2025 (VND) | TT 99/2025 Điều 10 | 1d |
| G-17 | No rounding method | Low | Missing | RoundingMethod enum | VAS 01 | 1d |
| G-18 | No exchange rate source | Low | Missing | DefaultRateSource enum | VAS 01, TT 99/2025 | 1d |
| G-19 | No inventory method enum | Medium | Free text string | Enum with VAS 02 methods | VAS 02, TT 99/2025 | 2d |
| G-20 | No license/permit tracking | Medium | Missing | BusinessRegCert + sub-licenses | NĐ 168/2025 | 1w |
| G-21 | No company seal support | Medium | Missing | Seal image + registration number | Luật DN Điều 43 | 3d |
| G-22 | No document management | Medium | Missing | Certificate + license file upload | Good practice | 1w |
| G-23 | No audit firm assignment | Low | Missing | AuditAssignment entity | Luật Kế toán 88/2015 | 3d |
| G-24 | No VNeID registration | **Blocking** | Missing | VNeID org ID + status + sync | NĐ 69/2024/NĐ-CP | 4w |
| G-25 | No multi-company context switching | Medium | UserCompany exists | Company switcher UI + context filter | Multi-tenancy | 5d |
| G-26 | No correction reason for critical fields | **Blocking** | Missing | Mandatory reason + audit trail | TT 99/2025 Điều 28 | 1w |
| G-27 | No period close tracking | Medium | Missing | LastClosedPeriodDate + enforcement | TT 99/2025 | 1w |
| G-28 | No capital change history | Medium | Missing | CapitalChange entity with before/after | Luật DN Điều 34 | 3d |
| G-29 | No company conversion support | Low | Missing | Conversion workflow + history | Luật DN Điều 202-206 | 1w |
| G-30 | Address not using admin hierarchy | Medium | Free text only | Province/District/Ward dropdowns | Good practice | 3d |

### Effort Summary

| Category | Count | Total Effort |
|---|---|---|
| Blocking (BG) | 5 | ~9 weeks |
| High | 5 | ~6 weeks |
| Medium | 14 | ~11 weeks |
| Low | 6 | ~2 weeks |
| **Total** | **30** | **~28 weeks** (parallelizable to 12 weeks) |

---

## 7. PROD Readiness Criteria

### 7.1 Must-Have (PROD Gate)

| # | Criterion | Verification |
|---|---|---|
| P1 | Enterprise code + tax code + company name stored and validated | Unit test + integration test |
| P2 | Tax code unique constraint enforced | Integration test |
| P3 | Company type selected from enum, not free text | Migration verification |
| P4 | At least one legal representative with VNeID number required | Integration test |
| P5 | Multiple legal reps supported (add/edit/remove) | Integration test |
| P6 | Charter capital + paid-in capital tracked | Unit test |
| P7 | At least one business line with VSIC code required | Integration test |
| P8 | Company status lifecycle with Active/Suspended/Dissolved/Bankrupt | Unit test + workflow test |
| P9 | Status change blocks financial ops when suspended/dissolved | Integration test |
| P10 | Accounting regime (TT99/TT133) selection required at setup | Integration test |
| P11 | Tax calculation method selection required | Integration test |
| P12 | Decimal places default 0 per TT 99/2025 | Config check |
| P13 | Last closed period tracked and enforced | Integration test |
| P14 | Correction reason mandatory for legally significant field edits | Integration test |
| P15 | All changes to company aggregate logged in audit trail | Integration test |
| P16 | Bank accounts with at least one tax payment account | Integration test |
| P17 | Tax authority assignment present | Integration test |
| P18 | VNeID registration status tracked | Integration test |
| P19 | Branch management CRUD | Integration test |
| P20 | User company context properly isolated (query-level WHERE CompanyId) | Security test |
| P21 | Migration script from old Company model to new aggregate works | Dry-run on staging |
| P22 | Existing company data preserved during migration | Data integrity check |

### 7.2 Nice-to-Have (Post-PROD Phases)

| # | Criterion | Priority |
|---|---|---|
| N1 | VNeID API integration (adapter + sync) | Phase 3 |
| N2 | Company seal image storage | Phase 3 |
| N3 | License expiry alerts | Phase 3 |
| N4 | Document management with expiry tracking | Phase 3 |
| N5 | Audit firm assignment | Phase 3 |
| N6 | Capital change history visualization | Post-PROD |
| N7 | Company type conversion workflow | Post-PROD |
| N8 | Multi-company user context switching UI | Post-PROD |
| N9 | Branch-scoped user permissions | Post-PROD |
| N10 | Company profile PDF export | Post-PROD |
| N11 | VSIC code hierarchy browser | Post-PROD |
| N12 | Onboarding wizard | Post-PROD |

---

## 8. Implementation Roadmap

### Phase 1: Core Data Model + Blocking Gaps (Weeks 1–4)

**Focus:** Expand Company entity, fix 5 blocking gaps, establish enums, migrations.

| Week | Deliverables | Dependencies |
|---|---|---|
| W1 | Company entity expansion: EnterpriseCode, CompanyType, NameVietnamese/English, AbbreviatedName, dates, address hierarchy | Existing Company model |
| W1 | TaxCode + EnterpriseCode validation, unique constraints | W1 entity |
| W1 | CompanyStatus enum + state machine (Active/Suspended/Dissolved/Bankrupt) | W1 entity |
| W1 | Migration script: old → new schema, data preservation | W1 entity |
| W2 | LegalRepresentative entity (1..N, VNeID, digital cert fields, primary flag) | W1 complete |
| W2 | AccountingRegime enum + TaxCalculationMethod enum on CompanySettings | Existing CompanySettings |
| W2 | DecimalPlaces default 0 + RoundingMethod + ExchangeRateSource | W2 settings |
| W2 | Period close tracking on CompanySettings | W2 settings |
| W3 | CapitalContributor entity + charter/paid-in capital fields | W1 complete |
| W3 | BusinessLine entity + VSIC code + primary flag | W1 complete |
| W3 | Capital validation: total ratio = 100%, company-type constraints | W3 contributors |
| W4 | BankAccount entity + tax payment primary flag | W1 complete |
| W4 | TaxAuthority assignment (TaxOfficeId) | W1 complete |
| W4 | Correction reason framework + audit trail wiring on Company aggregate | Existing AuditEntity |
| W4 | UserCompany isolation audit + query-level CompanyId enforcement | W1 complete |

### Phase 2: Branches, Documents, Licenses (Weeks 5–8)

**Focus:** Remaining entities, document management, admin UI, settings.

| Week | Deliverables | Dependencies |
|---|---|---|
| W5 | Branch/RO/Location entity + CRUD | Phase 1 complete |
| W5 | CompanyLicense entity + business registration certificate | Phase 1 complete |
| W6 | CompanySeal entity + image upload | W5 licenses |
| W6 | CompanyDocument entity + file upload (certificates, reports) | W5 licenses |
| W7 | Admin UI screens for all Phase 1 + Phase 2 entities | All entities |
| W7 | Company dashboard page with overview + status | W7 UI |
| W7 | FormerName tracking + name change reason | Phase 1 complete |
| W8 | Integration tests for all entities and validations | W7 complete |
| W8 | Bug fixes from Phase 1-2 testing | All |

### Phase 3: VNeID, Audit, Reporting, Migration (Weeks 9–12)

**Focus:** External integrations, data migration, production hardening.

| Week | Deliverables | Dependencies |
|---|---|---|
| W9 | VNeID organization ID + status tracking (entity fields first, API later) | Phase 1 complete |
| W9 | VNeID registration status UI + sync background job | W9 entity |
| W10 | AuditFirm entity + AuditAssignment | Phase 2 complete |
| W10 | Company profile PDF export | Phase 2 complete |
| W11 | Full data migration from PROD + verification | All entities |
| W11 | Performance testing on company aggregate queries | W11 migration |
| W11 | Security review: tenant isolation, data access | Phase 1-2 |
| W12 | Documentation: company module usage guide | All |
| W12 | PROD readiness review + sign-off | All |

### Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| VNeID API changes (government) | Phase 3 delay | Adapter pattern, feature-flag the API call, fallback to manual status entry |
| Migration data loss for existing companies | Data integrity issue | Multiple dry-run migrations on snapshots, rollback script, data diff comparison |
| Parallel development conflicts with other modules | Coordination overhead | Shared enums in NuGet package, Company aggregate as single source-of-truth for tenant services |
| Accounting regime decision affects chart of accounts | Downstream impact | Regime selected at setup — lock once transactions exist |
| Multi-company context switch affects all queries | Security bug | Tenant filter interceptor pattern (test all scoped queries) |

---

## 9. Related Documents

| Doc | Location |
|---|---|
| BRD — User Management | `docs/brd/01-user-management-brd.md` |
| BRD — Use Cases | `docs/brd/02-use-cases.md` |
| BRD — Workflows | `docs/brd/03-workflows.md` |
| BRD — Business Rules | `docs/brd/04-business-rules.md` |
| BRD — Data Flows | `docs/brd/05-data-flows.md` |
| BRD — User Journeys | `docs/brd/07-user-journeys.md` |
| ADR — VNeID Integration | `docs/adr/0001-vneid-integration.md` |
| ADR — Digital Signature | `docs/adr/0002-digital-signature-module.md` |
| Current Company Model | `src/SmeAccounting.Web/Models/Company.cs` |
| Current Company Controller | `src/SmeAccounting.Web/Areas/Admin/Controllers/CompanyController.cs` |
| Current Company ViewModels | `src/SmeAccounting.Web/Areas/Admin/Models/CompanyViewModels.cs` |
| Domain Glossary | `docs/domain/user-management-terms.md` |
| Coding Standards | `docs/standards/01-csharp-coding-standards.md` |
| Implementation Roadmap | `docs/standards/08-implementation-roadmap.md` |

---

## 10. Appendix A: Key Vietnamese Domain Terms

| VN Term | EN Translation | Context |
|---|---|---|
| Mã số doanh nghiệp | Enterprise code | 10-digit code issued by provincial DPI |
| Mã số thuế | Tax code | 10–13 digit code for tax purposes |
| Vốn điều lệ | Charter capital | Registered capital in business registration |
| Vốn đã góp | Paid-in capital | Capital actually contributed |
| Người đại diện theo pháp luật | Legal representative | Person authorized to represent company |
| Ngành nghề kinh doanh | Business lines | Registered business activities |
| Mã ngành VSIC | VSIC code | Vietnam Standard Industrial Classification |
| Chế độ kế toán | Accounting regime | TT 99 (enterprise) or TT 133 (SME) |
| Phương pháp tính thuế | Tax calculation method | Khấu trừ (deduction) or Trực tiếp (direct) |
| Chi nhánh | Branch | Dependent unit with separate operations |
| Văn phòng đại diện | Representative office | Liaison office (no revenue) |
| Con dấu | Company seal | Official rubber stamp |
| Giấy chứng nhận đăng ký doanh nghiệp | Business registration certificate | Issued by DPI |
| Cơ quan thuế quản lý | Managing tax authority | Cục Thuế / Chi cục Thuế |
| Tài khoản ngân hàng nộp thuế | Tax payment bank account | Registered with tax authority |
| Thành viên góp vốn | Capital contributor | Member/shareholder |
| Sáng lập viên | Founder | Founding shareholder |
| Giải thể | Dissolution | Legal termination process |
| Chuyển đổi loại hình | Company type conversion | Changing legal structure |
