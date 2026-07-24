# GL Module — Data Flows

**Version:** 2.0
**Date:** 2026-07-24

---

## DF-G01: Journal Entry Creation → Posting Flow ✅

**Implementation Status:** ✅ FULLY BUILT
**Files:** `JournalEntryFormPage.tsx` → `AccountingService.createJournalEntry()` → `SQLiteJournalEntryRepository`

```
User Input                    System Process                    Database
──────────                    ──────────────                    ────────
Journal Entry Form            │                                  │
├── Date ────────────────────→ Validate period open ────────────→ fiscal_periods
├── Entry Type                                                  │
├── Description                                                 │
├── Lines[ ]                                                    │
│   ├── Account ─────────────→ Validate account exists ─────────→ accounts
│   │                      → Validate account active             │
│   │                      → Validate account allows tx          │
│   ├── Debit Amount                                            │
│   ├── Credit Amount                                           │
│   └── Description                                             │
│                                                               │
│ Validate Debit = Credit                                       │
│         ↓                                                     │
│ If valid:                                                     │
│   Generate entry number ───→ Find next sequence ──────────────→ journal_entries
│   Save journal entry ──────→ INSERT                          │
│   Save lines ──────────────→ INSERT ─────────────────────────→ journal_entry_lines
│         ↓                                                     │
│ If "Post":                                                    │
│   Post to ledger ──────────→ Calculate running balances ─────→ ledger_entries
│                              INSERT batch                     │
│   Update balances ─────────→ Compute period totals ──────────→ account_balances
│                              UPSERT                           │
│   Mark posted ─────────────→ UPDATE is_posted                 │
│         ↓                                                     │
│   Log audit ───────────────→ INSERT ─────────────────────────→ audit_logs
│         ↓                                                     │
│ Return journal entry with ID                                  │
```

---

## DF-G02: Trial Balance Generation ✅

**Implementation Status:** ✅ FULLY BUILT
**Files:** `TrialBalancePage.tsx` → `AccountingService.getTrialBalance()` → `SQLiteLedgerRepository.getAccountBalances()`

```
User Request                   System Process                    Database
────────────                   ──────────────                    ────────
Select Period                  │                                  │
         ↓                     Read account_balances ────────────→ account_balances
         │                     WHERE company_id = ?               │
         │                     AND period_id = ?                  │
         │                     ORDER BY account_number            │
         │                           ↓                            │
         │                     For each account:                  │
         │                       opening_debit, opening_credit    │
         │                       period_debit, period_credit      │
         │                       closing_debit, closing_credit    │
         │                           ↓                            │
         │                     Calculate totals:                  │
         │                       Total Debit = Total Credit ?     │
         │                           ↓                            │
         ↓                     Display trial balance table        │
```

---

## DF-G03: Financial Statement Generation (B01-DN, B02-DN) ✅

**Implementation Status:** ✅ B01-DN + B02-DN BUILT. B03-DN + B09-DN MISSING.
**Files:** `FinancialStatementPage.tsx` → `FinancialStatementService` → `FinancialStatement.ts` (TT99 mappings)

```
Account Balances                  Mapping Rules                    B01-DN Line Items
───────────────                   ─────────────                    ─────────────────
period_balances[]                  TT 99 Phụ lục IV (getB01TTSMapping)   B01-DN Report
│                                                                  
├── TK 111, 112 ─────────────────→ 100. Tiền                      
├── TK 121, 128 ─────────────────→ 110. Đầu tư TC ngắn hạn        
├── TK 131 ─────────────────────→ 130. Phải thu KH                 
├── TK 152-158 ─────────────────→ 140. Hàng tồn kho               
├── TK 211 ─────────────────────→ 210. TSCĐ                          
├── TK 214 ─────────────────────→ 220. Hao mòn lũy kế (−)         
├── TK 331 ─────────────────────→ 310. Phải trả người bán         
├── TK 333 ─────────────────────→ 320. Thuế và phải nộp NN        
├── TK 411 ─────────────────────→ 410. Vốn góp CSH                 
├── TK 421 ─────────────────────→ 420. LNST chưa phân phối        

B02-DN mapping (getB02KQHDMapping):
├── TK 511 ─────────────────────→ 01. Doanh thu BH
├── TK 632 ─────────────────────→ 11. Giá vốn hàng bán
├── Formula: 01+11 ─────────────→ 20. Lợi nhuận gộp (computed)
├── TK 641, 642 ────────────────→ 23, 24. CPBH, CPQLDN
├── Formula chain ──────────────→ 60. LNST (computed)
```

---

## DF-G04: Sub-ledger → GL Integration ❌

**Implementation Status:** ❌ NOT BUILT. No sub-ledger modules exist to integrate.

```
Sub-ledger                    GL Integration Service              GL Database
───────────                    ─────────────────────              ───────────
Cash Module                    │                                    │
├── Receipt saved ────────────→ Create journal entry                │
│                               Dr 111 (Cash)                      │
│                               Cr XXX (Revenue/AR)                │
│                               ↓                                  │
│                             Post to GL ─────────────────────────→ journal_entries
│                                                                    ledger_entries
├── Payment saved ────────────→ Create journal entry                │
│                               Dr XXX (Expense/AP)                │
│                               Cr 111 (Cash)                      │
│                               ↓                                  │
│                             Post to GL ─────────────────────────→ ...

Bank, AR, AP, FA, Payroll, Inventory — same pattern
```

---

## DF-G05: Period-End Closing Flow ⚠️

**Implementation Status:** ⚠️ PARTIAL. Backend close + carry-forward exist. No checklist UI.

```
Pre-Close                     Close Execution                   Post-Close
───────────                   ──────────────                    ──────────
│                              │                                  │
Run checklist (❌ no UI):     Validate:                         Lock period:
├── Depreciation  ❌           All entries posted? ✅            status = CLOSED ✅
├── Prepayment    ❌           Trial balance balanced? ✅         │
├── Accruals      ❌           Sub-ledgers reconciled? ❌        Carry forward: ✅
├── FX            ❌                                              │
│                              Execute close:                    Insert next period ✅
│                              ├── UPDATE fiscal_periods        │
│                              │   SET status = 2               Archive: ❌
│                              ├── INSERT period_closing_log    │
│                              └── INSERT audit_log             Compute period stats
│                                                                 │
└── (manual) ──────────────── → (auto) ──────────────────────── → (auto)
```

---

## DF-G06: Multi-Currency Transaction Flow ❌

**Implementation Status:** ❌ NOT BUILT. Schema has `exchange_rate` and `currency_code` columns but they are unused.

```
Transaction                    Posting                           Period-End
────────────                   ───────                            ──────────
Journal entry with FC          │                                  │
├── Currency: USD              │                                  │
├── Rate: 25,500               │                                  │
├── Dr 156 (Inventory)         │                                  │
│   USD 1,000 = VND 25,500,000│                                  │
├── Cr 331 (AP)                │                                  │
│   USD 1,000 = VND 25,500,000│                                  │
         ↓                     │                                  │
Record in DB:                  │                                  │
├── debit_amount = 25,500,000  │                                  │
├── currency_code = 'USD'      │                                  │
├── original_amount = 1000     │                                  │
├── exchange_rate = 25500      │                                  │

Payment (later):               At period end:
├── Dr 331 (AP) USD 1,000     ├── Compute unrealized FX
├── Cr 112 (Bank)              ├── Post to TK 413/635/515
├── Dr/Cr 635 (FX gain/loss)  └── Auto-adjustment entry
```
