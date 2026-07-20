# Data Flows — Company Module

> Vietnamese SME Accounting System
> Law references: NĐ 168/2025/NĐ-CP, TT 99/2025/TT-BTC, NĐ 69/2024/NĐ-CP, Luật Doanh nghiệp 2020, Luật Quản lý thuế 38/2019

---

## DF-01: Company Setup Data Flow

### Context Diagram Scope

First-time company registration onboarding flow — from user input through validation to system activation. This is the single entry point for creating a new tenant in the system.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Company Setup (System Boundary)               │
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐          │
│  │  Step 1  │───►│   Step 2     │───►│   Step 3      │──► Activate│
│  │ Identity │    │ Settings     │    │  Verification │          │
│  └──────────┘    └──────────────┘    └───────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ▲                                │
         │                                ▼
[User (Admin)]              [National Business Registration Portal]
```

### Level-0 DFD

```
[Company Admin User]            [National Business Registration Portal]
        │                                        │
        │-- 1. Enter company info ──►            │
        │     {enterpriseCode, taxCode,          │
        │      nameVI, nameEN, companyType,      │
        │      charterCapital, address,          │
        │      legalReps[], businessLines[]}     │
        │                                        │
        │◄── 2. Validate tax code ───────────────┤
        │         (online check)                  │
        │                                        │
        │-- 3. Enter accounting settings ──►     │
        │     {fiscalYearStart, currencyCode,    │
        │      decimalPlaces, accountingRegime,  │
        │      taxMethod, inventoryMethod}       │
        │                                        │
        │                                        │
        ▼                                        ▼
   ┌──────────────────────────────────────────────────────┐
   │                  Setup Orchestrator                    │
   │                                                        │
   │  ┌──────────────────┐  ┌─────────────────────────┐    │
   │  │ ValidateService   │  │  ActivationService      │    │
   │  │ • TaxCodeFormat   │  │  • CreateCompany        │    │
   │  │ • EnterpriseCode  │  │  • CreateSettings       │    │
   │  │ • NameUnique      │  │  • CreateLegalReps      │    │
   │  │ • LegalRepRules   │  │  • CreateBusinessLines  │    │
   │  └───────┬──────────┘  │  • CreateBankAccounts    │    │
   │          │             │  • AssignTaxOffice       │    │
   │          ▼             │  • InitializePeriods     │    │
   │  ┌──────────────────┐  └───────────┬─────────────┘    │
   │  │ DuplicateCheck    │              │                  │
   │  │ • TaxCode unique  │              │                  │
   │  │ • Name unique     │              ▼                  │
   │  └──────────────────┘   ┌─────────────────────────┐    │
   │                         │  NotificationService    │    │
   │                         │  • Welcome email        │    │
   │                         │  • Setup complete       │    │
   │                         └─────────────────────────┘    │
   └──────────────────────────────────────────────────────┘
           │                    │                   │
           ▼                    ▼                   ▼
   ┌────────────┐   ┌──────────────────┐   ┌────────────────┐
   │  Company   │   │ CompanySettings  │   │  UserCompany   │
   └────────────┘   └──────────────────┘   └────────────────┘
```

### Data Store Descriptions

**Store: Company**
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid | PK | |
| EnterpriseCode | string(15) | UQ | Mã doanh nghiệp, 10 digits |
| TaxCode | string(15) | UQ, filtered | 10-13 digits, unique where non-null |
| NameVietnamese | string(400) | IX | |
| NameEnglish | string(400) | | Nullable |
| AbbreviatedName | string(100) | | Nullable |
| CompanyType | int | IX | Enum: 1TV, 2TV, CTCP, DNTN... |
| CharterCapital | decimal(18,2) | | Vốn điều lệ |
| PaidInCapital | decimal(18,2) | | Vốn đã góp |
| HeadOfficeAddress | string(500) | | |
| HeadOfficeProvinceId | string(10) | IX | |
| HeadOfficeDistrictId | string(10) | IX | |
| HeadOfficeWardId | string(10) | | |
| Phone | string(100) | | |
| Email | string(256) | | |
| Website | string(200) | | |
| Status | int | IX | Active/Suspended/Dissolved/Bankrupt |
| DateOfEstablishment | DateTime | | |
| DateOfOperationCommencement | DateTime | | Nullable |
| VNeIDOrganizationId | string(50) | | Nullable |
| VNeIDStatus | int | | NotRegistered/Registered/Verified/Revoked |
| LastVNeIDSyncAt | DateTime | | Nullable |
| CreatedAt | DateTime | IX | |
| UpdatedAt | DateTime | | |
| CreatedByUserId | string | IX | |
| UpdatedByUserId | string | | |

Indexes:
- PK: `Id`
- UQ: `EnterpriseCode` (non-unique nulls not applicable — required field)
- UQ: `TaxCode` (filtered `WHERE TaxCode IS NOT NULL AND Status != 4`)
- IX: `NameVietnamese`, `CompanyType`, `Status`, `CreatedByUserId`

**Store: CompanySettings**
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid | PK | 1:1 with Company |
| CompanyId | Guid | UQ FK | |
| FiscalYearStartMonth | int | | 1-12 |
| CurrencyCode | string(3) | | Default "VND" |
| DecimalPlaces | int | | Default 0 per TT 99/2025 |
| RoundingMethod | int | | HalfUp/Down/Up |
| AccountingRegime | int | | TT99 or TT133 |
| TaxCalculationMethod | int | | KhauTru/TrucTiep/HonHop |
| TaxMethod | int | | TrucTiepGTGT/KhauTruGTGT |
| InventoryMethod | int | | FIFO/BinhQuan/ThucTe/NhapTruoc |
| EnableMultiCurrency | bool | | |
| EnableDepartmentManagement | bool | | Default true |
| DefaultExchangeRateSource | int | | StateBank/CommercialBank/Interbank |
| LastPeriodClosed | DateTime | | Nullable |
| FirstPeriodStartDate | DateTime | | Nullable |
| ClosedPeriodCount | int | | |

Indexes:
- PK: `Id`
- UQ FK: `CompanyId`
- IX: `AccountingRegime`, `TaxMethod`

**Store: UserCompany**
| Field | Type | Index | Notes |
|---|---|---|---|
| UserId | string | PK (composite) | |
| CompanyId | Guid | PK (composite) FK | |
| IsActive | bool | | Is this user's active company context |
| JoinedAt | DateTime | | |
| Role | string(50) | | Admin/Accountant/Manager/Viewer |

Indexes:
- PK: (`UserId`, `CompanyId`)
- IX: `CompanyId`, `UserId`

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 1.1 | EnterCompanyInfo | User → SetupOrchestrator | JSON: `{ enterpriseCode, taxCode, nameVI, nameEN, companyType, charterCapital, legalReps[], businessLines[], address }` | Once per company | ~2KB |
| 1.2 | ValidateTaxCode | SetupOrchestrator → NationalBizPortal | HTTP GET: `?taxCode=xxxxxxxxxx` | Once per setup | ~200B |
| 1.3 | TaxCodeValidationResult | NationalBizPortal → SetupOrchestrator | JSON: `{ valid, enterpriseName, address, status }` | Once per setup | ~500B |
| 1.4 | EnterSettings | User → SetupOrchestrator | JSON: `{ fiscalYearStart, currencyCode, decimalPlaces, accountingRegime, taxMethod, inventoryMethod }` | Once per company | ~500B |
| 1.5 | CreateCompany | SetupOrchestrator → Company | INSERT | 1 row | |
| 1.6 | CreateSettings | SetupOrchestrator → CompanySettings | INSERT | 1 row | |
| 1.7 | LinkUser | SetupOrchestrator → UserCompany | INSERT | 1 row | |
| 1.8 | ActivationComplete | SetupOrchestrator → User | JSON: `{ companyId, status, welcomeMessage }` | Once | ~200B |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| UI Entry | EnterpriseCode regex `^\d{10}$` | NĐ 168/2025 Điều 5 | Block form submission |
| UI Entry | TaxCode regex `^\d{10}(-\d{3})?$` | TT 105/2020 Điều 5 | Block form submission |
| UI Entry | NameVietnamese non-empty, charset per Điều 37 | Luật DN 2020 Điều 37 | Inline error |
| UI Entry | CharterCapital >= 0 | Luật DN 2020 Điều 46 | Inline error |
| API | TaxCode unique (no other active company) | Luật QLT 38/2019 Điều 30 | 409 Conflict |
| API | EnterpriseCode unique | NĐ 168/2025 | 409 Conflict |
| API | NameVietnamese unique (active companies) | Luật DN 2020 Điều 38 | 409 Conflict |
| API | At least 1 legal rep, primary flag set | Luật DN 2020 Điều 12-13 | 422 Validation |
| API | CompanyType matches contributor count (CTCP >= 3, DNTN = 1) | Luật DN 2020 Điều 46, 74 | 422 Validation |
| API | VNeID number format (12 digits) per legal rep | NĐ 69/2024 | 422 Validation |
| API | AccountingRegime required | TT 99/2025 Điều 1 | 422 Validation |
| API | TaxCalculationMethod required | TT 99/2025 Điều 12 | 422 Validation |

---

## DF-02: Tax Code Verification Flow

### Context Diagram Scope

Real-time verification of a company's tax code against the national tax authority database. Triggered during setup (DF-01) and on-demand when tax code is modified.

```
┌─────────────────────────────────────────────────────────────┐
│              Tax Code Verification (System Boundary)          │
│                                                              │
│  [TaxCode Input] → [Format Check] → [Checksum] → [Online]   │
│                                              → [Duplicate]  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                                          │
         ▼                                          ▼
