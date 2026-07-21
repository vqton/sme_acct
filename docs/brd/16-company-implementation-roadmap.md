# Implementation Roadmap — Company Module

**Version:** 1.0
**Date:** 2026-07-20
**Status:** Draft — prioritised per regulatory risk, dependency chain, migration safety
**Sources:** `docs/brd/08-company-module-brd.md` through `docs/brd/15-company-user-stories.md`, `docs/standards/08-implementation-roadmap.md`

---

## 1. Strategy

### Value Delivery Order

```
Regulatory Risk ──→ Data Integrity ──→ Migration Safety ──→ Feature Completeness ──→ Integration
```

1. **Fix 5 blocking gaps first**: VNeID linkage (NĐ 69/2024), enterprise code validation (Luật DN 2020 Điều 29), charter capital (Điều 30), multiple legal reps (Điều 12-13), accounting regime enforcement (TT 99/2025). Cannot legally operate without these.
2. **Migration before new features**: Existing companies with 12-field skeleton must migrate to full aggregate without data loss. Dry-run on staging mandatory before any PROD deploy.
3. **Data model expansion before UI**: All new entities + SQLite schema migrations + validation rules must exist before any frontend work. Parallel UI development only on stable API contracts.
4. **Tracer-bullet entities first**: LegalRepresentative, BusinessLine, CapitalContributor ship before branches, documents, audit firm. Each entity is its own complete vertical slice.
5. **VNeID last (API integration)**: VNeID entity fields + status tracking first (store the identifier), API integration last (government API volatility). Feature-flag the API call — fallback to manual status entry.

### Team Assumptions

- 1 senior backend (Dev 1) + 1 mid backend (Dev 2) + 1 frontend (FE)
- Shared infra with User Management team — AuditInterceptor, tenant filter, session from Phase 1 of User Mgmt roadmap
- External API integration (VNeID, Tax Authority) in Phase 4 — coordinated with User Management integration phase

---

## 2. Dependency Graph

```
Sprint 1           Sprint 2-3          Sprint 4-5           Sprint 6-7            Sprint 8-9
────────           ──────────          ──────────           ──────────            ──────────
Enums + Base       LegalRep ──────→  Branch/RO           VNeID_Fields ──────→  VNeID_API
  │                   │                │                      │
  ├─→ CompanyExp     CapitalContrib    License               AuditFirm              TaxAuthAPI
  │     (blocking)   │                │                      │
  ├─→ TaxCodeValid   BusinessLine ──→ Seal + Doc             PDF Export             PortalSync
  │                   │                                      │
  └─→ CompanyStatus  BankAccount    FormerNames            ExpiryAlerts
                      │
  MigrationScript    TaxOffice    ──→ Admin UI + Dashboard    ContextSwitch
     (parallel)       │
                    SettingsRegime ──→ IntegrationTests     FullMigration
```

### Blocking Edges

| Task | Blocks | Reason |
|------|--------|--------|
| Enum types + base entities | All Phase 1 tasks | Every entity references CompanyType, CompanyStatus, AccountingRegime enums |
| Company entity expansion | LegalRep, CapitalContributor, BusinessLine, BankAccount | Foreign key to Company.Id must exist first |
| TaxCode validation + uniqueness | Company creation, LegalRep VNeID matching | TaxCode is root identifier across all integrations |
| CompanyStatus state machine | Status change workflow, financial operation gating | No status enforcement without state machine |
| Migration script (old→new) | Any PROD deploy of Phase 1+ | Existing company data must be preserved |
| LegalRepresentative entity | Legal rep change workflow, VNeID registration, digital signature | Legal rep is actor for all compliance workflows |
| Settings (AccountingRegime + TaxMethod) | GL module integration, Tax module integration | Drives COA template, report format, tax calculation |
| Admin UI | User acceptance testing | Cannot validate without screens |
| VNeID entity fields | VNeID API integration, tax filing gate | Store identifier before wiring API calls |
| VNeID API | Tax filing features | NĐ 69/2024 blocks e-tax without verified VNeID |

---

## 3. Phase Roadmap

### Phase 0: Foundation (Sprint 0 — Company-specific domain prep)

| Task | Status | Evidence |
|------|--------|----------|
| Domain enum types (CompanyType, CompanyStatus, AccountingRegime, TaxCalculationMethod, InventoryMethod, RoundingMethod, ExchangeRateSource, CompanyLicenseType, DocumentType, ContributorType, BranchType, VNeIDStatus) | ❌ Not started | Need new file: `domain/enums/CompanyEnums.ts` — 12 const enums |
| Core value objects (Address: ProvinceId/DistrictId/WardId, EnterpriseCode with regex validation) | ⚠️ Partial | `TaxCode.ts` exists. Need `Address.ts`, `EnterpriseCode.ts`, `VNeIDNumber.ts` |
| Existing Company model audit — map current fields to target | ❌ Not started | Run schema diff |
| Target data model review + sign-off | ❌ Not started | Reviewed in BRD. Stakeholder sign-off needed. |

#### T0.1: Domain Enums + Value Objects

| Attribute | Detail |
|-----------|--------|
| **Why** | Every entity references these enums. Must exist before any entity can be defined. |
| **What** | 12 TypeScript const enums matching BRD §4.2 definitions. 4 value objects with validation (TaxCode, EnterpriseCode, Address, VNeIDNumber). TaxCode checksum algorithm per Tổng cục Thuế spec. |
| **Files** | New: `domain/enums/CompanyEnums.ts`. New: `domain/valueObjects/EnterpriseCode.ts`, `domain/valueObjects/Address.ts`, `domain/valueObjects/VNeIDNumber.ts`. Existing: `TaxCode.ts` (update). |
| **Skill** | Backend — TypeScript domain modeling |
| **Test** | Unit: each enum has expected count test. Unit: TaxCode format + checksum validation. |
| **Dependency** | None — can start immediately |
| **Definition of Done** | All 12 const enums defined with JSDoc. Value objects reject invalid input. Unit tests pass. |

#### T0.2: Target Data Model Design Review

