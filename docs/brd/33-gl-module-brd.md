# BRD: GL Module (Sổ Cái / Tổng Hợp) — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-23
**Author:** BA Lead + Chief Accountant (40+ yrs combined)
**Status:** V0 — NOT PROD Ready

---

## 1. Executive Summary

GL (General Ledger / Sổ Cái) module is the central hub of accounting. Every transaction from all sub-ledgers (cash, bank, AR, AP, inventory, FA, payroll) flows into GL. It manages journal entries, ledger posting, account balances, trial balance, financial statements, and period-end closing. In Vietnamese accounting, GL is called **Phân hệ Tổng hợp** — the integration point that produces Báo cáo Tài chính (BCTC).

**Verdict: NOT PROD-READY — 8 CRITICAL + 15 MAJOR GAPS**
**Linked modules:** [Opening Balance Module (42-ob-module-brd.md)](./42-ob-module-brd.md) — OB must be ready before GL can operate

Current implementation provides solid foundation (LedgerEntry entity, LedgerRepository, AccountingService with posting logic, SQLite schema) but lacks client UI, financial statements, period-end closing workflow, multi-currency, cost center analytics, budget control, and full regulatory compliance with TT 99/2025/TT-BTC.

---

## 2. Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| LedgerEntry entity (interface) | EXISTS | Full fields incl. running balances, cost center, department, project |
| AccountBalance entity (interface) | EXISTS | Opening/period/closing debit/credit, optional budget fields |
| calculateBalance function | EXISTS | Computes closing balance from entries given nature (DuNo/DuCo) |
| LedgerRepository interface | EXISTS | findByPeriodId, findByAccountId, findByAccountInPeriod, getAccountBalance, getAccountBalances, saveMany, saveBalance, deleteByPeriodId, deleteByJournalEntryId |
| SQLiteLedgerRepository | EXISTS | Full implementation with lazy-init prepared statements, transaction batching |
| AccountingService ledger methods | EXISTS | postToLedger, updateAccountBalances, getLedgerEntries, getTrialBalance |
| JournalEntry entity + create/post/reverse | EXISTS | Full domain logic for journal entries, double-entry validation |
| JournalEntryRepository interface | EXISTS | findByPeriodId, findByCompanyId, findByEntryNumber, findByDateRange, findLinesByEntryId, getNextEntryNumber |
| FiscalPeriod entity + create/close | EXISTS | Open/Closed/Locked status, period creation, closure |
| DB schema (ledger_entries, account_balances, journal_entries, journal_entry_lines, fiscal_periods) | EXISTS | Full normalized schema |
| REST API (Express controller) | EXISTS | Full CRUD for accounts, journal entries, ledger, fiscal periods |
| NestJS module + controller | EXISTS | Full NestJS implementation parallel to Express |
| Client UI | MISSING | No GL screens, no journal entry UI, no ledger view |
| Financial statements (BCTC) | MISSING | No B01-DN, B02-DN, B03-DN, B09-DN generation |
| Period-end closing workflow | PARTIAL | closeFiscalPeriod exists but no close checklist, no audit trail, no rollback |
| Multi-currency | MISSING | exchange_rate column exists in journal entry lines but unused |
| Cost center analytics | MISSING | cost_center_id, department_id, project_id exist in schema but unused in reporting |
| Budget control | MISSING | budget_debit/credit exist in AccountBalance interface but unused |
| Sub-ledger integration | MISSING | No automated posting from cash/bank/AR/AP sub-ledgers |
| Audit trail visualization | MISSING | No UI for audit log viewing per account |
| GL reports | MISSING | No general ledger report, account analysis, or financial reports |
| Auto-recurring entries | MISSING | No support for recurring/depreciation/prepayment schedules |
| Electronic signature integration | MISSING | No digital signing of journal entries per NĐ 23/2025/NĐ-CP |

---

## 3. PROD Readiness Verdict

**NOT PROD-READY.** Eight critical gaps and fifteen major gaps prevent deployment.

### 3.1 Critical (Blocking) Gaps

