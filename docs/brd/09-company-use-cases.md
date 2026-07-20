# Use Cases — Company Module

**Domain:** Doanh nghiệp (Enterprise)
**Module:** Company Administration
**Regulatory basis:** Luật Doanh nghiệp 2020, Nghị định 168/2025/NĐ-CP, Thông tư 99/2025/TT-BTC, Nghị định 69/2024/NĐ-CP

---

## Entity Model Reference

The following entities are referenced across use cases:

| Entity | Fields |
|---|---|
| `Company` | Id, Name, TaxCode, Address, Phone, Email, Website, LogoUrl, IsActive, Status, StatusDate, CompanyType, CharterCapital, VNeIDRegistered, CreatedAt, UpdatedAt |
| `CompanySettings` | FiscalYearStartMonth, CurrencyCode, DecimalPlaces, InventoryMethod, TaxMethod, EnableMultiCurrency, EnableDepartmentManagement |
| `LegalRepresentative` | Id, CompanyId, FullName, IdCardNumber, IdCardIssueDate, IdCardIssuePlace, VNeIDLevel, Position, IsPrimary, IsActive, FromDate, ToDate |
| `BusinessLine` | Id, CompanyId, VsicCode, VsicName, IsMain, IsActive |
| `Branch` | Id, CompanyId, Name, Address, TaxCode, Phone, Email, BranchType (Branch/RepOffice), IsActive |
| `CompanyBankAccount` | Id, CompanyId, BankName, BranchName, AccountNumber, AccountHolder, CurrencyCode, IsDefault, IsActive |
| `CapitalContributor` | Id, CompanyId, FullName, IdCardNumber, ContributionAmount, CapitalRatio, ContributorType (Member/Shareholder), IsActive |
| `CompanyDocument` | Id, CompanyId, DocumentType (BusinessReg/TaxReg/Seal/etc), FileName, FileUrl, IssueDate, ExpiryDate, IsVerified |
| `CompanyLicense` | Id, CompanyId, LicenseType, LicenseNumber, Issuer, IssueDate, ExpiryDate, NotificationDays, Status |
| `CompanyStatusLog` | Id, CompanyId, FromStatus, ToStatus, Reason, ChangedBy, ChangedAt |
| `UserCompany` | UserId, CompanyId, IsDefault, IsActive |

---

## UC-01: Create New Company (Initial Setup)

**Actor:** System Admin, Chief Accountant (Kế toán trưởng)

**Description:** Register a new company entity in the system. Serves as the first step before any accounting operations. Must capture enterprise identity information per Luật Doanh nghiệp 2020 and the Tax Administration Law.

**Preconditions:**
1. User has permission `Company.Create`
2. TaxCode not already registered in system
3. No active company exists for the current user (first-time setup)

**Postconditions:**
1. Company record created with status Active
2. CompanySettings created with VND defaults
3. UserCompany relationship created (user assigned as first member)
4. Audit log entry: `CompanyCreated`

### Happy Path
1. User navigates to Admin → Companies → Create New
2. System displays company creation form
3. User enters: Name (required), TaxCode, Address, Phone, Email, Website
4. User enters Legal Representative info: FullName, IdCardNumber, Position
5. User selects CompanyType: LLC1 / LLC2 / JSC / Partnership / Private Enterprise
6. User enters Charter Capital (Vốn điều lệ)
7. System validates TaxCode uniqueness via local DB and optional MST check API (Tổng cục Thuế)
8. System validates IdCardNumber format (9 or 12 digits per CCCD law)
9. System creates Company + CompanySettings with defaults: VND, fiscal year Jan-Dec, KKTT tax method
10. System creates UserCompany record linking creator as default company user
11. System logs `CompanyCreated` audit event
12. System displays success message, redirects to Company Dashboard

### Alternative Path: Multi-Step Wizard
1. A1-A3 same
2. A4: User clicks "Save Draft" instead of "Create"
3. System saves company in Draft status (IsActive=false)
4. User can return later via Admin → Companies → Drafts to complete
5. Only when all required fields filled and user clicks "Create" does status become Active

### Alternative Path: Import From Tax Authority
1. A1-A2 same
2. User enters TaxCode only, clicks "Lookup MST"
3. System calls Tổng cục Thuế MST lookup API (if available)
4. System pre-fills Name, Address, Legal Representative from tax registry
5. User reviews and confirms auto-filled data
6. Continues from happy path step 6

### Exception Path: Duplicate TaxCode
1. A1-A6 same
2. System queries existing Companies — TaxCode already exists
3. System returns validation error: "TaxCode already registered to another company"
4. User must enter a different TaxCode or verify the existing company is theirs

### Exception Path: TaxCode Validation Failure
1. A1-A6 same
2. TaxCode format invalid (not 10 or 13 digits, wrong check digit)
3. System returns: "Invalid TaxCode format. Must be 10 or 13 digits."
4. User corrects TaxCode

### Exception Path: IdCardNumber Validation Failure
1. A1-A6 same
2. IdCardNumber format invalid (not 9 or 12 digits)
3. System returns: "Invalid CCCD/CMND number. Must be 9 (old CMND) or 12 (new CCCD) digits."
4. User corrects IdCardNumber

