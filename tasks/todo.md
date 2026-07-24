# GL Module — Execution Task List

**Generated:** 2026-07-24
**Status Key:** ⬜ Pending | 🔜 In Progress | ✅ Done | ❌ Blocked

---

## Phase 1: Remaining Core (P0 — CRITICAL)

### Task 1.1: B03-DN Cash Flow Statement
**Status:** ⬜ Pending
**Effort:** 4 days
**Files:** FinancialStatement.ts, FinancialStatementService.ts, accountingController.ts, FinancialStatementPage.tsx, api.ts
**Dependencies:** None

- [ ] Add `getB03LCTTMapping()` in FinancialStatement.ts with indirect method formulas
- [ ] Add `generateCashFlowStatement()` in FinancialStatementService.ts
- [ ] Add B03-DN route in accountingController.ts
- [ ] Add B03-DN tab in FinancialStatementPage.tsx
- [ ] Add `getCashFlowStatement()` in api.ts
- [ ] Tests: 5+ test cases
- [ ] **Checkpoint:** B03-DN generates correctly for any period

---

### Task 1.2: B09-DN Notes to Financial Statements
**Status:** ⬜ Pending
**Effort:** 3 days
**Files:** FinancialStatement.ts, FinancialStatementService.ts, noteRepository, accountingController.ts, FinancialStatementPage.tsx, api.ts
**Dependencies:** None

- [ ] Define 24+ note templates per TT 99
- [ ] Create notes table in DB
- [ ] Add get/save notes API
- [ ] Add B09-DN tab in FinancialStatementPage.tsx
- [ ] Tests: 3+ test cases
- [ ] **Checkpoint:** B09-DN displays saved notes per period

---

### Task 1.3: Period-End Closing Workflow UI
**Status:** ⬜ Pending
**Effort:** 4 days
**Files:** ClosePeriodPage.tsx (new), App.tsx, api.ts, accountingController.ts, PeriodCloseService.ts
**Dependencies:** None

- [ ] Create ClosePeriodPage with step checklist
- [ ] Add route in App.tsx
- [ ] Add close validation endpoint in backend
- [ ] Wire close button to existing closeFiscalPeriod()
- [ ] Add audit logging for each step
- [ ] Tests: 3+ test cases
- [ ] **Checkpoint:** Full period close flow works end-to-end

---

### Task 1.4: GL Export (PDF/Excel)
**Status:** ⬜ Pending
**Effort:** 3 days
**Files:** ExportService.ts (new), exportController.ts (new), LedgerPage.tsx, TrialBalancePage.tsx, FinancialStatementPage.tsx, package.json
**Dependencies:** None

- [ ] Create ExportService with pdfkit + exceljs
- [ ] Create export API routes
- [ ] Add export buttons to LedgerPage, TrialBalancePage, FinancialStatementPage
- [ ] Add pdfkit + exceljs dependencies
- [ ] Test Vietnamese font support in PDF
- [ ] **Checkpoint:** All reports exportable to PDF and Excel

---

## Checkpoint: Phase 1 Complete 🏁
- [ ] Full BCTC (B01+B02+B03+B09) available
- [ ] Period close via UI with checklist
- [ ] Reports exportable
- [ ] All tests pass, build succeeds

---

## Phase 2: Multi-Currency & Cost Centers (P1)

### Task 2.1: Multi-Currency JE (UI + API)
**Status:** ⬜ Pending
**Effort:** 3 days
**Dependencies:** Phase 1

- [ ] Currency selector on JE form
- [ ] Rate + original amount fields on non-VND lines
- [ ] Backend stores currency_code, exchange_rate, original_amount

### Task 2.2: Exchange Rate Management
**Status:** ⬜ Pending
**Effort:** 2 days

- [ ] Rate entry/history screen
- [ ] SBV auto-fill option
- [ ] Rate lookup API

### Task 2.3: FX Revaluation Engine
**Status:** ⬜ Pending
**Effort:** 3 days

