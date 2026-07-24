# GL Module — Workflows & Processes

**Version:** 2.0
**Date:** 2026-07-24

---

## Workflow W-G01: Monthly GL Close Cycle

**Implementation Status:** ⚠️ PARTIAL. Journal entry → posting → reversal cycle works. Auto-steps (depreciation, prepayment, FX) and close checklist UI missing.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY CLOSE CYCLE                          │
└─────────────────────────────────────────────────────────────────┘

Day 1-5:   Sub-ledger posting         ❌ All manual — no auto-posting
            ├── Cash receipts/payments
            ├── Bank transactions
            ├── AR/AP invoices
            ├── Inventory movements
            └── Payroll

Day 5-10:  Automated entries           ❌ Missing
            ├── Depreciation run
            ├── Prepayment amortization
            ├── Accrued expenses
            └── FX revaluation

Day 10-15: Review & adjustment         ✅ Supported
            ├── Trial balance review     ✅ (TrialBalancePage)
            ├── Adjusting entries        ✅ (JE create/post)
            ├── Review draft entries     ✅ (JournalEntryListPage)
            └── Chief accountant approval ⚠️ (user-manual)

Day 15-20: Close period                ⚠️ Backend exists, no UI
            ├── Verify trial balance     ✅ (enforced in closeFiscalPeriod)
            ├── Close fiscal period      ✅ (backend)
            ├── Carry forward balances   ✅ (carryForwardBalances)
            └── Archive period data      ❌ Missing

Day 20-25: Reporting                   ✅ Partial
            ├── Generate B01-DN/B02-DN   ✅ (FinancialStatementPage)
            ├── B03-DN/B09-DN            ❌ Missing
            ├── Management reports       ❌ Missing
            └── Tax declaration          ❌ Missing
```

---

## Workflow W-G02: Journal Entry Lifecycle ✅

**Implementation Status:** ✅ FULLY BUILT. All states and transitions implemented.

```
                    ┌─────────────┐
                    │   CREATE    │
                    │   (Draft)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   REVIEW    │
                    │ (Auto-valid)│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼───┐   ┌───▼────┐  ┌───▼────┐
         │  SAVE  │   │  POST  │  │DELETE  │
         │(Draft) │   │  to GL │  │(Draft  │
         └────────┘   └───┬────┘  │ only)  │
                          │       └────────┘
                    ┌─────▼─────┐
                    │  POSTED   │
                    │ (Ledger   │
                    │  updated) │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  REVERSE  │
                    │ (if error)│
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ REVERSED  │
                    │ (Original │
                    │  marked)  │
                    └───────────┘

States:
  DRAFT → POSTED → REVERSED
  DRAFT → DELETED

Rules (all enforced):
- Only DRAFT entries can be edited or deleted
- Only POSTED entries can be reversed
- REVERSED entries cannot be modified
- POSTED/REVERSED entries are immutable
```

---

## Workflow W-G03: Year-End Closing Process

**Implementation Status:** ⚠️ PARTIAL. TK 911 close and balance carry-forward exist. Annual BCTC and audit prep missing.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      YEAR-END CLOSING                               │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Verify December period close    ✅ Supported
Step 2: Run year-end adjustments        ❌ Auto-steps missing
Step 3: Calculate annual tax            ❌ Missing
Step 4: Close revenue/expense (TK 911)  ✅ Backend exists
Step 5: Generate annual BCTC            ⚠️ B01/B02 ✅, B03/B09 ❌
Step 6: Audit preparation               ❌ Missing
Step 7: Lock fiscal year                ✅ Backend exists
```

---

## Workflow W-G04: Correction & Adjustment Process

**Implementation Status:** ✅ BUILT for same-period corrections (reversal). Cross-year adjustment (TK 4211) is manual.

```
                    ┌─────────────────────┐
                    │  Error detected in   │
                    │  posted entry        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐     ┌────▼────┐     ┌─────▼─────┐
         │  Same   │     │  Same   │     │  Previous  │
         │  period │     │  period │     │  period   │
         │  (red   │     │(reversal│     │(prior year│
         │  ink)   │     │  + new) │     │adjustment)│
         └────┬────┘     └────┬────┘     └─────┬─────┘
              │               │                │
         ┌────▼────┐     ┌────▼────┐     ┌─────▼─────┐
         │ Reverse │     │ Reverse │     │ Adjust via │
         │  entry  │     │  entry  │     │  TK 4211  │
         │  with   │     │  then   │     │ (retained  │
         │  note   │     │ create  │     │ earnings)  │
         │         │     │ correct │     │            │
         └─────────┘     └─────────┘     └───────────┘

Vietnamese practice:
- Same period, same month: ✅ Reverse + re-post supported
- Same period, different month: ✅ Reverse + new entry supported
- Previous period, same year: ✅ Reverse + new entry supported
- Prior year: ❌ TK 4211 adjustment not automated
```

---

## Process P-G01: Sub-ledger → GL Posting

**Implementation Status:** ❌ NOT BUILT. GL posting API exists but no sub-ledger modules to call it.

```
Each sub-ledger defines "posting rules":
  Cash Receipt:    Dr Bank/Cash     Cr Revenue/AR
  Cash Payment:    Dr Expense/AP     Cr Bank/Cash
  Sales Invoice:   Dr AR             Cr Revenue (+ VAT)
  Purchase:        Dr Expense/Inv     Cr AP (+ VAT)
  Depreciation:    Dr Expense         Cr Accum. Depr
  Payroll:         Dr Expense         Cr Salary Payable

Integration pattern:
  1. Sub-ledger records transaction
  2. System calls GL posting API
  3. GL creates journal entry from sub-ledger template
  4. GL posts entry, updates ledger balances
  5. GL returns journal entry ID to sub-ledger
  6. Sub-ledger stores journal entry reference
```

---

## Process P-G02: Account Balance Calculation ✅

**Implementation Status:** ✅ BUILT in `calculateBalance()` and `postToLedger()`.

```
Balance computation algorithm per account per period:

1. Read closing balance from PREVIOUS period → opening balance for current period
   - If first period: opening balances from company setup

2. Sum all ledger entries for current period:
   period_debit  = SUM(debit_amount)  WHERE period_id = current
   period_credit = SUM(credit_amount) WHERE period_id = current

3. Compute closing:
   If nature = DuNo:  closing = opening_debit - opening_credit + period_debit - period_credit
   If nature = DuCo:  closing = opening_credit - opening_debit + period_credit - period_debit
   If nature = Lưỡng tính: closing_debit or closing_credit per sign

4. Store in account_balances:
   closing_debit  = closing > 0 ? (nature=DuNo ? closing : 0) : 0
   closing_credit = closing > 0 ? (nature=DuCo ? closing : 0) : 0
```
