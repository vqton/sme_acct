# BRD: GL Module (Sổ Cái / Tổng Hợp) — SmeAccounting

**Version:** 2.0
**Date:** 2026-07-24
**Author:** BA Lead + Chief Accountant (40+ yrs combined)
**Status:** V1 — PROD-READY with known gaps

---

## 1. Executive Summary

GL (General Ledger / Sổ Cái) is the central accounting hub. Every transaction from all sub-ledgers flows into GL. It manages journal entries, ledger posting, account balances, trial balance, financial statements, and period-end closing. In Vietnamese accounting: **Phân hệ Tổng hợp** — produces Báo cáo Tài chính (BCTC).

**Verdict: PROD-READY for core GL operations (journal entries, ledger, trial balance, B01-DN, B02-DN). Not PROD-ready for: sub-ledger auto-posting, B03-DN, B09-DN, multi-currency FX, budget control, recurring entries.**

**Linked modules:** Opening Balance Module (42-ob-module-brd.md) — OB must be loaded before GL can process.

### Key Changes from V1 (2026-07-23)
- **V1 claimed "No client UI"** — FALSE. All core GL screens exist: JournalEntryListPage, JournalEntryFormPage, LedgerPage, TrialBalancePage, FinancialStatementPage
- **V1 claimed "No financial statements"** — FALSE. B01-DN (Balance Sheet) + B02-DN (Income Statement) implemented with full TT 99 mappings including formula-based line items
- **V1 claimed "No GL reports"** — FALSE. LedgerPage shows full sổ cái with opening balance, each transaction, running balance, closing balance
- **V1 gap count reduced** from 8 CRITICAL+15 MAJOR (V1) to 3 CRITICAL+10 MAJOR (V2) after codebase verification
- **New: TT 99/2025/TT-BTC** replaced TT 200/2014/TT-BTC effective 01/01/2026 — verified by web research (thuvienphapluat.vn, luatvietnam.vn, VACPA workshop July 2026)
- **New: Market comparison** added — MISA SME 2026 (200+ reports, 3-9M VND/mo, 170K+ customers), Fast Accounting (1-3M/mo, 15.6K customers), BRAVO (customizable, manufacturing focus)

---

## 2. Current Implementation Status

### 2.1 Server-Side (EXISTS — VERIFIED)

| Component | Status | Files |
|-----------|--------|-------|
| LedgerEntry entity (interface) | ✅ EXISTS | `server/src/domain/entities/LedgerEntry.ts` |
| AccountBalance entity (interface) | ✅ EXISTS | `server/src/domain/entities/LedgerEntry.ts` |
| calculateBalance function | ✅ EXISTS | `server/src/domain/entities/LedgerEntry.ts` |
| LedgerRepository interface | ✅ EXISTS | `server/src/domain/repositories/LedgerRepository.ts` |
| SQLiteLedgerRepository | ✅ EXISTS | Full implementation with lazy-init prepared statements, batch inserts |
| JournalEntry entity + create/post/reverse | ✅ EXISTS | Domain logic for JE with double-entry validation |
| JournalEntryRepository interface | ✅ EXISTS | `server/src/domain/repositories/JournalEntryRepository.ts` |
| SQLiteJournalEntryRepository | ✅ EXISTS | Full implementation |
| FiscalPeriod entity + create/close | ✅ EXISTS | `server/src/domain/entities/FiscalPeriod.ts` |
| Account entity + hierarchy | ✅ EXISTS | Full COA domain model |
| AccountingService | ✅ EXISTS | `postToLedger`, `getLedgerEntries`, `getTrialBalance`, `reverseJournalEntry`, `closeFiscalPeriod` |
| FinancialStatementService | ✅ EXISTS | `generateBalanceSheet`, `generateIncomeStatement` with B01-DN + B02-DN TT99 mappings |
| NestJS AccountingController | ✅ EXISTS | Full REST endpoints |
| Tests (AccountingService) | ✅ 15/15 PASS | `server/src/application/AccountingService.test.ts` |
| Tests (PeriodCloseService) | ✅ 20/20 PASS | `server/src/application/PeriodCloseService.test.ts` |
| Tests (FinancialStatementService) | ✅ PASS | `server/src/application/FinancialStatementService.test.ts` |

### 2.2 Client-Side (EXISTS — VERIFIED)

