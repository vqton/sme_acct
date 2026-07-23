# GL Module — Business Rules

**Version:** 1.0
**Date:** 2026-07-23

---

## GR-01: Double-Entry Integrity
Every journal entry must have total debit = total credit (tolerance 0.001 VND).
**Source:** General accounting principle, Luật Kế toán Điều 7

## GR-02: Posted Entry Immutability
Once a journal entry is posted (is_posted = true), its lines cannot be modified or deleted. Correction requires a reversal entry.
**Source:** TT 99/2025/TT-BTC Điều 4, Luật Kế toán Điều 13

## GR-03: Period Lock
Journal entries can only be posted to an OPEN fiscal period. CLOSED or LOCKED periods reject new entries.
**Source:** TT 99/2025/TT-BTC Điều 12

## GR-04: Account Validation
Every journal entry line must reference an existing, ACTIVE account that allows transactions (allow_transactions = true). Parent/control accounts (is_system = true, allow_transactions = false) cannot be posted to.
**Source:** General accounting principle

## GR-05: Running Balance Calculation
Ledger entries must maintain running debit, running credit, and running balance per account within a period. Running balance follows account nature (DuNo/DuCo).
**Source:** TT 99/2025/TT-BTC Phụ lục III — Sổ kế toán

## GR-06: Entry Numbering
Entry numbers must be unique per company per fiscal year. Format: YYYYMM-XXXXX (e.g., 202607-00001). Sequential within month.
**Source:** TT 99/2025/TT-BTC Điều 10

## GR-07: Reversal Mandate
Only posted entries can be reversed. Reversal creates a new entry with swapped debits/credits. Original entry marked as reversed (is_reversed = true).
**Source:** TT 99/2025/TT-BTC Điều 10, Luật Kế toán Điều 13

## GR-08: Cross-Year Reversal
Reversals cannot cross fiscal years. Prior-year corrections post directly to retained earnings (TK 4211 — Lợi nhuận chưa phân phối năm trước).
**Source:** TT 99/2025/TT-BTC Điều 12, VAS 01

## GR-09: Trial Balance Verification
Before period close, total debit must equal total credit across all accounts. Difference must be zero (tolerance 0.001 VND).
**Source:** TT 99/2025/TT-BTC Phụ lục IV

## GR-10: Period Close Irreversibility
Once a fiscal period is closed (status = Closed/2), it cannot be re-opened. Periods can only be Locked (status = Locked/3) for additional protection.
**Source:** TT 99/2025/TT-BTC Điều 12

## GR-11: Balance Carry-Forward
Opening balances for period N = closing balances from period N-1. For first period, opening balances come from company setup.
**Source:** General accounting principle

## GR-12: Multi-Currency Recording
Foreign currency transactions must record: original currency, original amount, exchange rate, and VND equivalent. Exchange rate must be from a verifiable source (central bank rate, bank transfer rate).
**Source:** TT 99/2025/TT-BTC Điều 6

## GR-13: FX Revaluation
At period end, all foreign currency monetary accounts must be revalued at the period-end exchange rate. Unrealized gain/loss posted to TK 413 (Chênh lệch tỷ giá) for monetary items, TK 515/635 for realized items.
**Source:** TT 99/2025/TT-BTC Điều 6, TT 200/2014 Điều 69

## GR-14: Revenue/Expense Account Closure
At year-end, revenue accounts (TK 511, 515, 711) and expense accounts (TK 632, 635, 641, 642, 811, 821) must be closed to TK 911 (Xác định KQKD). TK 911 balance transfers to TK 421 (LNST chưa phân phối).
**Source:** TT 99/2025/TT-BTC, general year-end procedure

## GR-15: Audit Trail Requirements
Every GL action (create, post, reverse, delete journal entry; create, modify account; open, close period) must be recorded in audit_logs with: user_id, action, timestamp, detail.
**Source:** Luật Kế toán Điều 13, TT 99/2025/TT-BTC Điều 8

## GR-16: Retention Period
Accounting data must be retained for minimum 10 years (general) or permanently (for certain documents).
**Source:** Luật Kế toán Điều 41

## GR-17: Draft Lifetime
Draft (unposted) journal entries should be flagged if older than 30 days. No auto-delete, but highlight for review.
**Source:** Internal control best practice

## GR-18: Approval Threshold
Journal entries above configurable amount threshold require chief accountant approval before posting. Threshold configurable per company.
**Source:** TT 99/2025/TT-BTC Điều 9 — Internal control regulation

## GR-19: Fiscal Period Contiguity
Fiscal periods must be contiguous. No gaps allowed between periods. Closing a period auto-creates next period if not exists.
**Source:** TT 99/2025/TT-BTC Điều 12

## GR-20: Account Deactivation Block
Accounts with ledger transactions cannot be deleted. Set is_active = false instead. Previously posted transactions remain visible with historical account data.
**Source:** Luật Kế toán Điều 13

## GR-21: Budget Control Mode
Budget control can be configured per company: None (no check), Warning (alert on over-budget), Strict (block over-budget posting).
**Source:** Internal control regulation per TT 99 Điều 9

## GR-22: VAT Account Analysis
TK 133 (VAT input) and TK 3331 (VAT output) must be analyzable by tax period for VAT return preparation. Each journal line affecting these accounts must track the corresponding tax invoice reference.
**Source:** Luật Quản lý thuế 2025, TT 99/2025/TT-BTC

## GR-23: Digital Signature Compliance
Journal entries that serve as source for tax declarations must support digital signature per NĐ 23/2025/NĐ-CP. Signed entries are legally equivalent to wet-signed paper vouchers.
**Source:** NĐ 23/2025/NĐ-CP Điều 5
