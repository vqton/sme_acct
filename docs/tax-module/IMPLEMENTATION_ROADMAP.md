# Tax Module — Implementation Roadmap

**Version**: 1.0 | **Date**: 23/07/2026 | **Author**: BA Lead (20+ yrs) + Chief Accountant (20+ yrs)
**Skills Applied**: planning-and-task-breakdown, incremental-implementation, codebase-design

---

## 1. Strategic Overview

### 1.1 Why This Roadmap

Tax module is the single biggest gap between current system and production readiness. Without it, system is a **bookkeeping ledger** not an **accounting system**. Competitors (MISA, FAST, BRAVO) all ship mature tax engines.

We build in **thin vertical slices** — each slice delivers working, testable functionality end-to-end through the stack. No horizontal layers (all DB → all API → all UI). Every slice leaves main branch deployable.

### 1.2 Design Philosophy (Deep Modules)

Per codebase-design principles:
- **TaxEngine** = deep module: large calculation logic behind small interface (`computeVAT(periodId): VATResult`)
- **Seam at repository interfaces**: swap SQLite for Postgres later without touching engine
- **Internal seams** for testability: engine has internal calculators (VATEngine, CITEngine, PITEngine) not exposed at module boundary
- **TaxDeclarationService** = medium depth: generate+validate+sign+submit behind `submitDeclaration(declId): SubmissionResult`

### 1.3 Project Conventions (Must Follow)

| Convention | Rule |
|-----------|------|
| ESM | `"type": "module"` in package.json; use `.js` extensions in imports |
| Path aliases | `@domain/*` `@application/*` `@infrastructure/*` `@presentation/*` |
| DDD layers | `domain/` entities + repo interfaces → `application/` services → `infrastructure/` SQLite → `presentation/` controllers |
| better-sqlite3 | Synchronous; no async/await in repos |
| NestJS | `nest/` directory modules with `@Module()` decorator |
| TypeScript | Strict mode |
| Testing | Per TEST_STRATEGY.md; tests co-located or in `test/` |

---

## 2. Dependency Graph

```
Foundation (Phase 1)
  ├── Tax domain entities + enums + DB schema
  │       │
  │       ├── Tax repositories (interfaces + SQLite)
  │       │       │
  │       │       ├── TaxEngine — VAT computation ← consumes JournalEntryRepository
  │       │       │       │
  │       │       │       ├── TaxDeclaration generator ← produces XML
  │       │       │       │       │
  │       │       │       │       ├── eTax integration ← signs + submits
  │       │       │       │       │
  │       │       │       │       └── TaxModule (NestJS) ← exposes HTTP
  │       │       │       │
  │       │       │       └── Tax period + calendar ← extends FiscalPeriod
  │       │       │
  │       │       └── TaxDashboard ← aggregates all tax positions
  │       │
  │       └── Seed data + TT99 chart alignment

Phase 2 (After VAT MVP is PROD-ready)
  └── CIT engine → 03/TNDN → CIT finalization
  └── PIT engine → 05/QTT-TNCN → deduction certificates

Phase 3 (After CIT/PIT are PROD-ready)
  └── eInvoice sync (3 providers)
  └── Payment gateway
  └── Tax reports + BI
  └── Other taxes (license, SCT, resource, env)
```

---

## 3. Phase Breakdown

### PHASE 1: VAT Foundation (Weeks 1-4)
**Goal**: PROD-ready VAT declaration (khấu trừ method). Can compute, generate 01/GTGT, sign, submit to eTax.

### PHASE 2: CIT + PIT (Weeks 5-8)
**Goal**: Full CIT lifecycle (provisional + finalization) + PIT (monthly + finalization).

### PHASE 3: Integration + Polish (Weeks 9-12)
**Goal**: eInvoice auto-sync, payment gateway, tax dashboard, remaining taxes.

---

## 4. Phase 1 — Detailed Task Breakdown

### Sprint 1: Tax Domain Foundation (Week 1, Days 1-5)

#### Task 1.1: Tax domain entities + enums
**Files**: `server/src/domain/enums/TaxEnums.ts`, `server/src/domain/entities/TaxPeriod.ts`, `server/src/domain/entities/TaxDeclaration.ts`, `server/src/domain/entities/TaxLineItem.ts`, `server/src/domain/entities/InputInvoice.ts`, `server/src/domain/entities/OutputInvoice.ts`, `server/src/domain/entities/TaxAdjustment.ts`, `server/src/domain/entities/LossCarryforward.ts`

**Description**: Create all domain entities for tax module following existing patterns (Account.ts, FiscalPeriod.ts). Pure data + factory functions, zero infrastructure.

