# GL Module — Data Flows

**Version:** 1.0
**Date:** 2026-07-23

---

## DF-G01: Journal Entry Creation → Posting Flow

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

## DF-G02: Trial Balance Generation

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
         │                     ├── Account # | Name               │
         │                     ├── Opening Debit | Credit         │
         │                     ├── Period Debit | Credit          │
         │                     ├── Closing Debit | Credit         │
         │                     └── Totals row                     │
```

---

## DF-G03: Financial Statement Generation (B01-DN)

```
Account Balances                  Mapping Rules                    B01-DN Line Items
────────────────                  ─────────────                    ─────────────────
period_balances[]                  TT 99 Phụ lục IV                B01-DN Report
│                                                                  
├── TK 111, 112 ─────────────────→ 100. Tiền                      
├── TK 121, 128 ─────────────────→ 110. Đầu tư TC ngắn hạn        
├── TK 131 ─────────────────────→ 130. Phải thu KH                 
├── TK 133 ─────────────────────→ 140. Thuế GTGT được khấu trừ    
├── TK 138 ─────────────────────→ 150. Phải thu khác              
├── TK 141 ─────────────────────→ 151. Tạm ứng                     
├── TK 152-158 ─────────────────→ 160. Hàng tồn kho               
├── TK 211 ─────────────────────→ 220. TSCĐ                          
├── TK 213 ─────────────────────→ 227. TSCĐ vô hình                
├── TK 214 ─────────────────────→ 229. Hao mòn lũy kế (−)         
├── TK 331 ─────────────────────→ 310. Phải trả người bán         
├── TK 333 ─────────────────────→ 320. Thuế và phải nộp NN        
├── TK 334 ─────────────────────→ 330. Phải trả NLĐ                
├── TK 341 ─────────────────────→ 340. Vay và nợ thuê TC          
├── TK 411 ─────────────────────→ 410. Vốn góp CSH                 
├── TK 412 ─────────────────────→ 411. Thặng dư vốn CP            
├── TK 421 ─────────────────────→ 420. LNST chưa phân phối        
└── Others                      
```

---

## DF-G04: Sub-ledger → GL Integration

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

Bank Module                    │                                    │
├── Transfer ─────────────────→ Dr 112 (Bank) / Cr 111 (Cash)     │
├── Interest ─────────────────→ Dr 112 / Cr 515 (Interest income) │

AR Module                      │                                    │
├── Invoice ──────────────────→ Dr 131 / Cr 511 (Revenue) + 3331  │
├── Receipt ──────────────────→ Dr 111/112 / Cr 131                │

AP Module                      │                                    │
├── Purchase ─────────────────→ Dr 152/156/642 / Cr 331            │
├── Payment ──────────────────→ Dr 331 / Cr 111/112                 │

FA Module                      │                                    │
├── Depreciation ─────────────→ Dr 627/641/642 / Cr 214            │

Payroll Module                 │                                    │
├── Salary ───────────────────→ Dr 622/627/641/642 / Cr 334        │
├── Insurance ────────────────→ Dr 334 / Cr 3383 (SI), 3384 (HI)  │

Inventory Module               │                                    │
├── Goods issue ──────────────→ Dr 632 / Cr 152/156                │
├── Goods receipt ────────────→ Dr 152/156 / Cr 331                 │
```

---

## DF-G05: Period-End Closing Flow

```
Pre-Close                     Close Execution                   Post-Close
───────────                   ──────────────                    ──────────
│                              │                                  │
Run checklist:                 Validate:                         Lock period:
├── Depreciation ─────────────→ All entries posted? ────────────→ status = CLOSED
├── Prepayment ───────────────→ Trial balance balanced?           │
├── Accruals ─────────────────→ Sub-ledgers reconciled?           Carry forward:
├── FX revaluation ───────────→                                    │
├── Revenue/Expense close ────→ Execute close:                    Insert next period
│   (year-end only)             │                                  with opening balances
│                               ├── UPDATE fiscal_periods        │
│                               │   SET status = 2               Archive:
│                               ├── INSERT period_closing_log    │
│                               └── INSERT audit_log             Compute period stats
│                                                                 │
└── (manual review) ──────────→ ─── (auto) ────────────────────→ (auto)
```

---

## DF-G06: Multi-Currency Transaction Flow

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
                               │                                  │
                               │                                  │
Payment (later):               At period end:                     │
├── Rate: 25,800               ├── Rate: 25,700                   │
├── Dr 331 (AP) USD 1,000     ├── Outstanding AP USD 0           │
│   = VND 25,800,000           ├── (already paid)                  │
├── Cr 112 (Bank)              ├── No unrealized gain/loss        │
│   = VND 25,800,000           │                                  │
├── Dr 635 (FX loss)          │  But if open:                     │
│   = VND 300,000              │  Unrealized gain =               │
└── (realized FX loss)         │  (25,700 - 25,500) × 1,000       │
                               │  = VND 200,000                   │
                               │  Dr 635 / Cr 413 (or vice versa) │
```