| Attribute | Detail |
|-----------|--------|
| **Why** | Alignment across team before writing 20+ entity classes. Avoid rework. |
| **What** | Review BRD §4 target data model with Dev team. Confirm field names, types, indexes, FK relationships. Update based on feedback. |
| **Files** | `docs/brd/08-company-module-brd.md` §4 (updated if needed) |
| **Skill** | BA + Senior Backend |
| **Test** | N/A — document review |
| **Dependency** | None |
| **Definition of Done** | Data model reviewed, signed off, changes committed to BRD doc. |

---

### Phase 1: Core Data Model + 5 Blocking Gaps (Sprints 1-3)

**Goal:** Expand Company entity from 12 fields to 60+ fields. Fix all 5 blocking gaps. Migration script preserves existing data.
****Skill:**** Backend (.NET), EF Core, Domain modeling
**Risk:** CRITICAL — blocking gaps prevent legal operation. Migration could lose data.

#### T1: Company Entity Expansion ⚡ HIGHEST PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Why** | Current Company has 12 fields. Target requires 60+ across 10+ related entities. 5 blocking gaps depend on expanded entity. |
| **What** | Expand `Company` entity with: EnterpriseCode, CompanyType, NameVietnamese/English/Abbreviated, CharterCapital/PaidInCapital, DateOfEstablishment/Commencement, HeadOfficeAddress with Province/District/Ward, Status with CompanyStatus enum. Convert current Name→NameVietnamese, current LegalRepresentative text field→deprecated (replaced by T4). Add VNeIDOrganizationId, VNeIDStatus. All audit fields. |
| **Files** | Modified: `domain/entities/Company.ts` (full rewrite). New: `infrastructure/database/CompanyConfiguration.cs`. Modified: `infrastructure/database/schema.ts` |
| **Skill** | Senior Backend — TypeScript, domain entities |
| **Test** | Unit: entity factory creates valid company. Integration: save + retrieve all new fields. Verify indexes on EnterpriseCode (unique), TaxCode (unique filtered), Status, CompanyType. |
| **Dependency** | T0.1 (enums + value objects) |
| **Definition of Done** | Company entity carries all 40+ scalar fields. Unique constraints enforced. Integration test passes CRUD on each new field. |

#### T2: TaxCode + EnterpriseCode Validation

| Attribute | Detail |
|-----------|--------|
| **Why** | Blocking gap BG-02 (no enterprise code). TaxCode format and uniqueness must be enforced at API boundary (BR-CI-01, BR-CI-02). |
| **What** | TaxCode: regex validation `^\d{10}(-\d{3})?$` + checksum algorithm per Tổng cục Thuế. EnterpriseCode: regex `^\d{10}$`. Both indexed with unique constraint. |
| **Files** | Modified: `domain/valueObjects/TaxCode.ts` (add checksum). Modified: `infrastructure/database/CompanyConfiguration.cs` (add indexes). New: `domain/services/CompanyValidationService.ts` |
| **Skill** | Backend — validation, checksum algorithms |
| **Test** | Unit: valid TaxCode formats pass, invalid reject, checksum correct/incorrect. Integration: duplicate TaxCode → 409. |
| **Dependency** | T1 (Company entity exists) |
| **Definition of Done** | TaxCode validated at UI (inline), API (422), DB (unique constraint). Checksum confirms 10th digit. EnterpriseCode matches `^\d{10}$`. |

#### T3: CompanyStatus State Machine

| Attribute | Detail |
|-----------|--------|
| **Why** | Blocking gap BG-09. Current IsActive bool replaced by rich status lifecycle. Status gates all financial operations (BR-CL-05). |
| **What** | State machine: Pending → Active ↔ Suspended → Dissolving → Dissolved. Bankrupt as terminal. StatusChangeLog entity with reason, effective date, document ref. Status gate middleware checks company status before write operations. |
| **Files** | New: `domain/services/CompanyStatusMachine.ts`. New: `domain/entities/StatusChangeLog.ts`. New: `infrastructure/database/StatusChangeLogConfiguration.cs`. New: `presentation/middleware/CompanyStatusGateMiddleware.cs` |
| **Skill** | Backend — state machine pattern, middleware |
| **Test** | Unit: all valid transitions allowed, invalid rejected. Integration: set Suspended → verify GL write returns 403. Integration: set Dissolved → verify all write ops return 403. |
| **Dependency** | T1 (Company entity with Status field) |
| **Definition of Done** | Status transitions enforced by state machine. Financial operations gated by status middleware. StatusChangeLog records every transition. |

#### T4: LegalRepresentative Entity (1:N) ⚡ BLOCKING GAP

| Attribute | Detail |
|-----------|--------|
| **Why** | Blocking gap BG-04. Single text field replaced by typed 1:N entity. Luật DN 2020 Điều 12-13 mandates multiple legal rep support. |
| **What** | `LegalRepresentative` entity: FullName, VNeIDNumber (12-digit), Position, IsPrimary, AuthorizationScope, DigitalCertSerial/Provider/Expiry, VNeIDVerifiedAt, FromDate/ToDate, IsActive. Company must have ≥1 active rep, exactly 1 primary. CCCD uniqueness per company. |
| **Files** | New: `domain/entities/LegalRepresentative.ts`. New: `infrastructure/database/LegalRepresentativeConfiguration.cs`. Modified: `domain/entities/Company.ts` (add LegalRepresentatives collection) |
| **Skill** | Senior Backend — aggregate design, TypeScript |
| **Test** | Unit: factory creates valid legal rep. Integration: add 3 reps, designate primary, remove secondary. Integration: block removal of last rep. Integration: block duplicate CCCD. |
| **Dependency** | T1 (Company entity), T0.1 (VNeIDNumber value object) |
| **Definition of Done** | Company can have 1:N legal reps. Exactly 1 primary. CCCD unique per company. VNeIDNumber validated (12 digits). No removal of last active rep. |

#### T5: AccountingRegime + TaxMethod on CompanySettings ⚡ BLOCKING GAP