**Acceptance criteria**:
- [ ] `TaxEnums` with: TaxType (vat/cit/pit/license/sct/resource/env), DeclarationStatus (draft/computed/reviewed/signed/submitted/adjusted), VATMethod (khau_tru/truc_tiep/truc_tiep_gtgt), TaxPeriodType (monthly/quarterly/yearly), InvoiceSource (manual/synced/imported)
- [ ] `TaxPeriod` entity with factory + state machine (open→locked→finalized→amended)
- [ ] `TaxDeclaration` entity with factory + status transitions + amendment chain
- [ ] `TaxLineItem` entity with source tracking (auto/manual/override) + sourceTransactionIds
- [ ] `InputInvoice` entity with deduction condition flags (paymentMethod, isDeductible, rejectionReason)
- [ ] `OutputInvoice` entity with VAT rate breakdown
- [ ] `TaxAdjustment` entity with before/after values + justification + approval chain
- [ ] `LossCarryforward` entity at company+year level

**Verification**:
- `npx tsc --noEmit` passes
- Unit tests for each factory function
- No DB calls — pure domain logic

**Dependencies**: None (foundational)

**Estimated scope**: M (4-5 files)

---

#### Task 1.2: Tax repository interfaces
**Files**: `server/src/domain/repositories/TaxPeriodRepository.ts`, `server/src/domain/repositories/TaxDeclarationRepository.ts`, `server/src/domain/repositories/InputInvoiceRepository.ts`, `server/src/domain/repositories/OutputInvoiceRepository.ts`

**Description**: Repository interfaces following existing patterns (FiscalPeriodRepository.ts has findByCompanyId, findByMonth, findCurrentPeriod etc.). Each interface extends `Repository<T, number>`.

**Acceptance criteria**:
- [ ] `TaxPeriodRepository`: findByCompanyId, findByYear, findByMonth, findCurrent, findOpenPeriods
- [ ] `TaxDeclarationRepository`: findByPeriod, findByTaxType, findByStatus, findByCompanyAndYear, findAmendments
- [ ] `InputInvoiceRepository`: findByPeriod, findByStatus, findNonDeductible, findByPaymentMethod
- [ ] `OutputInvoiceRepository`: findByPeriod, findByVatRate, findByExportStatus

**Verification**:
- `npx tsc --noEmit` passes
- Interfaces compile clean

**Dependencies**: Task 1.1

**Size**: S (4 files)

---

#### Task 1.3: DB schema + migrations
**Files**: `server/src/infrastructure/database/schema.ts` (extend), `server/src/infrastructure/database/TaxPeriodRepository.ts`, `server/src/infrastructure/database/TaxDeclarationRepository.ts`, `server/src/infrastructure/database/InputInvoiceRepository.ts`, `server/src/infrastructure/database/OutputInvoiceRepository.ts`

**Description**: SQLite tables for tax module. Extend existing `initDatabase()`. Implement repository interfaces with better-sqlite3 (synchronous per convention).

**Tables needed**:
```sql
tax_periods (
  id INTEGER PK, company_id INT, type TEXT, year INT, month INT, quarter INT,
  start_date TEXT, end_date TEXT, status TEXT, vat_method TEXT,
  cit_rate REAL, created_at TEXT, updated_at TEXT
);

tax_declarations (
  id INTEGER PK, company_id INT, tax_period_id INT FK, tax_type TEXT,
  form_type TEXT, status TEXT, submission_method TEXT, xml_content TEXT,
  submitted_at TEXT, adjustment_number INT DEFAULT 0, original_id INT,
  gdt_confirmation_code TEXT, created_at TEXT, updated_at TEXT
);

tax_line_items (
  id INTEGER PK, tax_declaration_id INT FK, line_code TEXT, label TEXT,
  amount REAL, source TEXT, notes TEXT, created_at TEXT
);

tax_input_invoices (
  id INTEGER PK, company_id INT, period_id INT FK, invoice_number TEXT,
  invoice_date TEXT, seller_tax_code TEXT, seller_name TEXT,
  gross_amount REAL, vat_amount REAL, vat_rate REAL,
  payment_method TEXT, is_deductible INT, rejection_reason TEXT,
  gdt_confirmation_code TEXT, synced_from TEXT, created_at TEXT
);

tax_output_invoices (
  id INTEGER PK, company_id INT, period_id INT FK, invoice_number TEXT,
  invoice_date TEXT, buyer_tax_code TEXT, buyer_name TEXT,
  gross_amount REAL, vat_amount REAL, vat_rate REAL,
  taxable_amount REAL, is_export INT, has_customs_docs INT,
  gdt_confirmation_code TEXT, created_at TEXT
);

tax_adjustments (
  id INTEGER PK, company_id INT, tax_period_id INT FK,
  adjustment_type TEXT, description TEXT, amount REAL,
  before_value REAL, after_value REAL, justification TEXT,
  approved_by INT FK, created_at TEXT
);

tax_loss_carryforward (
  id INTEGER PK, company_id INT, loss_year INT,
  loss_amount REAL, used_amount REAL, remaining_amount REAL,
  expiry_year INT, created_at TEXT
);
```

