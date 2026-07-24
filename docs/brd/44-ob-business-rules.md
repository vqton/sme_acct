# Business Rules — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## BR-OB-001: Balance Equality
**Rule:** Total opening debit MUST equal total opening credit for each batch
**Severity:** ERROR (blocking)
**Enforcement:** At save, import, and conversion
**Message:** "Tổng Dư Nợ {debit} không khớp Tổng Dư Có {credit}. Chênh lệch: {diff}"

## BR-OB-002: Leaf Account Only
**Rule:** Opening balance can ONLY be entered for leaf accounts (allow_transactions = true)
**Severity:** WARNING for parent, ERROR for system
**Enforcement:** At entry time
**Rationale:** Parent accounts are calculated as sum of children per TT99

## BR-OB-003: Non-Negative Amount
**Rule:** Debit and credit amounts MUST be ≥ 0
**Severity:** ERROR
**Enforcement:** At entry
**Message:** "Số dư Nợ/Có không được âm"

## BR-OB-004: Natural Balance Direction
**Rule:** Accounts MUST have balance in their natural direction:
- Dư Nợ (Tài sản, Chi phí): opening_debit ≥ opening_credit
- Dư Có (Nợ phải trả, Vốn CSH, Doanh thu): opening_credit ≥ opening_debit
- Lưỡng tính (Xác định KQ): any direction allowed
**Severity:** WARNING
**Enforcement:** At save time
**Message:** "TK {account} có bản chất Dư {nature} nhưng số dư không đúng hướng"

## BR-OB-005: Single Active Batch
**Rule:** Only ONE active (draft or posted) opening balance batch per period
**Severity:** ERROR
**Enforcement:** At batch creation
**Rationale:** Prevents conflicting opening balance versions

## BR-OB-006: Lock After First Transaction
**Rule:** Opening balance AUTO-LOCKS when first journal entry is posted in the period
**Severity:** ERROR (cannot modify after lock)
**Exception:** Chief Accountant can unlock with written reason

## BR-OB-007: Lock Prevents Modification
**Rule:** Locked opening balance CANNOT be modified or deleted
**Operations blocked:** Edit, delete, import, convert
**Allowed:** View, export, audit log access

## BR-OB-008: Conversion Requires Backup
**Rule:** TT200→TT99 conversion REQUIRES full database backup first
**Severity:** ERROR
**Enforcement:** Before conversion starts
**Message:** "Vui lòng sao lưu dữ liệu trước khi chuyển đổi"

## BR-OB-009: Conversion Audit
**Rule:** Every TT200→TT99 conversion MUST produce audit report:
- Old account → New account mapping
- Old balance → New balance
- Conversion type (direct/split/merge/manual)
- Any unmapped accounts
**Enforcement:** System generates PDF report automatically

## BR-OB-010: Must Match Prior Closing
**Rule:** Opening balance for continuing entity MUST equal prior period closing balance
**Severity:** WARNING (informational)
**Enforcement:** At carry-forward and comparison report
**Message:** "Số dư đầu kỳ TK {account} ({ob_amount}) không khớp số dư cuối kỳ trước ({closing_amount})"
**Exception:** First-time setup, conversion, merger, split, spin-off

## BR-OB-011: Detail Sum Equals Total
**Rule:** Sum of sub-ledger details MUST equal total account opening balance
- Bank: Σ bank details = TK 112 total
- AR: Σ customer details = TK 131 total
- AP: Σ supplier details = TK 331 total
- Inventory: Σ item details = TK 152/156 total
- FA: Σ asset details = TK 211/213 total
**Severity:** ERROR
**Enforcement:** At save time
**Message:** "Tổng chi tiết {sum_detail} không khớp số dư tổng hợp TK {account} ({sum_total})"

## BR-OB-012: Import Template Compliance
**Rule:** Excel import MUST follow system template format
- Column headers are fixed (can't be renamed)
- Required columns marked with (*)
- Max 14 digits for amount fields
- Account number MUST exist in COA
**Enforcement:** At file upload, before preview

## BR-OB-013: Approval Before Lock
**Rule:** If company setting requires approval, opening balance MUST be approved by Chief Accountant BEFORE it can be locked
**Severity:** Blocking if enabled
**Enforcement:** At save/lock time

## BR-OB-014: Multi-Currency Balance Rule
**Rule:** For foreign currency accounts:
- Both original currency amount AND VND equivalent MUST be entered
- Exchange rate is REQUIRED
- VND = Foreign Amount × Exchange Rate
- If exchange rate = 0, VND equivalent = 0 (blocked with error)
**Severity:** ERROR
**Enforcement:** At save

## BR-OB-015: Conversion Completeness
**Rule:** After TT200→TT99 conversion, ALL accounts with non-zero balance in TT200 MUST be mapped
**Severity:** WARNING
**Enforcement:** At conversion validation step
**Message:** "Còn {count} tài khoản TT200 có số dư chưa được mapping"

## BR-OB-016: Off-Balance-Sheet Accounts
**Rule:** Off-balance-sheet accounts (TK 0xxx: 001, 002, 003, 004) CAN have opening balance entry
**Severity:** Allowed
**Note:** These accounts track assets under management, not company assets

## BR-OB-017: Minimum Entry Date
**Rule:** Opening balance entry date MUST be on or after company start date
**Enforcement:** At save
**Message:** "Ngày nhập số dư phải sau ngày bắt đầu dữ liệu ({company_start_date})"

## BR-OB-018: Account Currency Match
**Rule:** Opening balance currency MUST match account currency in COA
- If account.currency = 'USD', only USD entry allowed
- If account.currency = 'VND', only VND entry allowed
**Severity:** ERROR
**Enforcement:** At entry

## BR-OB-019: Zero Balance Excluded
**Rule:** Accounts with zero opening balance (debit=0 AND credit=0) do NOT need to appear in opening balance entry
**Enforcement:** Display filter

## BR-OB-020: Maximum Precision
**Rule:** Opening balance amounts stored with 2 decimal places in VND
- Display: 0-2 decimal places
- Storage: REAL (SQLite, up to 15 decimal precision)
- Rounding: Round half-up at 2 decimal places
**Enforcement:** At entry and display
