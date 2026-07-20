# User Stories — Company Module

**Domain:** Doanh nghiệp (Enterprise)
**Module:** Company Administration
**Version:** 1.0
**Date:** 2026-07-20
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Regulatory basis:** Luật Doanh nghiệp 2020, NĐ 168/2025/NĐ-CP, TT 99/2025/TT-BTC, NĐ 69/2024/NĐ-CP, TT 133/2016/TT-BTC

---

## Epic 1: Company Core Information

### US-001: Create Company Profile

**As a** Company Admin
**I want** to create a new company profile with all required fields (enterprise code, tax code, company type, charter capital, addresses)
**So that** the company is registered in the system

**Priority:** Must-have

**Acceptance Criteria:**
1. User can create a company with enterprise code (10-digit numeric), tax code (10- or 13-digit MST format), company type (from enum: 1TV/2TV/CTCP/DNTN/CTHD/DNNĐT/HTX/LS/Loại khác), Vietnamese name, charter capital, head office address (via Province → District → Ward hierarchy)
2. System validates enterprise code format (`^\d{10}$`) per NĐ 168/2025
3. System validates tax code format (`^\d{10}(-\d{3})?$`) with checksum verification
4. System enforces unique tax code constraint across all companies — duplicate tax code rejected with specific error
5. After successful creation, system creates CompanySettings with VND defaults, creates UserCompany record linking creator, and logs `CompanyCreated` audit event

### US-002: Update Company Information

**As a** Company Admin
**I want** to update company information
**So that** changes are reflected in the system

**Priority:** Must-have

**Acceptance Criteria:**
1. User can edit all profile fields: name, address, phone, email, website, logo, charter capital
2. TaxCode changes require additional permission `Company.UpdateTaxCode` and mandatory correction reason
3. System logs all changes with old/new values in audit trail per TT 99/2025 §28
4. Material changes (name, address, legal rep, capital) trigger publication reminder within 10 days per NĐ 168/2025 §35
5. System validates email format, phone format (Vietnamese mobile/landline), and required fields on save

### US-003: View Company Profile

**As a** Company Admin
**I want** to view the complete company profile
**So that** I can verify all information

**Priority:** Must-have

**Acceptance Criteria:**
1. Dashboard displays: company name (VN and EN), tax code, enterprise code, status badge, logo, head office address, phone, email
2. Quick-info cards show: charter capital, paid-in capital, legal rep count, business line count, bank account count
3. Compliance section shows: VNeID registration status, expiring licenses (next 30 days), expired documents
4. Recent activity feed shows last 10 audit events for the company
5. System displays warning banner if profile is incomplete (missing legal rep, bank account, or business line)

### US-004: Manage Company Names

**As a** Company Admin
**I want** to manage company names (VN, EN, abbreviated)
**So that** the company is properly identified

**Priority:** Must-have

**Acceptance Criteria:**
1. User can set and edit three name fields: Vietnamese name (required), English name (optional), abbreviated name (optional)
2. Vietnamese name validated per Luật DN 2020 §37: must use Vietnamese alphabet (including diacritics), F/J/Z/W, digits 0-9, and symbols `.-+`
3. Vietnamese name checked against prohibited-name blocklist (state agencies, armed forces, offensive terms)
4. Duplicate name rejected (case-insensitive, whitespace-normalized) across active companies
5. When both names displayed, Vietnamese name font size exceeds English name font size per NĐ 01/2021 §18

### US-005: Manage Former Company Names

**As a** Company Admin
**I want** to manage former company names
**So that** the name change history is tracked

**Priority:** Should-have

**Acceptance Criteria:**
1. When Vietnamese or English name changes, system automatically preserves old name as a FormerName record with effective-from and effective-to dates
2. User can view full former names list with timestamps
3. Former names displayed on company profile in read-only section
4. User can add a former name manually (for backdating historical changes before system use)
5. Former names cannot be deleted — they are immutable per regulatory record-keeping

### US-006: Upload Company Logo

**As a** Company Admin
**I want** to upload and update the company logo
**So that** it appears on reports and invoices

**Priority:** Should-have

**Acceptance Criteria:**
1. User can upload PNG/JPG logo, max 2MB, max 500x500 pixels
2. System validates file type and size on upload; oversized or wrong format rejected with specific error
3. System scales and stores logo to blob storage, updates LogoUrl on company record
4. Logo displayed on company dashboard, report headers, and invoice templates
5. Removing logo returns to default placeholder; previous logo versions retained in document store