- [ ] Scan FC monetary accounts
- [ ] Compute unrealized gain/loss
- [ ] Post adjustment to TK 413 + 515/635
- [ ] Tests: 5+ test cases

### Task 2.4: FX Adjustment Auto-Posting
**Status:** ⬜ Pending
**Effort:** 2 days

### Task 2.5: Department/Cost Center Reporting
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 2.6: Department Income Statement
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 2.7: Cost Allocation Engine
**Status:** ⬜ Pending
**Effort:** 4 days

---

## Phase 3: Sub-Ledger Integration (P0 — gated on sub-ledger modules)

### Task 3.1: GL Posting API
**Status:** ⬜ Pending
**Effort:** 2 days
**Dependencies:** Phase 1

- [ ] POST `/api/gl/post-from-subsystem` endpoint
- [ ] Validation + JE creation + posting
- [ ] Returns JE ID to caller

### Tasks 3.2-3.9: Per Sub-Ledger Integration
**Status:** ❌ Blocked (requires Cash/Bank/AR/AP/Inventory/FA/Payroll modules)
**Effort:** 2 days each

---

## Phase 4: Automation & Budget (P1-P2)

### Task 4.1: Recurring Entry Templates
**Status:** ⬜ Pending
**Effort:** 4 days

### Task 4.2: Scheduler (cron-based)
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 4.3: Budget Entry (UI + API)
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 4.4: Budget Control (warning/block)
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 4.5: Budget vs Actual Report
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 4.6: Batch JE Import (Excel/CSV)
**Status:** ⬜ Pending
**Effort:** 3 days

---

## Phase 5: Compliance & Advanced (P2)

### Task 5.1: Audit Trail UI
**Status:** ⬜ Pending (Quick Win, ~1 day)

### Task 5.2: Digital Signature (NĐ 23/2025/NĐ-CP)
**Status:** ⬜ Pending
**Effort:** 5 days

### Task 5.3: TT 133 BCTC Templates
**Status:** ⬜ Pending (Quick Win, ~2 days)

### Task 5.4: TT 58 Micro-Enterprise Support
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 5.5: VAT Account Analysis
**Status:** ⬜ Pending
**Effort:** 3 days

### Task 5.6: IFRS/VAS Dual Reporting
**Status:** ⬜ Pending
**Effort:** 5 days

### Task 5.7: Intercompany Transactions
**Status:** ⬜ Pending
**Effort:** 4 days

### Task 5.8: Consolidated GL
**Status:** ⬜ Pending
**Effort:** 5 days

---

## Quick Wins (can start anytime)

- [ ] Audit Trail UI (Task 5.1) — read-only page, 1 day
- [ ] Batch JE Import (Task 4.6) — CSV upload, 2 days
- [ ] GL Export — CSV only (no deps), 1 day
- [ ] TT 133 BCTC Templates (Task 5.3) — simplified B01/B02, 2 days
- [ ] JE Approval Threshold — config limit + warning, 1 day

---

## Summary

| Phase | Tasks | Effort | Status |
|-------|-------|--------|--------|
| Frontend Rewrite | 8 phases | — | ✅ Done |
| Phase 1: Remaining Core | 4 | 3 weeks | 🔜 START |
| Phase 1: Quick Wins | 2-3 | 1 week | 🔜 Parallel |
| Phase 2: Multi-Currency | 7 | 3 weeks | ⏳ After P1 |
| Phase 3: Sub-Ledger | 9 | 5 weeks | ❌ Blocked |
| Phase 4: Automation | 6 | 3 weeks | ⏳ After P1 |
| Phase 5: Compliance | 8 | 4 weeks | ⏳ After P2 |
| **Total** | **~34** | **~14 weeks** | |

**Frontend:** ✅ shadcn/ui migration complete (32 pages, 22 components, zero Ant Design).

**Start with:** Task 1.1 (B03-DN) + Quick Wins in parallel.
