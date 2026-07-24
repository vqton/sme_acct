# BRD: Opening Balance Module (Số Dư Đầu Kỳ) — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-24
**Author:** BA Lead + Chief Accountant (40+ yrs combined)
**Status:** V0 — NOT PROD Ready

---

## 1. Executive Summary

Opening Balance (Số Dư Đầu Kỳ / Số Dư Ban Đầu) module is the foundation of any accounting system. It allows accountants to enter initial balances for all accounts when starting a new company in the system, migrating from legacy software, or starting a new fiscal year. In Vietnamese accounting, this is called **Nhập số dư ban đầu** — the critical first step before any transaction can be posted.

**Verdict: NOT PROD-READY — 7 CRITICAL + 12 MAJOR GAPS**

Current implementation has `openingDebit`/`openingCredit` fields on the `Account` entity and `AccountBalance` interface, plus `carryForwardBalances` in `PeriodCloseService`, but lacks:
- Dedicated opening balance module with UI
- Bulk import from Excel/CSV
- Validation (Tổng Dư Nợ = Tổng Dư Có)
- Sub-ledger detail entry (bank, AR, AP, inventory, FA, CCDC, prepaid)
- TT 99/2025/TT-BTC conversion support (TT200→TT99 migration)
- Opening balance lock after first transaction
- Audit trail for opening balance changes

---

## 2. Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| `Account.openingDebit` / `Account.openingCredit` | EXISTS | Fields exist on Account entity but no dedicated module |
| `AccountBalance.openingDebit` / `AccountBalance.openingCredit` | EXISTS | Used in `calculateBalance()` and ledger posting |
| `FiscalPeriod.isOpeningBalancePeriod` | EXISTS | Boolean field exists but unused in any workflow |
| `PeriodCloseService.carryForwardBalances()` | EXISTS | Carries closing→opening between periods |
| `calculateBalance()` opening balance param | EXISTS | Uses opening balance to compute closing balance |
| DB schema `accounts.opening_debit/credit` | EXISTS | Columns exist in accounts table |
| DB schema `account_balances.opening_debit/credit` | EXISTS | Columns exist in account_balances table |
| Client UI for opening balance entry | MISSING | No screens for entering opening balances |
| Bulk import from Excel/CSV | MISSING | No batch import capability |
| Opening balance validation (balance check) | MISSING | No DEBIT=CREDIT validation |
| Sub-ledger detail entry | MISSING | No detail entry for bank/AR/AP/inventory/FA/CCDC |
| Opening balance lock | MISSING | No lock after first period transaction |
| TT99 conversion tool | MISSING | No TT200→TT99 account mapping |
| Multi-currency opening balance | MISSING | No FX opening balance entry |
| Opening balance audit trail | MISSING | No log of who entered/changed opening balances |
| Historical opening balance report | MISSING | No report showing opening balance by account |
| Opening balance period workflow | MISSING | No dedicated opening balance period flow |

---

## 3. PROD Readiness Verdict

**NOT PROD-READY.** Seven critical gaps and twelve major gaps prevent deployment.

### 3.1 Critical (Blocking) Gaps

| # | Gap | Regulatory/Operational Impact |
|---|------|-------------------------------|
| OB-C01 | **No client UI** — zero screens for entering opening balances | System cannot be onboarded. No way to enter starting balances for new company |
| OB-C02 | **No opening balance validation** — no Tổng Dư Nợ = Tổng Dư Có check | Unbalanced opening balances cause incorrect BCTC from day one. Violates Luật Kế toán Điều 29 |
| OB-C03 | **No sub-ledger detail entry** — cannot enter bank balances, AR/AP details, inventory quantities, FA details | Vietnamese SMEs need detail entry by bank account, customer, supplier, item. Manual entry per MISA/Fast/Bravo standard |
| OB-C04 | **No bulk import from Excel/CSV** — no batch import of opening balances | Companies migrating from legacy systems (MISA, Fast, Bravo, Excel) cannot import existing data. Must re-enter manually — impossible for production |
| OB-C05 | **No opening balance lock** — no prevention of modification after period transactions start | Changing opening balances mid-period breaks all ledger running balances. Creates audit risk. Violates Luật Kế toán Điều 13 |
| OB-C06 | **No TT 99/2025/TT-BTC conversion** — no support for TT200→TT99 account mapping | From 01/01/2026, all companies must convert from TT200 to TT99. Without conversion tool, opening balances mapped to wrong accounts. Mass non-compliance |
| OB-C07 | **No audit trail for opening balance changes** — no log of who entered/changed balances | Regulators (thanh tra thuế, kiểm toán) require proof of opening balance provenance. Without audit trail, legal liability for chief accountant |