---

## Epic 2: Legal Representatives

### US-007: Add Legal Representative

**As a** Company Admin
**I want** to add legal representatives
**So that** the company has proper legal representation

**Priority:** Must-have

**Acceptance Criteria:**
1. User can add legal representative with: full name, VNeID number (12 digits), position, authorization scope, from date
2. System validates VNeID number format (12-digit numeric)
3. System validates CCCD format (9 digits old CMND / 12 digits new CCCD per Luật CCCD)
4. CCCD uniqueness checked across active legal reps for this company — duplicate CCCD rejected
5. LLC1 type enforces exactly one legal rep; LLC2 and JSC allow multiple

### US-008: Designate Primary Legal Representative

**As a** Company Admin
**I want** to designate a primary legal representative
**So that** the system knows who has signing authority

**Priority:** Must-have

**Acceptance Criteria:**
1. Exactly one legal rep must be designated as primary at all times
2. User can set a different active legal rep as primary — current primary automatically demoted to secondary
3. System syncs Company-level legal rep display fields from the primary rep
4. Changing primary rep triggers confirmation prompt: "This will change the primary legal representative. Continue?"
5. Audit trail records `PrimaryLegalRepresentativeChanged` with old and new rep IDs

### US-009: Remove Legal Representative

**As a** Company Admin
**I want** to remove a legal representative
**So that** the record stays current

**Priority:** Must-have

**Acceptance Criteria:**
1. User can soft-remove a legal rep (set ToDate = today, IsActive = false)
2. System blocks removal of the last active legal rep — "Company must have at least one legal representative"
3. If removing primary rep and other reps exist, user must designate a new primary first
4. LLC1 type: removal blocked — user must use "Replace" workflow instead
5. Audit trail records `LegalRepresentativeRemoved` with reason

### US-010: View Legal Representative Change History

**As a** Company Admin
**I want** to view the legal representative change history
**So that** I can track compliance

**Priority:** Should-have

**Acceptance Criteria:**
1. System displays a timeline of all legal rep changes: additions, removals, primary changes
2. Each entry shows: rep name, change type, timestamp, user who made the change, reason
3. History is read-only and cannot be modified or deleted
4. User can filter by rep name and date range
5. Export available as CSV for regulatory submission

---

## Epic 3: Business Lines

### US-011: Add Business Lines with VSIC Codes

**As a** Company Admin
**I want** to add business lines with VSIC codes
**So that** the system reflects our registered business activities

**Priority:** Must-have

**Acceptance Criteria:**
1. User can add business lines by searching VSIC code hierarchy (Level 2→4→6) with auto-complete
2. System validates VSIC code against official VSIC 2018 classification
3. Each business line records: VSIC code, VSIC level, name, start date, optional end date
4. If selected VSIC is a conditional business line (ngành nghề có điều kiện), system displays warning: "Requires additional license — see Licenses & Permits tab"
5. At least one business line required for an active company

### US-012: Designate Primary vs Secondary Business Lines

**As a** Company Admin
**I want** to designate primary vs secondary business lines
**So that** reporting is accurate

**Priority:** Should-have

**Acceptance Criteria:**
1. System enforces exactly one primary business line per company
2. When user marks a different line as primary, the former primary automatically becomes secondary
3. Removing a primary line is blocked — user must designate a replacement primary first
4. Primary business line displayed prominently on company dashboard
5. Primary business line used in tax declaration headers and regulatory reports

### US-013: Verify Business Lines Against Registration Certificate

**As a** Company Admin
**I want** to verify that our business lines match the business registration certificate
**So that** the system is compliant

**Priority:** Nice-to-have

**Acceptance Criteria:**
1. System can compare registered business lines against those listed on the uploaded Business Registration Certificate via OCR
2. Any discrepancies flagged as warnings on the business lines page
3. Mismatches logged for audit: e.g., "VSIC 5610 in system but 5611 on certificate"
4. Verification status displayed per business line: Verified / Mismatch / Pending
5. User can manually mark a line as verified after confirming with source document

---

## Epic 4: Company Settings

### US-014: Configure Accounting Regime

**As a** Chief Accountant
**I want** to configure the accounting regime (TT99/TT133)
**So that** the system uses correct COA and templates

**Priority:** Must-have