[Company Module]                          [Tax Authority API]
                                   (thuedientu.gdt.gov.vn)
```

### Level-0 DFD

```
[Company Module]                              [Tax Authority API]
      │                                              │
      │-- 1. VerifyTaxCode(taxCode) ──►              │
      │                                              │
      │     ┌──────────────────────────┐             │
      │     │  Local Validation Chain  │             │
      │     │                          │             │
      │     │  Step 1: Format Check    │             │
      │     │  regex ^\d{10}(-\d{3})?$│             │
      │     │          │               │             │
      │     │          ▼               │             │
      │     │  Step 2: Checksum Check  │             │
      │     │  digit[10] = f(digits[1..9])          │
      │     │          │               │             │
      │     │          ▼               │             │
      │     │  Step 3: Duplicate Check │             │
      │     │  SELECT COUNT(*) FROM    │             │
      │     │  Company WHERE TaxCode=  │             │
      │     │    AND Status != Dissolved            │
      │     │          │               │             │
      │     │          ▼               │             │
      │     │  Step 4: Online Check    │─────────────►│
      │     └──────────────────────────┘             │
      │                                              │
      │◄── 2. TaxInfoResult ────────────────────────┤
      │     {                                       │
      │       enterpriseName, status: active,       │
      │       address, taxOfficeCode,               │
      │       taxMethod: khauTru/trucTiep,          │
      │       registrationDate                      │
      │     }                                       │
      │                                              │
      ▼                                              │
  ┌────────────┐                                     │
  │  Company   │                                     │
  └────────────┘                                     │
```

### Data Store Descriptions

**Store: Company (same as DF-01)**

No intermediate store — verification is stateless. Results cached locally for 24h in a `TaxCodeVerificationCache` (optional).

| Cache Field | Type | Notes |
|---|---|---|
| TaxCode | string(15) | PK |
| Result | JSON | Full verification result |
| VerifiedAt | DateTime | |
| ExpiresAt | DateTime | TTL = 24h |

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 2.1 | VerifyTaxCode | CompanyModule → ValidationChain | string: 10-13 digit tax code | On setup + on update | ~100B |
| 2.2 | OnlineLookup | ValidationChain → TaxAuthorityAPI | HTTP GET: `/api/taxcode/{taxCode}` | Once per 24h per tax code | ~200B |
| 2.3 | TaxInfoResult | TaxAuthorityAPI → ValidationChain | JSON: `{ enterpriseName, status, address, taxOfficeCode, taxMethod, registrationDate }` | Once per lookup | ~1KB |
| 2.4 | VerificationResult | ValidationChain → CompanyModule | JSON: `{ valid, enterpriseName, taxOfficeCode, matched }` | On every verify call | ~500B |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Format | TaxCode matches `^\d{10}(-\d{3})?$` | TT 105/2020 Điều 5 | Return `INVALID_FORMAT` |
| Checksum | 10th digit = f(1st 9 digits) per Tổng cục Thuế algorithm | TT 105/2020 Điều 5 | Return `CHECKSUM_FAILED` |
| Checksum | For 13-digit codes (branch): first 10 must pass checksum, last 3 are sequential suffix | TT 105/2020 Điều 5 | Return `INVALID_BRANCH_CODE` |
| Duplicate | No other active company uses this TaxCode | Luật QLT 38/2019 Điều 30 | Return `DUPLICATE` |
| Online | Tax authority API responds within 5s | SLA | Fallback to cached result or return `UNREACHABLE` with warning |
| Online | Enterprise name returned matches input name (if provided) | Anti-fraud | Warning to user, not blocking |

### Checksum Algorithm (Reference)

```
Per Tổng cục Thuế specification:
  position 1-9:    d1 d2 d3 d4 d5 d6 d7 d8 d9
  weight:          31 29 23 19 17 13 11 7  5
  weighted_sum = Σ(di * weight[i]) for i=1..9
  checksum = (10 - (weighted_sum % 10)) % 10
  valid IF checksum == d10
```

---

## DF-03: Company Settings → GL Module Integration

### Context Diagram Scope

How company-level accounting configuration controls General Ledger behavior. Settings are read at GL initialization, period creation, transaction posting, and reporting.

```
┌──────────────────────────────────────────────────────────────────┐
│          Company Settings to GL Integration (System Boundary)     │
│                                                                   │
│  ┌─────────────────┐     ┌──────────────────────────────────┐    │
│  │  CompanySettings │────►│  GL Module Configuration        │    │
│  │                  │     │                                 │    │
│  │  FiscalYearStart │────►│  Period creation dates          │    │
│  │  CurrencyCode    │────►│  Base currency + FX rate source │    │
│  │  DecimalPlaces   │────►│  Rounding rules                │    │
│  │  RoundingMethod  │────►│  Amount precision               │    │
│  │  AccountingRegime│────►│  Chart of accounts + templates  │    │
│  │  LastPeriodClosed│────►│  Posting gate                   │    │
│  └─────────────────┘     └──────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Level-0 DFD