### 3.2 Major Gaps

| # | Gap | Severity |
|---|------|----------|
| OB-M01 | No multi-currency opening balance (FX accounts) | High |
| OB-M02 | No opening balance report (Sổ chi tiết số dư đầu kỳ) | High |
| OB-M03 | No automatic carry-forward from closing balances of prior year | High |
| OB-M04 | No opening balance adjustment journal entry workflow | High |
| OB-M05 | No import template download (Excel mẫu nhập khẩu) | Medium |
| OB-M06 | No opening balance comparison with prior period | Medium |
| OB-M07 | No consolidated opening balance for multi-company | Medium |
| OB-M08 | No TT 133/2016/TT-BTC simplified opening balance template | High |
| OB-M09 | No opening balance for off-balance-sheet accounts (TK 0xx) | Medium |
| OB-M10 | No batch account creation during opening balance import | Medium |
| OB-M11 | No opening balance approval workflow (ký duyệt) | High |
| OB-M12 | No electronic signature on opening balance per NĐ 23/2025/NĐ-CP | High |

---

## 4. Regulatory Framework

| Regulation | Effective | OB Relevance |
|------------|-----------|--------------|
| **TT 99/2025/TT-BTC** (Chế độ kế toán DN) | 01/01/2026 | Điều 4-5: Xử lý số dư đầu kỳ khi thay đổi đơn vị tiền tệ, Điều 30: Chuyển đổi số dư đầu kỳ khi thay đổi chính sách kế toán. Phụ lục II: Hệ thống TK mới |
| **TT 200/2014/TT-BTC** (replaced) | →31/12/2025 | Old chart of accounts — opening balances must be convertible to TT99 |
| **TT 133/2016/TT-BTC** (SME) | Current | Simplified accounts for SMEs — opening balance template differs |
| **TT 132/2018/TT-BTC** (Siêu nhỏ) | Current | Minimal accounts for micro-enterprises |
| **TT 24/2024/TT-BTC** (HCSN) | 01/01/2025 | Administrative units — different opening balance rules |
| **Luật Kế toán 88/2015/QH13** | 01/01/2017 | Điều 13: Nguyên tắc kế toán — số dư đầu kỳ phải khớp với số dư cuối kỳ trước. Điều 29: BCTC phải trung thực |
| **NĐ 23/2025/NĐ-CP** (Chữ ký số) | 2025 | Electronic signature on accounting vouchers including opening balance |
| **NĐ 70/2025/NĐ-CP** (Hóa đơn điện tử) | 2025 | VAT invoice integration — opening VAT account balances |
| **TT 53/2006/TT-BTC** (Kế toán quản trị) | 2006—nay | Management accounting — cost center opening balances |
| **Luật Quản lý thuế 108/2025/QH15** | 01/07/2026 | Tax management — opening tax balances must match tax authority records |

### 4.1 Key Legal Provisions

**TT 99/2025/TT-BTC Điều 4 (Đơn vị tiền tệ):**
> Toàn bộ số dư tài sản, nợ phải trả và vốn chủ sở hữu tại thời điểm kết thúc kỳ kế toán trước khi chuyển đổi được ghi nhận là số dư đầu kỳ của kỳ kế toán mới

**TT 99/2025/TT-BTC Điều 5 (Chuyển đổi loại hình DN):**
> Toàn bộ số dư tài sản, nợ phải trả và vốn chủ sở hữu trên sổ kế toán của doanh nghiệp cũ trước khi chuyển đổi được ghi nhận là số dư đầu kỳ trên sổ kế toán của doanh nghiệp mới

**Luật Kế toán Điều 13 (Nguyên tắc kế toán):**
> Số dư đầu kỳ phải được xác định trên cơ sở số dư cuối kỳ kế toán trước đó

