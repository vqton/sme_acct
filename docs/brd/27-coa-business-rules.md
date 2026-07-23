# COA Module — Business Rules

**Version:** 1.1
**Date:** 2026-07-23

---

## BR-01: Account Number Uniqueness

**Rule:** Account number must be unique per company.
**Enforcement:** DB UNIQUE(company_id, account_number)
**Severity:** BLOCKER

---

## BR-02: Account Number Format by Regime

**TT 99/2025 (verified from official Phụ lục II):**
- Level 1: exactly 3 digits (111, 112, 113, 121, 128... all 71 level-1 accounts are 3-digit)
- Level 2: exactly 4 digits (parent 3-digit + 1 digit: 1281, 1282, 1331, 1332... 101 level-2 accounts)
- Level 3: exactly 5 digits (parent 4-digit + 1 digit: 21511, 21512, 33311... 10 level-3 accounts)
- Level 4: exactly 6 digits (parent 5-digit + 1 digit: 215121, 215122... 2 level-4 accounts)
- Max depth: 4
- Max length: 6 digits
- Format: `XXX` → `XXXX` → `XXXXX` → `XXXXXX`  (append 1 digit per level)

**TT 133/2016:**
- Level 1: 1-2 digits
- Level 2: append 2 digits
- Level 3: append 2 digits
- Max depth: 3
- Max length: 6 digits
- ⚠️ **Verification note:** This format is inferred from the TT 133 standard accounts list structure and common practice, but was not explicitly confirmed in official text from web search. Verify against actual Phụ lục TT 133 during implementation.

**TT 58/2026:**
- No traditional numbered COA — uses simplified tax-based book system (S1-DNSN through S4d-DNSN per Điều 5-8)
- Account number validation not applicable; validation based on tax payment method instead
- The system may still need to create accounts for internal tracking, but no regulatory format constraint
- Note: TT 58 replaced TT 132/2018 and uses a fundamentally different approach (book-based, not account-number-based)

**Enforcement:** Regex validation on create/update
**Severity:** HIGH

---

## BR-03: Hierarchy Integrity

**Rules:**
- Parent account must exist before child can be created
- Parent account must be in same category as child (exception: TK 214 is contra-asset under category Tài sản)
- Account cannot be its own parent (no self-reference)
- Account cannot be parent of its ancestor (no circular reference)

**Enforcement:** Application-level validation + DB foreign key
**Severity:** BLOCKER

---

## BR-04: Transaction Posting Restriction

**Rules:**
- Only `allow_transactions = true` (leaf) accounts accept debit/credit postings
- Parent/control accounts (`allow_transactions = false`) must have zero direct postings
- Exception: opening balance entries may post to any account level

**Enforcement:** Journal entry creation validates `account.allow_transactions`
**Severity:** BLOCKER

---

## BR-05: System Account Protection

**Rules:**
- `is_system = true` accounts cannot be deleted
- `is_system = true` accounts cannot be deactivated
- `is_system = true` accounts cannot be renamed
- System accounts are seeded by the system per regime

**Severity:** BLOCKER

---

## BR-06: Account Deletion Guard

**Rules:**
- Account with children cannot be deleted
- Account with journal entry lines cannot be deleted
- System accounts cannot be deleted
- Solution: deactivate instead of delete

**Severity:** BLOCKER

---

## BR-07: Balance Integrity

**Rules:**
- Parent account balance = sum of all children balances
- This is a reporting/display rule, not a storage rule (balances stored only at leaf level)
- On demand, system calculates parent balance by aggregating children

**Severity:** HIGH

---

## BR-08: Account Category to Nature Mapping

| Category | Default Nature |
|---|---|
| Tài sản (Asset) | Dư Nợ |
| Nợ phải trả (Liability) | Dư Có |
| Vốn chủ sở hữu (Equity) | Dư Có |
| Doanh thu (Revenue) | Dư Có |
| Chi phí (Expense) | Dư Nợ |
| Xác định KQKD (P&L) | Lưỡng tính |

**Severity:** HIGH

---

## BR-09: Regime-Specific Required Accounts

**TT 99/2025:** 71 level-1 accounts required (Phụ lục II)
**TT 133/2016:** ~50 level-1 accounts required (Phụ lục)
**TT 58/2026:** No traditional numbered COA — uses simplified tax-based book system (S1-DNSN through S4d-DNSN). System must validate accounts created match tax method, not account number format.

System must validate all required accounts exist for selected regime.

**Severity:** HIGH

---

## BR-10: Account Type Rules

| AccountType | Conditions |
|---|---|
| Tài khoản mẹ (Level-1) | No parent, `allow_transactions = false` |
| Tài khoản con (Child) | Has parent, `allow_transactions = false` |
| Tài khoản chi tiết (Detail) | Has parent, `allow_transactions = true`, no children |

**Severity:** MEDIUM

---

## BR-11: Audit Trail Immutability

**Rules:**
- All COA mutations (create, update, deactivate, delete) must create audit log entry
- Audit log: user_id, action, resource_type='account', resource_id, before_state, after_state, timestamp
- Audit log is append-only, cannot be modified or deleted
- Required per TT 99 Điều 28 (chống sửa chữa không để lại dấu vết)

**Severity:** BLOCKER

---

## BR-12: Regime Migration Constraints

**Rules:**
- Migration allowed only at fiscal period boundary (year-end)
- All periods must be closed before migration
- Unmapped accounts with balances must be manually mapped
- Migration is one-way: must create DB backup before proceeding
- Notification to tax authority required if changing regime (TT 99 Điều 31)

**Severity:** HIGH