```
[Company Admin]                 [GL Module]
      │                              │
      │─ UpdateSettings ──►          │
      │                              │
      ▼                              │
  ┌────────────┐                     │
  │  Company   │                     │
  │  Settings  │                     │
  └──────┬────┘                     │
         │                           │
         │─ FiscalYearStart ─────────► [PeriodGenerator]
         │                           │
         │─ CurrencyCode ────────────► [FiatCurrencyService]
         │                           │
         │─ DecimalPlaces (+) ───────► [RoundingService]
         │   RoundingMethod          │
         │                           │
         │─ AccountingRegime ────────► [ChartOfAccountsLoader]
         │                           │   • TT99 → 100+ accounts
         │                           │   • TT133 → 50+ accounts
         │                           │
         │─ LastPeriodClosed ────────► [PostingGate]
         │                           │   • Prevents posting to
         │                           │     closed periods
         │                           │
         │─ EnableMultiCurrency ─────► [JournalEntryValidator]
         │                           │   • Requires currency field
         │                           │   • Validates FX rate
         │                           │
         │─ EnableDepartment ───────► [JournalEntryValidator]
                                     │   • Requires department field
```

### Data Store Descriptions

**Store: CompanySettings** (same as DF-01)

**Store: GLPeriod** (derived store, created from settings)
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid | PK | |
| CompanyId | Guid | FK IX | |
| FiscalYear | int | IX | e.g. 2026 |
| PeriodNumber | int | | 1-12 (or 1-13 for fiscal year with adjustment period) |
| StartDate | Date | | |
| EndDate | Date | | |
| IsOpen | bool | | |
| IsAdjustmentPeriod | bool | | 13th period for adjustments |
| OpenedAt | DateTime | | |
| ClosedAt | DateTime | | Nullable |

Indexes:
- PK: `Id`
- UQ: (`CompanyId`, `FiscalYear`, `PeriodNumber`)
- IX: `CompanyId`, `FiscalYear`

**Store: ExchangeRate** (derived store)
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid | PK | |
| CompanyId | Guid | FK IX | |
| FromCurrency | string(3) | | |
| ToCurrency | string(3) | | Always VND for base |
| RateDate | Date | | |
| Rate | decimal(18,6) | | |
| Source | int | | StateBank/CommercialBank/Interbank |
| SourceRef | string(100) | | API reference if auto-fetched |

Indexes:
- PK: `Id`
- UQ: (`CompanyId`, `FromCurrency`, `ToCurrency`, `RateDate`, `Source`)

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 3.1 | FiscalYearConfig | CompanySettings → PeriodGenerator | `{ fiscalYearStartMonth, companyId }` | Once per company setup | ~100B |
| 3.2 | GeneratePeriods | PeriodGenerator → GLPeriod | 12-13 INSERT rows | Once per fiscal year | ~1KB |
| 3.3 | CurrencyConfig | CompanySettings → FiatCurrencyService | `{ currencyCode, enableMultiCurrency, defaultRateSource }` | On every transaction | ~200B |
| 3.4 | ResolveRate | FiatCurrencyService → ExchangeRate API | `{ fromCurrency, toCurrency=VND, date }` | On foreign currency posting | ~100B |
| 3.5 | RoundingConfig | CompanySettings → RoundingService | `{ decimalPlaces, roundingMethod }` | On every transaction | ~50B |
| 3.6 | PostingGateCheck | JournalEntry → GLPeriod | `{ companyId, postingDate }` | On every journal entry save | ~100B |
| 3.7 | PostingGateResult | GLPeriod → JournalEntry | `{ allowed, periodStatus, closedAt }` | On every save | ~100B |
| 3.8 | RegimeSelection | CompanySettings → ChartOfAccountsLoader | `{ accountingRegime }` | On COA initialization | ~50B |
| 3.9 | LoadCOATemplate | ChartOfAccountsLoader → Database | SELECT from COA template | Once per regime | ~10KB |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Period generation | FiscalYearStartMonth 1-12 | TT 99/2025 Điều 5 | 422 Validation |
| Period generation | Periods must not overlap existing periods | Internal | 409 Conflict |
| Currency | Base currency = VND (single-currency mode) | TT 99/2025 Điều 6 | 422 Validation |
| Decimal places | 0-6, locked after first period close | TT 99/2025 Điều 8 | 403 Forbidden |
| Posting | Cannot post to a closed period | TT 99/2025 Điều 29 | 403 Forbidden |
| Posting | Cannot post if company status = Suspended/Dissolved | Luật DN 2020 Điều 210 | 403 Forbidden |
| Multi-currency | FX rate required for non-VND entries | VAS 10 | 422 Validation |
| Department | Department required when EnableDepartment=true | TT 99/2025 Điều 10 | 422 Validation |

---

## DF-04: Company Settings → Tax Module Integration

### Context Diagram Scope

Company settings that determine tax module behavior: calculation methods, rates, filing templates, and tax authority routing.

```
┌──────────────────────────────────────────────────────────────────┐
│           Company Settings to Tax Module Integration              │
│                                                                   │
│  ┌─────────────────┐     ┌──────────────────────────────────┐    │
│  │  CompanySettings │────►│  Tax Module Configuration       │    │
│  │                  │     │                                 │    │
│  │  TaxMethod       │────►│  VAT declaration template       │    │
│  │  TaxCalcMethod   │────►│  Tax line calculation           │    │
│  │  DecimalPlaces   │────►│  Tax amount rounding            │    │
│  │  TaxOfficeId     │────►│  Filing routing + headers       │    │
│  │  LegalReps[]     │────►│  Digital signature              │    │
│  │  VNeIDStatus     │────►│  Filing gate                    │    │
│  └─────────────────┘     └──────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Level-0 DFD

```
[CompanySettings]                   [Tax Module]
      │                                  │
      │─ TaxCalculationMethod ──────────► [VatCalculator]
      │   khauTru:                         │
      │     • VAT deductible tracked       │── InputTax → OutputTax → VAT Payable
      │     • Separate input/output taxes  │
      │   trucTiep:                        │
      │     • VAT = Revenue × Rate         │
      │     • No input tax tracking        │
      │                                  │
      │─ TaxMethod ──────────────────────► [VatCalculator]
      │   khauTruGTGT:                     │
      │     • Full VAT credit allowed      │
      │   trucTiepGTGT:                    │
      │     • No VAT credit                │
      │                                  │
      │─ DecimalPlaces (+) ──────────────► [RoundingService]
      │   RoundingMethod                   │
      │                                  │
      │─ AccountingRegime ───────────────► [TaxReportTemplate]
      │   TT99 → Form 01/GTGT (full)      │── Declaration template selection
      │   TT133 → Form 01/GTGT (simplified)│
      │                                  │
      │─ TaxOfficeId ────────────────────► [FilingRouter]
      │   Cục Thuế / Chi cục Thuế          │── Add to declaration header
      │                                  │   Route to correct tax portal
      │                                  │
      │─ LegalRepresentative[] ──────────► [DigitalSignService]
      │   DigitalCertSerial                │── Sign XML before submission
      │   DigitalCertProvider              │
      │                                  │
      │─ VNeIDStatus ────────────────────► [FilingGate]
      │   verified/not_registered          │── Block filing if not verified
      │                                  │
      ▼                                  ▼
  [Company]                       [TaxAuthorityAPI]
