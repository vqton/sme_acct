# BRD: Dept Module (Cong no - Accounts Payable/Receivable) — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** **GREENFIELD — no code exists (zero implementation)**

---

## 1. Executive Summary

The Dept Module (Phan he Cong no) manages accounts receivable (Cong no phai thu — TK 131) and accounts payable (Cong no phai tra — TK 331). It does NOT exist anywhere in the codebase. Zero entities, zero repositories, zero controllers, zero services.

### Status: NOT IMPLEMENTED (Greenfield)

| Aspect | Detail |
|--------|--------|
| Domain entities | 0 of 6 created |
| Repositories | 0 of 4 created |
| Application services | 0 of 2 created |
| Controller endpoints | 0 implemented |
| Database tables | 0 of 8+ needed |
| Tests | 0 |

### 5 Blocking Gaps (cannot operate without)

| # | Gap | Law Reference | Impact |
|---|-----|---------------|--------|
| BG-01 | No Invoice entity — cannot record sales/purchase invoices | TT 99/2025/TT-BTC dien 15, 16 | Cannot fulfill legal invoice recording obligation |
| BG-02 | No Payment entity — cannot record receipts/disbursements | TT 99/2025/TT-BTC dien 17, 18 | Cash flow tracking impossible; bank reconciliation breaks |
| BG-03 | No customer/supplier master data with tax code tracking | Luat Quan ly thue 38/2019 dien 30 | Cannot issue e-invoices per ND 254/2026/ND-CP |
| BG-04 | No debt aging — cannot calculate bad debt provisions | VAS 18, TT 48/2019/TT-BTC | Financial statements non-compliant; provision omitted |
| BG-05 | No AR/AP offset or reconciliation | VAS 01 matching principle | Inter-company offsets impossible; statements unreliable |

### Effort Estimate

**14–20 weeks** for 1 senior backend + 1 frontend developer to reach PROD readiness:

- **Phase 1** (Weeks 1–5): Core entities (Customer, Vendor, Invoice, Payment) + CRUD endpoints
- **Phase 2** (Weeks 6–10): Aging, provisions, reconciliation, statements
- **Phase 3** (Weeks 11–14): GL integration, e-invoice interface, multi-currency
- **Phase 4** (Weeks 15–20): Reporting, batch operations, month-end close automation

---

## 2. Module Architecture Proposal

### 2.1 Entity Model