**Acceptance Criteria:**
1. User selects AccountingRegime from two options: TT 99/2025/TT-BTC (enterprise accounting) or TT 133/2016/TT-BTC (SME simplified)
2. Selection drives chart of accounts, report templates, and rounding rules downstream
3. Regime selection is required at setup and cannot be left blank
4. Once transactions exist in the first fiscal period, regime change is blocked
5. Current regime displayed on company dashboard and settings page

### US-015: Set Fiscal Year Start Month

**As a** Chief Accountant
**I want** to set the fiscal year start month
**So that** reporting periods are correct

**Priority:** Must-have

**Acceptance Criteria:**
1. User can select fiscal year start month (1-12 inclusive)
2. Default is January (tháng 1) per common Vietnamese practice
3. Fiscal year cannot change after journal entries have been posted in the current fiscal year
4. If changed mid-year before any entries exist, system regenerates period definitions and archives old ones
5. Confirmation prompt shown: "Fiscal year change will regenerate period definitions. Continue?"

### US-016: Configure Currency and Decimal Places

**As a** Chief Accountant
**I want** to configure currency and decimal places
**So that** financial reports display correctly

**Priority:** Must-have

**Acceptance Criteria:**
1. Default currency code set to "VND" per TT 99/2025 §6
2. Decimal places default to 0 for VND (integer currency per TT 99/2025 §8) but configurable 0-6
3. If multi-currency enabled, at least one foreign currency must be added alongside VND
4. Decimal places cannot be changed after first period close
5. Rounding method selectable: RoundHalfUp, RoundDown, RoundUp

### US-017: Select Inventory Valuation Method

**As a** Chief Accountant
**I want** to select the inventory valuation method
**So that** cost calculations are accurate

**Priority:** Should-have

**Acceptance Criteria:**
1. User can select from: FIFO, BinhQuanGiaQuyen (Weighted Average), ThucTeDichDanh (Specific Identification), NhapTruocXuatSau (LIFO)
2. Selection mapped to VAS 02 standards
3. Method cannot be changed during an open fiscal year (immutable mid-year per TT 99/2025 §25)
4. Selected method displayed on settings page and used in inventory valuation calculations
5. Changing method with existing inventory transactions requires Chief Accountant approval

### US-018: Configure Tax Method

**As a** Chief Accountant
**I want** to configure tax method and calculation method
**So that** tax declarations are accurate

**Priority:** Must-have

**Acceptance Criteria:**
1. User selects TaxCalculationMethod: KhauTru (deduction), TrucTiep (direct on value-add), TrucTiepTrenDoanhThu (direct on revenue), HonHop (mixed)
2. User selects TaxMethod: TrucTiepGTGT or KhauTruGTGT
3. Method must match the method registered with tax authority per Luật QLT 38/2019 §42
4. Changing tax method triggers re-validation flag on existing tax declarations
5. Tax method displayed on invoice templates and tax declaration forms

### US-019: Lock Settings After First Fiscal Period

**As a** Company Admin
**I want** to lock settings after the first fiscal period
**So that** accounting integrity is maintained

**Priority:** Must-have

**Acceptance Criteria:**
1. After first period close, critical settings (regime, fiscal year start, decimal places, inventory method, tax method) become read-only
2. Non-critical settings (multi-currency toggle, department management toggle) remain editable
3. System displays "locked" indicator next to each locked field with the period date it was locked
4. Unlocking requires system admin override with documented reason and Chief Accountant approval
5. All unlock attempts logged in audit trail

---

## Epic 5: Company Status Lifecycle

### US-020: Suspend Company Temporarily

**As a** Company Admin
**I want** to temporarily suspend the company
**So that** operations are properly paused

**Priority:** Must-have

**Acceptance Criteria:**
1. User can transition Active → Suspended with mandatory reason and expected resume date
2. Suspension max duration: 2 years (extension up to 1 additional year) per Luật DN 2020 §206
3. When suspended, system blocks: new invoices, purchase orders, bank transactions, journal entries
4. When suspended, system allows: viewing reports, editing company info, managing users
5. Status change recorded in CompanyStatusLog with timestamp, reason, and user ID

### US-021: Resume Operations from Suspension

**As a** Company Admin
**I want** to resume operations from suspension
**So that** the company is fully active again

**Priority:** Must-have