---

## 5. Target Data Model

### 5.1 Current Schema (exists — on Account)

```sql
-- accounts table (columns relevant to opening balance)
accounts.opening_debit      REAL DEFAULT 0
accounts.opening_credit     REAL DEFAULT 0
accounts.closing_debit      REAL DEFAULT 0
accounts.closing_credit     REAL DEFAULT 0

-- account_balances table
account_balances.opening_debit   REAL NOT NULL DEFAULT 0
account_balances.opening_credit  REAL NOT NULL DEFAULT 0
account_balances.period_debit    REAL NOT NULL DEFAULT 0
account_balances.period_credit   REAL NOT NULL DEFAULT 0
account_balances.closing_debit   REAL NOT NULL DEFAULT 0
account_balances.closing_credit  REAL NOT NULL DEFAULT 0

-- fiscal_periods table
fiscal_periods.is_opening_balance_period INTEGER NOT NULL DEFAULT 0
```

### 5.2 Required New Schema

```sql
-- Opening balance header — tracks each opening balance entry batch
CREATE TABLE IF NOT EXISTS opening_balance_headers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  period_id INTEGER NOT NULL REFERENCES fiscal_periods(id),
  batch_number TEXT NOT NULL,                          -- e.g. "OB-2026-0001"
  entry_date TEXT NOT NULL,                            -- ngày nhập số dư
  description TEXT,                                    -- lý do / diễn giải
  total_debit REAL NOT NULL DEFAULT 0,
  total_credit REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',                -- draft / locked / posted
  import_source TEXT,                                  -- 'manual' / 'excel' / 'carry_forward' / 'tt99_conversion'
  source_db_name TEXT,                                 -- e.g. "MISA SME 2025", "Fast Accounting 12"
  source_db_version TEXT,
  is_locked INTEGER NOT NULL DEFAULT 0,                -- locked after first period transaction
  locked_at TEXT,
  locked_by_user_id INTEGER REFERENCES users(id),
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  approved_by_user_id INTEGER REFERENCES users(id),
  approved_at TEXT
);

-- Opening balance lines — one per account
CREATE TABLE IF NOT EXISTS opening_balance_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  header_id INTEGER NOT NULL REFERENCES opening_balance_headers(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit_amount REAL NOT NULL DEFAULT 0,
  credit_amount REAL NOT NULL DEFAULT 0,
  foreign_currency_code TEXT,                          -- e.g. "USD"
  foreign_debit_amount REAL,                           -- original currency
  foreign_credit_amount REAL,
  exchange_rate REAL DEFAULT 1,
  
  -- Detail dimensions for sub-ledger tracking
  bank_account_id INTEGER REFERENCES bank_accounts(id),
  customer_id INTEGER REFERENCES customers(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  employee_id INTEGER REFERENCES employees(id),
  inventory_item_id INTEGER REFERENCES inventory_items(id),
  fixed_asset_id INTEGER REFERENCES fixed_assets(id),
  tool_id INTEGER REFERENCES tools(id),                -- CCDC
  prepaid_expense_id INTEGER REFERENCES prepaid_expenses(id),
  contract_id INTEGER REFERENCES contracts(id),
  project_id INTEGER REFERENCES projects(id),
  cost_center_id TEXT,
  department_id INTEGER REFERENCES departments(id),
  
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Opening balance conversion mapping (TT200 → TT99)
CREATE TABLE IF NOT EXISTS opening_balance_conversion_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  old_account_number TEXT NOT NULL,                     -- TT200 account
  new_account_number TEXT NOT NULL,                     -- TT99 account
  conversion_type TEXT NOT NULL,                        -- 'direct' / 'split' / 'merge' / 'manual'
  split_ratio REAL,                                     -- for split: % to new account
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Opening balance audit log
CREATE TABLE IF NOT EXISTS opening_balance_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  header_id INTEGER REFERENCES opening_balance_headers(id),
  action TEXT NOT NULL,                                 -- 'created' / 'updated' / 'locked' / 'unlocked' / 'approved' / 'imported'
  old_value TEXT,                                       -- JSON diff
  new_value TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ob_header_company ON opening_balance_headers(company_id, period_id);
CREATE INDEX IF NOT EXISTS idx_ob_header_status ON opening_balance_headers(status);
CREATE INDEX IF NOT EXISTS idx_ob_lines_account ON opening_balance_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_ob_lines_header ON opening_balance_lines(header_id);
CREATE INDEX IF NOT EXISTS idx_ob_audit_header ON opening_balance_audit_log(header_id);
CREATE INDEX IF NOT EXISTS idx_ob_audit_action ON opening_balance_audit_log(company_id, action);
```