---

## UC-02: Update Company Information

**Actor:** Admin, Chief Accountant

**Description:** Update general company information: name, address, phone, email, website, logo. TaxCode changes are restricted per regulatory rules.

**Preconditions:**
1. User has permission `Company.Update` or `Company.UpdateInfo`
2. Company exists and status is Active or Suspended
3. TaxCode change requires additional permission `Company.UpdateTaxCode`

**Postconditions:**
1. Company record updated
2. UpdatedAt timestamp set
3. Audit log entry: `CompanyUpdated` with old/new values per TT 99/2025
4. If TaxCode changed: audit event `TaxCodeChanged` with reason required

### Happy Path
1. User navigates to Admin → Company → Info tab
2. System loads CompanyInfoForm populated with current values
3. User modifies fields: Name, Address, Phone, Email, Website
4. User uploads new logo image (PNG/JPG, max 2MB, 500x500)
5. User clicks Save
6. System validates: Name required, Email format, Phone format (Vietnamese mobile/landline)
7. System saves changes to Company record
8. System scales and stores logo to blob storage, updates LogoUrl
9. System logs audit entry with oldValues and newValues per TT 99/2025 §audit
10. System displays "Company info updated" success message

### Alternative Path: TaxCode Change
1. A1-A3 same
2. User changes TaxCode field
3. System checks permission `Company.UpdateTaxCode` — denied → shows "Contact admin to change TaxCode"
4. If permitted: System requires mandatory reason field "Reason for TaxCode change"
5. System validates uniqueness of new TaxCode
6. System updates TaxCode
7. System logs `TaxCodeChanged` with old/new values and reason
8. System triggers notification to tax declaration module (existing declarations may need re-validation)

### Exception Path: Validation Failure
1. A1-A4 same
2. Name empty → "Company name is required"
3. Email malformed → "Invalid email format"
4. Phone invalid → "Phone number must be 10-11 digits for Vietnamese numbers"
5. Logo oversized → "Logo must be under 2MB"
6. System re-displays form with validation errors, field values preserved

---

## UC-03: Update Company Settings (Accounting Regime)

**Actor:** Chief Accountant (Kế toán trưởng), Admin

**Description:** Configure company-level accounting settings: fiscal year, currency, decimal precision, inventory method, tax calculation method, multi-currency and department management toggles.

**Preconditions:**
1. User has permission `Company.UpdateSettings`
2. Company exists and status is Active or Suspended
3. No journal entries posted yet (for fiscal year / currency changes)

**Postconditions:**
1. CompanySettings updated
2. If fiscal year changed: accounting periods regenerate
3. Audit log entry: `CompanySettingsChanged`
4. If tax method changed: flag for re-validation of tax declarations

### Happy Path
1. User navigates to Admin → Company → Settings tab
2. System loads CompanySettingsForm with current settings
3. User modifies: FiscalYearStartMonth (1-12), CurrencyCode, DecimalPlaces (0-6)
4. User selects InventoryMethod: FIFO / LIFO / WeightedAverage / SpecificIdentification
5. User selects TaxMethod: KKTT (Direct) / GTGT (Credit-based)
6. User toggles EnableMultiCurrency and EnableDepartmentManagement
7. User clicks Save
8. System validates: if CurrencyCode ≠ VND, warns about TT 133/2016 compliance for SMEs
9. System saves settings
10. System logs audit entry `CompanySettingsChanged` with changed fields
11. System displays "Settings updated" success message

### Alternative Path: Fiscal Year Change Mid-Year
1. A1-A4 same
2. User changes FiscalYearStartMonth
3. System detects period definitions already exist
4. System checks 0 journal entries exist in current fiscal year — if any, reject change
5. System prompts: "Fiscal year change will regenerate period definitions. Current period definitions will be archived. Continue?"
6. User confirms
7. System archives old period definitions
8. System creates new period definitions starting from new fiscal year month
9. System logs `FiscalYearChanged` audit event

### Exception Path: Settings Locked After Posting
1. A1-A6 same
2. System detects journal entries exist for current fiscal year
3. System rejects changes to: FiscalYearStartMonth, CurrencyCode, DecimalPlaces, InventoryMethod, TaxMethod
4. System displays: "These settings cannot be changed after journal entries have been posted in the current fiscal year"
5. Only EnableMultiCurrency and EnableDepartmentManagement remain editable

---

## UC-04: Manage Legal Representatives (Người đại diện pháp luật)

**Actor:** Admin, Chief Accountant

**Description:** Manage the legal representative(s) of the enterprise. LLC1 requires one legal rep; LLC2 and JSC can have multiple. Per Luật Doanh nghiệp 2020, the legal representative must be disclosed in the Business Registration database. Per NĐ 69/2024, VNeID organization account requires a legal rep with Level-2 eID.

**Preconditions:**
1. User has permission `Company.ManageLegalReps`
2. Company exists and status is Active
3. At least one legal representative must remain assigned (cannot remove last one without replacement)