```

### Data Store Descriptions

**Store: CompanySettings** (same as DF-01)

**Store: TaxDeclaration** (in Tax Module, created using company settings)
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid | PK | |
| CompanyId | Guid | FK IX | |
| DeclarationType | string(20) | | GTGT, TNCN, TNDN, etc. |
| Period | string(7) | | e.g. "2026-07" |
| TaxMethod | int | | Snapshot of method at filing time |
| TaxOfficeCode | string(20) | | For header |
| SignedByLegalRepId | Guid | | Who signed |
| VNeIDVerifiedAt | DateTime | | When verified for this filing |

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 4.1 | TaxMethodConfig | CompanySettings → VatCalculator | `{ taxCalculationMethod, taxMethod, decimalPlaces, roundingMethod }` | On every tax calculation | ~200B |
| 4.2 | TaxOfficeConfig | CompanySettings → FilingRouter | `{ taxOfficeId, taxOfficeName, taxDepartment }` | Per declaration | ~200B |
| 4.3 | DigitalSignConfig | LegalRepresentative → DigitalSignService | `{ fullName, position, digitalCertSerial, digitalCertProvider }` | Per signature | ~500B |
| 4.4 | VNeIDGate | Company → FilingGate | `{ vneidStatus, lastVNeIDSyncAt }` | Per filing attempt | ~100B |
| 4.5 | RegimeHeader | CompanySettings → TaxReportTemplate | `{ accountingRegime }` | Per new period | ~50B |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Tax calculation | TaxCalculationMethod must match tax authority registration | Luật QLT 38/2019 Điều 42 | 422 Validation |
| VAT filing | Cannot file VAT if DecPlaces changes mid-period | TT 99/2025 Điều 8 | 403 Forbidden |
| Filing gate | VNeID status must be `Verified` for legal rep | NĐ 69/2024 Điều 14 | Block filing with message |
| Filing gate | Company status must not be `Dissolved` | Luật DN 2020 Điều 210 | 403 Forbidden |
| Filing gate | Digital certificate must not be expired | NĐ 23/2025 Điều 9 | Block signature |
| Declaration header | TaxOfficeCode is required for filing | TT 86/2024/TT-BTC | 422 Validation |
| Method snapshot | TaxMethod at filing time is frozen in declaration record | TT 99/2025 Điều 28 | Audit requirement |

---

## DF-05: Company Status → Module Access Control

### Context Diagram Scope

Company status (Active/Suspended/Dissolved/Bankrupt/Pending) gates all module operations. A status change propagates to every feature in every module.

```
┌──────────────────────────────────────────────────────────────────┐
│         Company Status → Module Access Control (System Boundary)  │
│                                                                   │
│  [Status Change Event] ──► [StatusEvaluator] ──► [AccessDecision]│
│                                                                    │
│  [Company Module] ──► [GL Module] ──► [Tax Module] ──► [AR/AP]   │
│           Permissions gated by company status                     │
└──────────────────────────────────────────────────────────────────┘
```

### Level-0 DFD

```
[User Action in any Module]
         │
         ▼
┌──────────────────────────────────┐
│  Module Controller / Command     │
│  Handler                         │
│                                  │
│  ┌────────────────────────────┐  │
│  │  CompanyStatusGate         │  │
│  │  (Middleware / Decorator)  │  │
│  │                            │  │
│  │  Reads: Company.Status     │───► [Company (data store)]
│  │                            │  │
│  │  Decision Matrix:          │  │
│  │  ┌──────────┬──────────┐  │  │
│  │  │ Status   │ Access   │  │  │
│  │  ├──────────┼──────────┤  │  │
│  │  │ Pending  │ Setup    │  │  │
│  │  │          │ only     │  │  │
│  │  ├──────────┼──────────┤  │  │
│  │  │ Active   │ Full     │  │  │
│  │  ├──────────┼──────────┤  │  │
│  │  │ Suspended│ Tax +    │  │  │
│  │  │          │ Payment  │  │  │
│  │  │          │ only     │  │  │
│  │  ├──────────┼──────────┤  │  │
│  │  │ Dissolved│ Read-    │  │  │
│  │  │          │ only     │  │  │
│  │  ├──────────┼──────────┤  │  │
│  │  │ Bankrupt │ Read-    │  │  │
│  │  │          │ only     │  │  │
│  │  └──────────┴──────────┘  │  │
│  └────────────────────────────┘  │
│                                  │
│         │ ALLOW / DENY           │
│         ▼                        │
│  ┌────────────────────────────┐  │
│  │  Command Handler / Action  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
         │
         ▼
[Status Change Trigger]
(Admin action, scheduler, automatic)
         │
         ▼
[Notification sink]
• Invalidate cached permissions
• Update UI banners
• Send alerts to affected users
• Log status change to audit

```

### Data Store Descriptions

**Store: Company** (Status field — same as DF-01)

**Store: StatusChangeLog** (audit trail)
| Field | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| CompanyId | Guid FK IX | |
| OldStatus | int | Previous status |
| NewStatus | int | New status |
| Reason | string(1000) | Mandatory reason |
| ChangedByUserId | string | Who triggered |
| ChangedAt | DateTime | |
| EffectiveDate | Date | When status takes effect |
| DocumentRef | string | Reference to dissolution resolution, court order, etc. |

Indexes:
- PK: `Id`
- IX: `CompanyId`, `ChangedAt`

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 5.1 | StatusRead | CompanyStatusGate → Company | SELECT Status WHERE Id = companyId | On every write operation | ~50B |
| 5.2 | AccessDecision | StatusGate → Controller | `{ permitted: bool, reason: string, module: string }` | On every write operation | ~100B |
| 5.3 | StatusChange | Admin → Company | UPDATE Status + INSERT StatusChangeLog | Rare: ~1-5x per company/year | ~500B |
| 5.4 | CacheInvalidation | StatusChange → Redis (or MemoryCache) | DELETE cache key `company:{id}:access` | On status change | ~50B |
| 5.5 | StatusAlert | StatusChange → NotificationService | `{ companyId, oldStatus, newStatus, reason }` | On status change | ~500B |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Status gate | Active → full access | BR-CL-01 | N/A (allowed) |
| Status gate | Suspended → only Tax + Payment write ops permitted | Luật DN 2020 Điều 210 | 403 Forbidden + message |
| Status gate | Dissolved → all write ops rejected | Luật DN 2020 Điều 210 | 403 Forbidden + message |
| Status gate | Pending → only setup ops permitted | Internal | 403 Forbidden |
| Status transition | Only valid state transitions allowed (DF-01 state machine) | Luật DN 2020 Điều 206-210 | 422 Validation |
| Status transition | Block Active→Dissolved without dissolution workflow completed | Luật DN 2020 Điều 207-208 | 422 Validation with checklist |
| Status transition | Suspension limit: 2 years + 1 year extension max | Luật DN 2020 Điều 206 | 422 Validation |
| Status change | Reason required for all status changes | TT 99/2025 Điều 28 | 422 Validation |

### Access Decision Matrix (Complete)

| Module / Feature | Active | Suspended | Dissolved | Bankrupt | Pending |
|---|---|---|---|---|---|
| Company Profile (read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Company Profile (write) | ✅ | ❌ | ❌ | ❌ | ✅ |
| GL Journal Entry (create) | ✅ | ❌ | ❌ | ❌ | ❌ |
| GL Journal Entry (read) | ✅ | ✅ | ✅ | ✅ | ❌ |
| GL Period Close | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tax Declaration (create) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tax Declaration (submit) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invoice (create) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invoice (read) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Payment (create) | ✅ | ✅ (tax only) | ❌ | ❌ | ❌ |
| Bank Transaction | ✅ | ❌ | ❌ | ❌ | ❌ |
| Report (financial) | ✅ | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ✅ |
| Company Setup/Wizard | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## DF-06: VNeID Registration Data Flow

### Context Diagram Scope

End-to-end flow for registering a company's digital identity via VNeID (Bộ Công An) and propagating that registration to enable tax e-transactions.

```
┌──────────────────────────────────────────────────────────────────────┐
│                   VNeID Registration Flow (System Boundary)           │
│                                                                       │
│  User → System → VNeID API (BCA) → System → Tax Portal              │
│                                                                       │
│  1. User initiates registration                                       │
│  2. System redirects to VNeID OAuth                                   │
│  3. User authenticates via VNeID app                                  │
│  4. VNeID returns org identity token                                  │
│  5. System stores org e-ID + verifies status                          │
│  6. System activates tax filing capability                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Level-0 DFD

