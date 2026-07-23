# COA Module — Business Rules

**Version:** 1.0
**Date:** 2026-07-23

---

## BR-01: Account Number Uniqueness

**Rule:** Account number must be unique per company.
**Enforcement:** DB UNIQUE(company_id, account_number)
**Severity:** BLOCKER

---

## BR-02: Account Number Format by Regime

**TT 99/2025:**
- Level 1: 1-3 digits (e.g., 1, 11, 112, 133)
- Level 2: append 1-3 digits to parent (e.g., 1121, 1122)
- Level 3: append 1-2 digits (e.g., 11211)
- Level 4: append 1 digit (e.g., 112111)
- Max depth: 4
- Max length: 7 digits

**TT 133/2016:**
- Level 1: 1-2 digits
- Level 2: append 2 digits
- Level 3: append 2 digits
- Max depth: 3
- Max length: 6 digits

**TT 58/2026:**
- Level 1: 1-2 digits
- Level 2: append 2 digits
- Max depth: 2
- Max length: 4 digits

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
**TT 58/2026:** ~20 level-1 accounts required

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