**Acceptance criteria**:
- [ ] All 7 tables created in `initDatabase()` within existing schema file
- [ ] Foreign keys referencing companies, periods
- [ ] Indexes on company_id + period_id + tax_type
- [ ] SQLite repositories implement all interface methods
- [ ] Prepared statements lazy-init (match existing pattern)

**Verification**:
- Unit tests: insert → query → update → delete cycle per table
- `npm run build` passes
- Existing tests still pass

**Dependencies**: Tasks 1.1, 1.2

**Size**: L (5 files — schema changes need extra care)

---

#### Task 1.4: TaxEngine — VAT computation
**Files**: `server/src/application/TaxEngine.ts`, `server/src/application/VATEngine.ts`, `server/src/domain/services/TaxCalculatorService.ts` (interface)

**Description**: Core VAT engine implementing both khấu trừ and trực tiếp methods. Deep module per codebase-design: small interface (`computeVAT(companyId, periodId): VATResult`) hides complex logic.

**VAT computation logic**:
```
Khấu trừ:
  outputByRate = query JournalEntry lines with account 33311, group by corresponding revenue account VAT rate
  inputDeductible = query 1331/1332 entries, filter by:
    - Invoice ≥ 5M → must have non-cash payment flag
    - Within 6-month declaration window
    - Goods/services for taxable activities
  result.payable = sum(output) - sum(inputDeductible)

Trực tiếp:
  result.payable = sum(revenue by industry group) × deemed rate
```

**Acceptance criteria**:
- [ ] `VATEngine.compute(companyId, periodId, method)` returns `{ outputByRate, inputDeductible, inputNonDeductible, vatPayable, vatRefundable, vatCarryforward }`
- [ ] Queries JournalEntryRepository for tax-relevant accounts (1331, 1332, 33311, 33312)
- [ ] Applies deduction conditions (5M non-cash, 6-month window)
- [ ] Handles edge cases: zero period, no invoices, mixed rates
- [ ] Pure computation — no side effects

**Verification**:
- Unit test with known journal entries → assert exact VAT result
- Test both khấu trừ and trực tiếp methods
- Test edge cases (no entries, all non-deductible, export 0%)
- `npx tsc --noEmit` passes

**Dependencies**: Tasks 1.1-1.3

**Size**: L (3 files, but complex logic)

---

#### Task 1.5: Declaration generator — 01/GTGT
**Files**: `server/src/application/TaxDeclarationService.ts`, `server/src/application/declaration-templates/01_GTGT.ts`

**Description**: Generate 01/GTGT declaration from VAT engine output. Map computed values to GDT form line codes [23]-[43]. Support manual override on specific lines with audit trail.

**Form mapping**:
```
[23] HHDV chịu thuế 0%       → outputByRate[0]
[24] HHDV chịu thuế 5%       → outputByRate[5]
[25] HHDV chịu thuế 10%      → outputByRate[10]
[26] HHDV chịu thuế 8%       → outputByRate[8] (reduced rate period)
[33] HHDV mua vào 5%         → inputDeductible[5]
[34] HHDV mua vào 10%        → inputDeductible[10]
[35] HHDV mua vào 8%         → inputDeductible[8]
[40] Thuế GTGT phải nộp      → computed
[41] Thuế GTGT đề nghị hoàn  → if refundable
[42] Thuế GTGT kỳ sau        → if carryforward
```

**Acceptance criteria**:
- [ ] `generateDeclaration(companyId, periodId, taxType)` creates TaxDeclaration with computed line items
- [ ] Line items mapped to correct GDT line codes
- [ ] Manual override possible per line item (copies original to audit, creates new with override flag)
- [ ] Status set to COMPUTED after generation
- [ ] Duplicate generation check (prevents overwriting SUBMITTED)

**Verification**:
- Unit test: mock VATEngine → assert declaration line items match expected
- Test override: change line [25] → verify audit trail created
- `npm test` passes

**Dependencies**: Task 1.4

**Size**: M (2 files)

---

### Sprint 2: VAT Submission (Week 2)

#### Task 1.6: XML Generation (01/GTGT per GDT schema)
**Files**: `server/src/infrastructure/xml/GTGT01XmlBuilder.ts`, `server/src/infrastructure/xml/XmlSchema.ts`, `server/src/infrastructure/xml/xsd/01_GTGT.xsd`

**Description**: Build XML string conforming to GDT schema (TT80 format). XML-DSig enveloped signature support.