```
[User / Legal Rep]                [VNeID Platform (Bộ Công An)]
      │                                      │
      │                                       │
      │  ┌────────────────────────┐          │
      ├──│  1. InitiateRegistration│          │
      │  │  { companyId,           │          │
      │  │    legalRepId }         │          │
      │  └───────────┬────────────┘          │
      │              ▼                       │
      │  ┌────────────────────────┐          │
      │  │  2. Redirect to VNeID  │─────────►│
      │  │  OAuth authorize URL   │   Auth   │
      │  │  { clientId,           │  Request │
      │  │    redirectUri,        │          │
      │  │    state, scope }      │          │
      │  └────────────────────────┘          │
      │                                      │
      │  ◄── 3. User authenticates ──────────┤
      │        on VNeID mobile app            │
      │        (enter PIN / biometric)        │
      │                                      │
      │  ◄── 4. Auth code callback ──────────┤
      │        authorization_code             │
      │                                      │
      ▼                                      ▼
  ┌─────────────────────────────────────────────────────┐
  │              VNeID Integration Service                │
  │                                                       │
      │                                      │
      │── 5. POST /token ──────────────────►│
      │   { code, clientSecret,             │  Access token exchange
      │     redirectUri }                   │
      │                                      │
      │◄── 6. Access token ─────────────────┤
      │   { access_token,                   │
      │     refresh_token, expires_in }     │
      │                                      │
      │── 7. GET /api/organization/info ────►│
      │   Authorization: Bearer <token>       │  Fetch org identity
      │                                      │
      │◄── 8. Organization info ────────────┤
      │   {                                  │
      │     orgId, enterpriseCode,          │
      │     orgName, address,               │
      │     legalRepVNeIDId,                │
      │     digitalCertStatus,              │
      │     verificationStatus              │
      │   }                                 │
      │                                      │
  ┌──────────────────────────────────────────┴────────┐
  │                 Data Transformation                 │
  │                                                     │
  │  9. Map VNeID fields → Company fields              │
  │     VNeID orgId → Company.VNeIDOrganizationId      │
  │     verificationStatus → Company.VNeIDStatus       │
  │     Sync timestamp → Company.LastVNeIDSyncAt       │
  │                                                     │
  │  10. Verify legal rep match:                        │
  │      VNeID legalRepVNeIDId matches                  │
  │      LegalRepresentative.VNeIDNumber                │
  └────────────────────────────────────────────────────┘
      │                                      │
      │── 11. POST /api/permissions ────────►│
      │   { orgId, taxCode,                 │  Delegate tax permissions
      │     accountantVNeIDIds[],           │
      │     permissions: ["TAX_DECLARE",    │
      │       "TAX_PAY", "TAX_LOOKUP"] }    │
      │                                      │
      │◄── 12. Permission result ───────────┤
      │   { status: "GRANTED",             │
      │     effectiveAt: DateTime }          │
      │                                      │
      │── 13. GET /api/tax/status ──────────►│
      │   { taxCode }                        │  Verify tax portal access
      │                                      │
      │◄── 14. Tax portal status ───────────┤
      │   { canAccessETax: bool,            │
      │     registrationDate,               │
      │     linkedAccounts[] }              │
      │                                      │
      ▼                                      ▼
  ┌────────────┐                    ┌──────────────────┐
  │  Company   │                    │ TaxAuthorityAPI  │
  │  (VNeID    │                    │ (thuedientu.gdt  │
  │   fields)  │                    │  .gov.vn)        │
  └────────────┘                    └──────────────────┘
```

### Data Store Descriptions

**Store: Company** (VNeID-specific fields — from DF-01)