**Postconditions:**
1. LegalRepresentative record(s) added/updated/removed
2. Company.LegalRepresentative and Company.RepPosition synced from primary rep
3. If primary rep changed: update VNeID authorization chain
4. Audit log entry: `LegalRepresentativeChanged`

### Happy Path: Add Legal Representative
1. User navigates to Admin → Company → Legal Representatives
2. System displays current legal reps list
3. User clicks "Add Legal Representative"
4. User enters: FullName, IdCardNumber (CCCD/CMND), IdCardIssueDate, IdCardIssuePlace
5. User enters Position (e.g., Chairman, Director, CEO)
6. User selects IsPrimary (if multiple reps, exactly one must be primary)
7. User enters FromDate (default: today)
8. System validates CCCD number format (12 digits for new CCCD, 9 for old CMND)
9. System checks CCCD uniqueness across active legal reps for this company
10. System saves LegalRepresentative record
11. If IsPrimary=true: updates Company.LegalRepresentative and Company.RepPosition
12. System logs `LegalRepresentativeAdded`

### Alternative Path: Change Primary Representative
1. User views legal reps list
2. User clicks "Set as Primary" on a non-primary rep
3. System prompts: "This will change the primary legal representative. The current primary will become secondary."
4. User confirms
5. System sets old primary rep IsPrimary=false
6. System sets new primary rep IsPrimary=true
7. System syncs Company.LegalRepresentative and Company.RepPosition from new primary
8. System logs `PrimaryLegalRepresentativeChanged`

### Alternative Path: Remove Legal Representative
1. User views legal reps list
2. User clicks "Remove" on a rep
3. If rep is primary and more than one rep exists: prompt to designate new primary first
4. If rep is primary and only rep: block removal — "Company must have at least one legal representative"
5. If rep is not primary: System sets ToDate = today, IsActive = false
6. System logs `LegalRepresentativeRemoved`

### Alternative Path: LLC1 — Single Legal Representative
1. User creates LLC1 type company
2. System enforces: exactly one legal rep at all times
3. "Add" button disabled if one active rep exists
4. "Remove" blocked — must use "Replace" operation instead
5. Replace: user enters new rep details, old rep gets ToDate, new rep created as primary

### Exception Path: Duplicate CCCD
1. User enters CCCD that already exists for an active legal rep in this company
2. System returns: "This CCCD number is already registered as a legal representative for this company"
3. User must verify the identity

---

## UC-05: Manage Business Lines (Ngành nghề kinh doanh)

**Actor:** Admin, Chief Accountant

**Description:** Manage the registered business lines (ngành nghề kinh doanh) using VSIC (Vietnam Standard Industrial Classification) codes. One main business line required; multiple secondary lines allowed. Per Luật Doanh nghiệp 2020 §29-30, certain lines require specific conditions.

**Preconditions:**
1. User has permission `Company.ManageBusinessLines`
2. Company exists and status is Active
3. VSIC code data loaded in system

**Postconditions:**
1. BusinessLine record(s) added/updated/removed
2. At least one main business line always exists
3. Audit log entry: `BusinessLineChanged`

### Happy Path: Add Business Line
1. User navigates to Admin → Company → Business Lines
2. System displays current business lines
3. User clicks "Add Business Line"
4. System shows VSIC search field with auto-complete (by code or name)
5. User types partial name/code, selects from VSIC hierarchy (Level 5)
6. User toggles IsMain if this should be the primary business line (previous main becomes secondary)
7. System validates: if the selected VSIC code is in the "conditional business lines" list (ngành nghề kinh doanh có điều kiện)
8. If conditional: system displays warning "Requires additional license/permit — see Licenses & Permits tab"
9. System saves BusinessLine
10. If IsMain=true: updates Company's main business classification
11. System logs `BusinessLineAdded`

### Alternative Path: Remove Secondary Business Line
1. User views business lines list
2. User clicks "Remove" on a secondary line
3. System prompts confirmation
4. User confirms
5. System soft-deletes (IsActive=false)
6. System logs `BusinessLineRemoved`

### Alternative Path: Replace Main Business Line
1. User clicks "Remove" on current main business line
2. System blocks removal: "Cannot remove main business line. Designate a different main line first, or add a new one."
3. User marks a different existing line as IsMain=true
4. Former main line becomes secondary (IsMain=false)
5. User can now remove the former main line

### Exception Path: Invalid VSIC Code
1. User enters free-text business line description instead of selecting from VSIC
2. System rejects: "Business line must be selected from the VSIC code list"
3. User must search and select a valid VSIC code

---

## UC-06: Manage Branches and Representative Offices

**Actor:** Admin, Chief Accountant

**Description:** Register and manage company branches (chi nhánh) and representative offices (văn phòng đại diện). Each branch may have its own TaxCode for VAT purposes.

**Preconditions:**
1. User has permission `Company.ManageBranches`
2. Company exists and status is Active

**Postconditions:**
1. Branch record created/updated/deactivated
2. If TaxCode provided: validates uniqueness
3. Audit log entry: `BranchChanged`