**Acceptance criteria**:
- [ ] `buildXml(declarationId): string` produces valid XML per GDT 01/GTGT schema
- [ ] UTF-8 encoded, proper namespaces: `http://www.gdt.gov.vn/schemas/`
- [ ] Company info from CompanyService
- [ ] Period info from TaxPeriod
- [ ] Line items mapped to correct XML elements
- [ ] Schema validation against XSD before returning
- [ ] Includes placeholder for digital signature

**Verification**:
- Generate XML → validate against XSD → assert no errors
- Round-trip test: parse sample GDT XML → rebuild → compare
- `npm run build` passes

**Dependencies**: Task 1.5

**Size**: M (3 files)

---

#### Task 1.7: Digital signature integration
**Files**: `server/src/infrastructure/signature/SigningService.ts`, `server/src/infrastructure/signature/TokenSigner.ts`, `server/src/infrastructure/signature/HsmSigner.ts`

**Description**: PKCS#11 (USB Token) and HSM (network) signers. XML-DSig enveloped signature per NĐ 23/2025/NĐ-CP.

**Acceptance criteria**:
- [ ] `TokenSigner.sign(xml, certSerial): string` signs XML with USB Token via PKCS#11
- [ ] `HsmSigner.sign(xml, certSerial): string` signs via HSM REST API
- [ ] Certificate selection from available tokens
- [ ] Signed XML passes GDT validation
- [ ] Error handling: token disconnected, wrong PIN, expired cert

**Verification**:
- Integration test with test token (if available)
- Unit test with mock PKCS#11
- Test error scenarios

**Dependencies**: Task 1.6

**Size**: M (3 files + SDK setup)

---

#### Task 1.8: eTax submission client
**Files**: `server/src/infrastructure/integration/ETaxClient.ts`, `server/src/infrastructure/integration/ETaxConfig.ts`

**Description**: REST client for thuedientu.gdt.gov.vn API. Mutual TLS, XML submission, status polling.

**Acceptance criteria**:
- [ ] `submitDeclaration(signedXml, certId, taxCode): SubmissionResult` sends to eTax
- [ ] `checkStatus(submissionId): StatusResponse` polls submission status
- [ ] `getConfirmation(submissionId): ConfirmationResult` retrieves GDT confirmation
- [ ] Mutual TLS with client certificate
- [ ] Retry logic: 3 attempts with exponential backoff (1s, 4s, 9s)
- [ ] Timeout: 30s per attempt
- [ ] Error mapping: GDT error codes → user messages
- [ ] Config: base URL, timeouts, cert paths from env

**Verification**:
- Unit test with mock HTTP
- Integration test against eTax test environment (if available)
- Test all error codes mapped

**Dependencies**: Task 1.7

**Size**: M (2 files + config)

---

#### Task 1.9: Tax submission workflow (sign + submit)
**Files**: `server/src/application/TaxSubmissionWorkflow.ts`

**Description**: Orchestrate declaration → sign → submit flow. Handle failure modes: signing failure, submission failure, partial success.

**Flow**:
```
prepare(declId)         → validate completeness, lock declaration
sign(declId)            → call SigningService → store signed XML
submit(declId)          → call ETaxClient → if fail: log + notify + set status to SUBMISSION_FAILED
confirm(declId)         → poll status → set SUBMITTED + store confirmation code
```

**Acceptance criteria**:
- [ ] `submit(declId): SubmissionResult` executes full pipeline
- [ ] Atomic: if any step fails, declaration returns to REVIEWED status with error details
- [ ] GDT confirmation code stored on declaration
- [ ] Submission timestamp recorded
- [ ] Notification event emitted on success/failure

**Verification**:
- Integration test: mock signing + mock eTax → assert status transitions
- Test failure at each step → assert proper rollback
- `npm test` passes

**Dependencies**: Tasks 1.6-1.8

**Size**: M (1 file + substantial logic)

---

### Sprint 3: Period + Calendar + Dashboard (Week 3)

#### Task 1.10: Tax period lifecycle
**Files**: `server/src/application/TaxPeriodManager.ts`

**Description**: Extend existing FiscalPeriod with tax-specific lifecycle. Auto-lock after 30 days, manual unlock with approval, rollover.

**State machine**:
```
OPEN → LOCKED (auto 30 days) → FINALIZED (after tax filed)
  ↑           ↓
  └── UNLOCK (manager approval + 2FA)
```

**Acceptance criteria**:
- [ ] `openPeriod(companyId, year, month): TaxPeriod` creates new tax period
- [ ] `lockPeriod(periodId): TaxPeriod` auto-locks 30 days after end
- [ ] `unlockPeriod(periodId, userId, reason): TaxPeriod` requires manager + 2FA
- [ ] `finalizePeriod(periodId): TaxPeriod` sets FINALIZED after all tax obligations met
- [ ] `rollover(companyId, fromYear, fromMonth, toYear, toMonth): TaxPeriod` carries forward balances
- [ ] Status transition audit logged