| Attribute | Detail |
|-----------|--------|
| **Why** | Blocking gaps BG-14, BG-15. No regime selection means chart of accounts and report templates cannot be determined. Tax calc method drives VAT tracking. |
| **What** | Add to CompanySettings: AccountingRegime enum (TT99/TT133), TaxCalculationMethod (KhauTru/TrucTiep/TrucTiepTrenDoanhThu/HonHop). Change DecimalPlaces default from 2 to 0 per TT 99/2025 §8. Add RoundingMethod, ExchangeRateSource, LastPeriodClosed, ClosedPeriodCount, FirstPeriodStartDate. |
| **Files** | Modified: `domain/entities/CompanySettings.ts` (add 5+ new fields). New: `infrastructure/database/CompanySettingsConfiguration.cs`. |
| **Skill** | Backend — SQLite schema |
| **Test** | Unit: default DecimalPlaces = 0. Integration: create company → settings created with TT99 default. Integration: change regime → verify blocked after first period close. |
| **Dependency** | T0.1 (AccountingRegime enum), T1 (Company entity) |
| **Definition of Done** | CompanySettings includes AccountingRegime, TaxCalculationMethod, RoundingMethod, ExchangeRateSource, LastPeriodClosed. DecimalPlaces defaults to 0. All locked after first period close. |

#### T6: CapitalContributor + Charter Capital Tracking ⚡ BLOCKING GAP

| Attribute | Detail |
|-----------|--------|
| **Why** | Blocking gaps BG-03, BG-05. Charter capital and contributor registry required by Luật DN 2020 Điều 30, 34, 36. |
| **What** | `CapitalContributor` entity: ContributorType (Individual/Organization), FullName/OrgName, IdNumber/TaxCode, ContributionType (Member/Shareholder/CapitalContributingMember), CapitalContribution (decimal 18,2), OwnershipRatio (decimal 5,2), ContributionDate, ContributionCertificate, IsFounder. Add CharterCapital + PaidInCapital to Company. Validation: total ratio = 100% (±0.01), CTCP requires ≥3 shareholders, DNTN has 1 owner. |
| **Files** | New: `domain/entities/CapitalContributor.ts`. New: `infrastructure/database/CapitalContributorConfiguration.cs`. Modified: `domain/entities/Company.ts` (add CharterCapital, PaidInCapital, CapitalContributors collection) |
| **Skill** | Backend — aggregate design, validation |
| **Test** | Unit: ratio validation (sum = 100%). Integration: add 3 contributors → verify ratio auto-calculated. Integration: CTCP with 2 contributors → reject. Integration: CharterCapital change triggers capital change history. |
| **Dependency** | T1 (Company entity), T0.1 (ContributorType enum) |
| **Definition of Done** | Company tracks charter capital + paid-in capital. CapitalContributor list maintained with validation. Ownership ratio auto-calculated. Company-type constraints enforced. Capital change history preserved. |

#### T7: BusinessLine + VSIC Codes

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-05. VSIC code classification required by NĐ 168/2025. Primary business line drives tax declarations. |
| **What** | `BusinessLine` entity: VsicCode (string 10), VsicLevel (int 2-6), Name (string 500), IsPrimary, StartDate, EndDate, LicenseReference. VSIC hierarchy loading from seed data (source: GSO VSIC 2018). Exactly 1 primary business line. Conditional business lines flagged with warning. |
| **Files** | New: `domain/entities/BusinessLine.ts`. New: `infrastructure/database/BusinessLineConfiguration.cs`. New: `infrastructure/database/VSIC2018Seed.cs` |
| **Skill** | Backend — TypeScript, hierarchical data |
| **Test** | Unit: primary line enforced. Integration: add 3 lines, change primary. Integration: query by VSIC level. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Company has 1:N business lines. VSIC code validated against seed data. Exactly 1 primary. Conditional business lines display warning. |

#### T8: BankAccount Management

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-08. Tax payment bank account required for operations. LUẬT QLT 38/2019 requires registered tax payment account. |
| **What** | `CompanyBankAccount` entity: AccountNumber (string 50), AccountName (string 200), BankName (string 200), BankBranch, SwiftCode, CurrencyCode (default VND), IsPrimaryTaxPayment, IsActive, OpenedDate. Validation: account number 8-20 digits, bank name from SBV-licensed list, exactly 1 primary tax payment account. |
| **Files** | New: `domain/entities/CompanyBankAccount.ts`. New: `infrastructure/database/CompanyBankAccountConfiguration.cs` |
| **Skill** | Backend — SQLite |
| **Test** | Integration: add 3 accounts, designate primary. Integration: remove primary → must designate new primary. Integration: account number format validation. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Company has 1:N bank accounts. Exactly 1 primary tax payment account. Account format validated. |

#### T9: TaxAuthority Assignment

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-10. Tax office assignment required for declaration routing and report headers. |
| **What** | Add to Company: TaxOfficeId, TaxOfficeName, TaxDepartment, ManagedByTaxAuthorityCode. Seed data for Vietnamese tax offices (Cục Thuế 63 provinces + Chi cục Thuế ~700 districts). |
| **Files** | Modified: `domain/entities/Company.ts` (add tax office fields). New: `infrastructure/database/TaxOfficeSeed.cs` |
| **Skill** | Backend — SQLite seed data |
| **Test** | Integration: assign tax office → verify on company read. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Company assigned to tax office. Tax office data seeded. Office name included in declaration headers. |

#### T10: Correction Reason Framework + Audit Trail Wiring

| Attribute | Detail |
|-----------|--------|
| **Why** | TT 99/2025 Điều 28 mandates correction reason + before/after values for legally significant fields (tax code, enterprise code, name, charter capital, legal reps). Blocking gap BG-26. |
| **What** | Extend existing AuditInterceptor (from User Mgmt Phase 1) to capture OldValues/NewValues on Company aggregate entities. Require `CorrectionReason` string for designated critical fields. Audit log preserves all historical versions. |
| **Files** | Modified: `infrastructure/database/AuditSaveChangesInterceptor.cs` (extend for Company aggregate). New: `domain/entities/CompanyAuditEntry.ts` |
| **Skill** | Senior Backend — audit interceptor |
| **Test** | Integration: modify TaxCode → verify audit entry has old/new values + reason. Integration: modify email → verify audit entry (no reason required). |
| **Dependency** | T1-T9 (all Phase 1 entities). AuditInterceptor exists from User Mgmt Phase 1. |
| **Definition of Done** | Every change to Company aggregate entities logged with before/after values. Critical field changes require mandatory reason. Audit is immutable. |