```
Customer (Khach hang)                  Vendor (Nha cung cap)
├── Id (string/Guid)                   ├── Id (string/Guid)
├── Code (string, unique)              ├── Code (string, unique)
├── Name (string, 400)                 ├── Name (string, 400)
├── TaxCode (TaxCode value object)     ├── TaxCode (TaxCode value object)
├── Address (string, 500)              ├── Address (string, 500)
├── Phone (string, 20)                 ├── Phone (string, 20)
├── Email (string, 256)                ├── Email (string, 256)
├── ContactPerson (string, 200)        ├── ContactPerson (string, 200)
├── PaymentTerms (enum)                ├── PaymentTerms (enum)
├── CreditLimit (Money)                ├── BankAccount (string, 50)
├── OpeningBalance (Money)             ├── OpeningBalance (Money)
├── IsActive (bool)                    ├── IsActive (bool)
└── CreatedAt/UpdatedAt                └── CreatedAt/UpdatedAt

Invoice (Hoa don)                      InvoiceLine (Chi tiet hoa don)
├── Id (string/Guid)                   ├── Id (string/Guid)
├── InvoiceNumber (string, unique)     ├── InvoiceId (string FK)
├── InvoiceType (Sale | Purchase)      ├── Description (string, 500)
├── ReferenceType                      ├── Quantity (number)
│   (Original | Adjustment | Debit)    ├── UnitPrice (Money)
├── Customer/Vendor Id (string FK)     ├── TaxRate (number, 0-10)
├── InvoiceDate (Date)                 ├── TaxAmount (Money)
├── DueDate (Date)                     ├── LineTotal (Money)
├── CurrencyCode (string, default VND) └── SortOrder (int)
├── ExchangeRate (number?)
├── SubTotal (Money)
├── TaxTotal (Money)
├── TotalAmount (Money)
├── PaidAmount (Money)
├── BalanceDue (Money) -- computed
├── Status (Draft | Posted | Paid | Partial | Cancelled | Reversed)
├── PostedAt (Date?)
├── ApprovedBy (string?)
└── GLEntryId (string FK?) -- link to journal entry

Payment (Phieu thu/chi)
├── Id (string/Guid)
├── VoucherNumber (string, unique)
├── PaymentType (Receipt | Disbursement)
├── Customer/Vendor Id (string FK)
├── PaymentDate (Date)
├── CurrencyCode (string, default VND)
├── ExchangeRate (number?)
├── TotalAmount (Money)
├── PaymentMethod (Cash | BankTransfer | Cheque | CreditCard)
├── BankAccountId (string?)
├── Reference (string?) -- e.g., cheque number
├── Status (Draft | Posted | Cancelled)
├── ApprovedBy (string?)
├── PostedAt (Date?)
└── GLEntryId (string FK?)

InvoicePaymentAllocation (Phan bo thanh toan)
├── Id (string/Guid)
├── PaymentId (string FK)
├── InvoiceId (string FK)
├── AllocatedAmount (Money)
└── AllocatedAt (Date)

DebtAgingSummary (view/query -- not persisted)
├── Customer/Vendor Id
├── Bucket_0_30 (Money)
├── Bucket_31_60 (Money)
├── Bucket_61_90 (Money)
├── Bucket_91_180 (Money)
├── Bucket_Over_180 (Money)
└── TotalDue (Money)

BadDebtProvision (Du phong)
├── Id (string/Guid)
├── CustomerId (string FK)
├── ProvisionDate (Date)
├── AgingBucket (int)
├── OutstandingBalance (Money)
├── ProvisionRate (number %)
├── ProvisionAmount (Money)
├── JournalEntryId (string FK?)
├── Status (Draft | Posted | Reversed)
└── Period (string YYYY-MM)
```

### 2.2 Repository Interfaces

| Repository | Methods |
|------------|---------|
| `ICustomerRepository` | getById, getByTaxCode, getAll, save, update, softDelete |
| `IVendorRepository` | getById, getByTaxCode, getAll, save, update, softDelete |
| `IInvoiceRepository` | getById, getByNumber, getByCustomer/Vendor, getOverdue, getAgingSummary, save, update |
| `IPaymentRepository` | getById, getByVoucherNumber, getByCustomer/Vendor, getAllForPeriod, save, update |
| `IDebtAgingRepository` | getAgingForCustomer, getAgingForVendor, getAgingSummary (read-model) |

### 2.3 Application Services

| Service | Key Operations |
|---------|---------------|
| `ArService` | recordInvoice, recordReceipt, allocatePayment, getCustomerAging, getCustomerStatement, createProvision, writeOffBadDebt |
| `ApService` | recordInvoice, recordPayment, allocatePayment, getVendorAging, getVendorStatement, offsetArAp |

### 2.4 GL Integration Contract

Dept module posts to GL via `JournalEntryService`:

| Transaction | Debit | Credit |
|-------------|-------|--------|
| Sales invoice | TK 131 (Customer) | TK 511 (Revenue), TK 3331 (VAT) |
| Receipt from customer | TK 111/112 (Cash/Bank) | TK 131 (Customer) |
| Purchase invoice | TK 152/156/641/642 (Expense) | TK 331 (Supplier) |
| Payment to supplier | TK 331 (Supplier) | TK 111/112 (Cash/Bank) |
| Bad debt provision | TK 642 (Expense) | TK 2293 (Provision) |
| Bad debt write-off | TK 2293 (Provision) | TK 131 (Customer) |
| AR/AP offset | TK 331 (Supplier) | TK 131 (Customer) |

---

## 3. Regulatory Compliance Index