| # | Gap | Regulatory/Operational Impact |
|---|------|-------------------------------|
| BG-G01 | **No client UI** — zero GL/accounting screens exist | System cannot be used by accountants. No journal entry creation, no ledger viewing, no trial balance |
| BG-G02 | **No financial statements (BCTC)** — B01-DN, B02-DN, B03-DN, B09-DN not generated | Companies cannot submit statutory BCTC. Violates TT 99 Điều 17, Luật Kế toán Điều 29-31 |
| BG-G03 | **No period-end closing workflow** — closeFiscalPeriod is a stub without close checklist, balance verification, or rollback | Periods may close with unbalanced or incomplete data. No audit trail for closure |
| BG-G04 | **No sub-ledger integration** — automated posting from cash/bank/AR/AP/inventory/FA modules not implemented | All transactions must be manually entered as journal entries. Impossible for production use |
| BG-G05 | **No multi-currency support** — exchange_rate in schema but no FX revaluation, no unrealized gain/loss posting | Vietnamese SMEs with foreign currency transactions (export/import) cannot operate. Violates TT 99 Điều 6 |
| BG-G06 | **No GL-specific reports** — no general ledger report, account analysis, or financial reports | Accountants cannot produce standard audit-ready GL outputs |
| BG-G07 | **No cost center / department / project analytics** — analytic dimensions exist in schema but no reporting or allocation | Cannot produce management accounts by department. Violates TT 53/2006/TT-BTC management accounting guidance |
| BG-G08 | **No budget control** — budget_debit/credit in AccountBalance but no budget entry, no variance reporting | Cannot prevent overspending. No budget vs actual comparison |

### 3.2 Major Gaps

| # | Gap | Severity |
|---|------|----------|
| MG-G01 | No auto-recurring journal entries (depreciation, prepayment, allocation) | High |
| MG-G02 | No electronic signature integration per NĐ 23/2025/NĐ-CP | High |
| MG-G03 | No audit trail visualization (who posted what, when) | High |
| MG-G04 | No configurable account number auto-generation for journal entries | Medium |
| MG-G05 | No batch journal entry import (Excel/CSV) | Medium |
| MG-G06 | No reversing/correcting entry workflow (red ink reversal) | High |
| MG-G07 | No intercompany transaction processing | Medium |
| MG-G08 | No consolidated GL for multi-company groups | Medium |
| MG-G09 | No IFRS/VAS dual reporting capability | High |
| MG-G10 | No TT 133/TT 58 regime support in GL (different report templates) | High |
| MG-G11 | No closing checklist automation (Verify balances → Depreciation → Prepayment → Allocation → Revaluation → Close) | High |
| MG-G12 | No year-end closing with retained earnings calculation | High |
| MG-G13 | No GL drill-down (balance → sub-ledger → journal entry → source document) | Medium |
| MG-G14 | No tax-integrated GL (VAT account analysis for tax declaration) | High |
| MG-G15 | No data export for auditor (Excel, PDF) | Medium |

---

## 4. Regulatory Framework

| Regulation | Effective | GL Relevance |
|------------|-----------|--------------|
| **TT 99/2025/TT-BTC** (Chế độ kế toán DN) | 01/01/2026 | Defines GL structure, account names, BCTC templates, period-end procedures |
| **TT 133/2016/TT-BTC** (SME) | 01/01/2017 | Simplified GL for SMEs — TK 642 replaces 641+642, simplified BCTC |
| **TT 58/2026/TT-BTC** (siêu nhỏ) | 01/07/2026 | Simplified tax-based book system — S1-DNSN to S4d-DNSN |
| **Luật Kế toán 88/2015/QH13** | 01/01/2017 | Defines general accounting requirements, GL integrity, BCTC obligations |
| **TT 53/2006/TT-BTC** (Kế toán quản trị) | 2006—nay | Management accounting — analytic dimensions, cost centers, department accounting |
| **NĐ 23/2025/NĐ-CP** (Chữ ký số) | 2025 | Electronic signature on accounting vouchers |
| **NĐ 70/2025/NĐ-CP** (Hóa đơn điện tử) | 2025 | E-invoice integration with GL |