#### T11: Migration Script (Old → New Schema)

| Attribute | Detail |
|-----------|--------|
| **Why** | Existing PROD companies with old 12-field schema must migrate to new 60+ field aggregate. Data integrity is critical. |
| **What** | EF Core migration with custom SQL: (1) Back up existing Company table. (2) Add all new columns with defaults/nulls. (3) Map old Name → NameVietnamese. (4) Map old LegalRepresentative text → new LegalRepresentative entity (single rep with IsPrimary=true). (5) Create CompanySettings if missing. (6) Preserve UserCompany records. (7) Verify row counts match. Rollback script included. |
| **Files** | New: `infrastructure/database/migrations/{timestamp}_ExpandCompanyEntity.cs`. New: `infrastructure/database/migrations/{timestamp}_SeedLegalRepresentative.cs` |
| **Skill** | Senior Backend — SQLite migrations, data integrity |
| **Test** | Dry-run on staging DB clone. Data diff: old vs new row counts, field-by-field comparison for each company. Rollback script tested. |
| **Dependency** | T1-T10 (all new entities + fields must exist in migration target) |
| **Definition of Done** | Migration runs successfully on staging. Zero data loss. Rollback restores original state. Data diff script confirms 100% fidelity. |

#### T12: UserCompany Tenant Isolation Audit

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-16. Tenant isolation must be enforced at query level. All tenant-scoped entities filtered by CompanyId. |
| **What** | Audit existing query patterns to ensure all scoped queries include `WHERE CompanyId = @CurrentCompanyId`. Tenant filter interceptor pattern (global query filter) applied to all scoped DbSets. Verify UserCompany records scoped correctly. |
| **Files** | Modified: `infrastructure/database/schema.ts` (add global query filters). New: `presentation/middleware/TenantResolutionMiddleware.cs` |
| **Skill** | Backend — middleware, security |
| **Test** | Security: user from Company A attempts to access Company B data → blocked. Integration: cross-company query returns empty. |
| **Dependency** | T1 (Company entity). Tenant filter pattern from User Mgmt foundation. |
| **Definition of Done** | All tenant-scoped entities have `CompanyId` global query filter. Cross-company data leak prevented. Integration test proves isolation. |

---

### Phase 2: Extended Entities + Admin UI (Sprints 4-5)

**Goal:** Branch management, documents, licenses, company seal, former names. Admin UI for Phase 1+2 entities.
****Skill:**** Backend + Frontend (Blazor/React)
**Risk:** MEDIUM — UI scope creep, file storage setup

#### T13: Branch/RO/Location Entity

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-07. Luật DN 2020 Điều 43-45 requires branch/RO tracking. Branches have separate tax codes. |
| **What** | `Branch` entity: BranchType (Branch/RO/BusinessLocation), Name, Address, TaxCode (parent code + `-\d{3}`), Phone, ManagerName, Status, DateOpened, DateClosed. TaxCode validation against parent company. |
| **Files** | New: `domain/entities/Branch.ts`. New: `infrastructure/database/BranchConfiguration.cs` |
| **Skill** | Backend — SQLite |
| **Test** | Integration: CRUD branch. Integration: verify branch taxCode format `^\d{10}-\d{3}$` + first 10 digits = parent TaxCode. |
| **Dependency** | T1 (Company entity with TaxCode), T2 (TaxCode validation) |
| **Definition of Done** | Company manages branches/ROs/Locations. Branch tax code validated against parent. Status tracked independently. |

#### T14: CompanyLicense + Permits

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-11. Business registration certificate, sub-licenses, permit tracking with expiry. |
| **What** | `CompanyLicense` entity: LicenseType (BusinessRegCert/TaxRegCert/SealRegCert/SubLicense/Other), LicenseNumber, IssuedBy, DateIssued, DateExpiry, FileUrl, Notes. Expiry monitoring for alerts. |
| **Files** | New: `domain/entities/CompanyLicense.ts`. New: `infrastructure/database/CompanyLicenseConfiguration.cs` |
| **Skill** | Backend — SQLite |
| **Test** | Integration: add license with expiry. Integration: query licenses expiring within 30 days. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Company licenses tracked with expiry dates. Queryable by expiry window. |

#### T15: CompanySeal

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-13. Company seal image and registration number per Luật DN 2020 Điều 43. |
| **What** | `CompanySeal` entity: SealRegistrationNumber, SealImageUrl, IssuedBy, DateRegistered, Notes. 0:1 relationship with Company. |
| **Files** | New: `domain/entities/CompanySeal.ts`. New: `infrastructure/database/CompanySealConfiguration.cs` |
| **Skill** | Backend — file storage, SQLite |
| **Test** | Integration: create company with seal. Integration: update seal image URL. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Company has optional seal record. Image stored in blob storage. Seal registration number validated format. |

#### T16: CompanyDocument Management

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-12. Certificate and license file upload with expiry tracking. |
| **What** | `CompanyDocument` entity: DocumentType (enum), FileName, FileUrl, FileSize, ContentType, ExpiryDate, UploadedAt. File upload validation: max 10MB, PDF/JPEG/PNG. Blob storage integration. |
| **Files** | New: `domain/entities/CompanyDocument.ts`. New: `infrastructure/database/CompanyDocumentConfiguration.cs`. New: `infrastructure/storage/BlobStorageService.ts` |
| **Skill** | Backend + DevOps — blob storage, file validation |
| **Test** | Integration: upload document → verify FileUrl returned. Integration: upload >10MB → rejected. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Documents uploaded to blob storage. File type + size validated. Expiry dates tracked. |