| Document | Status | Key Dept-Related Requirements | Current Compliance |
|----------|--------|-----------------------------|-------------------|
| TT 99/2025/TT-BTC (Che do ke toan DN) | Active from 01/01/2026 | TK 131, 331 format; mau so chi tiet cong no; bang tong hop cong no; mau phieu thu/chi | **Missing** (no entities) |
| TT 133/2016/TT-BTC (SME accounting) | Active (optional) | Simplified TK 131, 331; reduced report templates for SMEs | **Missing** |
| VAS 01 — Chuan muc chung | Active | Ghi nhan cong no theo nguyen tac co so don vi tien te; consistent | **Missing** |
| VAS 10 — Ty gia hoi doai | Active | AR/AP ngoai te ghi nhan theo ty gia thuc te tai thoi diem phat sinh | **Missing** |
| VAS 18 — Du phong phai thu kho doi | Active | Trich lap du phong theo tuoi no; xu ly no kho doi | **Missing** |
| TT 48/2019/TT-BTC (Trich lap du phong) | Active | Ty le trich lap theo khung tuoi no; dieu kien duoc khau tru thue | **Missing** |
| Luat Ke toan 88/2015/QH13 — Dieu 26 | Active | Chung tu ke toan bat buoc: phieu thu, phieu chi | **Missing** |
| Luat Ke toan 88/2015/QH13 — Dieu 41 | Active | Luu tru chung tu 5 nam toi thieu | **Missing** |
| ND 254/2026/ND-CP (Hoa don dien tu) | Active from 01/07/2026 | Hoa don ban hang phai la hoa don dien tu; co ma cua co quan thue | **Missing** |
| ND 23/2025/ND-CP (Chu ky so) | Active | Chu ky so tren hoa don dien tu; yeu cau ky so tren chung tu thanh toan | **Missing** |
| Luat Quan ly thue 38/2019 | Active | Ma so thue tren hoa don; bao cao thue GTGT dinh ky | **Missing** |

---

## 4. Integration Points

| Module | Integration | Data Flow |
|--------|-------------|-----------|
| GL (General Ledger) | JournalEntryService | Every invoice/payment creates journal entries to TK 131/331 and contra accounts |
| Tax (Thue) | Invoice data for VAT declaration | Sales invoices feed into GTGT output; purchase invoices feed into GTGT input |
| Company (Doanh nghiep) | Company context, settings | AccountingRegime (TT99/TT133) determines chart of accounts used for GL posting |
| Cash/Bank (Tien mat/Tien gui) | Payment settlement | Receipts/disbursements update cash/bank balances |
| Report (Bao cao) | AR aging, AP aging, statements | Reporting module sources debt aging data for financial statements |
| E-Invoice (Hoa don dien tu) | Invoice issuance | Future: hoa don dien tu co ma cua co quan thue (post-MVP) |

---

## 5. Security & Segregation of Duties

### 5.1 Roles with Dept Permissions

| Role ID | Role Name (VN) | Dept Access |
|---------|----------------|-------------|
| `ke-toan-cong-no` | Ke toan cong no | Create/edit invoices and payments (AP + AR) |
| `ke-toan-truong` | Ke toan truong | Approve invoices, approve payments, review aging |
| `ke-toan-tong-hop` | Ke toan tong hop | View all, month-end closing |
| `ke-toan-vien` | Ke toan vien | Data entry only (create draft invoices) |
| `thu-quy` | Thu quy | Record receipts/disbursements (physical custody) |
| `giam-doc` | Giam doc | View reports, approve large payments |
| `kiem-soat` | Kiem soat vien | Read-only review of all dept data |

### 5.2 SoD Rules (via existing SoDConflictMatrix)

| Rule | Constraint | Enforced By |
|------|-----------|-------------|
| Creator != Approver | Invoice creator cannot approve same invoice | SoDConflictMatrix.checkCreatorApprover |
| AR Clerk != Cash Handler | ke-toan-cong-no who records AR cannot also record receipt as thu-quy | SoDConflictMatrix.checkCashierRecords |
| AP Clerk != Approver | ke-toan-cong-no who creates AP invoice cannot approve payment | SoDConflictMatrix.checkCreatorApprover |
| System Admin != Transaction | he-thong cannot create/post invoices or payments | SoDConflictMatrix.checkSystemAdminAccounting |