**Verification**:
- Unit test each state transition
- Test unlock with insufficient permission → rejected
- Test rollover with no prior period → fallback

**Dependencies**: Tasks 1.1-1.3

**Size**: M (1 file)

---

#### Task 1.11: Tax calendar + alert engine
**Files**: `server/src/application/TaxCalendarService.ts`, `server/src/domain/entities/TaxCalendarEntry.ts`

**Description**: Generate schedule based on company settings (monthly/quarterly VAT, CIT deadlines). Smart alert system.

**Rules**:
```
VAT monthly: due day 20 of next month
VAT quarterly: due day 30 of next quarter
CIT provisional: due day 30 after quarter (payment only)
CIT finalization: due day 90 after FY end
PIT monthly: due day 20 of next month
License tax: due 30 Jan annually
Invoice usage: due day 30 of next quarter
```

**Acceptance criteria**:
- [ ] `generateCalendar(companyId, year): TaxCalendarEntry[]` creates full year schedule
- [ ] `getUpcomingDeadlines(companyId, days): TaxCalendarEntry[]` filters next N days
- [ ] Alert levels: INFO (14 days), WARNING (7 days), CRITICAL (1 day), OVERDUE
- [ ] Email/in-app notification per alert level

**Verification**:
- Test calendar generation for monthly vs quarterly filer
- Test alert timing matches deadlines
- `npm test` passes

**Dependencies**: Task 1.10

**Size**: M (2 files)

---

#### Task 1.12: Tax dashboard API + basic UI
**Files**: `server/src/application/TaxDashboardService.ts`, `server/src/nest/tax/tax.controller.ts` (dashboard endpoints), `client/src/pages/tax/TaxDashboard.tsx`

**Description**: Executive dashboard showing tax position, deadlines, alerts. Aggregation over all tax types.

**Acceptance criteria**:
- [ ] `getDashboard(companyId): TaxDashboard` returns: current tax position, upcoming deadlines, overdue items, cash flow forecast
- [ ] Endpoints: `GET /tax/dashboard`, `GET /tax/dashboard/alerts`
- [ ] NestJS controller with AuthGuard, TenantGuard
- [ ] React page: 4 KPI cards (VAT/CIT/PIT/License) + deadline list + alert banner
- [ ] Responsive layout per UI_SPEC.md

**Verification**:
- API returns correct aggregated data
- UI renders without error
- Both existing test suites pass

**Dependencies**: Tasks 1.4-1.11

**Size**: M (3 files)

---

### Sprint 4: VAT UI + Integration + Polish (Week 4)

#### Task 1.13: VAT declaration UI (01/GTGT screen)
**Files**: `client/src/pages/tax/VATReturnPage.tsx`, `client/src/pages/tax/VATReturnDetail.tsx`, `client/src/pages/tax/VATInputInvoiceList.tsx`, `client/src/pages/tax/VATOutputInvoiceList.tsx`

**Description**: Full VAT declaration screen per UI_SPEC.md. Input invoice management with deduction flags. Output invoice by rate.

**Acceptance criteria**:
- [ ] Period selector → load computed declaration
- [ ] Display line items with GDT codes [23]-[43]
- [ ] Drill-down: click line → see source invoices
- [ ] Input invoice list with deduction status badge (green/red/yellow)
- [ ] Mark invoice as non-deductible with reason dialog
- [ ] Manual override on specific lines (with justification required)
- [ ] "Compute" button (re-runs engine)
- [ ] "Preview" button → shows form layout
- [ ] "Sign & Submit" button → triggers submission workflow
- [ ] Status indicator: draft/computed/reviewed/submitted

**Verification**:
- Manual: create test data → compute → review → submit flow
- Responsive: mobile + desktop
- Console errors: none

**Dependencies**: Tasks 1.4-1.12

**Size**: L (4 files — UI takes time)

---

#### Task 1.14: VAT payment flow
**Files**: `server/src/application/TaxPaymentService.ts`, `server/src/infrastructure/integration/BankGateway.ts`, `client/src/pages/tax/TaxPaymentPage.tsx`

**Description**: Generate payment order from declared VAT. Connect to bank gateway (or generate NSNN payment slip).

**Acceptance criteria**:
- [ ] `generatePaymentOrder(declId, amount): PaymentOrder` creates NSNN payment order
- [ ] Content format: `{taxCode}-{taxType}-{period}` (e.g., `0123456789-VAT-Q2/2026`)
- [ ] Integrate with bank gateway (first: generate PDF manually, later: API)
- [ ] UI: payment order preview + confirm + status
- [ ] Payment recorded in tax_payments table

**Verification**:
- Unit test payment order generation
- Manual: generate → confirm → verify in DB
- `npm test` passes