**Store: VNeIDRegistrationAttempt** (audit)
| Field | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| CompanyId | Guid FK IX | |
| LegalRepId | Guid FK | Who initiated |
| VNeIDAuthCode | string(500) | Authorization code (encrypted) |
| VNeIDAccessToken | string(1000) | Access token (encrypted, short TTL) |
| VNeIDOrgId | string(50) | Received from VNeID |
| AttemptedAt | DateTime | |
| Status | int | Initiated/Completed/Failed |
| ErrorMessage | string(1000) | On failure |
| IpAddress | string(45) | |
| UserAgent | string(500) | |

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 6.1 | InitiateRegistration | User → VNeIDService | `{ companyId, legalRepId }` | Once per company | ~200B |
| 6.2 | OAuthAuthorizeRedirect | VNeIDService → User (→ VNeID) | HTTP 302: VNeID authorize URL with params | Once per registration | ~500B |
| 6.3 | AuthCodeCallback | VNeID → VNeIDService | HTTP callback: `{ code, state }` | Once per registration | ~200B |
| 6.4 | TokenExchange | VNeIDService → VNeID API | POST: `{ grant_type=authorization_code, code, client_secret, redirect_uri }` | Once per registration | ~500B |
| 6.5 | AccessToken | VNeID API → VNeIDService | JSON: `{ access_token, refresh_token, expires_in, token_type }` | Once per registration | ~1KB |
| 6.6 | FetchOrgInfo | VNeIDService → VNeID API | GET with Bearer token | Once per registration | ~200B |
| 6.7 | OrgInfo | VNeID API → VNeIDService | JSON: org identity data | Once per registration | ~2KB |
| 6.8 | UpdateCompanyVNeID | VNeIDService → Company | UPDATE VNeIDOrganizationId, VNeIDStatus, LastVNeIDSyncAt | Once per registration | ~200B |
| 6.9 | DelegateTaxPerms | VNeIDService → VNeID API | POST: accountant delegation | Once per registration | ~1KB |
| 6.10 | VerifyTaxAccess | VNeIDService → TaxAuthorityAPI | GET: verify tax portal linked | Once per registration | ~200B |
| 6.11 | TaxAccessResult | TaxAuthorityAPI → VNeIDService | JSON: `{ canAccessETax, registrationDate }` | Once per registration | ~500B |
| 6.12 | DailySync | Scheduler → VNeID API | GET: org status | Daily per company | ~200B |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Initiation | LegalRep must have VNeIDNumber matching 12-digit format | NĐ 69/2024 Điều 8 | 422 Validation |
| Initiation | LegalRep VNeIDNumber not already linked to another company | NĐ 69/2024 | 409 Conflict |
| Initiation | Company status must be Active or Pending | Internal | 403 Forbidden |
| OAuth callback | `state` parameter must match initiating session (CSRF protection) | OWASP | 401 Unauthorized |
| Token exchange | `client_secret` must match registered credential | OAuth 2.0 | 401 Unauthorized |
| Org info | VNeID returned org taxCode must match Company.TaxCode | NĐ 69/2024 Điều 8 | Block, manual review required |
| Legal rep match | VNeID legalRepVNeIDId must match at least one LegalRep.VNeIDNumber | NĐ 69/2024 Điều 14 | Block, manual review required |
| Tax access | Tax portal must confirm access before enabling filing | NĐ 69/2024 Điều 14 | Warning to user, partial activation |
| Daily sync | If sync fails 3 consecutive days, alert admin | Internal | Admin notification |

---

## DF-07: Company Information → Public Disclosure

### Context Diagram Scope

Regulatory requirement (NĐ 168/2025 Điều 35) to publish material company information changes to the National Business Registration Portal within 10 days (changed within 30 days). System tracks, notifies, and logs the disclosure lifecycle.

```
┌─────────────────────────────────────────────────────────────────────┐
│           Company Information → Public Disclosure (System Boundary)  │
│                                                                      │
│  [Company Info Change] → [Audit Log] → [Disclosure Tracker]         │
│                                          → [Notification]           │
│                                          → [Portal Sync]            │
└─────────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
[AuditLog Store]                             [National Business Portal]
                                      (dangkykinhdoanh.gov.vn)
```

### Level-0 DFD

```
[Company Admin]
      │
      │── 1. Update company info ──►
      │   { name, address, legalRep,
      │     charterCapital, businessLines }
      │
      ▼
  ┌────────────────────────────────────────────┐
  │  Company Aggregate Command Handler         │
  │                                            │
  │  ┌────────────────────────────────────┐    │
  │  │  2. Detect materially significant  │    │
  │  │     field changes                  │    │
  │  │                                   │    │
  │  │  Material fields (per NĐ 168/35): │    │
  │  │  • NameVietnamese                 │    │
  │  │  • HeadOfficeAddress              │    │
  │  │  • LegalRepresentative (change)   │    │
  │  │  • CharterCapital                 │    │
  │  │  • BusinessLines (primary change) │    │
  │  │  • CompanyType (conversion)       │    │
  │  └──────────────┬────────────────────┘    │
  │                 │                          │
  │                 ▼                          │
  │  ┌────────────────────────────────────┐    │
  │  │  3. Require correction reason      │    │
  │  └──────────────┬────────────────────┘    │
  │                 │                          │
  │                 ▼                          │
  │  ┌────────────────────────────────────┐    │
  │  │  4. Apply change (UPDATE)          │───► [Company (update)]
  │  └──────────────┬────────────────────┘    │
  │                 │                          │
  │                 ▼                          │
  │  ┌────────────────────────────────────┐    │
  │  │  5. Record audit trail             │───► [AuditLog]
  │  │  { entityId, property, oldValue,   │    │
  │  │    newValue, timestamp, userId,    │    │
  │  │    reason, changeType,             │    │
  │  │    requiresDisclosure: bool }      │    │
  │  └──────────────┬────────────────────┘    │
  │                 │                          │
  │                 ▼                          │
  │  ┌────────────────────────────────────┐    │
  │  │  6. Create DisclosureRecord        │───► [DisclosureRecord]
  │  │  { companyId, changeId,            │    │
  │  │    changeDescription,              │    │
  │  │    disclosureDeadline (T+10d),     │    │
  │  │    status: PENDING }              │    │
  │  └──────────────┬────────────────────┘    │
  │                 │                          │
  │                 ▼                          │
  │  ┌────────────────────────────────────┐    │
  │  │  7. Schedule notification          │───► [NotificationService]
  │  │  • Immediate: "Disclosure required  │    │  Send to admin / legal rep
  │  │     within 10 days"                │    │
  │  │  • T+5: Reminder                   │    │
  │  │  • T+9: Urgent reminder            │    │
  │  │  • T+11: Overdue alert             │    │
  │  └────────────────────────────────────┘    │
  │                                            │
  └────────────────────────────────────────────┘
         │
         │── 8. ConfirmDisclosure (manual) ──►
         │   User marks "Published on Portal"
         │
         ▼
  ┌────────────────────────────────────────────┐
  │  9. DisclosureConfirmHandler               │──► [DisclosureRecord (UPDATE)]
  │  { confirmedAt, confirmedBy,               │
  │    portalReferenceNumber,                   │
  │    proofUrl }                              │
  └────────────────────────────────────────────┘
```

### Data Store Descriptions

**Store: Company** (same as DF-01)

**Store: AuditLog** (entity change tracking)
| Field | Type | Index | Notes |
|---|---|---|---|
| Id | Guid PK | | |
| EntityName | string(100) | IX | "Company" |
| EntityId | Guid | IX | Company.Id |
| PropertyName | string(100) | | e.g. "NameVietnamese" |
| OldValue | string(MAX) | | Serialized |
| NewValue | string(MAX) | | Serialized |
| ChangedAt | DateTime | IX | |
| ChangedByUserId | string | IX | |
| Reason | string(1000) | | Mandatory for material fields |
| ChangeType | string(50) | | Create/Update/Delete/StatusChange |
| RequiresDisclosure | bool | IX | Per NĐ 168/2025 Điều 35 |
| IpAddress | string(45) | | |
| UserAgent | string(500) | | |

Indexes:
- PK: `Id`
- IX: `EntityName + EntityId`, `ChangedAt`, `RequiresDisclosure`, `ChangedByUserId`

**Store: DisclosureRecord**
| Field | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| CompanyId | Guid FK IX | |
| AuditLogId | Guid FK | Reference to triggering audit entry |
| ChangeDescription | string(2000) | Human-readable description |
| DisclosureDeadline | DateTime | CreatedAt + 10 calendar days |
| Status | int | Pending/Confirmed/Overdue/Exempt |
| ConfirmedAt | DateTime | Nullable |
| ConfirmedByUserId | string | Nullable |
| PortalReferenceNumber | string(100) | Nullable — number on national portal |
| ProofUrl | string(1000) | Nullable — screenshot or confirmation |
| OverdueNotifiedAt | DateTime | Nullable |