### Happy Path: Add Branch
1. User navigates to Admin → Company → Branches
2. System displays current branches/rep offices list
3. User clicks "Add Branch"
4. User enters: Name, Address, Phone, Email
5. User selects Type: Branch (Chi nhánh) or Representative Office (Văn phòng đại diện)
6. User optionally enters TaxCode (different from parent company — for branches that file separate VAT)
7. User clicks Save
8. System validates TaxCode uniqueness across all companies and branches
9. System saves Branch record
10. System logs `BranchAdded`

### Alternative Path: Deactivate Branch
1. User views branches list
2. User clicks "Deactivate" on a branch
3. System prompts: "Deactivating this branch will prevent it from being used in transactions. Related data will be preserved."
4. User provides reason (required)
5. User confirms
6. System sets IsActive=false
7. System logs `BranchDeactivated`

### Exception Path: Duplicate Branch TaxCode
1. User enters TaxCode that matches another existing branch or company
2. System returns: "TaxCode already assigned to another branch or company"
3. User must correct the TaxCode or leave it blank

---

## UC-07: Manage Company Bank Accounts

**Actor:** Admin, Accountant, Chief Accountant

**Description:** Manage company bank accounts for payment processing, tax refunds, and transaction tracking. Per Thông tư 99/2025/TT-BTC, bank account info must be disclosed in tax filings.

**Preconditions:**
1. User has permission `Company.ManageBankAccounts`
2. Company exists

**Postconditions:**
1. CompanyBankAccount record created/updated/deactivated
2. If IsDefault=true: previous default becomes non-default
3. Audit log entry: `BankAccountChanged`

### Happy Path: Add Bank Account
1. User navigates to Admin → Company → Bank Accounts
2. System displays current bank accounts list
3. User clicks "Add Bank Account"
4. User enters: BankName, BranchName, AccountNumber, AccountHolder
5. User selects CurrencyCode (VND / USD / EUR / others)
6. User toggles IsDefault (whether this is the primary account)
7. System validates: AccountNumber format (8-20 digits), IBAN not used in Vietnam
8. System checks: if AccountNumber already exists for this company → warn "Account already registered"
9. System validates BankName against list of licensed Vietnamese banks (SBV)
10. System saves CompanyBankAccount
11. If IsDefault=true: system unsets previous default account
12. System logs `BankAccountAdded`

### Alternative Path: Set Default Account
1. User views bank accounts list
2. User clicks "Set Default" on a non-default account
3. System prompts confirmation
4. User confirms
5. Current default account cleared as default
6. Selected account set as default
7. System logs `DefaultBankAccountChanged`

### Alternative Path: Deactivate Bank Account
1. User views bank accounts list
2. User clicks "Deactivate"
3. System checks: if this is the only active account → warn "At least one active bank account recommended"
4. System prompts confirmation
5. User confirms
6. System sets IsActive=false
7. System logs `BankAccountDeactivated`

### Exception Path: Invalid Bank Name
1. User enters bank name not in the licensed bank list (e.g., foreign bank without Vietnamese license)
2. System warns: "This bank is not in the list of banks licensed to operate in Vietnam. Verify the bank name."
3. User can override with Admin override permission, but flag is set on the record

---

## UC-08: Manage Capital Contributors (Members/Shareholders)

**Actor:** Admin, Chief Accountant

**Description:** Manage company ownership structure: members (for LLC) or shareholders (for JSC). Capital ratios drive profit distribution and voting rights per Luật Doanh nghiệp 2020.

**Preconditions:**
1. User has permission `Company.ManageCapital`
2. Company exists and status is Active
3. Total capital ratio must equal 100% at all times

**Postconditions:**
1. CapitalContributor record(s) added/updated/removed
2. Company's CharterCapital updated if total contributed capital changes
3. Capital ratios recalculated if amounts change
4. Audit log entry: `CapitalStructureChanged`

### Happy Path: Add Member (LLC)
1. User navigates to Admin → Company → Capital Contributors
2. System displays current members/shareholders with capital ratios, sorted by contribution amount descending
3. User clicks "Add Member"
4. User enters: FullName, IdCardNumber, IdCardIssueDate, IdCardIssuePlace
5. User selects ContributorType: Member (for LLC) / Shareholder (for JSC)
6. User enters ContributionAmount (VND)
7. System calculates CapitalRatio = ContributionAmount / CharterCapital × 100
8. System checks: if total ratio would exceed 100% → reject with "Total capital ratio would exceed 100%"
9. System checks: LLC1 allows max 50 members; LLC2 allows max 50 members — enforce limit
10. System saves CapitalContributor
11. System updates total capital ratio display
12. System logs `CapitalContributorAdded`

### Alternative Path: Adjust Capital Contribution
1. User views contributors list
2. User clicks "Edit Contribution" on a member
3. User enters new ContributionAmount
4. System recalculates individual ratio
5. System checks total across all contributors equals 100% (with rounding tolerance 0.01%)
6. If total ≠ 100%: "Capital ratios must total 100%. Current total: X.XX%"
7. System prompts to adjust other members' contributions automatically proportionally, or manually
8. User selects adjustment method
9. System updates all affected contributions
10. If CharterCapital changed: updates Company.CharterCapital
11. System logs `CapitalContributionAdjusted`