---

## 6. Functional Requirements

### 6.1 Core Opening Balance Operations (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-OB01 | System shall allow manual entry of opening balances per account with debit/credit amounts | P0 |
| FR-OB02 | System shall validate Tổng Dư Nợ = Tổng Dư Có before allowing save/post | P0 |
| FR-OB03 | System shall support import of opening balances from Excel template (.xlsx) | P0 |
| FR-OB04 | System shall provide Excel template download with correct column headers per TT99/TT133 | P0 |
| FR-OB05 | System shall support sub-ledger detail entry for: bank, AR, AP, inventory, FA, CCDC, prepaid | P0 |
| FR-OB06 | System shall lock opening balance after first transaction is posted in the period | P0 |
| FR-OB07 | System shall auto-carry-forward closing balances as opening balances for next period | P0 |
| FR-OB08 | System shall show opening balance summary: total debit, total credit, difference | P0 |

### 6.2 TT99 Conversion (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-OB09 | System shall support TT200→TT99 account mapping with conversion types: direct, split, merge, manual | P0 |
| FR-OB10 | System shall provide default conversion mapping per TT99 Appendix 1 | P0 |
| FR-OB11 | System shall auto-convert opening balances using mapping rules | P0 |
| FR-OB12 | System shall generate conversion report: old account → new account → amount → conversion type | P0 |
| FR-OB13 | System shall allow manual override of converted balances | P0 |

### 6.3 Multi-Currency (P1)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-OB14 | System shall support opening balance entry in foreign currency with exchange rate | P1 |
| FR-OB15 | System shall calculate VND equivalent from foreign amount × exchange rate | P1 |
| FR-OB16 | System shall support opening balance for monetary accounts in multiple currencies | P1 |

### 6.4 Audit & Compliance (P0)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-OB17 | System shall audit-log every opening balance action: create, update, lock, unlock, approve, import | P0 |
| FR-OB18 | System shall require approval workflow for opening balance → approval by Chief Accountant | P1 |
| FR-OB19 | System shall prevent deletion of opening balance after period is closed | P0 |
| FR-OB20 | System shall support digital signature on opening balance per NĐ 23/2025/NĐ-CP | P2 |

### 6.5 Reports (P1)

| FR# | Requirement | Priority |
|-----|-------------|----------|
| FR-OB21 | System shall display opening balance by account — sổ chi tiết số dư đầu kỳ | P1 |
| FR-OB22 | System shall compare opening balance with prior period closing balance | P1 |
| FR-OB23 | System shall export opening balance report to Excel/PDF for auditor | P1 |

---

## 7. Opening Balance Categories (Per MISA/Fast/Bravo Standard)

Based on Vietnamese accounting software market research, opening balances must be grouped into 10 categories:

| # | Category | VN Name | Accounts | Detail Level |
|---|----------|---------|----------|--------------|
| 1 | Account Balance | Số dư tài khoản | All non-detailed accounts | Account level |
| 2 | Bank Balance | Số dư ngân hàng | TK 112 | Per bank account |
| 3 | AR (Customer) | Công nợ khách hàng | TK 131 | Per customer |
| 4 | AP (Supplier) | Công nợ nhà cung cấp | TK 331 | Per supplier |
| 5 | Employee Debt | Công nợ nhân viên | TK 334, 338 | Per employee |
| 6 | Inventory | Tồn kho vật tư, hàng hóa | TK 152, 153, 155, 156 | Per item/warehouse |
| 7 | Fixed Assets | Tài sản cố định | TK 211, 213, 214 | Per asset |
| 8 | Tools/CCDC | Công cụ dụng cụ | TK 242 (part) | Per tool |
| 9 | Prepaid Expenses | Chi phí trả trước | TK 242, 2422 | Per prepaid item |
| 10 | Unearned Revenue | Doanh thu nhận trước | TK 3387 | Per contract |

