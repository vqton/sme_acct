# GL Module — Workflows & Processes

**Version:** 1.0
**Date:** 2026-07-23

---

## Workflow W-G01: Monthly GL Close Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY CLOSE CYCLE                          │
└─────────────────────────────────────────────────────────────────┘

Day 1-5:   Sub-ledger posting
           ├── Cash receipts/payments posted to GL
           ├── Bank transactions posted to GL
           ├── AR/AP invoices posted to GL
           ├── Inventory movements posted to GL
           └── Payroll posted to GL

Day 5-10:  Automated entries
           ├── Depreciation run
           ├── Prepayment amortization
           ├── Accrued expenses
           └── FX revaluation (if multi-currency)

Day 10-15: Review & adjustment
           ├── Trial balance review
           ├── Adjusting entries (if needed)
           ├── Review draft entries
           └── Chief accountant approval

Day 15-20: Close period
           ├── Verify trial balance (debit = credit)
           ├── Verify BCTC (if month-end is quarter)
           ├── Close fiscal period
           ├── Carry forward balances
           └── Archive period data

Day 20-25: Reporting
           ├── Generate BCTC (quarterly/yearly)
           ├── Generate management reports
           ├── Tax declaration preparation
           └── Submit tax returns (if applicable)
```

---

## Workflow W-G02: Journal Entry Lifecycle

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

Rules:
- Only DRAFT entries can be edited or deleted
- Only POSTED entries can be reversed
- REVERSED entries cannot be modified
- POSTED/REVERSED entries are immutable
```

---

## Workflow W-G03: Year-End Closing Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                      YEAR-END CLOSING                               │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Verify December period close
        ├── All monthly periods Jan-Nov must be closed
        └── December must have all entries posted

Step 2: Run year-end adjustments
        ├── Full year depreciation
        ├── Full year prepayment amortization
        ├── Inventory count adjustments
        ├── Bad debt provision
        └── FX revaluation (full year)

Step 3: Calculate annual tax
        ├── CIT provisional vs actual
        ├── VAT reconciliation
        └── PIT annual settlement

Step 4: Close revenue/expense accounts (TK 911)
        ├── Close revenue accounts → TK 911
        ├── Close expense accounts → TK 911
        └── Transfer TK 911 balance → TK 421 (retained earnings)

Step 5: Generate annual BCTC
        ├── B01-DN: Báo cáo tình hình tài chính
        ├── B02-DN: Báo cáo KQHĐKD
        ├── B03-DN: Báo cáo lưu chuyển tiền tệ
        └── B09-DN: Thuyết minh BCTC

Step 6: Audit preparation
        ├── Export GL for auditor
        ├── Export account balance confirmations
        └── Generate supporting schedules

Step 7: Lock fiscal year
        ├── Close December period
        ├── Lock all periods
        ├── Open new fiscal year periods
        └── Set opening balances for new year
```

---

## Workflow W-G04: Correction & Adjustment Process

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
- Same period, same month: Red ink reversal (bút toán đảo đỏ) 
  → negative amounts in original entry to net to zero, then create correct entry
- Same period, different month: Create reversal entry + new correct entry
- Previous period, same year: Adjusting entry in current period
- Prior year: Adjustment to retained earnings (TK 4211)
```

---

## Process P-G01: Sub-ledger to GL Posting

```
Sub-ledger modules produce transactions → GL integration service:

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

For PROD: at minimum, a GL posting API must exist that:
  - Accepts: companyId, entryDate, entryType, description, lines[]
  - Validates: period open, accounts valid, balanced
  - Returns: journal entry with ID
```

---

## Process P-G02: Account Balance Calculation

```
Balance computation algorithm per account per period:

1. Read closing balance from PREVIOUS period → opening balance for current period
   - If first period: opening balances from company setup (opening_debit, opening_credit)

2. Sum all ledger entries for current period:
   period_debit  = SUM(debit_amount)  WHERE period_id = current
   period_credit = SUM(credit_amount) WHERE period_id = current

3. Compute closing:
   If nature = DuNo:  closing = opening_debit - opening_credit + period_debit - period_credit
   If nature = DuCo:  closing = opening_credit - opening_debit + period_credit - period_debit
   If nature = Lưỡng tính: closing_debit or closing_credit whichever applies per account balance sign

4. Store in account_balances:
   closing_debit  = closing > 0 ? (nature=DuNo ? closing : 0) : 0
   closing_credit = closing > 0 ? (nature=DuCo ? closing : 0) : 0
```