#### T17: FormerNames Tracking

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-02.3. Name changes must preserve history. FormerName entity immutable. |
| **What** | `FormerName` entity: Name, FromDate, ToDate. Auto-created when NameVietnamese or NameEnglish changes. Manual add supported for backdating. Immutable — cannot be deleted. |
| **Files** | New: `domain/entities/FormerName.ts`. New: `infrastructure/database/FormerNameConfiguration.cs`. Modified: `domain/entities/Company.ts` (add FormerNames collection) |
| **Skill** | Backend — TypeScript, SQLite |
| **Test** | Integration: change company name → verify FormerName created. Integration: try delete former name → blocked. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Name changes auto-create FormerName records. Former names displayed in read-only section. Manual backdate supported. |

#### T18: Admin UI Screens (Phase 1+2 Entities) ⚡ HIGH EFFORT

| Attribute | Detail |
|-----------|--------|
| **Why** | Users cannot configure companies without UI. 8+ entity CRUD screens + company dashboard + settings page. |
| **What** | Screens: (1) Company registration wizard (step 1 identity, step 2 legal reps, step 3 business lines, step 4 settings, step 5 bank account). (2) Company profile dashboard with status, compliance section, activity feed. (3) Company info edit form. (4) Legal rep management page. (5) Business lines page with VSIC browser. (6) Capital contributors page. (7) Bank accounts page. (8) Settings page with accounting regime, tax method, decimal places. (9) Branch/RO management page. (10) Document upload page. (11) License management page. |
| **Files** | 20+ UI files (Blazor pages / React components depending on framework). Detail per framework convention. |
| **Skill** | Frontend — Blazor or React (match existing app framework) |
| **Test** | E2E: full registration wizard creates company with all entities. UI: validation errors displayed inline. UI: company switcher works. |
| **Dependency** | T1-T17 (all Phase 1 + Phase 2 entities must have stable API contracts) |
| **Definition of Done** | All entity CRUD operations available via UI. Company dashboard displays status, warnings, activity feed. Settings page respects lock-after-close rules. |

#### T19: Company Overview Dashboard

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-02.1, US-003. Users need at-a-glance view of company status, compliance health, recent activity. |
| **What** | Dashboard components: status badge (color-coded), quick-info cards (charter capital, legal reps, business lines, bank accounts), compliance section (VNeID status, expiring licenses, expired documents), recent activity feed (last 10 audit events), warning banner for incomplete profile. |
| **Files** | New UI page + components. |
| **Skill** | Frontend — UI components |
| **Test** | UI: dashboard loads with mock data. UI: warning banner appears when profile incomplete. |
| **Dependency** | T18 (Admin UI framework), T10 (audit trail for activity feed), T14 (license expiry for compliance section) |
| **Definition of Done** | Dashboard displays all required sections. Warnings appear for incomplete/compliance issues. Color-coded status badge visible. |

#### T20: Integration Tests (Phase 1+2)

| Attribute | Detail |
|-----------|--------|
| **Why** | Ensure all entities, validations, and workflows work together. Blocking gap for Phase 2→3 gate. |
| **What** | Integration test suite: (1) Full company registration flow. (2) Legal rep add/remove/replace. (3) Status lifecycle (Active→Suspended→Active→Dissolved). (4) Settings change + lock. (5) Tenant isolation breach attempt. (6) Audit trail integrity. (7) Capital contributor validation. (8) Branch CRUD with tax code. (9) Document upload flow. (10) License expiry query. |
| **Files** | `tests/SmeAccounting.IntegrationTests/CompanyModule/` — 10+ test files |
| **Skill** | Backend — integration testing |
| **Test** | N/A — this IS the test effort |
| **Dependency** | All Phase 1 + Phase 2 entities |
| **Definition of Done** | All 10+ integration scenarios passing. Code coverage ≥ 75% on Company module entities. |

---

### Phase 3: Compliance & VNeID (Sprints 6-7)

**Goal:** VNeID registration fields + status tracking, audit firm, PDF export, expiry alerts, multi-company context switching.
****Skill:**** Backend + Frontend
**Risk:** HIGH — VNeID API dependency in Phase 4, but Phase 3 stores entity fields independently

#### T21: VNeID Registration Fields + Status Tracking

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-15. NĐ 69/2024 mandates VNeID for tax e-transactions. Store org ID and status before API integration. |
| **What** | Add to Company: VNeIDOrganizationId, VNeIDRegistrationDate, VNeIDStatus (enum: NotRegistered/Registered/Verified/Revoked), LastVNeIDSyncAt. VNeIDRegistrationAttempt audit entity. UI shows VNeID status badge. **No API integration yet** — status set manually or via import. |
| **Files** | Modified: `domain/entities/Company.ts` (add VNeID fields). New: `domain/entities/VNeIDRegistrationAttempt.ts`. UI: VNeID status component. |
| **Skill** | Backend + Frontend |
| **Test** | Integration: set VNeID status → verified → UI shows verified badge. Integration: VNeIDVerified blocks tax filing when not Verified. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | VNeID organization ID and status stored. Tax filing features blocked when VNeID not Verified. Status badge on dashboard. |

#### T22: AuditFirm + AuditAssignment

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-14. Annual audit firm assignment tracking per Luật Kế toán 88/2015. |
| **What** | `AuditAssignment` entity: AuditFirmName, AuditFirmTaxCode, AuditFirmAddress, AssignmentYear, EngagementPartner, AuditStartDate, AuditEndDate, AuditReportReference, Status (Assigned/InProgress/Completed/Terminated). |
| **Files** | New: `domain/entities/AuditAssignment.ts`. New: `infrastructure/database/AuditAssignmentConfiguration.cs` |
| **Skill** | Backend — SQLite |
| **Test** | Integration: assign audit firm for year. Integration: query all audit assignments by company. |
| **Dependency** | T1 (Company entity) |
| **Definition of Done** | Annual audit assignments tracked. Status lifecycle managed. Linked to audit report document. |