### Alternative Path: Remove Contributor
1. User views contributors list
2. User clicks "Remove"
3. System checks: if only one contributor → block: "Company must have at least one contributor"
4. System recalculates what ratios would be without this contributor
5. System prompts: "Removing [Name] will redistribute their [X%] share proportionally among remaining contributors. Continue?"
6. User confirms
7. System soft-deletes contributor (IsActive=false)
8. System redistributes capital ratios proportionally among remaining contributors
9. System logs `CapitalContributorRemoved`

### Alternative Path: Convert LLC to JSC (Future)
1. User initiates enterprise type conversion
2. System validates: all members agree (hypothetical — requires legal process outside system)
3. System converts member records to shareholder records
4. System updates Company.CompanyType
5. System logs `CompanyTypeConverted`

### Exception Path: LLC Member Limit Exceeded
1. Company is LLC1 or LLC2 with 50 active members
2. User tries to add 51st member
3. System rejects: "LLC can have maximum 50 members per Luật Doanh nghiệp 2020 §46"
4. User must remove a member or convert company type

---

## UC-09: Change Company Status

**Actor:** Admin, Chief Accountant

**Description:** Change company operational status. Lifecycle: Active → Temporarily Suspended → Resume → Dissolving → Dissolved. Status changes affect system functionality (e.g., suspended companies cannot post new transactions).

**Preconditions:**
1. User has permission `Company.ChangeStatus`
2. Company exists
3. Valid transition per status state machine

**Postconditions:**
1. Company.Status updated
2. Company.StatusDate updated
3. CompanyStatusLog record created
4. If suspended: system blocks new transaction posting
5. If dissolved: system archives company (read-only)
6. Audit log entry: `CompanyStatusChanged`

### Happy Path: Temporarily Suspend
1. User navigates to Admin → Company → Status
2. System displays current status (Active) and allowed transitions
3. User clicks "Temporarily Suspend" (Tạm ngừng kinh doanh)
4. System prompts: Reason for suspension (required), ExpectedResumeDate
5. User enters: "Renovating office" + ExpectedResumeDate 2025-09-01
6. User confirms
7. System checks: no unposted journal entries in current period → warn if any
8. System sets Company.Status = TemporarilySuspended, StatusDate = today
9. System blocks: new invoice entry, new purchase orders, new bank transactions
10. System allows: viewing reports, editing company info, managing users
11. System creates CompanyStatusLog entry
12. System logs `CompanySuspended`

### Alternative Path: Resume from Suspension
1. Company status = TemporarilySuspended
2. User clicks "Resume Operations"
3. System prompts: confirm that suspension period has ended
4. User confirms
5. System sets Company.Status = Active, StatusDate = today
6. System unblocks transaction posting
7. System logs `CompanyResumed`

### Alternative Path: Begin Dissolution
1. Company status = Active or TemporarilySuspended
2. User clicks "Begin Dissolution"
3. System warns: "This action starts the dissolution process. Financial reports will be required. Continue?"
4. User confirms reason (mandatory)
5. System sets Company.Status = Dissolving
6. System checks: all tax declarations filed up to date — warn if incomplete
7. System triggers: "Complete final tax declaration before closure"
8. System locks: new invoices, new purchases, new bank transactions
9. System allows: closing entries only
10. System logs `DissolutionStarted`

### Alternative Path: Mark Dissolved (Admin Only)
1. Company status = Dissolving
2. Admin confirms dissolution completed (legal process finalized)
3. Admin uploads dissolution certificate document
4. System sets Company.Status = Dissolved, StatusDate = today
5. System marks company as read-only (all editing disabled)
6. System retains data for archival (5-year minimum per tax law)
7. System logs `CompanyDissolved`

### Exception Path: Invalid Transition
1. Company status = Dissolved
2. User clicks "Resume Operations"
3. System rejects: "Cannot resume a dissolved company. A dissolved company is final per Luật Doanh nghiệp 2020 §208."
4. User must create a new company registration instead

### Exception Path: Pending Tax Declarations
1. A1-A5 same
2. System detects unfiled tax declarations for current period
3. System blocks transition: "Complete all pending tax declarations before changing status"
4. User redirected to tax declaration module

---

## UC-10: Upload and Manage Business Documents

**Actor:** Admin, Chief Accountant

**Description:** Upload, store, and manage digital copies of enterprise legal documents: Business Registration Certificate (Giấy chứng nhận đăng ký doanh nghiệp), Tax Registration Certificate, Company Seal Registration, and other regulatory documents.

**Preconditions:**
1. User has permission `Company.ManageDocuments`
2. Company exists
3. Document type not already uploaded (or user uploading updated version)

**Postconditions:**
1. CompanyDocument record created
2. Document file stored in blob storage
3. If document is BusinessReg: system validates registration data matches Company record
4. Audit log entry: `DocumentUploaded`