---

## 5. Target Data Model

### 5.1 Current Schema (exists)

```
ledger_entries:
  id, company_id, account_id, account_number, period_id,
  journal_entry_id, entry_number, entry_date, description,
  debit_amount, credit_amount, running_debit, running_credit, running_balance,
  cost_center_id?, department_id?, project_id?, created_at

account_balances:
  account_id, account_number, company_id, period_id,
  opening_debit, opening_credit,
  period_debit, period_credit,
  closing_debit, closing_credit

journal_entries:
  id, company_id, entry_number, entry_date, period_id, entry_type,
  description, reference_number, reference_date,
  total_debit, total_credit,
  is_posted, is_reversed, reversed_by_id,
  posted_at, posted_by_user_id, created_by_user_id

journal_entry_lines:
  id, journal_entry_id, account_id, account_number, description,
  debit_amount, credit_amount, cost_center_id?, department_id?, project_id?
```

### 5.2 Required Schema Additions

```sql
-- Add to journal_entry_lines
ALTER TABLE journal_entry_lines ADD COLUMN exchange_rate REAL DEFAULT 1;
ALTER TABLE journal_entry_lines ADD COLUMN currency_code TEXT DEFAULT 'VND';

-- Budget tracking
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  period_id INTEGER NOT NULL REFERENCES fiscal_periods(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  budget_amount REAL NOT NULL DEFAULT 0,
  department_id INTEGER,
  cost_center_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, period_id, account_id, department_id, cost_center_id)
);

-- Recurring journal entry templates
CREATE TABLE IF NOT EXISTS recurring_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  template_name TEXT NOT NULL,
  description TEXT,
  entry_type INTEGER NOT NULL,
  frequency TEXT NOT NULL,  -- 'monthly','quarterly','yearly','on_demand'
  next_run_date TEXT,
  last_run_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurring_entry_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recurring_entry_id INTEGER NOT NULL REFERENCES recurring_entries(id),
  account_number TEXT NOT NULL,
  description TEXT,
  debit_formula TEXT,  -- e.g. "fixed:1000000" or "proportion:account:642:0.1"
  credit_formula TEXT,
  department_id INTEGER,
  cost_center_id TEXT
);

-- Closing checklist templates
CREATE TABLE IF NOT EXISTS closing_checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,  -- 'verify','post','calculate','report'
  reference_module TEXT,  -- 'depreciation','prepayment','fx','allocation',etc.
  is_required INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 6. Functional Requirements

### 6.1 Core GL Operations (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G01 | System shall allow creating journal entries with debit/credit lines, auto-validating balance (total debit = total credit) | P0 |
| FR-G02 | System shall post journal entries to ledger, updating running balances per account | P0 |
| FR-G03 | System shall prevent posting to closed fiscal periods | P0 |
| FR-G04 | System shall prevent posting to inactive accounts | P0 |
| FR-G05 | System shall generate unique entry numbers per company per period (YYYYMM-XXXXX) | P0 |
| FR-G06 | System shall support reversing journal entries with auto-creation of reversal entry | P0 |
| FR-G07 | System shall display general ledger (sổ cái) per account: opening balance, each transaction, running balance | P0 |
| FR-G08 | System shall display trial balance (bảng cân đối tài khoản) for any period | P0 |
| FR-G09 | System shall display account balance sheet for any period | P0 |
| FR-G10 | System shall generate financial statements: B01-DN, B02-DN, B03-DN, B09-DN per TT 99 | P0 |

### 6.2 Period-End Closing (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G11 | System shall provide period-end closing checklist with ordered steps | P0 |
| FR-G12 | System shall verify closing balance equality before period close (total debit assets = total credit liabilities + equity) | P0 |
| FR-G13 | System shall lock period on close; prevent new entries or modifications | P0 |
| FR-G14 | System shall auto-carry forward closing balances as opening balances for next period | P0 |
| FR-G15 | System shall log all period-end actions in audit trail | P0 |

### 6.3 Multi-Currency (P1)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G16 | System shall support journal entries in foreign currency with exchange rate | P1 |
| FR-G17 | System shall calculate and post unrealized FX gain/loss at period end | P1 |
| FR-G18 | System shall support realized FX gain/loss on settlement | P1 |
| FR-G19 | System shall maintain exchange rate history | P1 |

### 6.4 Cost Center Analytics (P1)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G20 | System shall report trial balance by department/cost center/project | P1 |
| FR-G21 | System shall support cost allocation rules (proportional, fixed, step-down) | P1 |
| FR-G22 | System shall produce department income statement | P1 |

### 6.5 Budget Control (P2)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G23 | System shall support budget entry per account per period per department | P2 |
| FR-G24 | System shall warn (soft) or block (hard) when posting exceeds budget | P2 |
| FR-G25 | System shall produce budget vs actual variance report | P2 |

### 6.6 Automation (P1)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G26 | System shall support recurring journal entry templates (monthly depreciation, prepayment amortization) | P1 |
| FR-G27 | System shall generate accrued entries automatically at period end | P1 |
| FR-G28 | System shall support batch import of journal entries from Excel/CSV | P2 |

### 6.7 Compliance & Audit (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-G29 | System shall prevent modification or deletion of posted entries (reverse only) | P0 |
| FR-G30 | System shall audit-log every journal entry action (create, post, reverse, delete) | P0 |
| FR-G31 | System shall support digital signature on journal entries per NĐ 23/2025/NĐ-CP | P2 |
| FR-G32 | System shall support GL data export for auditor (Excel, PDF) | P1 |

---

## 7. Integration Points

| Module | Integration | Current Status |
|--------|-------------|----------------|
| COA | Account validation, hierarchy, balance roll-up | EXISTS |
| Cash (Quỹ) | Auto-post receipt/payment → GL | MISSING |
| Bank | Auto-post bank transactions → GL | MISSING |
| AR (Bán hàng) | Auto-post sales invoices → GL | MISSING |
| AP (Mua hàng) | Auto-post purchase invoices → GL | MISSING |
| Inventory (Kho) | Auto-post inventory movements → GL | MISSING |
| FA (TSCĐ) | Auto-post depreciation → GL via recurring entries | MISSING |
| Payroll (Lương) | Auto-post salary → GL | MISSING |
| Tax (Thuế) | VAT account analysis from GL | MISSING |
| Budget | Budget control on GL posting | MISSING |
| Audit | Audit trail for all GL transactions | PARTIAL |

---

## 8. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data integrity: unbalanced journal entries in production | Low | Critical | Enforce double-entry validation at domain entity level (already done in createJournalEntry) |
| Period-end close failure with no rollback | Medium | High | Implement transactional close with explicit rollback procedure |
| FX revaluation errors causing incorrect BCTC | Medium | High | Implement and test FX logic with independent verification |
| Performance: 100K+ ledger entries per period | Low | Medium | Index critical columns (company_id, period_id, account_id), use batch inserts |
| Concurrent journal entry creation causing duplicate entry numbers | Low | High | Use database-level sequence or table-level lock for entry number generation |

---

## 9. References

- TT 99/2025/TT-BTC: thuvienphapluat.vn
- TT 133/2016/TT-BTC: Chế độ kế toán SME
- TT 58/2026/TT-BTC: Chế độ kế toán DN siêu nhỏ
- TT 53/2006/TT-BTC: Hướng dẫn kế toán quản trị
- Luật Kế toán 88/2015/QH13
- NĐ 23/2025/NĐ-CP: Chữ ký số
- MISA SME.NET 2026 — Phân hệ Tổng hợp
- Fast Accounting 12 — Kế toán tổng hợp
- BRAVO 10 — Quản lý Tài chính - Kế toán
- Kế toán Thiên Ưng: ketoanthienung.net
- Kế toán Lê Ánh: ketoanleanh.edu.vn