#### T23: Company Profile PDF Export

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-17.1. PDF export of company profile for regulatory submission. |
| **What** | PDF generation service: company overview, legal reps table, business lines, capital structure, bank accounts. Uses Razor PDF or similar. |
| **Files** | New: `infrastructure/pdf/CompanyProfilePdfGenerator.ts`. New: `presentation/controllers/CompanyExportController.cs` |
| **Skill** | Backend — PDF generation |
| **Test** | Integration: generate PDF → verify content includes all sections. |
| **Dependency** | All Phase 1 + Phase 2 entities |
| **Definition of Done** | PDF generated with all company data. Downloadable from UI. Content verified in test. |

#### T24: License + Document Expiry Alerts

| Attribute | Detail |
|-----------|--------|
| **Why** | US-030. 90/30/7-day expiry alerts for licenses, certificates, permits, digital certs. |
| **What** | Background job runs daily: queries CompanyLicense + CompanyDocument + LegalRepresentative.DigitalCertExpiry. Generates alerts: 90-day dashboard warning, 30-day in-app + email, 7-day high priority. Expired items auto-deactivated. Critical documents expired >30 days block write ops. |
| **Files** | New: `infrastructure/jobs/ExpiryAlertJob.cs`. New: `domain/services/ExpiryAlertService.ts` |
| **Skill** | Backend — background jobs, notifications |
| **Test** | Integration: set document expiry 5 days away → verify alert generated. Integration: expired license → verify write ops blocked. |
| **Dependency** | T14 (CompanyLicense), T16 (CompanyDocument), T4 (LegalRepresentative for digital cert) |
| **Definition of Done** | Expiry alerts trigger at 90/30/7 day thresholds. Expired items auto-deactivated. Critical expired docs block writes. |

#### T25: Multi-Company Context Switching

| Attribute | Detail |
|-----------|--------|
| **Why** | US-024, FR-16.2. Users assigned to multiple companies need to switch context. |
| **What** | Company switcher UI in header: dropdown shows user's active companies with status badges. On switch: update CurrentCompanyId in session, reload company-specific data. Persist last-active company. Switch blocked for dissolved companies (read-only context). |
| **Files** | UI: CompanySwitcher component. Modified: `presentation/middleware/TenantResolutionMiddleware.cs` |
| **Skill** | Frontend + Backend |
| **Test** | E2E: user with 2 companies switches → dashboard reloads with Company B data. E2E: data isolation verified after switch. |
| **Dependency** | T12 (tenant isolation), T18 (Admin UI framework) |
| **Definition of Done** | Company switcher in header. Context switch reloads all company-scoped data. Last-active persisted. |

---

### Phase 4: External API Integration (Sprint 8-9)

**Goal:** Replace manual VNeID status with real API integration. Tax authority data exchange. National portal sync.
****Skill:**** Backend (.NET), API integration, DevOps
**Risk:** HIGH — government API reliability, authentication, rate limits

#### T26: VNeID API Integration (Adapter Pattern)

| Attribute | Detail |
|-----------|--------|
| **Why** | Replace manual VNeID status entry with real API calls. Enable automated sync per NĐ 69/2024. |
| **What** | `IVNeIDService` adapter pattern (follow ADR-0001). Real implementation: OAuth 2.0 authorization code flow, org identity fetch, permission delegation, daily sync background job. Feature-flagged — fallback to manual status if API unreachable. |
| **Files** | New: `domain/interfaces/IVNeIDService.ts`. New: `infrastructure/vneid/VNeIDService.ts`. New: `infrastructure/vneid/VNeIDOptions.ts`. New: `infrastructure/jobs/VNeIDSyncJob.cs` |
| **Skill** | Senior Backend — OAuth, HTTP client, Polly retry/circuit breaker |
| **Test** | Contract: WireMock.NET verifies request/response against VNeID sandbox. Integration: real OAuth flow (if sandbox available). |
| **Dependency** | T21 (VNeID entity fields), T4 (Legal rep VNeID numbers) |
| **Definition of Done** | VNeID org registration flow works end-to-end against sandbox. Daily sync job updates status. Feature-flag controls API vs manual mode. |

#### T27: Tax Authority Data Exchange

| Attribute | Detail |
|-----------|--------|
| **Why** | FR-10, DF-02, DF-04. Tax code verification, tax office routing, declaration format per tax authority. |
| **What** | Tax authority API integration: MST lookup (tax code verification), tax office assignment via API, declaration submission routing. XML/TXML format per TCT spec. |
| **Files** | New: `Infrastructure/TaxAuthority/TaxAuthorityService.cs`. New: `Infrastructure/TaxAuthority/TaxXmlBuilder.cs` |
| **Skill** | Backend — XML, government API |
| **Test** | Contract: XML validates against TCT XSD. Integration: MST lookup returns expected format. |
| **Dependency** | T2 (TaxCode validation), T9 (TaxOffice assignment) |
| **Definition of Done** | Tax code verified against TCT API. Tax office synced from registry. Declaration format matches TCT XSD. |

#### T28: National Business Portal Sync

| Attribute | Detail |
|-----------|--------|
| **Why** | NĐ 168/2025 Điều 35 — material company changes must be published within 10 days. |
| **What** | Integration with Cổng thông tin quốc gia về đăng ký doanh nghiệp (dangkykinhdoanh.gov.vn). Submit material changes (name, address, legal rep, capital). Track publication status. Reminder escalation: Day 9 → reminder, Day 10 → escalate to legal rep. |
| **Files** | New: `Infrastructure/NatBizPortal/NationalBizPortalService.cs`. Modified: T10 (audit trail flags PublishPending, starts 10-day timer) |
| **Skill** | Backend — HTTP API, background job |
| **Test** | Contract: mock portal API. Integration: material change → verify PublishPending flag set → verify timer started. |
| **Dependency** | T10 (correction reason + material change detection) |
| **Definition of Done** | Material changes trigger publication workflow. 10-day timer with reminders. Publication status tracked. |

---

## 4. Skills Allocation Matrix