Indexes:
- PK: `Id`
- IX: `CompanyId`, `Status`, `DisclosureDeadline`

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 7.1 | CompanyUpdateWithReason | User → CommandHandler | `{ property, value, reason }` | On material field edit | ~1KB |
| 7.2 | DetectMaterialChange | CommandHandler → AuditLog | `{ entityName, entityId, property, oldValue, newValue, requiresDisclosure }` | On material field edit | ~2KB |
| 7.3 | CreateDisclosureRecord | CommandHandler → DisclosureRecord | `{ companyId, auditLogId, changeDescription, deadline = T+10d, status = Pending }` | On material field edit | ~500B |
| 7.4 | DisclosureNotification | CommandHandler → NotificationService | `{ companyId, deadline, changeDescription, recipients: [admin, legalRep] }` | Immediate + T+5 + T+9 | ~500B |
| 7.5 | ConfirmDisclosure | User → DisclosureRecord | `{ disclosureId, portalRef, proofUrl }` | Within 30 days per NĐ 168 | ~500B |
| 7.6 | OverdueAlert | Scheduler (daily) → NotificationService | Query: `Status=Pending AND Deadline < Today` | Daily batch | ~200B per record |

### Validation Rules

| Boundary | Rule | Law Reference | Action on Failure |
|---|---|---|---|
| Update initiation | Only CompanyAdmin role can update material fields | BR-SC-01 | 403 Forbidden |
| Update initiation | Reason field mandatory for all material fields | TT 99/2025 Điều 28 | 422 Validation |
| Material detection | Fields defined as material: name, address, legal rep, capital, business lines, company type | NĐ 168/2025 Điều 35 | Auto-detected |
| Disclosure deadline | Deadline = change timestamp + 10 calendar days | NĐ 168/2025 Điều 35 | System-calculated |
| Overdue status | If not confirmed by deadline + 30 days, escalate to Chief Accountant | NĐ 168 Điều 35 | Escalation notification |
| Confirmation | At least portalReferenceNumber or proofUrl required | NĐ 168/2025 | 422 Validation |
| Confirmation | Legal rep change requires additional OTP verification (per BR-SC-03) | NĐ 168/2025 Điều 35 | Block confirmation without 2FA |

---

## DF-08: Multi-Company Data Isolation Flow

### Context Diagram Scope

Data isolation boundary enforced at every data access point. Every tenant-scoped query includes a `CompanyId` filter derived from the authenticated user's session context.

```
┌──────────────────────────────────────────────────────────────────┐
│              Multi-Company Data Isolation (System Boundary)       │
│                                                                   │
│  [User with JWT] → [TenantResolver] → [QueryFilter]              │
│                                         → [Data Store]            │
│                                         → [Isolation Boundary]   │
│                                                                   │
│  All modules: GL, AR, AP, Tax, Inventory, Reporting               │
│  Every query: WHERE CompanyId = @activeCompanyId                  │
└──────────────────────────────────────────────────────────────────┘
```

### Level-0 DFD

```
[User Browser]
      │
      │── 1. HTTP Request ──►
      │   Authorization: Bearer <JWT>
      │
      ▼
  ┌──────────────────────────────────────┐
  │  AuthMiddleware                      │
  │  • Validate JWT                     │
  │  • Extract claims: sub, companyId   │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  CompanyContextMiddleware            │
  │                                      │
  │  2. Resolve active company           │
  │     From JWT claim: 'companyId'      │
  │     OR from header: X-Company-Id     │
  │     OR from query param: ?companyId  │
  │                                      │
  │  3. Validate user belongs to company │
  │     SELECT 1 FROM UserCompany        │
  │     WHERE UserId = sub               │
  │       AND CompanyId = companyId      │
  │       AND Company.Status != Dissolved│
  │                                      │
  │  4. Set HttpContext.Items["Company"] │
  │     = { Id, Status, Settings }      │
  │                                      │
  │  5. Validate company can perform     │
  │     operation (status gate DF-05)    │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  Query Execution (any module)        │
  │                                      │
  │  ┌──────────────────────────────────┐│
  │  │  EF Core QueryInterceptor        ││
  │  │  │                               ││
  │  │  │  All tenant-scoped entities   ││
  │  │  │  have CompanyId column        ││
  │  │  │                               ││
  │  │  │  Interceptor adds:            ││
  │  │  │  .Where(e => e.CompanyId      ││
  │  │  │    == activeCompanyId)        ││
  │  │  │                               ││
  │  │  │  Applied globally to:         ││
  │  │  │  • JournalEntry               ││
  │  │  │  • Invoice                    ││
  │  │  │  • Payment                    ││
  │  │  │  • TaxDeclaration             ││
  │  │  │  • ChartOfAccount             ││
  │  │  │  • Customer, Vendor           ││
  │  │  │  • Inventory, Product         ││
  │  │  │  • Report, Budget             ││
  │  │  └──────────────────────────────┘│
  │  └──────────────────────────────────┘
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  Data Stores                         │
  │                                      │
  │  ┌─────────────────────────┐         │
  │  │  Isolation Boundary ——— │         │
  │  │  CompanyId on every     │         │
  │  │  tenant-scoped table    │         │
  │  │                         │         │
  │  │  CompanyA: rows with    │         │
  │  │  CompanyId = A          │         │
  │  │  CompanyB: rows with    │         │
  │  │  CompanyId = B          │         │
  │  │  ...each isolated       │         │
  │  └─────────────────────────┘         │
  │                                      │
  │  Tenant-agnostic tables              │
  │  (shared across companies):          │
  │  • ApplicationUser                   │
  │  • Role, Permission                  │
  │  • AuditLog (via CompanyId field)    │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │  Company Switcher Flow               │
  │                                      │
  │  [User] → POST /api/user/switch      │
  │    { companyId }                     │
  │       │                              │
  │       ▼                              │
  │  Validate UserCompany exists         │
  │       │                              │
  │       ▼                              │
  │  Issue new JWT with updated          │
  │  'companyId' claim                   │
  │       │                              │
  │       ▼                              │
  │  Client updates stored token         │
  │  Subsequent requests use new JWT     │
  └──────────────────────────────────────┘
```

### Data Store Descriptions

**Store: UserCompany** (same as DF-01)

**Tenant-scoped entities (all modules) — partial list:**

| Entity | Module | CompanyId Column |
|---|---|---|
| JournalEntry | GL | CompanyId FK |
| JournalEntryLine | GL | (via JE) |
| GLPeriod | GL | CompanyId FK |
| ChartOfAccount | GL | CompanyId FK |
| Invoice | AR/AP | CompanyId FK |
| InvoiceLine | AR/AP | (via Invoice) |
| Payment | AR/AP | CompanyId FK |
| Customer | AR | CompanyId FK |
| Vendor | AP | CompanyId FK |
| TaxDeclaration | Tax | CompanyId FK |
| TaxDeclarationLine | Tax | (via TD) |
| InventoryItem | Inventory | CompanyId FK |
| Warehouse | Inventory | CompanyId FK |
| Product | Inventory | CompanyId FK |
| Budget | GL | CompanyId FK |
| Report | Reporting | CompanyId FK |
| CompanyDocument | Company | CompanyId FK |
| CompanyLicense | Company | CompanyId FK |
| CompanyBankAccount | Company | CompanyId FK |
| Branch | Company | CompanyId FK |
| AuditLog | System | CompanyId FK (nullable for system-level events) |