**Dependencies**: Tasks 1.4-1.8

**Size**: M (3 files)

---

#### Task 1.15: VAT amendment flow
**Files**: `server/src/application/TaxAmendmentService.ts`, `client/src/pages/tax/VATAmendmentPage.tsx`

**Description**: When error found in submitted return, create amended version. Calculate additional payment/refund with late interest.

**Acceptance criteria**:
- [ ] `amendDeclaration(originalDeclId, adjustments): TaxDeclaration` creates amended copy
- [ ] adjustment_number incremented
- [ ] original_id links to original submission
- [ ] Late interest: 0.03%/day on additional tax
- [ ] UI: show diff between original and amended
- [ ] Re-submit amended XML to GDT

**Verification**:
- Test amendment with increase → verify late interest calculation
- Test amendment with decrease → verify refund offset
- `npm test` passes

**Dependencies**: Tasks 1.5-1.8

**Size**: M (2 files)

---

#### Task 1.16: Integration test suite + documentation
**Files**: `server/src/test/tax/`, `docs/tax-module/`

**Description**: End-to-end integration tests for VAT flow. Complete documentation per docs/.

**Acceptance criteria**:
- [ ] Integration test: create company → post transactions → compute VAT → generate 01/GTGT → submit (mock) → confirm
- [ ] Test coverage: all tax engine paths
- [ ] Documentation: README.md in docs/tax-module/

**Verification**:
- `npm test` → all tests pass
- `npm run build` → clean

**Dependencies**: All Phase 1 tasks

**Size**: M (test files)

---

## PHASE 1 CHECKPOINT: VAT PROD READY

```
□ All Phase 1 tasks complete
□ Integration test: end-to-end VAT flow passes
□ Manual QA: create → compute → review → sign → submit flow verified
□ Regression: existing accounting tests pass
□ Build: npm run build clean
□ Review with Chief Accountant
```

---

## 5. Phase 2 — CIT + PIT (Weeks 5-8, Summary)

### Sprint 5 (Week 5): CIT Provisional

#### Task 2.1: CITEngine — provisional estimation
- Read P&L data from AccountingService
- Apply non-deductible flags (from manually marked expenses)
- Compute estimated CIT per rate table (15%/17%/20%)
- Flag if provisional < 80% of previous year actual → warning
- Output: CITEstimate { taxableIncome, citRate, citPayable, quarterlyBreakdown }

#### Task 2.2: CIT provisional payment UI
- Screen: "Ước tính thuế TNDN tạm nộp"
- Auto-fill from P&L, manual overrides
- Generate payment order (no return filing needed per Luật TNDN 2025)
- Track quarterly payments against year

### Sprint 6 (Week 6): CIT Finalization

#### Task 2.3: CITEngine — annual finalization
- Load full year P&L + adjustments
- Apply loss carryforward (max 5 years, earliest first)
- Apply CIT incentives (holiday, reduced rate)
- Compute 03/TNDN form data
- Compare provisional vs actual → calculate difference + interest

#### Task 2.4: 03/TNDN form generator + XML
- Map to 03-1A/TNDN (P&L adjustments)
- Map to 03-2A/TNDN (loss carryforward)
- Manual input for non-auto fields: [B2] non-taxable income, [B9] interest cap, [C2] loss amounts
- XML per GDT schema

#### Task 2.5: CIT finalization UI
- Tab 1: 03-1A/TNDN with auto-fill + manual adjustments
- Tab 2: 03-2A/TNDN loss tracking
- Warning if provisional < 80% actual
- Submit workflow (sign + eTax)

### Sprint 7 (Week 7): PIT

#### Task 2.6: PITEngine — monthly computation
- Read payroll data
- Apply progressive tax table (5-35%)
- Apply deductions: SI (8%) + HI (1.5%) + UI (1%) + family (11M + 4.4M/dependent)
- Output: PITResult per employee + company total

#### Task 2.7: PIT monthly UI + submission
- Employee list with PIT breakdown
- Aggregate company total
- Generate + submit 05/QTT-TNCN
- Generate deduction certificates per NĐ 70/2025

#### Task 2.8: PIT annual finalization
- Aggregate 12 months
- Adjust for year-end changes
- Generate 05/QTT-TNCN annual form
- Submit + issue electronic deduction certificates

## PHASE 2 CHECKPOINT: CIT + PIT PROD READY

```
□ All Phase 2 tasks complete
□ CIT provisional → quarterly payment → annual finalization flow tested
□ PIT monthly → annual finalization flow tested
□ All forms generate valid XML
□ Integration tests pass
```

---

## 6. Phase 3 — Integration + Polish (Weeks 9-12, Summary)

### Sprint 9 (Week 9): eInvoice Integration

