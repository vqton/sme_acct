# COA Module — Data Flows

**Version:** 1.0
**Date:** 2026-07-23

---

## DF-01: Company Creation → COA Seeding

```
User creates company
       │
       ▼
Company saved (companies table)
       │
       ▼
company_settings created with accounting_regime = selected
       │
       ▼
System loads standard accounts for regime
       │
       ▼
┌─────────────────────────────────────────────┐
│ Seed loop (in transaction):                 │
│                                              │
│ For each account in STANDARD_ACCOUNTS[regime]│
│   ├── Build parent reference (by number)    │
│   ├── Infer nature from category            │
│   ├── Infer type from depth                 │
│   ├── Set allow_transactions (leaf = true)  │
│   └── INSERT into accounts table            │
└─────────────────────────────────────────────┘
       │
       ▼
Audit log: COA_SEEDED, {regime, count}
       │
       ▼
Company ready for journal entry creation
```

### Data Mappings

```
STANDARD_ACCOUNTS[regime] → Account entity:
  number       → account_number
  name         → name
  category     → category (enum)
  parent       → parentId (resolved from generated id)
  is_system    → true (hardcoded for seed)
  is_active    → true (hardcoded for seed)
  nature       → ACCOUNT_CATEGORY_NATURE[category]
  type         → depth-based (1 = me, 2 = con, 3 = chi tiet)
  allow_transactions → leaf? (depth >= max_per_regime - 1)
```

---

## DF-02: Journal Entry Posting → Ledger Update

```
Journal entry created with lines
       │
       ▼
For each line:
  ├── debit_amount > 0 OR credit_amount > 0
  ├── account exists
  ├── account.allow_transactions == true
  ├── account.is_active == true
  └── company_id matches
       │
       ▼
Post to ledger_entries table
       │
       ▼
Update account_balances:
  ├── period_debit  += line.debit_amount
  ├── period_credit += line.credit_amount
  ├── closing_debit  = calculated from opening + period
  └── closing_credit = calculated from opening + period
       │
       ▼
Parent account balances NOT stored (computed on read)
```

---

## DF-03: Trial Balance Generation

```
Request: company_id + period_id
       │
       ▼
Load all accounts for company (active)
       │
       ▼
Load account_balances for period
       │
       ▼
For each account:
  ├── If leaf: use stored balance
  └── If parent: sum children balances recursively
       │
       ▼
Return: account_number, name, category, opening_d/c, period_d/c, closing_d/c
       │
       ▼
Verify: sum(debit) == sum(credit) across all accounts
```

---

## DF-04: Account Search

```
Search query: company_id + (number | name) + filters
       │
       ▼
SQL: SELECT * FROM accounts
     WHERE company_id = ? 
       AND (account_number LIKE ? OR name LIKE ?)
       [AND category = ?]
       [AND nature = ?]
       [AND is_active = ?]
     ORDER BY account_number
       │
       ▼
Map rows to Account entities
       │
       ▼
If tree requested: build parent→children map
Return paginated results
```

---

## DF-05: Regime Migration

```
User initiates regime switch (TT 133 → TT 99)
       │
       ▼
Validate: all fiscal periods closed
       │
       ▼
Load current accounts + balances
       │
       ▼
Apply mapping table:
  ├── 1:1 mapping (same account exists in both regimes)
  ├── Renamed (TK 112 "Tiền gửi NH" → "Tiền gửi không kỳ hạn")
  ├── Merged (TK 641 + TK 642 → TK 642 for TT 133→TT 99 reverse?)
  └── Unmapped (must flag for manual review)
       │
       ▼
Check: unmapped accounts with non-zero balance?
  ├── Yes → halt, require manual mapping
  └── No → proceed
       │
       ▼
Update company_settings.accounting_regime
       │
       ▼
Adjust account names/numbers per new regime
       │
       ▼
Audit log + backup creation
```

---

## DF-06: COA Import (Excel/CSV)

```
Upload file (XLSX or CSV)
       │
       ▼
Parse rows: account_number, name, category, nature, parent_number, description
       │
       ▼
Validate each row:
  ├── Number format per regime
  ├── Name required
  ├── Category valid enum
  ├── Nature valid enum
  ├── Parent_number exists in file or DB
  └── No duplicate number in file
       │
       ▼
Errors found?
  ├── Yes → return row-level error report, abort
  └── No → preview: N rows to create, N to update, N errors
       │
       ▼
User confirms → execute in transaction
       │
       ▼
Audit log: COA_IMPORTED, {row_count, total}
```
