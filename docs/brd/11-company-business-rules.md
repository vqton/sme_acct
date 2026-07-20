# Business Rules — Company Module

> Vietnamese SME Accounting System
> Law references: Luật Doanh nghiệp 2020 (DN 2020), NĐ 168/2025/NĐ-CP, TT 99/2025/TT-BTC, NĐ 69/2024/NĐ-CP, Luật Kế toán 88/2015, NĐ 23/2025/NĐ-CP, NĐ 01/2021/NĐ-CP, Thông tư 133/2016/TT-BTC, Luật Quản lý thuế 38/2019

---

## Company Identity

## BR-CI-01: Enterprise Code Format

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Enterprise code must be a 10-digit numeric string issued by the business registration authority (Sở Kế hoạch và Đầu tư). |
| Expression | IF Mã số doanh nghiệp is provided THEN it must match regex `^\d{10}$` |
| Source | Luật Doanh nghiệp 2020, Điều 29; NĐ 01/2021/NĐ-CP, Điều 5 |
| Severity | Critical |
| Validation Point | UI, API, DB |

## BR-CI-02: Tax Code Validation

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Tax code must be 10 digits or 13 digits (10-digit code + 3-digit suffix for branches/secondary establishments). |
| Expression | IF TaxCode is provided THEN TaxCode MUST MATCH `^\d{10}(-\d{3})?$` AND checksum digit (position 10) must validate against the first 9 digits per Tổng cục Thuế algorithm |
| Source | Luật Quản lý thuế 38/2019, Điều 30; TT 105/2020/TT-BTC, Điều 5 |
| Severity | Critical |
| Validation Point | UI, API |

## BR-CI-03: Company Name Uniqueness

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | No two active companies in the system may share the same registered enterprise name. |
| Expression | IF Name is created or updated THEN system MUST query existing active companies and REJECT duplicate Name (case-insensitive, whitespace-normalized) |
| Source | Luật Doanh nghiệp 2020, Điều 38 |
| Severity | Critical |
| Validation Point | API, DB |

## BR-CI-04: Company Name Character Set

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Company name in Vietnamese must use Vietnamese alphabet (including diacritics), plus F, J, Z, W, numerals, and permitted punctuation (., -, +). |
| Expression | IF Name is Vietnamese-language name THEN it MUST contain only: characters from bảng chữ cái tiếng Việt, F, J, Z, W, digits 0-9, and symbols ., -, + |
| Source | Luật Doanh nghiệp 2020, Điều 37, Khoản 1 |
| Severity | High |
| Validation Point | UI, API |

## BR-CI-05: Foreign Name Font Size

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | When displaying a bilingual name, the Vietnamese company name font size must exceed the foreign-language name font size. |
| Expression | IF both Vietnamese name and foreign name are displayed THEN font-size(Vietnamese name) > font-size(foreign name) |
| Source | Luật Doanh nghiệp 2020, Điều 37, Khoản 3; NĐ 01/2021/NĐ-CP, Điều 18 |
| Severity | Medium |
| Validation Point | UI |

## BR-CI-06: Prohibited Company Names

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Company name must not be identical or confusingly similar to a state agency name, unit of armed forces, or violate national traditions, history, culture, or ethics. |
| Expression | IF Name matches a prohibited term in the blocklist (tên cơ quan nhà nước, đơn vị vũ trang, từ ngữ vi phạm thuần phong mỹ tục) THEN REJECT with specific error message |
| Source | Luật Doanh nghiệp 2020, Điều 38, Khoản 2 |
| Severity | Critical |
| Validation Point | API |

## BR-CI-07: Company Type Selection

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Every company must declare its legal type from the enumerated list: Công ty TNHH 1TV, Công ty TNHH 2TV, Công ty Cổ phần, Công ty Hợp danh, Doanh nghiệp tư nhân. |
| Expression | IF Company is created THEN CompanyType MUST NOT be null AND MUST be one of the 5 enumerated types |
| Source | Luật Doanh nghiệp 2020, Điều 19-24 |
| Severity | Critical |
| Validation Point | UI, API, DB |

## BR-CI-08: Chartered Capital Minimum

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Chartered capital (vốn điều lệ) must meet the legal minimum for each company type (Công ty TNHH, Cổ phần: no statutory minimum in most sectors; however, regulated industries require higher minimums). For all types, Vốn điều lệ >= 0 VND. |
| Expression | IF Loại hình doanh nghiệp is Công ty TNHH or Công ty Cổ phần AND ngành nghề is regulated (banking, insurance, securities, auditing) THEN Vốn điều lệ MUST >= ngành nghề quy định mức vốn pháp định |
| Source | Luật Doanh nghiệp 2020, Điều 46, 74; Nghị định các ngành nghề đầu tư kinh doanh có điều kiện |
| Severity | Critical |
| Validation Point | UI, API |