| Page | Status | File |
|------|--------|------|
| Journal Entry List | ✅ EXISTS | `client/src/pages/JournalEntryListPage.tsx` |
| Journal Entry Create/Edit | ✅ EXISTS | `client/src/pages/JournalEntryFormPage.tsx` |
| General Ledger (Sổ Cái) | ✅ EXISTS | `client/src/pages/LedgerPage.tsx` |
| Trial Balance | ✅ EXISTS | `client/src/pages/TrialBalancePage.tsx` |
| Financial Statements | ✅ EXISTS | `client/src/pages/FinancialStatementPage.tsx` (B01-DN + B02-DN) |
| Opening Balance List | ✅ EXISTS | `client/src/pages/OpeningBalanceListPage.tsx` |
| Opening Balance Form | ✅ EXISTS | `client/src/pages/OpeningBalanceFormPage.tsx` |
| Opening Balance Detail | ✅ EXISTS | `client/src/pages/OpeningBalanceDetailPage.tsx` |

### 2.3 What's Still Missing

| Component | Status | Notes |
|-----------|--------|-------|
| B03-DN (Cash Flow Statement) | ❌ MISSING | Type enum defined, no mapping rules |
| B09-DN (Notes to Financial Statements) | ❌ MISSING | Type enum defined, no implementation |
| Sub-ledger auto-posting (cash/bank/AR/AP/inventory/FA/payroll) | ❌ MISSING | All transactions must be manually entered |
| Multi-currency FX revaluation | ❌ MISSING | `exchange_rate` in schema but unused |
| Cost center / department / project reporting | ❌ MISSING | Dimensions exist in schema but unused in reporting |
| Budget control | ❌ MISSING | `budget_debit/credit` in AccountBalance interface but unused |
| Recurring journal entries | ❌ MISSING | No templates/scheduler |
| Period-end closing workflow UI | ❌ MISSING | `closeFiscalPeriod` exists but no close checklist UI |
| Audit trail visualization | ❌ MISSING | No UI for audit log viewing |
| Electronic signature integration | ❌ MISSING | Per NĐ 23/2025/NĐ-CP |
| TT 133 simplified regime support | ❌ MISSING | Different BCTC templates |
| TT 58 micro-enterprise regime | ❌ MISSING | Simplified tax-based book system |
| IFRS/VAS dual reporting | ❌ MISSING | Aspirational |

---

## 3. PROD Readiness Verdict

**CONDITIONAL PROD-READY.** Core GL operations work. Three remaining critical gaps.

### 3.1 Critical (Blocking) Gaps

| # | Gap | Impact | Mitigation |
|---|------|--------|------------|
| BG-G01 | **No sub-ledger auto-posting** — cash/bank/AR/AP/inventory/FA/payroll not integrated | All entries must be manually keyed. OK for low-volume SME but error-prone at scale | Phase 2 of roadmap; manual JE entry works for now |
| BG-G02 | **No B03-DN (Cash Flow Statement)** — missing from FinancialStatementService | Cannot submit complete BCTC to tax authority. TT 99 requires all 4 statements for annual filing | Q4 2026 priority; indirect method uses B01+B02 data |
| BG-G03 | **No B09-DN (Notes to Financial Statements)** — required explanatory notes | BCTC submission incomplete without B09-DN companion | Q4 2026 priority |

### 3.2 Major Gaps

| # | Gap | Severity |
|---|------|----------|
| MG-G01 | No period-end closing workflow UI (close checklist, verification, rollback) | High |
| MG-G02 | No multi-currency FX revaluation (unrealized gain/loss) | High |
| MG-G03 | No cost center / department / project reporting | Medium |
| MG-G04 | No budget control (warning/block on over-budget) | Medium |
| MG-G05 | No auto-recurring entries (depreciation, prepayment, allocation) | High |
| MG-G06 | No electronic signature integration per NĐ 23/2025/NĐ-CP | Medium |
| MG-G07 | No audit trail visualization UI | Medium |
| MG-G08 | No IFRS/VAS dual reporting capability | Medium |
| MG-G09 | No TT 133/TT 58 regime support | Medium |
| MG-G10 | No consolidated GL for multi-company groups | Low |

---

## 4. Regulatory Compliance Assessment

| Regulation | Effective | GL Relevance | Compliance Status |
|------------|-----------|--------------|-------------------|
| **TT 99/2025/TT-BTC** (Chế độ kế toán DN) | 01/01/2026 | Chart of accounts, BCTC templates, period-end procedures | ✅ B01-DN, B02-DN implemented with TT99 mappings. ❌ B03-DN, B09-DN missing |
| **Luật Kế toán 88/2015/QH13** | 01/01/2017 | Double-entry, audit trail, retention | ✅ Điều 7 (double-entry) enforced. ⚠️ Điều 13 (audit trail) exists but no UI |
| **TT 133/2016/TT-BTC** (SME regime) | 01/01/2017 | Simplified GL for SMEs | ❌ Not implemented |
| **TT 58/2026/TT-BTC** (Siêu nhỏ) | 01/07/2026 | Simplified tax-based books | ❌ Not implemented |
| **NĐ 23/2025/NĐ-CP** (Chữ ký số) | 2025 | Digital signature on vouchers | ❌ Not implemented |
| **NĐ 254/2026/NĐ-CP** (Hóa đơn điện tử) | 01/07/2026 | E-invoice → GL posting | ❌ Not integrated |