### 5.3 Permissions to Add

| Permission | Description | Assigned To |
|------------|-------------|-------------|
| `dept:invoice:create` | Create draft invoices | ke-toan-cong-no, ke-toan-vien |
| `dept:invoice:approve` | Approve/post invoices | ke-toan-truong |
| `dept:payment:create` | Create draft payments | ke-toan-cong-no, thu-quy |
| `dept:payment:approve` | Approve payments | ke-toan-truong, giam-doc |
| `dept:aging:view` | View debt aging reports | ke-toan-cong-no, ke-toan-truong, ke-toan-tong-hop, giam-doc |
| `dept:provision:create` | Create bad debt provisions | ke-toan-truong |
| `dept:reconcile` | Perform reconciliation | ke-toan-cong-no, ke-toan-truong |
| `dept:offset` | Perform AR/AP offset | ke-toan-truong |
| `dept:writeoff` | Write off bad debts | ke-toan-truong (with giam-doc approval) |

---

## 6. Regulatory & Vietnamese Context Notes

### 6.1 TK 131 — Phai thu cua khach hang (AR)

Per TT 99/2025/TT-BTC, TK 131 tracks all amounts receivable from customers:
- Chi tiet theo tung khach hang (per-customer detail required)
- Chi tiet theo tung hop dong kinh te (per-contract detail recommended)
- Foreign currency AR tracked separately with exchange rate
- TK 131 duoc phan loai: 131A (trong nuoc), 131B (nuoc ngoai)

### 6.2 TK 331 — Phai tra cho nguoi ban (AP)

Per TT 99/2025/TT-BTC, TK 331 tracks all amounts payable to suppliers:
- Chi tiet theo tung nha cung cap (per-supplier detail required)
- Foreign currency AP tracked with exchange rate
- Doanh nghiep khong duoc bu tru so du TK 131/331 tren bao cao tai chinh (no netting on balance sheet per VAS)

### 6.3 Bad Debt Provision Periods

Per TT 48/2019/TT-BTC, bad debt provision calculation occurs:
- At year-end (cuoi nam tai chinh) — mandatory
- At mid-year (giua nam) — optional, recommended for listed companies
- Additional provision when customer shows signs of insolvency

### 6.4 E-Invoice Mandate (ND 254/2026/ND-CP)

From 01/07/2026, all sales invoices must be electronic invoices with tax authority codes. The Dept module must integrate with the e-invoice system for:
- Invoice issuance (phat hanh hoa don)
- Invoice cancellation (huy hoa don)
- Invoice adjustment (dieu chinh hoa don)

---

## 7. Implementation Phases

### Phase 1: Core Entities & CRUD (Weeks 1–5)

| Week | Deliverable | Dependencies |
|------|-------------|--------------|
| W1 | Customer entity + repository + controller | Money value object (exists) |
| W1 | Vendor entity + repository + controller | W1 Customer pattern |
| W2 | Invoice entity + InvoiceLine entity | W1 Customer, Vendor |
| W2 | Invoice CRUD endpoints (draft, save) | W2 entity |
| W3 | Invoice approval workflow (post to GL) | GL JournalEntryService |
| W3 | Payment entity + repository | W1, W2 |
| W4 | Payment CRUD + approval + GL posting | W3 |
| W4 | InvoicePaymentAllocation logic | W3, W4 |
| W5 | Database migrations + seed data | All above |
| W5 | Integration tests for core flows | All above |

### Phase 2: Aging, Provision, Reconciliation (Weeks 6–10)

| Week | Deliverable | Dependencies |
|------|-------------|--------------|
| W6 | AR aging query + report | Phase 1 |
| W6 | AP aging query + report | Phase 1 |
| W7 | Customer statement generation | W6 |
| W7 | Supplier statement generation | W6 |
| W8 | Bad debt provision calculation engine | W6 aging |
| W8 | Bad debt provision GL posting | W8 |
| W9 | Customer reconciliation | W7, W8 |
| W9 | Supplier reconciliation | W7, W8 |
| W10 | Write-off workflow | W8 |

