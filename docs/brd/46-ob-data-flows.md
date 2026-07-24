# Data Flows — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## DF-OB-01: Manual Entry Data Flow

```
[Browser UI]                           [API Server]                      [Database]
     │                                      │                                │
     │ POST /api/opening-balance/batch      │                                │
     │ {company_id, period_id, lines[]}     │                                │
     │─────────────────────────────────────▶│                                │
     │                                      │                                │
     │                                      │──▶ Validate OB header          │
     │                                      │──▶ Validate each line:         │
     │                                      │    - Account exists, leaf      │
     │                                      │    - Amount ≥ 0                │
     │                                      │    - Currency match            │
     │                                      │                                │
     │                                      │──▶ Validate sum debit = sum credit
     │                                      │                                │
     │                                      │──▶ BEGIN TRANSACTION           │
     │                                      │                                │
     │                                      │──▶ INSERT opening_balance_headers
     │                                      │      ← batch_id, batch_number │
     │                                      │                                │
     │                                      │──▶ INSERT opening_balance_lines
     │                                      │      (batch of lines)         │
     │                                      │                                │
     │                                      │──▶ UPDATE accounts SET        │
     │                                      │      opening_debit = ?,       │
     │                                      │      opening_credit = ?       │
     │                                      │      WHERE id = ?             │
     │                                      │                                │
     │                                      │──▶ UPDATE account_balances    │
     │                                      │      SET opening_debit = ?,   │
     │                                      │      opening_credit = ?       │
     │                                      │      WHERE account_id = ?     │
     │                                      │      AND period_id = ?        │
     │                                      │                                │
     │                                      │──▶ INSERT audit_log           │
     │                                      │                                │
     │                                      │──▶ COMMIT                     │
     │                                      │                                │
     │ 201 {batch_id, batch_number,         │                                │
     │      total_debit, total_credit}      │                                │
     │◀─────────────────────────────────────│                                │
     │                                      │                                │
```

---

## DF-OB-02: Excel Import Data Flow

```
[Browser]                        [API Server]                     [Database]
    │                                │                                │
    │ GET /api/opening-balance/      │                                │
    │   template                     │                                │
    │───────────────────────────────▶│                                │
    │◀────── .xlsx template file ────│                                │
    │                                │                                │
    │ [User fills Excel]             │                                │
    │                                │                                │
    │ POST /api/opening-balance/     │                                │
    │   import (multipart: file)     │                                │
    │───────────────────────────────▶│                                │
    │                                │                                │
    │                                │──▶ Parse Excel (.xlsx)         │
    │                                │──▶ Validate row by row:        │
    │                                │    - Account lookup            │
    │                                │    - Amount format             │
    │                                │    - Required fields           │
    │                                │                                │
    │◀────── Preview ───────────────│                                │
    │ {valid_rows: 45,              │                                │
    │  error_rows: 3,               │                                │
    │  total_debit: 5.2B,           │                                │
    │  total_credit: 5.2B,          │                                │
    │  errors: [                    │                                │
    │    {row: 12, msg: "TK không tồn tại"},
    │    {row: 23, msg: "Số dư âm"} │
    │  ]}                           │                                │
    │                                │                                │
    │ POST /api/opening-balance/     │                                │
    │   import/confirm               │                                │
    │   {import_id}                  │                                │
    │───────────────────────────────▶│                                │
    │                                │──▶ Same as DF-OB-01           │
    │                                │    (batch insert)              │
    │                                │                                │
    │◀────── Success ───────────────│                                │
    │                                │                                │
```

---

## DF-OB-03: TT99 Conversion Data Flow