| Task | Primary Skill | Secondary Skill | Team |
|------|---------------|-----------------|------|
| T0.1 Enums + ValueObjects | Domain modeling | — | Dev 2 |
| T0.2 Data model review | BA | — | BA + Dev 1 |
| T1 Company entity expansion | EF Core, Domain entities | Migration | Dev 1 (Senior) |
| T2 TaxCode validation | Validation, Checksum | Regex | Dev 2 |
| T3 Status state machine | State machine, Middleware | EF Core | Dev 2 |
| T4 LegalRepresentative entity | Aggregate design, EF Core | DDD | Dev 1 (Senior) |
| T5 Settings + AccountingRegime | EF Core, Configuration | — | Dev 2 |
| T6 CapitalContributor | Aggregate design, Validation | DDD | Dev 1 |
| T7 BusinessLine + VSIC | Hierarchical data, Seed | — | Dev 2 |
| T8 BankAccount | EF Core | — | Dev 2 |
| T9 TaxAuthority seed | Seed data, EF Core | — | Dev 2 |
| T10 Audit trail wiring | Audit interceptor | EF Core | Dev 1 (Senior) |
| T11 Migration script | EF Core migrations, SQL | Data integrity | Dev 1 (Senior) |
| T12 Tenant isolation | EF Core global query filters | Security | Dev 1 |
| T13 Branch/RO entity | EF Core | — | Dev 2 |
| T14 CompanyLicense | EF Core | — | Dev 2 |
| T15 CompanySeal | EF Core, Blob storage | — | Dev 2 |
| T16 Document management | Blob storage, File validation | — | Dev 2 |
| T17 FormerNames | EF Core owned types | — | Dev 2 |
| T18 Admin UI screens | Blazor/React | CRUD patterns | FE |
| T19 Dashboard | UI components | — | FE |
| T20 Integration tests | Integration testing | All entities | Dev 1 + 2 |
| T21 VNeID fields | EF Core, UI badge component | — | Dev 2 + FE |
| T22 AuditFirm entity | EF Core | — | Dev 2 |
| T23 PDF export | PDF generation | — | Dev 2 |
| T24 Expiry alerts | Background jobs, Notifications | — | Dev 2 |
| T25 Context switching | Session management, UI | — | FE + Dev 1 |
| T26 VNeID API | OAuth, Polly, HttpClient | Security | Dev 1 (Senior) |
| T27 Tax authority API | XML, Government API | — | Dev 1 |
| T28 National portal sync | HTTP API, Background jobs | — | Dev 1 |

---

## 5. Risk Management

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|------------|
| Migration data loss for existing companies | P1 | CRITICAL — irrecoverable data loss | Multiple dry-run migrations on staging. Data diff script. Rollback tested. Lock PROD DB during migration window. |
| VNeID API unavailable or changed (government) | P4 | HIGH — tax filing blocked | Entity fields stored independently (T21) — API gated by feature flag. Manual status entry fallback. |
| AccountingRegime selection blocks COA + reports downstream | P1 | HIGH — regime must be set before GL integration | Regime required at setup. Locked after first transaction. Decision guide in UI for Chief Accountant. |
| Company entity 60+ fields slows EF Core queries | P1 | MEDIUM — poor dashboard performance | Selective loading for dashboard (DTO projection). Split aggregate if performance test shows >500ms reads. |
| Legal rep VNeID API integration complexity (OTP, 2FA) | P4 | MEDIUM — frustrated users during legal rep change | OTP flow defined in WF-06. UX tested before PROD. Escalation path when OTP fails. |
| Team unfamiliar with Vietnamese regulatory domain | ALL | MEDIUM — wrong implementation | BRD + business rules doc provide law references. Chief Accountant role in review loop. |
| Parallel User Management + Company development conflict | P1 | MEDIUM — git merge conflicts | Share enum NuGet package. Company aggregate is single source of truth. Coordinate on AuditInterceptor + TenantFilter. |
| VSIC code seed data accuracy | P2 | LOW — wrong business line classification | Source from GSO official VSIC 2018. Import script verified against published CSV. |
| FE scope creep (11 screens in one sprint) | P2 | HIGH — missed sprint deadline | Prioritize: dashboard + registration wizard first. Defer: seal upload, document management, branch management to T13-T16. |
| NĐ 168/2025 publication timer enforcement | P4 | MEDIUM — regulatory non-compliance | 10-day timer with escalation chain. Legal rep alerted on day 9, day 10, day 14 (escalated). |

---

## 6. Acceptance Gates per Phase

### Phase 0 → Phase 1 Gate
- [ ] All 13 domain enums defined in `domain/enums/CompanyEnums.ts`
- [ ] TaxCode, EnterpriseCode, Address, VNeIDNumber value objects with validation
- [ ] Target data model reviewed and signed off
- [ ] Unit tests for all value objects pass

### Phase 1 → Phase 2 Gate
- [ ] Company entity expanded to 40+ scalar fields
- [ ] TaxCode + EnterpriseCode validation enforced at all boundaries
- [ ] CompanyStatus state machine gates financial operations
- [ ] LegalRepresentative 1:N working with VNeIDNumber validation
- [ ] AccountingRegime + TaxCalculationMethod on CompanySettings
- [ ] CapitalContributor with ratio validation and company-type constraints
- [ ] BusinessLine with VSIC code and primary line enforcement
- [ ] BankAccount with tax payment primary flag
- [ ] TaxOffice seed data loaded
- [ ] Correction reason required for critical field changes
- [ ] Migration script tested on staging — zero data loss
- [ ] Tenant isolation global query filters applied
- [ ] Code coverage ≥ 75% on Company module
- [ ] All 5 blocking gaps resolved

### Phase 2 → Phase 3 Gate
- [ ] Branch/RO/Location entity CRUD working
- [ ] CompanyLicense expiry tracking implemented
- [ ] CompanySeal optional record supported
- [ ] CompanyDocument upload + expiry tracking working
- [ ] FormerNames auto-created on name change
- [ ] Admin UI screens delivered for all Phase 1+2 entities
- [ ] Company dashboard displays status, compliance, activity
- [ ] Integration test suite for Phase 1+2 passing
- [ ] UI acceptance tested with stakeholders

### Phase 3 → Phase 4 Gate
- [ ] VNeID fields + status tracking on Company
- [ ] AuditFirm + AuditAssignment entity CRUD
- [ ] Company profile PDF export working
- [ ] Expiry alerts generating at 90/30/7 day thresholds
- [ ] Multi-company context switching functional
- [ ] Tax filing blocked when VNeID not Verified