**Acceptance Criteria:**
1. User can transition Suspended → Active with confirmation prompt
2. System validates prerequisites: all tax declarations filed, no overdue tax debt
3. If suspension exceeded 1 year, re-registration proof required per Luật DN 2020 §206
4. After resuming, system unblocks all transaction posting
5. Audit trail records `CompanyResumed` with resume date

### US-022: Initiate Dissolution

**As a** Company Admin
**I want** to initiate dissolution proceedings
**So that** the company can be legally dissolved

**Priority:** Must-have

**Acceptance Criteria:**
1. User can transition Active or Suspended → Dissolving with mandatory reason
2. System checks: all tax declarations filed, debts settled, tax clearance certificate obtained
3. System blocks: new invoices, purchases, bank transactions (only closing entries permitted)
4. Dissolution notice must be published on national business portal (reminder generated)
5. Final transition Dissolving → Dissolved requires admin confirmation + dissolution certificate upload; company becomes read-only with 5-year data retention

### US-023: View Company Legal Status

**As a** Company Admin
**I want** to view the company's current legal status
**So that** I know what actions are available

**Priority:** Must-have

**Acceptance Criteria:**
1. Company status displayed prominently on dashboard with color-coded badge: Active (green), Suspended (amber), Dissolving (orange), Dissolved (red)
2. Status date and reason shown next to the badge
3. Allowed and disallowed actions are clearly indicated based on current status
4. Status change history displayed as timeline
5. System warns when approaching suspension time limit (30/60/90 days before max)

---

## Epic 6: Multi-Company

### US-024: Switch Between Companies

**As a** user
**I want** to switch between companies that I belong to
**So that** I can work for different clients

**Priority:** Should-have

**Acceptance Criteria:**
1. Company switcher displayed in header showing current company name and logo
2. Clicking opens dropdown of all active companies the user is assigned to
3. Selecting a company updates session context: loads company-specific data (COA, settings, tax info)
4. User's last-active company persisted as default for next login
5. Switching to suspended/dissolved company warns with feature restrictions

### US-025: Invite Users to Company

**As a** Company Admin
**I want** to invite users to my company
**So that** they can collaborate

**Priority:** Must-have

**Acceptance Criteria:**
1. User can search for existing users by name/email/username and assign them to the company
2. Admin selects role within company: Accountant, Chief Accountant, Admin, Viewer
3. System validates user not already assigned to this company — existing assignment can be modified instead
4. Invited user receives notification: "You have been assigned to [CompanyName]"
5. Batch assignment via CSV upload supported: UserEmail, CompanyCode, Role, IsDefault

### US-026: Remove Users from Company

**As a** Company Admin
**I want** to remove users from my company
**So that** access is controlled

**Priority:** Must-have

**Acceptance Criteria:**
1. User can deactivate a user's company membership (soft-delete, IsActive = false)
2. System prevents removal of the last company admin
3. Removing a user does not delete their data — they retain historical associations
4. Confirmation prompt shown with warning about access revocation
5. Removed user receives notification of access change

### US-027: See Current Company Context

**As a** user
**I want** to see which company I'm currently working in
**So that** I don't make mistakes

**Priority:** Must-have

**Acceptance Criteria:**
1. Current company name and logo always visible in application header
2. Company-specific settings (fiscal year, currency) shown on relevant screens
3. All data displayed is scoped to the active company — no cross-company data leakage
4. Audit entries tagged with active CompanyId
5. Attempting to access a different company's data results in authorization error

---

## Epic 7: Compliance & Integration

### US-028: Register Company for VNeID

**As a** System Admin
**I want** to register the company for VNeID
**So that** the company can use e-tax and e-government services (NĐ 69/2024/NĐ-CP)

**Priority:** Must-have

**Acceptance Criteria:**
1. System stores VNeID organization identifier with registration status tracking (NotRegistered / Registered / Verified / Revoked)
2. Legal representative initiates VNeID registration via QR code scan in VNeID mobile app
3. System receives callback from VNeID API with verification token and organization data
4. VNeID-returned TaxCode matched against local Company.TaxCode — mismatch blocks registration with detailed error
5. Tax filing features blocked when VNeID status is not Verified per NĐ 69/2024 §8

### US-029: Manage Bank Accounts

**As a** Company Admin
**I want** to manage company bank accounts
**So that** payments and tax refunds are properly routed

**Priority:** Must-have