### Phase 3: GL Integration, Multi-Currency, E-Invoice (Weeks 11–14)

| Week | Deliverable | Dependencies |
|------|-------------|--------------|
| W11 | Full GL auto-posting for all dept transactions | JournalEntry service |
| W11 | Foreign currency AR/AP (VAS 10) | Money value object |
| W12 | Exchange rate difference handling | W11 |
| W12 | AR/AP offset (bu tru cong no) | Phase 2 |
| W13 | E-invoice integration contract (interface) | ND 254/2026 |
| W13 | Invoice XML export for tax authority | W13 |
| W14 | Tax declaration data feed (GTGT) | Phase 1, W13 |

### Phase 4: Reporting, Batch, Month-End (Weeks 15–20)

| Week | Deliverable | Dependencies |
|------|-------------|--------------|
| W15 | So chi tiet cong no phai thu (Mau S03b-DN) | Phase 2 |
| W15 | So chi tiet cong no phai tra (Mau S04-DN) | Phase 2 |
| W16 | Bang tong hop cong no phai thu | W15 |
| W16 | Bang tong hop cong no phai tra | W15 |
| W17 | Batch invoice import/export (CSV, XML) | Phase 1 |
| W17 | Batch payment processing | Phase 1 |
| W18 | Month-end closing automation | All phases |
| W18 | AR/AP dashboard | W15-W17 |
| W19 | Performance optimization, indexes | W18 |
| W19 | Security audit (SoD enforcement) | All |
| W20 | Documentation, training materials | All |

---

## 8. Related Documents

| Doc | Location |
|-----|----------|
| BRD — Dept Use Cases | `docs/brd/18-dept-use-cases.md` |
| BRD — Dept Workflows | `docs/brd/19-dept-workflows.md` |
| BRD — Dept Business Rules | `docs/brd/20-dept-business-rules.md` |
| BRD — Dept Data Flows | `docs/brd/21-dept-data-flows.md` |
| BRD — Dept Templates | `docs/brd/22-dept-templates.md` |
| BRD — Dept User Journeys | `docs/brd/23-dept-user-journeys.md` |
| GL JournalEntry | `server/src/domain/GeneralLedger/JournalEntry.ts` (planned) |
| Money Value Object | `server/src/domain/valueObjects/Money.ts` |
| SoDConflictMatrix | `server/src/domain/services/SoDConflictMatrix.ts` |
| Role Definitions | `server/src/domain/entities/Role.ts` |
| Domain Glossary | `docs/UBIQUITOUS_LANGUAGE.md` |

---

## 9. Appendix A: Vietnamese Accounting Terminology for Dept

| VN Term | EN Translation | Account | Context |
|---------|---------------|---------|---------|
| Cong no phai thu | Accounts Receivable | TK 131 | Amounts owed by customers |
| Cong no phai tra | Accounts Payable | TK 331 | Amounts owed to suppliers |
| Phai thu khach hang | Customer receivables | TK 131 | Detail by customer |
| Phai tra nguoi ban | Supplier payables | TK 331 | Detail by supplier |
| Hoa don ban hang | Sales invoice | — | Invoice issued to customer |
| Hoa don mua hang | Purchase invoice | — | Invoice received from supplier |
| Phieu thu | Receipt voucher | — | Evidence of cash/bank receipt |
| Phieu chi | Payment voucher | — | Evidence of cash/bank disbursement |
| Du phong phai thu kho doi | Bad debt provision | TK 2293 | Estimated uncollectible amount |
| No kho doi | Bad debt | — | Debt deemed uncollectible |
| Bu tru cong no | AR/AP offset | — | Mutual settlement between parties |
| Bang tuoi no | Aging schedule | — | Debt classification by overdue period |
| So chi tiet cong no | Detailed debt ledger | — | Per-customer/supplier statement |
| Chiet khau thanh toan | Payment discount | — | Discount for early payment |
| Lai cham thanh toan | Late payment interest | — | Penalty for overdue payment |