### Happy Path: Upload Business Registration Certificate
1. User navigates to Admin → Company → Documents tab
2. System displays current documents grid with type, status, expiry
3. User clicks "Upload Document"
4. User selects DocumentType: BusinessRegistrationCertificate / TaxRegistration / SealRegistration / Other
5. User uploads file (PDF/JPEG/PNG, max 10MB)
6. User enters: IssueDate, ExpiryDate (if applicable), Issuer, ReferenceNumber
7. System scans file for malware (basic AV scan)
8. System performs OCR on uploaded BusinessReg PDF: extracts TaxCode, CompanyName, LegalRep
9. System compares OCR data against current Company record
10. If data mismatch: system warns "Uploaded document shows different TaxCode than current record"
11. System saves document, marks IsVerified = false (pending admin verification)
12. System logs `DocumentUploaded`

### Alternative Path: Replace Expired Document
1. User views documents list
2. User clicks "Replace" on an existing document
3. System prompts: "Uploading a new version will archive the current version. Previous version remains in audit trail."
4. User uploads new file
5. System archives old document (IsActive=false)
6. System creates new CompanyDocument with same DocumentType
7. System logs `DocumentReplaced`

### Exception Path: Oversized File
1. User uploads file > 10MB
2. System rejects: "File exceeds maximum size of 10MB"
3. User must compress or split the document

### Exception Path: OCR Mismatch — TaxCode Discrepancy
1. System runs OCR on uploaded BusinessReg Certificate
2. Extracted TaxCode X ≠ Company.TaxCode Y
3. System blocks document from finalizing: "TaxCode on uploaded certificate does not match company record"
4. Document saved in PendingReview status
5. Admin must manually verify or update company TaxCode

---

## UC-11: Manage Company Licenses and Permits

**Actor:** Admin, Chief Accountant

**Description:** Track conditional business licenses and permits with expiry management. Certain VSIC codes require specific licenses (giấy phép kinh doanh có điều kiện). System sends notifications before expiry.

**Preconditions:**
1. User has permission `Company.ManageLicenses`
2. Company exists
3. License type may be auto-suggested based on registered business lines

**Postconditions:**
1. CompanyLicense record created/updated/deactivated
2. Expiry notification schedule set
3. Audit log entry: `LicenseChanged`

### Happy Path: Register New License
1. User navigates to Admin → Company → Licenses & Permits tab
2. System displays current licenses with expiry status (Active/ExpiringSoon/Expired)
3. User clicks "Add License"
4. User selects LicenseType from dropdown (pre-populated from conditional business line requirements)
5. User enters: LicenseNumber, Issuer, IssueDate, ExpiryDate
6. User selects NotificationDays (default: 30 days before expiry)
7. User optionally uploads license document
8. System validates: LicenseNumber format per license type (e.g., food safety cert format)
9. System validates: ExpiryDate > IssueDate
10. System saves CompanyLicense
11. System schedules expiry notification (NotificationDays before ExpiryDate)
12. System logs `LicenseRegistered`

### Alternative Path: Auto-Suggest from Business Lines
1. User adds a conditional business line (e.g., "Food and Beverage Service" — VSIC 5610)
2. System detects VSIC code is conditional
3. System pre-creates a Pending license record: "License required: Food Safety Certificate (VSIC 5610)"
4. User navigates to Licenses tab, sees the pending license
5. User completes the license record with actual details

### Alternative Path: Renew License
1. Existing license approaching expiry
2. System displays banner: "License L/Cert will expire in [N] days"
3. User clicks "Renew" on the license
4. System creates renewal workflow: current license archived (IsActive=false)
5. User enters new IssueDate, ExpiryDate, LicenseNumber (may be same or new)
6. System saves new license record linked to previous as renewal chain
7. System logs `LicenseRenewed`

### Alternative Path: Notify Before Expiry
1. Timer/background job runs daily
2. System queries CompanyLicenses where ExpiryDate - NotificationDays <= today AND IsActive=true
3. For each: system creates notification for users with `Company.ManageLicenses`
4. If expiry within 7 days: notification priority = High, sent as email + in-app alert
5. If expired: notification priority = Critical, license auto-deactivated (IsActive=false)

### Exception Path: Invalid Date Range
1. User enters ExpiryDate before IssueDate
2. System returns: "Expiry date must be after issue date"
3. User corrects dates

---

## UC-12: Assign Company to User (UserCompany)

**Actor:** Admin (system-level)

**Description:** Assign a user to a company, creating a UserCompany relationship. A user may be assigned to multiple companies (e.g., accountant serving multiple enterprises).

**Preconditions:**
1. Admin has permission `Company.AssignUser`
2. Both User and Company exist
3. UserCompany relationship does not already exist for this pair

**Postconditions:**
1. UserCompany record created
2. If first user for company: user set as default
3. Audit log entry: `UserAssignedToCompany`