## BR-CI-09: Minimum One Legal Representative

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Every company must have at least one legal representative (người đại diện theo pháp luật) at all times. |
| Expression | IF Company is active THEN LegalRepresentative MUST NOT be null OR empty AND at least one UserCompany with IsLegalRep = true MUST exist |
| Source | Luật Doanh nghiệp 2020, Điều 12, 13 |
| Severity | Critical |
| Validation Point | UI, API, DB |

## BR-CI-10: Legal Representative Eligibility

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Legal representative must not be an ineligible person per Điều 17 Luật Doanh nghiệp 2020 (e.g., current civil servant, person with limited legal capacity, person convicted of specified crimes without rehabilitation). |
| Expression | IF user is assigned as Legal Representative THEN system MUST verify user has no disqualifying attributes per Điều 17 DN 2020 |
| Source | Luật Doanh nghiệp 2020, Điều 17 |
| Severity | Critical |
| Validation Point | API |

---

## Company Settings

## BR-CS-01: Fiscal Year Start Month

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Fiscal year start month must be an integer between 1 and 12 inclusive. |
| Expression | IF FiscalYearStartMonth is set THEN it MUST be >= 1 AND <= 12 |
| Source | Luật Kế toán 88/2015, Điều 12; TT 99/2025/TT-BTC, Điều 5 |
| Severity | High |
| Validation Point | UI, API, DB |

## BR-CS-02: Default Currency

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | The base accounting currency must be VND (Việt Nam Đồng). Multi-currency accounting is an optional extension. |
| Expression | IF CurrencyCode is set AND system is in single-currency mode THEN CurrencyCode MUST equal "VND" |
| Source | TT 99/2025/TT-BTC, Điều 6; Luật Kế toán 88/2015, Điều 11 |
| Severity | High |
| Validation Point | API, DB |

## BR-CS-03: Decimal Places Constraint

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Number of decimal places for currency amounts must be between 0 and 6 inclusive. |
| Expression | IF DecimalPlaces is set THEN DecimalPlaces >= 0 AND DecimalPlaces <= 6 |
| Source | TT 99/2025/TT-BTC, Điều 8 (quy định làm tròn số) |
| Severity | Medium |
| Validation Point | UI, API, DB |

## BR-CS-04: Accounting Regime Declaration

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | Every company must declare its accounting regime: Thông tư 99/2025/TT-BTC (new regime) or Thông tư 133/2016/TT-BTC (small/medium enterprises). |
| Expression | IF Company is created THEN AccountingRegime MUST be selected: "TT99" or "TT133" |
| Source | TT 99/2025/TT-BTC, Điều 1; TT 133/2016/TT-BTC, Điều 1 |
| Severity | Critical |
| Validation Point | UI, API |

## BR-CS-05: Inventory Method Immutable Mid-Year

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | Inventory calculation method (bình quân gia quyền, nhập trước xuất trước, nhập sau xuất trước, đích danh) cannot be changed during a fiscal year. |
| Expression | IF fiscal year is in progress (current date >= FiscalYearStart AND < next FiscalYearStart) THEN InventoryMethod MUST NOT be modified |
| Source | TT 99/2025/TT-BTC, Điều 25; Chuẩn mực kế toán Việt Nam VAS 02 |
| Severity | High |
| Validation Point | API |

## BR-CS-06: Tax Method Matches Authority Registration

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | The tax calculation method (phương pháp khấu trừ or phương pháp trực tiếp) must match the method registered with the tax authority (Cơ quan thuế). |
| Expression | IF TaxMethod is configured THEN TaxMethod MUST equal the method registered on file with Mã số thuế at Tổng cục Thuế |
| Source | Luật Quản lý thuế 38/2019, Điều 42; NĐ 68/2026/NĐ-CP, Điều 3 |
| Severity | Critical |
| Validation Point | API |

## BR-CS-07: Multi-Currency Requires Addon Configuration

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Enabling multi-currency requires additional configuration: at least one foreign currency code, exchange rate source, and exchange rate update frequency. |
| Expression | IF EnableMultiCurrency = true THEN (CurrencyCode list MUST contain "VND" AND at least one foreign currency AND ExchangeRateSource MUST be defined AND ExchangeRateUpdateFrequency MUST be defined) |
| Source | TT 99/2025/TT-BTC, Điều 6, Khoản 2; Chuẩn mực kế toán VAS 10 |
| Severity | Medium |
| Validation Point | UI, API |