#### Task 3.1: Input invoice sync engine
- Connect to top 3 eInvoice providers (MISA mTax, Viettel VAS, VNPT)
- Daily fetch new invoices where buyer tax code = company
- Auto-categorize deductible vs non-deductible
- Create draft journal entries
- UI: review + confirm synced invoices

#### Task 3.2: Output invoice verification
- After issuing sales invoice, verify with GDT portal
- Auto-flag discrepancies
- Link to tax return output lines

### Sprint 10 (Week 10): Tax Payment Gateway

#### Task 3.3: Bank API integration
- Connect to top Vietnamese banks (VCB, TCB, BIDV, CTG)
- Generate NSNN payment orders
- Submit payment via bank API
- Auto-reconciliation: match paid amounts to tax obligations

#### Task 3.4: Payment tracking UI
- Payment history per tax type + period
- Outstanding balance tracker
- Receipt archive

### Sprint 11 (Week 11): Tax Reports + BI

#### Task 3.5: Tax reports
- Invoice usage report (quarterly, auto-generated)
- VAT ledger (Sổ thuế GTGT)
- CIT ledger
- Tax obligation summary (all taxes)
- Export: PDF, Excel, XML

#### Task 3.6: Tax analytics
- Year-over-year comparison
- Effective tax rate trends
- Cash tax forecasting (12-month rolling)
- Drill-down from KPI to source transactions

### Sprint 12 (Week 12): Other Taxes + Polish

#### Task 3.7: Other tax engines
- License tax (môn bài): annual, auto-compute from revenue, 30 Jan deadline
- Special consumption tax (TTĐB): rate table per product, import deduction per TT99
- Resource tax: rate per resource type
- Environmental tax (BVMT): fixed rate per unit

#### Task 3.8: Corporate e-ID integration
- Per NĐ 69/2024/NĐ-CP
- Integrate with VNeID for company authentication
- Tax registration updates via corporate e-ID

#### Task 3.9: Performance + audit polish
- Query optimization for large invoice volumes (10,000+ per period)
- Audit log completeness review
- Role-based access hardening (Tax Admin vs Tax Viewer vs Tax Approver)
- Load testing: 100 concurrent users declaring simultaneously

## PHASE 3 CHECKPOINT: FULL TAX PROD READY

```
□ All 12 phases complete
□ eInvoice auto-sync working for 3 providers
□ Payment gateway integrated (2 banks minimum)
□ All tax reports generating correctly
□ Load test: 100 concurrent users, < 2s response
□ Full audit trail review passed
□ Chief Accountant sign-off
```

---

## 7. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | eTax API spec changes | Medium | High | Monitor GDT announcements; abstract API layer; version negotiation |
| R2 | Digital signature token compatibility | Medium | High | Support both PKCS#11 (Token) and REST (HSM); test with top 3 providers (Viettel, VNPT, BKAV) |
| R3 | GDT XML schema validation errors | Medium | Medium | Build strict XSD validator; test with GDT test environment before production |
| R4 | Network latency to GDT portal | Low | Medium | Async submission with status polling; queue for retry; user notified immediately |
| R5 | Concurrency: same period declared twice | Low | High | Optimistic locking on tax_periods; duplicate submission prevention at API layer |
| R6 | Large invoice volume (>10k/month) | Medium | Medium | Batch processing for VAT computation; pagination in UI; async for report generation |
| R7 | TT99 CoA migration issues | Low | High | Already partially done; full audit of account mapping before Phase 2 |
| R8 | User adoption resistance | Medium | Medium | Parallel run with manual process for 1 month; compare results; build confidence |

---

## 8. Key Architecture Decisions

### AD-1: New TaxModule (NestJS) — parallel to AccountingModule
**Rationale**: Separation of concerns. Tax has distinct lifecycle, repositories, integration surface. Following existing module pattern (CompanyModule, AuthModule, AccountingModule).

### AD-2: TaxEngine as pure computation — zero side effects
**Rationale**: Testability. Engine takes data → returns result. No DB writes, no API calls. Caller decides what to do with result.

### AD-3: XML generation in infrastructure layer
**Rationale**: GDT XML format is an external detail, not domain logic. Swap XSD version without touching domain.

### AD-4: Repository interfaces at domain layer, implementations in infrastructure
**Rationale**: Follows existing pattern. Enables test doubles without SQLite.

### AD-5: Digital signature in infrastructure (SigningService abstraction)
**Rationale**: Token/HSM details are infrastructure. Domain only cares about "signed XML bytes".

### AD-6: Vertical slicing — each sprint ships working UI
**Rationale**: Per incremental-implementation skill. Every task leaves system buildable, testable, deployable.

### AD-7: Feature flags for incomplete features
**Rationale**: Phase 2-3 features disabled behind `FEATURE_TAX_PHASE_2` env var. Main branch always deployable.

---

## 9. File Tree (Final State)