**Acceptance Criteria:**
1. User can add multiple bank accounts: account number, account name, bank name, branch, SWIFT code, currency
2. Exactly one account must be marked as primary for tax payment
3. Account number validated (8-20 digits); bank name checked against SBV-licensed bank list
4. Deactivating the only active account shows warning: "At least one active bank account recommended"
5. Primary account displayed on invoice templates and tax declaration forms

### US-030: Receive Alerts for Expiring Documents

**As a** Company Admin
**I want** to receive alerts when documents or licenses are about to expire
**So that** renewals are handled in time

**Priority:** Should-have

**Acceptance Criteria:**
1. System monitors expiry dates on: Business Registration Certificate, licenses, digital certificates, permits
2. 90 days before expiry: dashboard warning banner displayed
3. 30 days before expiry: in-app notification + email sent to users with `Company.ManageLicenses` permission
4. 7 days before expiry: notification priority set to High (email + in-app + optional SMS)
5. Expired items auto-deactivated; critical documents expiring >30 days ago block all write operations

---

## Prioritization Summary

| Epic | Stories | Must-have | Should-have | Nice-to-have |
|------|---------|-----------|-------------|--------------|
| EP-01: Company Core Information | US-001 to US-006 | 4 | 1 | 1 |
| EP-02: Legal Representatives | US-007 to US-010 | 3 | 1 | 0 |
| EP-03: Business Lines | US-011 to US-013 | 2 | 0 | 1 |
| EP-04: Company Settings | US-014 to US-019 | 4 | 2 | 0 |
| EP-05: Company Status Lifecycle | US-020 to US-023 | 4 | 0 | 0 |
| EP-06: Multi-Company | US-024 to US-027 | 3 | 1 | 0 |
| EP-07: Compliance & Integration | US-028 to US-030 | 2 | 1 | 0 |
| **Total** | **30** | **22** | **6** | **2** |

---

## Traceability to BRD

| User Story | BRD Requirement | Use Case | Business Rule |
|------------|-----------------|----------|---------------|
| US-001 | FR-01.1 to FR-01.6 | UC-01 | BR-CI-01, BR-CI-02, BR-CI-07 |
| US-002 | FR-02.2, FR-02.4 | UC-02 | BR-CI-03, BR-SC-02 |
| US-003 | FR-02.1 | UC-15 | — |
| US-004 | FR-02.3 | — | BR-CI-04, BR-CI-05, BR-CI-06 |
| US-005 | FR-02.3 | — | — |
| US-006 | — | UC-02 alt | — |
| US-007 | FR-04.1 to FR-04.4 | UC-04 | BR-CI-09, BR-CI-10, BR-17 |
| US-008 | FR-04.2 | UC-04 alt | BR-CI-09 |
| US-009 | FR-04.9 | UC-04 alt | BR-CI-09 |
| US-010 | FR-18.1 | — | BR-SC-03 |
| US-011 | FR-05.1 to FR-05.3 | UC-05 | — |
| US-012 | FR-05.5 | UC-05 alt | — |
| US-013 | FR-05.3 | — | — |
| US-014 | FR-09.1 | UC-03 | BR-CS-04 |
| US-015 | FR-09.2 | UC-03 alt | BR-CS-01 |
| US-016 | FR-09.3, FR-09.4 | UC-03 | BR-CS-02, BR-CS-03 |
| US-017 | FR-09.8 | UC-03 | BR-CS-05 |
| US-018 | FR-09.2 | UC-03 | BR-CS-06 |
| US-019 | FR-09.6 | UC-03 exc | — |
| US-020 | FR-03.3, FR-03.4 | UC-09 | BR-CL-01, BR-CL-02 |
| US-021 | FR-03.3 | UC-09 alt | BR-CL-03 |
| US-022 | FR-03.3, FR-03.5 | UC-09 alt | BR-CL-04 |
| US-023 | FR-03.6 | UC-15 | BR-CL-05 |
| US-024 | FR-16.2 | UC-13 | BR-OP-01 |
| US-025 | FR-16.2 | UC-12 | — |
| US-026 | FR-16.2 | — | — |
| US-027 | FR-16.1 | UC-13 exc | — |
| US-028 | FR-15.1 to FR-15.4 | UC-14 | BR-SC-05 |
| US-029 | FR-08.1 to FR-08.3 | UC-07 | BR-OP-04 |
| US-030 | FR-11.2 | UC-11 | BR-OP-05 |