## BR-CS-08: Department Management Setting Influences Transaction Screens

| Field | Value |
|-------|-------|
| Category | Process |
| Description | When EnableDepartmentManagement is enabled, all journal entry, invoice, and payment screens MUST require a department (phòng ban) selection. |
| Expression | IF EnableDepartmentManagement = true THEN all transaction entry forms MUST render Department field as required |
| Source | TT 99/2025/TT-BTC, Điều 10 (quy định chi tiết theo bộ phận) |
| Severity | Medium |
| Validation Point | UI |

---

## Company Lifecycle

## BR-CL-01: Status Transition Constraints

| Field | Value |
|-------|-------|
| Category | Process |
| Description | Company status transitions follow a defined state machine: [Pending] -> [Active] -> [Suspended] <-> [Active]; [Active] -> [Dissolved]; [Suspended] -> [Dissolved]. Direct Active->Dissolved is permitted only via the dissolution workflow. |
| Expression | IF status transition is requested THEN validate transition against allowed state machine: Pending→Active, Active→Suspended, Suspended→Active, Active→Dissolved, Suspended→Dissolved. Any other transition is REJECTED. |
| Source | Luật Doanh nghiệp 2020, Điều 207-210 |
| Severity | Critical |
| Validation Point | API |

## BR-CL-02: Suspension Period Limits

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | A company may be suspended (tạm ngừng kinh doanh) for a maximum of 2 consecutive years, with a one-time extension of up to 1 year. |
| Expression | IF Company status transitions to Suspended THEN suspension end date MUST NOT exceed start date + 2 years. IF extension is granted THEN total suspension MUST NOT exceed start date + 3 years. |
| Source | Luật Doanh nghiệp 2020, Điều 206; NĐ 01/2021/NĐ-CP, Điều 66 |
| Severity | High |
| Validation Point | API |

## BR-CL-03: Reactivation Requirements

| Field | Value |
|-------|-------|
| Category | Process |
| Description | Reactivation from Suspended state requires: (a) all outstanding tax declarations filed, (b) no overdue tax debt, (c) re-registration with business registration authority if suspension exceeded 1 year. |
| Expression | IF status transition Suspended→Active is requested THEN validate (tax declarations current) AND (tax debt = 0) AND (if suspension duration > 1 year THEN re-registration proof must be on file) |
| Source | Luật Doanh nghiệp 2020, Điều 206; Luật Quản lý thuế 38/2019, Điều 66 |
| Severity | Critical |
| Validation Point | API |

## BR-CL-04: Dissolution Prerequisites

| Field | Value |
|-------|-------|
| Category | Process |
| Description | Company dissolution (giải thể) requires: all debts settled, all tax obligations fulfilled, tax code locked with Cơ quan thuế, notice published on Cổng thông tin quốc gia về đăng ký doanh nghiệp. |
| Expression | IF status transition Active→Dissolved OR Suspended→Dissolved is requested THEN validate (no outstanding debts) AND (tax clearance certificate received) AND (tax code locked) AND (dissolution notice published >= 7 days on national portal) |
| Source | Luật Doanh nghiệp 2020, Điều 207, 208; NĐ 01/2021/NĐ-CP, Điều 75 |
| Severity | Critical |
| Validation Point | API |

## BR-CL-05: Status Affects All Module Access

| Field | Value |
|-------|-------|
| Category | Security |
| Description | All accounting operations are gated on company status. Dissolved companies are read-only. Suspended companies may only create tax declarations and payment transactions. Active companies have full access. |
| Expression | IF Company.IsActive = false THEN:
- IF status = Dissolved: ALL write operations REJECTED across all modules
- IF status = Suspended: only Tax and Payment write operations PERMITTED
- IF status = Pending: only setup/configuration operations PERMITTED |
| Source | Luật Doanh nghiệp 2020, Điều 210; TT 99/2025/TT-BTC, Điều 29 |
| Severity | Critical |
| Validation Point | API, UI |

---

## Security & Compliance

## BR-SC-01: Company Info Modification Authorization

| Field | Value |
|-------|-------|
| Category | Security |
| Description | Only users with the Admin role or CompanyAdmin permission can modify company information (Company entity + Settings). |
| Expression | IF user attempts to Create/Update/Delete Company OR CompanySettings THEN user MUST have role "Admin" OR permission "CompanyAdmin.Modify" |
| Source | NĐ 168/2025/NĐ-CP, Điều 28 (internal control requirements) |
| Severity | Critical |
| Validation Point | API, UI |