### Phase 4 → PROD Gate
- [ ] VNeID API integration tested against sandbox
- [ ] Tax authority MST lookup verified
- [ ] National portal sync with 10-day timer working
- [ ] All integration tests pass
- [ ] Full data migration from PROD + verification
- [ ] Penetration test passed (tenant isolation focus)
- [ ] Load test within SLA (company dashboard <2s P95)
- [ ] Compliance audit reviewed and signed off

---

## 7. Delivery Schedule Summary

| Phase | Sprints | Tasks | Team | Target Date | Effort (person-weeks) |
|-------|---------|-------|------|-------------|----------------------|
| 0 — Foundation | Sprint 0 | T0.1, T0.2 | Dev 2 + BA | Sprint 0 (done from User Mgmt) | 1 |
| 1 — Core + Blocking | Sprints 1-3 | T1–T12 (12 tasks) | Dev 1+2 | Sprint 3 | 18 |
| 2 — Extended + UI | Sprints 4-5 | T13–T20 (8 tasks) | Dev 1+2+FE | Sprint 5 | 12 |
| 3 — Compliance | Sprints 6-7 | T21–T25 (5 tasks) | Dev 1+2+FE | Sprint 7 | 8 |
| 4 — API Integration | Sprints 8-9 | T26–T28 (3 tasks) | Dev 1 | Sprint 9 | 6 |

**Total: 9 sprints (18 weeks) for 28 tasks. ~45 person-weeks effort.**

### Parallelization Opportunities

| Sprint | Dev 1 (Senior) | Dev 2 (Mid) | FE |
|--------|----------------|-------------|-----|
| Sprint 0 | T0.1 (Enums) | T0.2 (Data model review) | N/A |
| Sprint 1 | T1 (Company expansion) | T2 (TaxCode), T3 (Status state machine) | N/A |
| Sprint 2 | T4 (LegalRep), T6 (CapitalContributor) | T5 (Settings), T7 (BusinessLine) | N/A |
| Sprint 3 | T10 (Audit wiring), T11 (Migration) | T8 (BankAccount), T9 (TaxOffice), T12 (Tenant) | N/A |
| Sprint 4 | T13 (Branch), T14 (License) | T15 (Seal), T16 (Docs), T17 (FormerNames) | T18 (Admin UI start) |
| Sprint 5 | T20 (Integration tests) | — | T18 (UI cont), T19 (Dashboard) |
| Sprint 6 | T21 (VNeID fields), T22 (AuditFirm) | T23 (PDF), T24 (Expiry alerts) | T25 (Context switch) |
| Sprint 7 | T26 (VNeID API) | T27 (Tax auth API) | T25 (polish) |
| Sprint 8 | T28 (Portal sync) | — | Final UI polish |
| Sprint 9 | PROD migration + sign-off | — | — |

---

## 8. Effort Estimate Breakdown

| Task | Dev Days | FE Days | Complexity | Risk |
|------|----------|---------|------------|------|
| T0.1 Enums + ValueObjects | 2 | 0 | S | L |
| T0.2 Data model review | 1 | 0 | S | L |
| T1 Company entity expansion | 5 | 0 | XL | H |
| T2 TaxCode validation | 2 | 0 | M | M |
| T3 Status state machine | 4 | 0 | M | M |
| T4 LegalRepresentative entity | 8 | 0 | XL | H |
| T5 Settings + AccountingRegime | 3 | 0 | M | M |
| T6 CapitalContributor | 5 | 0 | L | M |
| T7 BusinessLine + VSIC | 5 | 0 | L | M |
| T8 BankAccount | 2 | 0 | S | L |
| T9 TaxAuthority seed | 2 | 0 | S | L |
| T10 Audit trail wiring | 3 | 0 | M | H |
| T11 Migration script | 5 | 0 | XL | H |
| T12 Tenant isolation | 3 | 0 | M | H |
| T13 Branch/RO entity | 3 | 0 | M | L |
| T14 CompanyLicense | 2 | 0 | S | L |
| T15 CompanySeal | 1 | 0 | S | L |
| T16 Document management | 3 | 0 | M | M |
| T17 FormerNames | 2 | 0 | S | L |
| T18 Admin UI screens | 0 | 20 | XL | H |
| T19 Dashboard | 0 | 5 | L | M |
| T20 Integration tests | 5 | 0 | L | M |
| T21 VNeID fields | 3 | 2 | M | M |
| T22 AuditFirm entity | 2 | 0 | S | L |
| T23 PDF export | 3 | 0 | M | L |
| T24 Expiry alerts | 3 | 0 | M | M |
| T25 Context switching | 2 | 3 | M | M |
| T26 VNeID API | 8 | 0 | XL | H |
| T27 Tax authority API | 5 | 0 | L | H |
| T28 National portal sync | 3 | 0 | M | M |
| **Total** | **101** | **30** | | |

**Legend:** S=Small (<3d), M=Medium (3-5d), L=Large (5-8d), XL=Extra Large (8+ days). Risk: L=Low, M=Medium, H=High.

---

## 9. Related Documents

| Doc | Location |
|-----|----------|
| BRD — Company Module | `docs/brd/08-company-module-brd.md` |
| BRD — Use Cases | `docs/brd/09-company-use-cases.md` |
| BRD — Workflows | `docs/brd/10-company-workflows.md` |
| BRD — Business Rules | `docs/brd/11-company-business-rules.md` |
| BRD — Data Flows | `docs/brd/12-company-data-flows.md` |
| BRD — Templates | `docs/brd/13-company-templates.md` |
| BRD — User Journeys | `docs/brd/14-company-user-journeys.md` |
| BRD — User Stories | `docs/brd/15-company-user-stories.md` |
| Implementation Roadmap — User Management | `docs/standards/08-implementation-roadmap.md` |
| ADR — VNeID Integration | `docs/adr/0001-vneid-integration.md` |
| ADR — Digital Signature | `docs/adr/0002-digital-signature-module.md` |
| Domain Glossary | `docs/domain/user-management-terms.md` |