### Data Flow Descriptions

| Flow # | Name | Source → Target | Format | Frequency | Volume |
|---|---|---|---|---|---|
| 8.1 | Authenticate | User → AuthMiddleware | JWT: `{ sub, companyId, permissions }` | Every request | ~1KB |
| 8.2 | ResolveContext | AuthMiddleware → CompanyContextMiddleware | `{ userId, companyId }` | Every request | ~100B |
| 8.3 | ValidateMembership | CompanyContextMiddleware → UserCompany | SELECT 1 WHERE UserId AND CompanyId | Every request (cached 5 min) | ~50B |
| 8.4 | SetContext | CompanyContextMiddleware → HttpContext.Items | `{ companyId, status, settings }` | Every request | ~500B |
| 8.5 | ApplyFilter | QueryInterceptor → EF Query | `.Where(e => e.CompanyId == activeCompanyId)` | Every query | 0B (expression) |
| 8.6 | SwitchCompany | User → /api/user/switch | `{ companyId }` | Rare: ~1-5x/day per user | ~200B |
| 8.7 | NewJwt | SwitchHandler → Client | `{ accessToken, refreshToken }` | On switch | ~2KB |
| 8.8 | StatusGateCheck | Middleware → Company.Status | SELECT Status (cached) | Every request | ~50B |

### Validation Rules

| Boundary | Rule | Source | Action on Failure |
|---|---|---|---|
| JWT validation | Token must contain valid `companyId` claim | Internal | 401 Unauthorized |
| Membership check | UserCompany record must exist and be active | BR-OP-01 | 403 Forbidden — "User not associated with company" |
| Status gate | Company status must permit requested operation | DF-05 matrix | 403 Forbidden — specific message per DF-05 |
| Query isolation | All tenant-scoped queries must include CompanyId WHERE | TT 99/2025 Điều 28 | Security audit — query without CompanyId = incident |
| Cross-company access | No endpoint may accept a different CompanyId than the JWT claim | Internal | 403 Forbidden — mismatched company context |
| Switch context | Switch target CompanyId must have UserCompany record | BR-OP-01 | 403 Forbidden — no membership |
| Switch context | Switch target company must not be Dissolved | Internal | 403 Forbidden — company dissolved |
| Data export | Export filters must include CompanyId | Internal | 422 Validation |

### Isolation Boundary Enforcement Points

| Layer | Enforcement | Bypass Risk |
|---|---|---|
| JWT claim | `companyId` signed in token | Low — token tampering detected by signature |
| Middleware | CompanyContextMiddleware validates membership every request | Low — runs on every request before controller |
| Query interceptor | EF Core interceptor appends `.Where(e.CompanyId == x)` | Medium — interceptor can be disabled in raw SQL |
| Repository | All repository methods accept `companyId` param | Medium — caller could pass wrong value |
| Database FK | `CompanyId` FK constraint prevents orphaned rows | Low — no bypass possible |
| Database row-level security (optional) | PostgreSQL RLS / SQL Server predicate | Low — at database level, bypass requires direct DB access |
| Audit | All queries logged with company context | Medium — detection, not prevention |

---

## Appendix A: Data Flow Dependency Matrix

| Flow | Depends On | Required By |
|---|---|---|
| DF-01: Company Setup | — (root) | DF-03, DF-04, DF-05, DF-07, DF-08 |
| DF-02: Tax Code Verification | DF-01 (during setup) | DF-01 (validation step) |
| DF-03: Settings → GL | DF-01 (setup complete) | GL module initialization |
| DF-04: Settings → Tax | DF-01 (setup complete) | Tax module initialization |
| DF-05: Status → Access | DF-01 (company exists) | All modules (write gate) |
| DF-06: VNeID Registration | DF-01 (legal reps exist) | DF-04 (filing gate), Tax module |
| DF-07: Public Disclosure | DF-01 (company exists) | Compliance reporting |
| DF-08: Data Isolation | DF-01 (UserCompany) | All modules (query scope) |

## Appendix B: External API Reference Summary

| External System | API Base URL | Used By | Auth Method |
|---|---|---|---|
| National Business Registration Portal | `dangkykinhdoanh.gov.vn` | DF-01, DF-07 | API key + certificate |
| Tax Authority Tax Code Lookup | `thuedientu.gdt.gov.vn` | DF-02 | API key |
| VNeID Platform (Bộ Công An) | `vneid.gov.vn` | DF-06 | OAuth 2.0 + client secret |
| Tax Authority e-Tax Portal | `thuedientu.gdt.gov.vn` | DF-06 | VNeID token |

## Appendix C: Regulatory Compliance Mapping

| Law Reference | Requirement | Covered In |
|---|---|---|
| NĐ 168/2025/NĐ-CP Điều 5 | Enterprise code format | DF-01 validation rules |
| NĐ 168/2025/NĐ-CP Điều 28 | Internal control over company info | DF-08 isolation, DF-05 access gate |
| NĐ 168/2025/NĐ-CP Điều 35 | Public disclosure within 10 days (changed 30 days) | DF-07 |
| NĐ 168/2025/NĐ-CP Điều 41 | VNeID for tax transactions | DF-06 |
| TT 99/2025/TT-BTC Điều 5 | Fiscal year start month | DF-03 |
| TT 99/2025/TT-BTC Điều 6 | Base currency VND | DF-03 |
| TT 99/2025/TT-BTC Điều 8 | Decimal places / rounding | DF-03, DF-04 |
| TT 99/2025/TT-BTC Điều 10 | Department management | DF-03 |
| TT 99/2025/TT-BTC Điều 12 | Tax calculation method | DF-04 |
| TT 99/2025/TT-BTC Điều 25 | Inventory method | DF-04 |
| TT 99/2025/TT-BTC Điều 28 | Audit trail for changes | DF-07 |
| TT 99/2025/TT-BTC Điều 29 | Period close enforcement | DF-03 |
| NĐ 69/2024/NĐ-CP Điều 8 | Organization digital identity | DF-06 |
| NĐ 69/2024/NĐ-CP Điều 14 | VNeID for tax e-transactions | DF-06 |
| Luật DN 2020 Điều 12-13 | Legal representatives (1..N) | DF-01 validation |
| Luật DN 2020 Điều 29 | Enterprise code | DF-01 validation |
| Luật DN 2020 Điều 37-38 | Company name rules | DF-01 validation |
| Luật DN 2020 Điều 46, 74 | Charter capital | DF-01 validation |
| Luật DN 2020 Điều 206-210 | Company lifecycle | DF-05 |
| NĐ 23/2025/NĐ-CP Điều 9 | Digital signature | DF-04, DF-06 |
| Luật QLT 38/2019 Điều 30 | Tax code format | DF-02 |
| Luật QLT 38/2019 Điều 42 | Tax method matching | DF-04 |

---

*End of document — 8 data flow diagrams for Company Module*