### Happy Path
1. Admin navigates to Company → Users tab
2. System displays current users assigned to this company
3. Admin clicks "Assign User"
4. System shows user search (by name, email, or username)
5. Admin searches and selects target user
6. Admin selects user role within company: Accountant / Chief Accountant / Admin / Viewer
7. Admin optionally toggles IsDefault (sets as active company when user logs in)
8. System validates: user not already assigned to this company
9. System creates UserCompany record
10. System sends notification to user: "You have been assigned to [CompanyName]"
11. System logs `UserAssignedToCompany`

### Alternative Path: Batch Assign
1. A1-A2 same
2. Admin uploads CSV: UserEmail, CompanyCode, Role, IsDefault
3. System validates each row: user exists, company exists, not duplicate
4. System processes valid rows, skips invalid rows with error report
5. System generates assignment summary: "N assigned, M skipped"
6. System sends batch notifications

### Exception Path: Duplicate Assignment
1. Admin selects user already assigned to this company
2. System returns: "User is already assigned to this company"
3. Admin can modify the existing assignment (change role) instead

### Exception Path: User Not Found
1. A1-A5 same
2. User search returns no results
3. System displays: "No user found matching the search criteria"
4. Admin must try a different search or invite the user first

---

## UC-13: Switch Active Company

**Actor:** Any user assigned to multiple companies

**Description:** User switches their active working context between companies they are assigned to. The system updates session state to reflect the new active company.

**Preconditions:**
1. User is authenticated
2. User has UserCompany relationships with at least 2 companies (IsActive=true)
3. User has permission to access the target company

**Postconditions:**
1. User's active company context updated in session/claims
2. UI refreshes with new company data
3. Audit log entry: `UserSwitchedCompany`

### Happy Path
1. User clicks company switcher in header (current company name displayed)
2. System drops down list of user's assigned active companies
3. User selects target company
4. System validates user is assigned to selected company
5. System updates session: HttpContext.Items["ActiveCompanyId"] = companyId
6. System re-fetches company-specific data (chart of accounts, settings, tax info)
7. System updates UI: header shows new company name, logo, fiscal year
8. System persists last-active company per user (optional: update UserCompany.IsDefault)
9. System logs `UserSwitchedCompany`
10. User is redirected to current page (or dashboard if page unavailable in new context)

### Alternative Path: Switch from Dashboard
1. User on company dashboard
2. User clicks "Switch Company" from sidebar
3. Same as happy path steps 2-10

### Exception Path: Company Inactive or Suspended
1. A1-A3 same
2. Selected company status = TemporarilySuspended or Dissolved
3. System warns: "[CompanyName] is currently [status]. Some features are restricted."
4. User can still switch but with feature restrictions (view-only for dissolved)
5. System sets context with restricted mode flag

### Exception Path: User Access Revoked
1. A1-A3 same
2. UserCompany relationship was deactivated between dropdown load and switch
3. System returns: "Access to this company has been revoked"
4. User stays in current company context
5. System refreshes company list

---

## UC-14: Complete VNeID / e-ID Registration

**Actor:** Admin, Legal Representative

**Description:** Register the company's organization account on VNeID (ứng dụng định danh quốc gia) per Nghị định 69/2024/NĐ-CP. VNeID integration enables electronic tax filing, digital signatures, and legal document authentication.

**Preconditions:**
1. Company exists with at least one active legal representative
2. Legal representative has personal VNeID Level-2 account
3. Company has valid Business Registration Certificate
4. Internet connection to VNeID API gateway

**Postconditions:**
1. Company.VNeIDRegistered = true
2. VNeID organization account linked to company record
3. Legal representative's VNeID credentials mapped
4. Audit log entry: `VNeIDRegistrationCompleted`

### Happy Path
1. User navigates to Admin → Company → VNeID Registration
2. System displays QR code + instructions for VNeID app
3. Legal representative opens VNeID app on phone
4. Legal representative scans QR code from system screen
5. Legal representative selects "Organization Account Registration" on VNeID
6. Legal representative confirms organization identity: TaxCode matches VNeID database
7. VNeID sends verification token back to system via callback URL
8. System validates callback token
9. System queries VNeID API for organization details
10. System matches returned data (TaxCode, CompanyName, LegalRep) against local record
11. System updates Company.VNeIDRegistered = true, stores VNeID organization ID
12. System logs `VNeIDRegistrationCompleted`
13. System displays "VNeID organization account linked successfully"

### Alternative Path: Legal Representative Verification on VNeID
1. Legal rep does not have VNeID Level-2 account
2. System displays: "Legal representative must have VNeID Level-2 account to proceed"
3. System provides link to VNeID registration guide
4. Legal rep completes VNeID Level-2 registration (out of system)
5. User retries VNeID registration from step 1

### Alternative Path: Token Timeout
1. A1-A6 same
2. QR code expires (valid for 5 minutes)
3. System detects timeout — no callback received
4. System returns: "QR code expired. Please start again."
5. System generates new QR code
6. User retries from step 3

### Exception Path: TaxCode Mismatch with VNeID
1. A1-A9 same
2. VNeID API returns organization data with TaxCode different from local Company.TaxCode
3. System logs mismatch details
4. System notifies admin: "TaxCode on VNeID ([VNeIDTaxCode]) does not match registered TaxCode ([LocalTaxCode]). Contact tax authority to resolve."
5. Registration cannot proceed until resolved
6. System leaves VNeIDRegistered = false

