# GL Module — Business Rules

**Version:** 2.0
**Date:** 2026-07-24

---

## GR-01: Double-Entry Integrity ✅ Enforced
Every journal entry must have total debit = total credit (tolerance 0.001 VND).
**Source:** General accounting principle, Luật Kế toán Điều 7
**Implementation:** `JournalEntry.ts` — createJournalEntry validates sum(debit) = sum(credit)

## GR-02: Posted Entry Immutability ✅ Enforced
Once a journal entry is posted (is_posted = true), its lines cannot be modified or deleted. Correction requires a reversal entry.
**Source:** TT 99/2025/TT-BTC Điều 4, Luật Kế toán Điều 13
**Implementation:** `AccountingService` — only DRAFT entries can be updated/deleted

## GR-03: Period Lock ✅ Enforced
Journal entries can only be posted to an OPEN fiscal period. CLOSED or LOCKED periods reject new entries.
**Source:** TT 99/2025/TT-BTC Điều 12
**Implementation:** `AccountingService.postToLedger()` — validates period status before posting

## GR-04: Account Validation ✅ Enforced
Every journal entry line must reference an existing, ACTIVE account that allows transactions. Parent/control accounts cannot be posted to.
**Source:** General accounting principle
**Implementation:** `AccountingService.postToLedger()` — validates account exists, active, allows transactions

## GR-05: Running Balance Calculation ✅ Enforced
Ledger entries must maintain running debit, running credit, and running balance per account within a period.
**Source:** TT 99/2025/TT-BTC Phụ lục III — Sổ kế toán
**Implementation:** `LedgerEntry.ts` — calculateBalance(), `LedgerRepository` — saveMany with running balance

## GR-06: Entry Numbering ✅ Enforced
Entry numbers must be unique per company per fiscal year. Format: YYYYMM-XXXXX.
**Source:** TT 99/2025/TT-BTC Điều 10
**Implementation:** `JournalEntryRepository.getNextEntryNumber()`

## GR-07: Reversal Mandate ✅ Enforced
Only posted entries can be reversed. Reversal creates a new entry with swapped debits/credits. Original entry marked as reversed.
**Source:** TT 99/2025/TT-BTC Điều 10, Luật Kế toán Điều 13
**Implementation:** `AccountingService.reverseJournalEntry()`

## GR-08: Cross-Year Reversal ✅ Enforced
Reversals cannot cross fiscal years. Prior-year corrections post directly to retained earnings.
**Source:** TT 99/2025/TT-BTC Điều 12, VAS 01
**Implementation:** `AccountingService.reverseJournalEntry()` — validates same fiscal year

## GR-09: Trial Balance Verification ✅ Enforced
Before period close, total debit must equal total credit across all accounts. Tolerance 0.001 VND.
**Source:** TT 99/2025/TT-BTC Phụ lục IV
**Implementation:** `AccountingService.getTrialBalance()` — totals row with balance check

## GR-10: Period Close Irreversibility ✅ Enforced
Once a fiscal period is closed (status = Closed/2), it cannot be re-opened.
**Source:** TT 99/2025/TT-BTC Điều 12
**Implementation:** `FiscalPeriod.close()` — sets status to Closed

## GR-11: Balance Carry-Forward ✅ Enforced
Opening balances for period N = closing balances from period N-1.
**Source:** General accounting principle
**Implementation:** `PeriodCloseService.carryForwardBalances()`

## GR-12: Multi-Currency Recording 📋 Planned
Foreign currency transactions must record: original currency, original amount, exchange rate, and VND equivalent.
**Source:** TT 99/2025/TT-BTC Điều 6
**Note:** Schema columns exist (exchange_rate, currency_code). Logic not yet implemented.

## GR-13: FX Revaluation 📋 Planned
At period end, all foreign currency monetary accounts must be revalued. Unrealized gain/loss posted to TK 413/515/635.
**Source:** TT 99/2025/TT-BTC Điều 6

## GR-14: Revenue/Expense Account Closure ✅ Enforced
At year-end, revenue/expense accounts must close to TK 911. TK 911 balance transfers to TK 421.
**Source:** TT 99/2025/TT-BTC, year-end procedure
**Implementation:** `PeriodCloseService.closeRevenueExpenseAccounts()`

## GR-15: Audit Trail Requirements ⚠️ Logged, No UI
Every GL action must be recorded in audit_logs: user_id, action, timestamp, detail.
**Source:** Luật Kế toán Điều 13, TT 99/2025/TT-BTC Điều 8
**Note:** Audit logging exists in code. No UI to view/search audit trail.

## GR-16: Retention Period ✅ Schema supports
Accounting data must be retained for minimum 10 years.
**Source:** Luật Kế toán Điều 41
**Note:** SQLite data retention — no explicit archival mechanism implemented.

## GR-17: Draft Lifetime 📋 Planned
Draft journal entries older than 30 days should be flagged for review.
**Source:** Internal control best practice

## GR-18: Approval Threshold 📋 Planned
Journal entries above configurable amount threshold require chief accountant approval before posting.
**Source:** TT 99/2025/TT-BTC Điều 9 — Internal control regulation

## GR-19: Fiscal Period Contiguity ✅ Enforced
Fiscal periods must be contiguous. No gaps allowed. Closing a period auto-creates next period if not exists.
**Source:** TT 99/2025/TT-BTC Điều 12
**Implementation:** `FiscalPeriodService.ensureNextPeriod()`

## GR-20: Account Deactivation Block ✅ Enforced
Accounts with ledger transactions cannot be deleted. Set is_active = false instead.
**Source:** Luật Kế toán Điều 13

## GR-21: Budget Control Mode 📋 Planned
Budget control can be configured per company: None, Warning, Strict.
**Source:** Internal control per TT 99 Điều 9

## GR-22: VAT Account Analysis 📋 Planned
TK 133 and TK 3331 must be analyzable by tax period for VAT return preparation.
**Source:** Luật Quản lý thuế 2025, TT 99/2025/TT-BTC

## GR-23: Digital Signature Compliance 📋 Planned
Journal entries for tax declarations must support digital signature per NĐ 23/2025/NĐ-CP.
**Source:** NĐ 23/2025/NĐ-CP Điều 5