---

## 8. Integration Points

| Module | Integration | Current Status |
|--------|-------------|----------------|
| COA | Account validation, hierarchy, balance roll-up | EXISTS |
| GL (Sổ Cái) | Opening balance → ledger opening balance | PARTIAL |
| Fiscal Period | Opening balance period management | PARTIAL |
| Cash (Quỹ) | Opening cash balance | MISSING |
| Bank | Opening bank balance per account | MISSING |
| AR (Bán hàng) | Opening AR per customer | MISSING |
| AP (Mua hàng) | Opening AP per supplier | MISSING |
| Inventory (Kho) | Opening inventory per item/warehouse | MISSING |
| FA (TSCĐ) | Opening FA cost, depreciation | MISSING |
| Payroll (Lương) | Opening employee debt/payable | MISSING |
| Tax (Thuế) | Opening VAT credit/refund balance | MISSING |
| Audit | Audit trail for all opening balance changes | MISSING |
| Import/Export | Excel/CSV import and export | MISSING |

---

## 9. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Unbalanced opening balances cause incorrect BCTC | Medium | Critical | Enforce Tổng Dư Nợ = Tổng Dư Có validation at save time |
| Data loss during TT200→TT99 conversion | High | Critical | Mandatory backup before conversion. Conversion audit trail |
| Opening balance modified after transactions posted | Medium | High | Lock opening balance after first period transaction |
| Excel import format errors causing wrong balances | High | High | Validate import file before processing. Show preview before commit |
| Multi-currency opening balance errors | Medium | Medium | Require exchange rate for each foreign currency account |
| Performance: 10K+ opening balance lines | Low | Medium | Batch insert with transaction, progress bar for large imports |

---

## 10. Comparison with Market Standards

| Feature | MISA SME 2026 | Fast Online 2026 | Bravo 8 | SmeAccounting |
|---------|--------------|-------------------|---------|--------|
| Manual opening balance entry | ✅ | ✅ | ✅ | ❌ (no UI) |
| Excel/CSV import | ✅ | ✅ | ✅ | ❌ |
| Sub-ledger detail (10 categories) | ✅ | ✅ | ✅ | ❌ |
| TT200→TT99 conversion | ✅ | ✅ | ✅ | ❌ |
| Opening balance validation | ✅ | ✅ | ✅ | ❌ |
| Multi-currency OB | ✅ | ✅ | ✅ | ❌ |
| OB audit trail | ✅ | ✅ | ✅ | ❌ |
| OB lock | ✅ | ✅ | ✅ | ❌ |
| OB report | ✅ | ✅ | ✅ | ❌ |
| OB approval workflow | Partial | Partial | ✅ | ❌ |

---

## 11. References

- TT 99/2025/TT-BTC: thuvienphapluat.vn (Điều 4, 5, 30)
- TT 200/2014/TT-BTC (replaced by TT99 from 01/01/2026)
- TT 133/2016/TT-BTC: Chế độ kế toán SME
- TT 132/2018/TT-BTC: Chế độ kế toán siêu nhỏ
- Luật Kế toán 88/2015/QH13 (Điều 13, 29)
- NĐ 23/2025/NĐ-CP: Chữ ký số
- MISA SME.NET 2026 — Nhập số dư ban đầu: helpsme.misa.vn/2026/kb/html_27000000
- MISA AMIS Kế toán — Khai báo số dư đầu kỳ: helpact.misa.vn/kb/khai-bao-so-du-ban-dau
- Fast Accounting Online — TT99 cập nhật: help.faonline.vn
- Bravo 8 — Quản lý Số dư đầu kỳ: bravo.com.vn
- Kế toán Thiên Ưng — Số dư đầu kỳ: ketoanthienung.net
- Kế toán Lê Ánh — Nhập số dư: ketoanleanh.edu.vn
- Tổng cục Thuế — Chính sách thuế: gdt.gov.vn
- Thư viện Pháp luật — TT 99/2025/TT-BTC: thuvienphapluat.vn