## BR-SC-02: Tax Code Change Audit Trail

| Field | Value |
|-------|-------|
| Category | Compliance |
| Description | Any change to the company tax code must be recorded in an immutable audit log capturing: old value, new value, timestamp, user ID, and reason. |
| Expression | IF TaxCode is updated THEN system MUST create AuditLog entry with: Entity="Company", Property="TaxCode", OldValue, NewValue, Timestamp=UTCNow, UserId, Reason |
| Source | TT 99/2025/TT-BTC, Điều 28; Luật Kế toán 88/2015, Điều 7 |
| Severity | High |
| Validation Point | API, DB |

## BR-SC-03: Legal Representative Change Verification

| Field | Value |
|-------|-------|
| Category | Security |
| Description | Changes to the legal representative require two-factor verification (OTP sent to existing representative's registered phone/email + confirmation from new representative). |
| Expression | IF LegalRepresentative field changes THEN system MUST require: (1) OTP verification from current LegalRepresentative AND (2) confirmation from new LegalRepresentative BEFORE persisting the change |
| Source | NĐ 168/2025/NĐ-CP, Điều 35; NĐ 69/2024/NĐ-CP, Điều 8 (VNeID verification) |
| Severity | Critical |
| Validation Point | API |

## BR-SC-04: Company Info Changes Must Be Published

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | Material changes to company registration information (name, address, legal representative, capital) must be published on Cổng thông tin quốc gia về đăng ký doanh nghiệp within 10 days and recorded in the system as published. |
| Expression | IF material Company field (Name, Address, LegalRepresentative, Vốn điều lệ) is updated THEN system MUST generate a published notification record AND trigger a reminder to complete publication within 10 days |
| Source | NĐ 168/2025/NĐ-CP, Điều 35; Luật Doanh nghiệp 2020, Điều 32 |
| Severity | High |
| Validation Point | API |

## BR-SC-05: VNeID Registration for Tax Filing

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | From 01/07/2025, legal representatives and chief accountants must register VNeID (định danh điện tử) for all tax e-transactions. The system must verify VNeID status before enabling tax filing features. |
| Expression | IF user attempts to access tax filing features THEN system MUST verify that LegalRepresentative and ChiefAccountant have active VNeID accounts (verified via API Tổng cục Thuế) |
| Source | NĐ 69/2024/NĐ-CP, Điều 8, 14; NĐ 168/2025/NĐ-CP, Điều 41 |
| Severity | Critical |
| Validation Point | API, UI |

## BR-SC-06: Document Retention Period

| Field | Value |
|-------|-------|
| Category | Compliance |
| Description | All accounting documents and electronic records must be retained for a minimum of 5 years from the end of the fiscal year in which they were created. |
| Expression | IF document reaches FiscalYear end date + 5 years THEN system MAY flag for archival deletion BUT MUST retain if: (a) document is involved in unresolved tax assessment, or (b) document relates to pending litigation, or (c) law specifies longer retention |
| Source | Luật Kế toán 88/2015, Điều 41; TT 99/2025/TT-BTC, Điều 28 |
| Severity | High |
| Validation Point | DB |

## BR-SC-07: E-Signature Requirements

| Field | Value |
|-------|-------|
| Category | Regulatory |
| Description | All electronic invoices, tax declarations, and financial reports must be signed with a qualified electronic signature (chữ ký số) registered with a certified CA (Tổ chức cung cấp dịch vụ chứng thực chữ ký số). |
| Expression | IF document type is e-invoice OR tax declaration OR financial report THEN sign MUST use qualified e-signature meeting NĐ 23/2025 standards AND certificate MUST be from a Tổ chức cung cấp dịch vụ chứng thực chữ ký số hợp pháp |
| Source | NĐ 23/2025/NĐ-CP, Điều 9, 12; Luật Giao dịch điện tử 2023, Điều 22 |
| Severity | Critical |
| Validation Point | API |

---

## Operational Rules

## BR-OP-01: User Multi-Company Membership

| Field | Value |
|-------|-------|
| Category | Process |
| Description | A user may belong to multiple companies via UserCompany records but may have only one active company at a time within a single session. |
| Expression | IF user is authenticated THEN user MUST have exactly one CurrentCompanyId (active session context). IF user switches company THEN active session context MUST be replaced. UserCompany records may have N entries but session context is always 1. |
| Source | Internal control; TT 99/2025/TT-BTC, Điều 28 (nguyên tắc phân tách dữ liệu) |
| Severity | High |
| Validation Point | API, UI |

## BR-OP-02: Mid-Fiscal-Year Settings Change Requires Approval

| Field | Value |
|-------|-------|
| Category | Process |
| Description | Changes to company settings that materially affect accounting (accounting regime, currency, decimal places, inventory method, tax method) during an active fiscal year require Chief Accountant approval. |
| Expression | IF current date is within an open fiscal year AND user modifies FiscalYearStartMonth, CurrencyCode, DecimalPlaces, AccountingRegime, InventoryMethod, or TaxMethod THEN system MUST require approval from user with Chief Accountant role BEFORE applying change |
| Source | TT 99/2025/TT-BTC, Điều 28, 29; Chuẩn mực kế toán VAS 01 |
| Severity | High |
| Validation Point | API |

## BR-OP-03: Branch Tax Code Format

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | A branch (chi nhánh) tax code must follow the format of the parent company's 10-digit tax code plus a hyphen and sequential 3-digit suffix. |
| Expression | IF company type is "Branch" THEN TaxCode MUST MATCH pattern `^\d{10}-\d{3}$` AND the first 10 digits MUST equal the parent company's tax code |
| Source | TT 105/2020/TT-BTC, Điều 5, Khoản 2; Luật Quản lý thuế 38/2019, Điều 30 |
| Severity | Critical |
| Validation Point | UI, API |

## BR-OP-04: Minimum One Bank Account for Payments

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Every active company must have at least one registered bank account to process payment transactions (chi trả, nộp thuế). |
| Expression | IF Company is Active AND user attempts a payment transaction THEN system MUST verify at least one BankAccount exists with IsActive = true for that CompanyId |
| Source | Luật Doanh nghiệp 2020, Điều 72 (thanh toán qua ngân hàng); TT 99/2025/TT-BTC, Điều 12 |
| Severity | High |
| Validation Point | API, UI |

## BR-OP-05: Business License Expiry Check

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | The business license (Giấy chứng nhận đăng ký doanh nghiệp) must not be expired. A warning must be displayed 90 days before expiry, and operations are blocked 30 days after expiry. |
| Expression | IF BusinessLicenseExpiryDate exists THEN:
- daysRemaining <= 90: display warning banner on dashboard
- daysRemaining < 0 (expired): REJECT all write operations except tax filing and license renewal
- expired > 30 days: REJECT all operations including login for Admin users |
| Source | Luật Doanh nghiệp 2020, Điều 29 (hiệu lực Giấy chứng nhận ĐKDN) |
| Severity | High |
| Validation Point | API, UI |

---

## Appendix

### Company Status State Machine

```
[Pending] ──► [Active] ◄──► [Suspended]
    │              │              │
    │              ▼              │
    │          [Dissolved] ◄──────┘
    │              │
    ▼              ▼
[Deleted]     [Archived]
```

### Law Reference Summary

| Law | Issued | Key Articles |
|-----|--------|-------------|
| Luật Doanh nghiệp 2020 (DN 2020) | 17/06/2020 | Điều 12-13 (đại diện pháp luật), Điều 17 (đối tượng không được thành lập), Điều 29 (mã số doanh nghiệp), Điều 37-38 (tên doanh nghiệp), Điều 46-74 (vốn điều lệ), Điều 206-210 (tạm ngừng, giải thể) |
| NĐ 168/2025/NĐ-CP | 2025 | Điều 28 (kiểm soát nội bộ), Điều 35 (công bố thông tin), Điều 41 (VNeID) |
| TT 99/2025/TT-BTC | 2025 | Điều 5 (kỳ kế toán), Điều 6 (tiền tệ), Điều 8 (làm tròn số), Điều 10 (bộ phận), Điều 25 (hàng tồn kho), Điều 28 (lưu trữ, nhật ký), Điều 29 (hiệu lực) |
| NĐ 69/2024/NĐ-CP | 2024 | Điều 8 (định danh điện tử VNeID), Điều 14 (giao dịch thuế điện tử) |
| Luật Kế toán 88/2015 | 12/11/2015 | Điều 7 (chứng từ), Điều 11 (đơn vị tiền tệ), Điều 12 (kỳ kế toán), Điều 41 (lưu trữ) |
| NĐ 23/2025/NĐ-CP | 2025 | Điều 9 (chữ ký số hợp pháp), Điều 12 (chứng thực chữ ký số) |
| Luật Quản lý thuế 38/2019 | 13/06/2019 | Điều 30 (mã số thuế), Điều 42 (phương pháp tính thuế), Điều 66 (tạm ngừng) |
| TT 133/2016/TT-BTC | 26/08/2016 | Toàn văn (chế độ kế toán doanh nghiệp nhỏ và vừa) |