**Key TT 99/2025/TT-BTC Changes Verified (web research Jul 2026):**
1. Multi-currency accounting — stricter rules for choosing functional currency (Điều 5)
2. New chart of accounts (Phụ lục 2) — minor changes from TT 200
3. New BCTC templates (Phụ lục 4) — updated B01-DN, B02-DN, B03-DN, B09-DN formats
4. Internal control requirements — DN must self-build management regulations (Điều 9)
5. 26 articles of TT 200 still effective — gradual transition
6. VACPA held "Thực hành TT 99" workshop July 2026 with "386 sơ đồ kế toán DN" book

---

## 5. Market Comparison

| Feature | SmeAccounting | MISA SME 2026 | Fast Accounting | BRAVO |
|---------|--------------|---------------|-----------------|-------|
| Core GL (JE, ledger, TB) | ✅ | ✅ | ✅ | ✅ |
| B01-DN (Balance Sheet) | ✅ | ✅ | ✅ | ✅ |
| B02-DN (Income Statement) | ✅ | ✅ | ✅ | ✅ |
| B03-DN (Cash Flow) | ❌ | ✅ | ✅ | ✅ |
| B09-DN (Notes) | ❌ | ✅ | ✅ | ✅ |
| Multi-currency | ❌ | ✅ | ✅ | ✅ |
| Budget control | ❌ | ✅ | ✅ | ✅ |
| Recurring entries | ❌ | ✅ | ✅ | ✅ |
| Sub-ledger auto-posting | ❌ | ✅ | ✅ | ✅ |
| Cost center reporting | ❌ | ✅ | ✅ | ✅ |
| Period-end checklist | ❌ | ✅ | ✅ | ✅ |
| E-invoice integration | ❌ | ✅ (meInvoice) | ✅ (VNPT/Viettel) | ✅ (partner) |
| Electronic signature | ❌ | ✅ | ✅ | ✅ |
| 200+ reports | ❌ | ✅ | ✅ | ✅ |
| Mobile access | ❌ | ✅ | ✅ | ✅ |
| Price | TBD | 3-9M VND/month | 1-3M VND/month | Custom |
| Customers | 0 (pre-launch) | 170,000+ | 15,600+ | 10,000+ |

**Competitive Advantage:**
- Open source / self-hosted (MISA, Fast, BRAVO are proprietary)
- Modern tech stack (React, TypeScript, SQLite) vs legacy desktop apps
- Clean DDD architecture — easier to extend

**Gap to close for parity:** ~6 months development for feature parity with MISA SME core GL features.

---

## 6. Functional Requirements (Updated)

### 6.1 Core GL Operations — ✅ Mostly Built

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G01 | Create journal entries with debit/credit validation | P0 | ✅ Built |
| FR-G02 | Post to ledger, update running balances | P0 | ✅ Built |
| FR-G03 | Prevent posting to closed periods | P0 | ✅ Built |
| FR-G04 | Prevent posting to inactive accounts | P0 | ✅ Built |
| FR-G05 | Generate unique entry numbers (YYYYMM-XXXXX) | P0 | ✅ Built |
| FR-G06 | Support reversing entries | P0 | ✅ Built |
| FR-G07 | Display general ledger per account | P0 | ✅ Built |
| FR-G08 | Display trial balance | P0 | ✅ Built |
| FR-G09 | Display account balance sheet | P0 | ✅ Built |
| FR-G10 | Generate B01-DN, B02-DN | P0 | ✅ Built |
| FR-G10b | Generate B03-DN (Cash Flow) | P0 | ❌ Missing |
| FR-G10c | Generate B09-DN (Notes) | P0 | ❌ Missing |

### 6.2 Period-End Closing — ⚠️ Partial

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G11 | Period-end closing checklist | P0 | ❌ Missing |
| FR-G12 | Verify trial balance before close | P0 | ✅ Built (in closeFiscalPeriod) |
| FR-G13 | Lock period on close | P0 | ✅ Built |
| FR-G14 | Carry forward balances | P0 | ✅ Built (carryForwardBalances) |
| FR-G15 | Audit trail for closure | P0 | ⚠️ Exists in code, no UI |

### 6.3 Multi-Currency — ❌ Missing

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G16 | JE in foreign currency with rate | P1 | ❌ Missing |
| FR-G17 | Unrealized FX gain/loss at period end | P1 | ❌ Missing |
| FR-G18 | Realized FX gain/loss on settlement | P1 | ❌ Missing |
| FR-G19 | Exchange rate history | P1 | ❌ Missing |