```
[Browser]                        [API Server]                     [Database]
    │                                │                                │
    │ POST /api/opening-balance/     │                                │
    │   convert-tt99                 │                                │
    │   {company_id, period_id}      │                                │
    │───────────────────────────────▶│                                │
    │                                │                                │
    │                                │──▶ Backup database             │
    │                                │                                │
    │                                │──▶ Load default mapping        │
    │                                │    opening_balance_conversion  │
    │                                │    _mappings                   │
    │                                │                                │
    │                                │──▶ For each TT200 account      │
    │                                │    with balance > 0:           │
    │                                │    - Find mapping              │
    │                                │    - Apply conversion type     │
    │                                │    - Calculate new balance     │
    │                                │                                │
    │                                │──▶ Validate total balance      │
    │                                │                                │
    │◀────── Simulation ────────────│                                │
    │ {mappings: [                   │                                │
    │   {old: "111", new: "111",    │                                │
    │    old_balance: 500M,         │                                │
    │    new_balance: 500M,         │                                │
    │    type: "direct"},           │                                │
    │   {old: "2281", new: "22811", │                                │
    │    old_balance: 2B,           │                                │
    │    new_balance: 1.2B,         │                                │
    │    type: "split", ratio: 0.6},│
    │   ...],                       │                                │
    │  total_old: 15B,              │                                │
    │  total_new: 15B,              │                                │
    │  unmapped: []}                │                                │
    │                                │                                │
    │ POST /api/opening-balance/     │                                │
    │   convert-tt99/confirm         │                                │
    │───────────────────────────────▶│                                │
    │                                │──▶ Create new OB header        │
    │                                │    source = 'tt99_conversion'  │
    │                                │                                │
    │                                │──▶ Insert converted lines      │
    │                                │                                │
    │                                │──▶ Update accounts + balances  │
    │                                │                                │
    │                                │──▶ Generate PDF audit report   │
    │                                │                                │
    │◀────── Done ──────────────────│                                │
    │                                │                                │
```

---

## DF-OB-04: Carry-Forward Data Flow

```
[Period Close Service]
      │
      │  carryForwardBalances(companyId, fromPeriodId, toPeriodId)
      │
      ▼
[Fetch account_balances for fromPeriod]
      │
      ▼
[Map: closing → opening for each account]
      │
      ▼
[For each account balance:
   openingDebit = closingDebit (from)
   openingCredit = closingCredit (from)
   periodDebit = 0
   periodCredit = 0
   closingDebit = closingDebit (from)
   closingCredit = closingCredit (from)
   period = toPeriodId]
      │
      ▼
[saveBalance(balance) for each account]
      │
      ▼
[Return carried balances array]
```

---

## DF-OB-05: Opening Balance Lock Flow

```
[System Event: Journal Entry Posted]
      │
      ▼
[Check: Does period have opening balance?]
      │
      ├── No → [Do nothing, allow entry]
      │
      └── Yes → [Check: Is OB locked?]
                    │
                    ├── Yes → [Do nothing]
                    │
                    └── No → [Auto-lock opening balance]
                               │
                               ▼
                         UPDATE opening_balance_headers
                         SET is_locked = 1,
                             locked_at = NOW(),
                             locked_by_user_id = system
                         WHERE company_id = ?
                         AND period_id = ?
                         AND is_locked = 0
```

---

## DF-OB-06: Sub-Ledger Detail → GL Aggregation

```
[Opening Balance Detail Entry]           [GL Account Balance]
      │                                         │
      ├── Bank Account A: 500M                  │
      ├── Bank Account B: 300M                  │
      ├── Bank Account C: 200M                  │
      │                                         │
      │  Σ = 1,000M                             │
      │──────────────────────────────────────▶  │  TK 112 = 1,000M
      │                                         │
      ├── Customer X: 200M                      │
      ├── Customer Y: 300M                      │
      ├── Customer Z: 100M                      │
      │                                         │
      │  Σ = 600M                               │
      │──────────────────────────────────────▶  │  TK 131 = 600M
      │                                         │
      ├── Item A (10 × 50,000): 500K            │
      ├── Item B (5 × 100,000): 500K            │
      │                                         │
      │  Σ = 1,000K                             │
      │──────────────────────────────────────▶  │  TK 152 = 1,000K
      │                                         │
```

---

## DF-OB-07: Conversion Mapping Types

```
DIRECT (majority of accounts):
  TT200 Account → TT99 Account (1:1)
  Example: 111 → 111, 112 → 112, 131 → 131

SPLIT (one account → multiple sub-accounts):
  TT200: 2281 (balance: 2,000,000,000)
          ├── 60% → TT99: 22811 (1,200,000,000)
          └── 40% → TT99: 22812 (800,000,000)
  Rule: Σ split amounts = original balance

MERGE (multiple accounts → one account):
  TT200: 441 (balance: 500,000,000)
       + 466 (balance: 300,000,000)
          │
          └── TT99: 4118 (800,000,000)
  Rule: merge sum = sum of all merged accounts

MANUAL (user specifies):
  TT200: Some account → TT99: User picks target
  Rule: user must provide full mapping
```