```
server/src/
├── domain/
│   ├── entities/
│   │   ├── Account.ts               (existing)
│   │   ├── JournalEntry.ts          (existing)
│   │   ├── FiscalPeriod.ts          (existing)
│   │   ├── TaxPeriod.ts             [NEW]
│   │   ├── TaxDeclaration.ts        [NEW]
│   │   ├── TaxLineItem.ts           [NEW]
│   │   ├── InputInvoice.ts          [NEW]
│   │   ├── OutputInvoice.ts         [NEW]
│   │   ├── TaxAdjustment.ts         [NEW]
│   │   ├── LossCarryforward.ts      [NEW]
│   │   └── TaxCalendarEntry.ts      [NEW]
│   ├── enums/
│   │   ├── AccountEnums.ts          (existing)
│   │   └── TaxEnums.ts              [NEW]
│   └── repositories/
│       ├── AccountRepository.ts     (existing)
│       ├── TaxPeriodRepository.ts   [NEW]
│       ├── TaxDeclarationRepository.ts [NEW]
│       ├── InputInvoiceRepository.ts  [NEW]
│       └── OutputInvoiceRepository.ts [NEW]
├── application/
│   ├── AccountingService.ts         (existing)
│   ├── TaxEngine.ts                 [NEW]
│   ├── VATEngine.ts                 [NEW]
│   ├── CITEngine.ts                 [NEW] (Phase 2)
│   ├── PITEngine.ts                 [NEW] (Phase 2)
│   ├── TaxDeclarationService.ts     [NEW]
│   ├── TaxSubmissionWorkflow.ts     [NEW]
│   ├── TaxPeriodManager.ts          [NEW]
│   ├── TaxCalendarService.ts        [NEW]
│   ├── TaxDashboardService.ts       [NEW]
│   ├── TaxPaymentService.ts         [NEW]
│   ├── TaxAmendmentService.ts       [NEW]
│   └── TaxReportService.ts          [NEW]
├── infrastructure/
│   ├── database/
│   │   ├── schema.ts                (extended)
│   │   ├── TaxPeriodRepository.ts   [NEW]
│   │   ├── TaxDeclarationRepository.ts [NEW]
│   │   └── ... (other repos)
│   ├── xml/
│   │   ├── GTGT01XmlBuilder.ts      [NEW]
│   │   ├── TNDN03XmlBuilder.ts      [NEW] (Phase 2)
│   │   ├── PIT05XmlBuilder.ts       [NEW] (Phase 2)
│   │   └── XmlSchema.ts             [NEW]
│   ├── signature/
│   │   ├── SigningService.ts        [NEW]
│   │   ├── TokenSigner.ts           [NEW]
│   │   └── HsmSigner.ts             [NEW]
│   └── integration/
│       ├── ETaxClient.ts            [NEW]
│       ├── EinvoiceClient.ts        [NEW] (Phase 3)
│       ├── BankGateway.ts           [NEW] (Phase 3)
│       └── ... (other integrations)
└── nest/
    ├── accounting/
    │   └── accounting.module.ts     (existing)
    └── tax/
        ├── tax.module.ts            [NEW]
        ├── tax.controller.ts        [NEW]
        └── tax.service.ts           [NEW] (NestJS wrapper)

client/src/
└── pages/
    └── tax/
        ├── TaxDashboard.tsx          [NEW]
        ├── VATReturnPage.tsx         [NEW]
        ├── VATReturnDetail.tsx       [NEW]
        ├── VATInputInvoiceList.tsx   [NEW]
        ├── VATOutputInvoiceList.tsx  [NEW]
        ├── CITFinalizationPage.tsx   [NEW] (Phase 2)
        ├── PITDeclarationPage.tsx    [NEW] (Phase 2)
        ├── TaxPaymentPage.tsx        [NEW]
        ├── TaxCalendarPage.tsx       [NEW]
        └── TaxReportsPage.tsx        [NEW]
```

---

## 10. Commands Reference

```bash
# Development
npm run dev                    # Run both server + client

# Type checking
npx tsc --noEmit               # Check types (server)
cd client && npx tsc -b --noEmit  # Check types (client)

# Testing
npm test                       # All tests
cd server && npm test          # Server tests only
npm test -- --grep "TaxEngine"  # Specific test

# Building
npm run build                  # Both packages

# Linting
npm run lint                   # Both packages
```

---

## 11. Approval

| Role | Status | Date |
|------|--------|------|
| BA Lead | ☐ | |
| Chief Accountant | ☐ | |
| Tech Lead | ☐ | |
| CFO | ☐ | |

---

*This roadmap follows planning-and-task-breakdown methodology: dependency graph → vertical slicing → acceptance criteria → verification checkpoints. Each task is independent, testable, and sized for a single focused session.*