### 6.4 Cost Center Analytics — ❌ Missing

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G20 | Trial balance by department/cost center/project | P1 | ❌ Missing |
| FR-G21 | Cost allocation rules | P1 | ❌ Missing |
| FR-G22 | Department income statement | P1 | ❌ Missing |

### 6.5 Budget Control — ❌ Missing

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G23 | Budget entry per account per period | P2 | ❌ Missing |
| FR-G24 | Warning/block on over-budget posting | P2 | ❌ Missing |
| FR-G25 | Budget vs actual variance report | P2 | ❌ Missing |

### 6.6 Automation — ❌ Missing

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G26 | Recurring entry templates | P1 | ❌ Missing |
| FR-G27 | Auto-generate accrued entries at period end | P1 | ❌ Missing |
| FR-G28 | Batch import JE from Excel/CSV | P2 | ❌ Missing |

### 6.7 Compliance & Audit — ⚠️ Partial

| FR# | Requirement | Priority | Status |
|-----|-------------|----------|--------|
| FR-G29 | Posted entries immutable (reverse only) | P0 | ✅ Built |
| FR-G30 | Audit log every JE action | P0 | ⚠️ Exists in code, no UI |
| FR-G31 | Digital signature per NĐ 23/2025/NĐ-CP | P2 | ❌ Missing |
| FR-G32 | GL data export for auditor (Excel/PDF) | P1 | ❌ Missing |

---

## 7. Integration Points

| Module | Integration | Current Status |
|--------|-------------|----------------|
| COA | Account validation, hierarchy, balance roll-up | ✅ EXISTS |
| Opening Balance | Import opening balances → GL account_balances | ✅ EXISTS (15/15 tests pass) |
| Cash (Quỹ) | Auto-post receipt/payment → GL | ❌ MISSING |
| Bank | Auto-post bank transactions → GL | ❌ MISSING |
| AR (Bán hàng) | Auto-post sales invoices → GL | ❌ MISSING |
| AP (Mua hàng) | Auto-post purchase invoices → GL | ❌ MISSING |
| Inventory (Kho) | Auto-post inventory movements → GL | ❌ MISSING |
| FA (TSCĐ) | Auto-post depreciation → GL | ❌ MISSING |
| Payroll (Lương) | Auto-post salary → GL | ❌ MISSING |
| Tax (Thuế) | VAT account analysis from GL | ❌ MISSING |
| Budget | Budget control on GL posting | ❌ MISSING |
| Audit | Audit trail for all GL transactions | ⚠️ PARTIAL (logs exist, no UI) |

---

## 8. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data integrity: unbalanced JE in production | Low | Critical | Double-entry validation at domain level ✅ enforced |
| Period-end close failure with no rollback | Medium | High | closeFiscalPeriod wraps in transaction; explicit rollback needed |
| FX revaluation errors causing incorrect BCTC | Medium | High | Not yet implemented — no risk until Phase 3 |
| Performance: 100K+ ledger entries per period | Low | Medium | Indexes on company_id, period_id, account_id; batch inserts |
| Concurrent JE creation → duplicate entry numbers | Low | High | DB-level sequence for entry number generation needed |
| Docs out of sync with codebase | High | Medium | V2 update closes this gap; establish doc-review cadence |

---

## 9. References

- TT 99/2025/TT-BTC: thuvienphapluat.vn (effective 01/01/2026, replaces TT 200/2014/TT-BTC)
- TT 133/2016/TT-BTC: Chế độ kế toán SME (simplified BCTC templates)
- TT 58/2026/TT-BTC: Chế độ kế toán DN siêu nhỏ (effective 01/07/2026)
- Luật Kế toán 88/2015/QH13 (Điều 7: double-entry, Điều 13: immutability, Điều 41: retention)
- NĐ 23/2025/NĐ-CP: Chữ ký số trên chứng từ kế toán
- NĐ 254/2026/NĐ-CP: Hóa đơn điện tử (effective 01/07/2026)
- VACPA Hội thảo Thực hành TT 99 (July 2026) — 386 sơ đồ kế toán
- IFRS lộ trình Việt Nam — QĐ 345/QĐ-BTC, dự thảo Thông tư IFRS (11/2025)
- MISA SME 2026: sme.misa.vn (170K+ KH, 200+ BC, 3-9M VND/tháng)
- Fast Accounting: fast.com.vn (15.600+ KH, 1-3M VND/tháng)
- BRAVO: bravo.com.vn (tùy biến cao, mạnh về sản xuất)
- Previous BRD version: `33-gl-module-brd.md` v1 (2026-07-23) — superseded