### Exception Path: VNeID API Unavailable
1. A1-A8 same
2. System tries to call VNeID API — service unavailable / timeout
3. System displays: "VNeID service is currently unavailable. Please try again later."
4. System retries 2 more times with 30s interval (automatic)
5. If still failing: "VNeID registration temporarily unavailable. Your changes have been saved as draft."
6. System saves registration attempt as Draft

---

## UC-15: View Company Profile and Dashboard

**Actor:** Any authenticated user assigned to company

**Description:** View a consolidated dashboard of company information: general info, status, key metrics, compliance status, recent activity, and quick-access actions.

**Preconditions:**
1. User is authenticated and assigned to a company (active company context set)

**Postconditions:**
1. N/A (view-only — no data changes)
2. Audit log entry: `CompanyProfileViewed` (optional, for analytics)

### Happy Path
1. User navigates to Admin → Company (or dashboard after login)
2. System loads active company context from session
3. System fetches Company + CompanySettings
4. System loads summary counts:
   - Total legal representatives (active)
   - Total business lines (main + secondary)
   - Total branches/rep offices
   - Total bank accounts
   - Total capital contributors
5. System loads compliance status:
   - VNeID registration status (Registered / Not Registered)
   - Expiring licenses (next 30 days count)
   - Expired documents count
6. System loads recent activity (last 10 audit log events for this company)
7. System loads user's role/permissions for this company
8. System renders Company Dashboard view:
   - Company name, TaxCode, status badge, logo
   - Quick-info cards (legal rep, address, phone, email)
   - Settings summary (fiscal year, currency, tax method, inventory method)
   - Compliance alerts (expiring licenses, missing VNeID)
   - Recent activity feed
   - Quick action buttons (Edit Info, Settings, Users)

### Alternative Path: Incomplete Profile Warning
1. A1-A8 same
2. System detects missing critical info: No legal representative / No bank account / No business line
3. System displays warning banner: "Company profile is incomplete. [N] item(s) require attention."
4. Each missing item linked to the relevant section
5. Banner remains until all critical items complete

### Alternative Path: Suspended/Dissolved Company View
1. Company status ≠ Active
2. System displays status-specific banner: "Company is [Temporarily Suspended / Dissolving / Dissolved]"
3. System suppresses action buttons (no Edit, no Settings, no User management for dissolved)
4. System shows read-only view
5. Audit log events related to status change shown prominently

### Exception Path: No Active Company
1. User has UserCompany records, but none with IsActive=true
2. System displays: "No active company found. Contact your administrator."
3. System logs `NoActiveCompany` event
4. User cannot proceed without company context

### Exception Path: Company Data Load Failure
1. System tries to load company data
2. Database unavailable or query fails
3. System returns: "Unable to load company data. Please try again."
4. System logs error with correlation ID
5. User can retry

---

## Business Rules Summary

| ID | Rule | Source |
|---|---|---|
| BR-01 | TaxCode must be unique across all companies | Tax Law / DB constraint |
| BR-02 | TaxCode format: 10 digits (standard) or 13 digits (subsidiary) | Tổng cục Thuế |
| BR-03 | LLC max 50 members | Luật Doanh nghiệp 2020 §46 |
| BR-04 | Company must have at least one legal representative | Luật Doanh nghiệp 2020 §12 |
| BR-05 | LLC1 requires exactly one legal rep; LLC2/JSC allow multiple | Luật Doanh nghiệp 2020 §12 |
| BR-06 | Capital ratios must total 100% (±0.01% tolerance) | Luật Doanh nghiệp 2020 |
| BR-07 | Fiscal year cannot change after journal entries posted | Accounting convention |
| BR-08 | Data corrections must preserve original with audit trail | TT 99/2025/TT-BTC |
| BR-09 | Security token (JWT) 15min access + 7d refresh | Security policy |
| BR-10 | Account lockout after 5 failed login attempts (15min default) | Security policy |
| BR-11 | Failed login attempts increment, lock at threshold | Security policy |
| BR-12 | Password history: cannot reuse last 10 passwords | Security policy |
| BR-13 | Company status state machine: Active ⇄ Suspended → Dissolving → Dissolved (terminal) | Luật Doanh nghiệp 2020 §207-210 |
| BR-14 | Dissolved company data retained min 5 years | Tax Law |
| BR-15 | VNeID org account required for electronic tax filing | NĐ 69/2024/NĐ-CP |
| BR-16 | Legal rep must have VNeID Level-2 for org registration | NĐ 69/2024/NĐ-CP |
| BR-17 | CCCD format: 12 digits (new card) or 9 digits (old CMND) | Luật CCCD |
| BR-18 | At least one active bank account recommended for operations | Recommendation |
| BR-19 | Conditional business lines require corresponding license | Luật Doanh nghiệp 2020 §29-30 |
| BR-20 | Company must have at least one main business line | Luật Doanh nghiệp 2020 §29 |
