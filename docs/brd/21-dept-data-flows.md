# Data Flows — Dept Module (Cong no — AP/AR)

**Domain:** Cong no (Accounts Payable/Receivable)
**Module:** Dept Management
**Law references:** TT 99/2025/TT-BTC, TT 133/2016/TT-BTC, VAS 01, VAS 10, VAS 18, TT 48/2019/TT-BTC

---

## DF-01: Invoice Recording -> GL Posting (Hach toan vao TK 131/331)

### Context

Every invoice recorded in the Dept module generates a corresponding GL journal entry. This flow ensures the general ledger always matches the dept sub-ledger.

### Data Flow Diagram

```
[User Input]                  [Dept Module]                     [GL Module]
     |                             |                                |
     |-- Invoice Data ------------>|                                |
     |  {type, customer/vendor,    |                                |
     |   lines[], totals, date,    |                                |
     |   dueDate, currency}        |                                |
     |                             |                                |
     |                             |-- Validate SoD --------------->|
     |                             |   {creator != approver}        |
     |                             |                                |
     |                             |-- Build Journal Entry -------->|
     |                             |   {AR/AP side + contra side}   |
     |                             |                                |
     |                             |<-- JournalEntryId --------------|
     |                             |   {assigned entry number}      |
     |                             |                                |
     |                             |-- Save Invoice + GL ref ------>|
     |                             |   Invoice.GLEntryId = id       |
     |                             |                                |
     |<-- Success -----------------|                                |
     |    {InvoiceNumber,          |                                |
     |     GLEntryNumber}          |                                |
```

### GL Mapping Rules

**Sales Invoice (Hoa don ban hang)**

| Line Type | Debit Account | Credit Account | Amount |
|-----------|--------------|----------------|--------|
| AR entry | TK 131 (Customer detail) | — | TotalAmount |
| Revenue | — | TK 511 (Doanh thu) | SubTotal |
| Output VAT | — | TK 3331 (Thue GTGT dau ra) | TaxTotal |

**Purchase Invoice (Hoa don mua hang)**

| Line Type | Debit Account | Credit Account | Amount |
|-----------|--------------|----------------|--------|
| Expense/Asset | TK 152/156/641/642 | — | LineTotal (excl tax) |
| Input VAT | TK 133 (Thue GTGT dau vao) | — | TaxTotal |
| AP entry | — | TK 331 (Supplier) | TotalAmount |

### Data Store Impact

```
Invoice (write)                    JournalEntry (write)
├── Id                             ├── Id
├── InvoiceNumber                  ├── EntryNumber
├── Status -> Posted               ├── EntryType -> "Invoice"
├── GLEntryId -> FK                ├── ReferenceId -> Invoice.Id
├── ...                            ├── ReferenceType -> "SalesInvoice" / "PurchaseInvoice"
                                   ├── PostingDate
                                   ├── Lines[]
                                   │   ├── AccountId (131/511/3331/...)
                                   │   ├── DebitAmount
                                   │   ├── CreditAmount
                                   │   └── Customer/VendorId (for 131/331)
                                   └── Status -> Posted
```

---

## DF-02: Payment Receipt -> AR Reduction -> Bank Reconciliation

### Context

When a customer payment is received, the AR balance reduces (Credit TK 131) and the cash/bank balance increases (Debit TK 111/112). This flow also feeds into bank reconciliation.

### Data Flow Diagram

```
[Ke toan cong no]              [Dept - Payment]              [GL Module]              [Bank Module]
      |                             |                          |                          |
      |-- Create Receipt ---------->|                          |                          |
      |  {customer, amount,         |                          |                          |
      |   paymentMethod,            |                          |                          |
      |   bankAccount, invoices[]}  |                          |                          |
      |                             |                          |                          |
      |                             |-- Allocate to Invoices   |                          |
      |                             |   {FIFO by due date}     |                          |
      |                             |   Update Invoice.        |                          |
      |                             |   BalanceDue -= amount   |                          |
      |                             |                          |                          |
      |                             |-- Create GL Entry ------>|                          |
      |                             |   {Debit 111/112,        |                          |
      |                             |    Credit 131}            |                          |
      |                             |                          |                          |
      |                             |                          |-- Post to GL ----------->|
      |                             |                          |   {update period         |
      |                             |                          |    balances}             |
      |                             |                          |                          |
      |                             |                          |                          |-- Record Bank Transaction
      |                             |                          |                          |   {account, date, amount,
      |                             |                          |                          |    reference, type=Credit}
      |                             |                          |                          |
      |                             |                          |<-- Bank Reconciled -------|
      |                             |                          |   {matched to bank stmt} |
      |                             |                          |                          |
      |<-- Success -----------------|                          |                          |
      |    {VoucherNumber,          |                          |                          |
      |     GL post confirmed}      |                          |                          |
```

### Data Stores Affected

```
Payment (write)                   Invoice (update)               BankTransaction (write)
├── Id                            ├── PaidAmount += allocated   ├── Id
├── VoucherNumber                 ├── BalanceDue = Total - Paid ├── BankAccountId
├── Type = Receipt                ├── IF BalanceDue = 0 THEN    ├── PaymentId (FK)
├── CustomerId                       Status = Paid             ├── TransactionDate
├── TotalAmount                   └── IF BalanceDue > 0 THEN    ├── Amount
├── Allocations[]                     Status = Partial         ├── Type = Credit
│   └── InvoiceId, Amount                                       ├── Reference
├── GLEntryId -> FK                                             └── ReconciledAt?
└── Status = Posted
```

---

## DF-03: Payment Disbursement -> AP Reduction -> Bank Reconciliation

### Context

When payment is made to a supplier, AP reduces (Debit TK 331) and cash/bank decreases (Credit TK 111/112). Same bank reconciliation pipeline as DF-02.

### Data Flow Diagram

```
[Thu quy]                       [Dept - Payment]              [GL Module]              [Bank Module]
    |                               |                          |                          |
    |-- Create Disbursement ------->|                          |                          |
    |  {supplier, amount,           |                          |                          |
    |   bankAccount, invoices[],    |                          |                          |
    |   paymentMethod}              |                          |                          |
    |                               |                          |                          |
    |                               |-- Check Approval ------>|                          |
    |                               |   {threshold check}      |                          |
    |                               |                          |                          |
    |                               |-- Allocate to Invoices   |                          |
    |                               |   {FIFO, pay oldest first}                          |
    |                               |   Update Invoice.        |                          |
    |                               |   BalanceDue -= amount   |                          |
    |                               |                          |                          |
    |                               |-- Create GL Entry ------>|                          |
    |                               |   {Debit 331,            |                          |
    |                               |    Credit 111/112}        |                          |
    |                               |                          |                          |
    |                               |                          |-- Post to GL ----------->|-- Record Bank Transaction
    |                               |                          |                          |   {account, date, amount,
    |                               |                          |                          |    reference, type=Debit}
    |                               |                          |                          |
    |<-- Success -------------------|                          |                          |
    |    {VoucherNumber,            |                          |                          |
    |     GL post,                  |                          |                          |
    |     bank transaction ref}     |                          |                          |
```

---

## DF-04: Debt Aging Calculation Pipeline

### Context

The aging calculation is a read-model pipeline that aggregates invoice balances by overdue period. It does not write data; it computes from the Invoice + Payment tables.

### Data Flow Diagram

```
[Request]                     [Aging Engine]                    [Data Stores]
    |                             |                                  |
    |-- AsOfDate ----------------->|                                  |
    |  {date, type=AR|AP,         |                                  |
    |   customer/vendor filter}    |                                  |
    |                             |                                  |
    |                             |-- Query Invoices --------------->|  Invoice table
    |                             |   WHERE BalanceDue > 0           |  WHERE Status IN
    |                             |   AND Status = Posted            |  (Posted, Partial)
    |                             |   AND Date <= AsOfDate            |  AND companyId = ctx
    |                             |                                  |
    |                             |<-- Invoice rows                   |
    |                             |   [{id, cust/vend, dueDate,      |
    |                             |     balance, currency}]           |
    |                             |                                  |
    |                             |-- Query Payments --------------->|  Payment table
    |                             |   WHERE Date <= AsOfDate          |  + Allocation table
    |                             |   AND Status = Posted             |
    |                             |                                  |
    |                             |<-- Payment rows                   |
    |                             |   [{id, invoiceId, amount}]       |
    |                             |                                  |
    |                             |-- Calculate Aging                 |
    |                             |   For each invoice:               |
    |                             |   DaysOverdue = AsOfDate - DueDate
    |                             |   Bucket = classify(DaysOverdue)  |
    |                             |                                  |
    |                             |-- Group by Customer/Vendor        |
    |                             |   Aggregate balance per bucket    |
    |                             |                                  |
    |<-- Aging Report -------------|                                  |
    |    {header, rows[],          |                                  |
    |     totals per bucket,       |                                  |
    |     grand total}             |                                  |
```

### Per-Invoice Computation

```
For each invoice i:
  daysOverdue = AsOfDate - i.DueDate
  balance = i.TotalAmount - i.PaidAmount

  IF daysOverdue <= 0:
    bucket = "Not Due Yet"
  ELSE IF daysOverdue <= 30:
    bucket = "0-30 days"
  ELSE IF daysOverdue <= 60:
    bucket = "31-60 days"
  ELSE IF daysOverdue <= 90:
    bucket = "61-90 days"
  ELSE IF daysOverdue <= 180:
    bucket = "91-180 days"
  ELSE:
    bucket = "Over 180 days"

  Add balance to bucket total for customer/vendor
```

---

## DF-05: Bad Debt Provision -> GL Posting

### Context

Year-end provision calculation uses aging data to compute the required provision adjustment per TT 48/2019.

### Data Flow Diagram

```
[Ke toan truong]              [Provision Engine]              [GL Module]              [Balance Sheet]
      |                             |                             |                          |
      |-- Run Provision ----------->|                             |                          |
      |   {periodEnd date,          |                             |                          |
      |    companyId}               |                             |                          |
      |                             |                             |                          |
      |                             |-- Get AR Aging --------->|  Aging Engine              |
      |                             |   {as of periodEnd}       |  (see DF-04)              |
      |                             |                             |                          |
      |                             |<-- Aging per bucket -------|                          |
      |                             |   {per customer}           |                          |
      |                             |                             |                          |
      |                             |-- Calculate Provision      |                          |
      |                             |   For each customer:       |                          |
      |                             |   prov_i = sum(bucket_balance * rate)                 |
      |                             |                             |                          |
      |                             |-- Apply Exclusions ------->|                          |
      |                             |   Filter credit balance,   |                          |
      |                             |   intercompany, secured    |                          |
      |                             |                             |                          |
      |                             |-- Sum Total Provision -----|                          |
      |                             |                             |                          |
      |                             |-- Get Existing Balance -->|  TK 2293 account          |
      |                             |   {current provision level}|  from GL trial balance    |
      |                             |                             |                          |
      |<-- Provision Summary -------|                             |                          |
      |    {total, adjustment,      |                             |                          |
      |     per-customer detail,    |                             |                          |
      |     existing balance}       |                             |                          |
      |                             |                             |                          |
      |-- Approve & Post ---------->|                             |                          |
      |                             |                             |                          |
      |                             |-- Create GL Entry -------->|                          |
      |                             |   IF adjustment > 0:       |                          |
      |                             |     Debit 6426, Credit 2293|                          |
      |                             |   IF adjustment < 0:       |                          |
      |                             |     Debit 2293, Credit 6426|                          |
      |                             |                             |                          |
      |                             |                             |-- Update BS ------->|   TK 2293 increases
      |                             |                             |                     |   TK 6426 on P&L
      |<-- Posted ------------------|                             |                          |
```

### Provision Calculation Formula

```
TotalRequiredProvision = 0

For each customer c with positive AR balance:
  customerProvision = 0
  For each aging bucket b:
    balance = customer's outstanding in bucket b
    rate = provision rate for bucket b (per BR-04.3)
    customerProvision += balance * rate / 100
  TotalRequiredProvision += customerProvision

ExistingBalance = GL balance of TK 2293 as of periodEnd
Adjustment = TotalRequiredProvision - ExistingBalance

IF Adjustment > 0: POST Debit 6426, Credit 2293 (amount = Adjustment)
IF Adjustment < 0: POST Debit 2293, Credit 6426 (amount = |Adjustment|)
IF Adjustment = 0: No entry
```

---

## DF-06: AR/AP Offset -> GL Adjustment

### Context

When the same entity is both debtor and creditor, mutual offset reduces both balances without cash movement.

### Data Flow Diagram

```
[Ke toan truong]               [Offset Engine]                 [GL Module]
      |                             |                              |
      |-- Initiate Offset --------->|                              |
      |   {entityId, amount,        |                              |
      |    reference}               |                              |
      |                             |                              |
      |                             |-- Get AR Balance ---------->|  Invoice table
      |                             |   {outstanding invoices     |  WHERE CustomerId = entity
      |                             |    for this customer}        |
      |                             |                              |
      |                             |<-- AR Total: X --------------|
      |                             |                              |
      |                             |-- Get AP Balance ---------->|  Invoice table
      |                             |   {outstanding invoices     |  WHERE VendorId = entity
      |                             |    for this vendor}          |
      |                             |                              |
      |                             |<-- AP Total: Y --------------|
      |                             |                              |
      |                             |-- Validate:                  |
      |                             |   OffsetAmount <= min(X,Y)   |
      |                             |                              |
      |                             |-- Select Invoices to Offset  |
      |                             |   FIFO on both sides         |
      |                             |                              |
      |<-- Preview -----------------|                              |
      |    {AR invoices to reduce,  |                              |
      |     AP invoices to reduce,  |                              |
      |     net effect}             |                              |
      |                             |                              |
      |-- Confirm ----------------->|                              |
      |                             |                              |
      |                             |-- Create GL Entry -------->|  Debit 331 (AP reduction)
      |                             |   {Debit 331,               |  Credit 131 (AR reduction)
      |                             |    Credit 131}               |
      |                             |                              |
      |                             |-- Update Invoices --------->|  Reduce BalanceDue
      |                             |   Mark offset reference      |  on selected invoices
      |                             |                              |
      |<-- Posted ------------------|                              |
      |    {offset completed,       |                              |
      |     remaining AR, AP}       |                              |
```

### GL Entry Detail

```
Journal Entry:
  Reference: "AR/AP Offset - [Entity Name] - [Date]"
  
  Lines:
    Account TK 331 (Supplier Payable)     Debit = OffsetAmount
    Account TK 131 (Customer Receivable)  Credit = OffsetAmount
  
  Customer/Vendor on both lines: same entity
```

---

## DF-07: Month-End Close for AR/AP

### Context

Month-end closing ensures dept sub-ledger balances match GL, all transactions are posted, and reports are generated.

### Data Flow Diagram

```
[KTH - Ke toan tong hop]         [Dept Module]                    [GL Module]

    |-- Start Month-End Close -->|                                  |
    |   {period, companyId}      |                                  |
    |                            |                                  |
    |                            |-- STEP 1: Lock new entries       |
    |                            |   Block new Draft/Pending save   |
    |                            |   for period                     |
    |                            |                                  |
    |                            |-- STEP 2: Check pending drafts   |
    |                            |   Query: Invoices with Status    |
    |                            |   = Draft AND Date in period     |
    |                            |                                  |
    |<-- Pending Items List -----|                                  |
    |    {N invoices, M payments}|                                  |
    |    Notify responsible users|                                  |
    |                            |                                  |
    |-- Confirm post all ------->|                                  |
    |                            |-- Post all Draft -> Posted       |
    |                            |                                  |
    |                            |-- STEP 3: Reconcile AR ----|     |  Invoice table
    |                            |   AR Total = Sum(BalanceDue)|    |  WHERE Status = Posted
    |                            |   where Status = Posted     |    |
    |                            |                                  |
    |                            |-- STEP 4: Get GL 131 bal ------>|  Journal Entry table
    |                            |   {GL trial balance for 131}    |  Sum(Credit) - Sum(Debit)
    |                            |                                  |  for 131 accounts
    |                            |<-- GL 131 Balance ----------------|
    |                            |                                  |
    |                            |-- Compare AR vs 131              |
    |                            |   IF NOT equal: flag error       |
    |                            |                                  |
    |                            |-- STEP 5: Same for AP vs 331     |
    |                            |   {AP total from Invoice table   |
    |                            |    vs GL 331 balance}            |
    |                            |                                  |
    |                            |-- STEP 6: Generate Reports        |
    |                            |   AR aging, AP aging,            |
    |                            |   Customer statements,           |
    |                            |   Supplier statements            |
    |                            |                                  |
    |<-- Close Summary ----------|                                  |
    |    {AR balance, AP balance,|                                  |
    |     reports generated,     |                                  |
    |     discrepancies if any}  |                                  |
```

### Month-End Verification Queries

```
-- AR vs GL 131
SELECT 
  (SELECT COALESCE(SUM(TotalAmount - PaidAmount), 0) FROM invoices 
   WHERE type = 'Sale' AND status = 'Posted' AND company_id = @companyId) AS ar_total,
  (SELECT COALESCE(SUM(debit - credit), 0) FROM journal_entry_lines 
   WHERE account_code LIKE '131%' AND company_id = @companyId 
     AND posting_date <= @periodEnd) AS gl_131_balance

-- AP vs GL 331
SELECT 
  (SELECT COALESCE(SUM(TotalAmount - PaidAmount), 0) FROM invoices 
   WHERE type = 'Purchase' AND status = 'Posted' AND company_id = @companyId) AS ap_total,
  (SELECT COALESCE(SUM(credit - debit), 0) FROM journal_entry_lines 
   WHERE account_code LIKE '331%' AND company_id = @companyId 
     AND posting_date <= @periodEnd) AS gl_331_balance
```

---

## DF-08: Customer/Supplier Statement Generation

### Context

Statement (So chi tiet cong no phai thu / phai tra) provides per-entity transaction history with running balance, typically issued to customers or obtained from suppliers for reconciliation.

### Data Flow

```
[User]                         [Statement Engine]               [Data Stores]
  |                                 |                               |
  |-- Request Statement ----------->|                               |
  |   {entityId, entityType        |                               |
  |    (customer|supplier),        |                               |
  |    periodStart, periodEnd,     |                               |
  |    format (PDF|Excel|CSV)}     |                               |
  |                                 |                               |
  |                                 |-- Validate entity ---------->| Customer/Vendor table
  |                                 |   {exists, active}            |
  |                                 |                               |
  |                                 |-- Get Opening Balance ------>| Invoice + Payment tables
  |                                 |   Sum of BalanceDue as of    | WHERE date < periodStart
  |                                 |   periodStart - 1              |
  |                                 |                               |
  |                                 |<-- OpeningBalance ------------|
  |                                 |                               |
  |                                 |-- Get Period Transactions -->| Invoice table
  |                                 |   WHERE date BETWEEN          | WHERE entityId = param
  |                                 |   periodStart AND periodEnd   | AND status IN (Posted, Paid, Partial)
  |                                 |   ORDER BY date ASC           |
  |                                 |                               |
  |                                 |<-- Invoice rows               |
  |                                 |   [{date, number, type,       |
  |                                 |     amount, balance}]         |
  |                                 |                               |
  |                                 |-- Get Period Payments ------>| Payment table
  |                                 |   WHERE date BETWEEN          | WHERE entityId = param
  |                                 |   periodStart AND periodEnd   | AND status = Posted
  |                                 |   ORDER BY date ASC           |
  |                                 |                               |
  |                                 |<-- Payment rows                |
  |                                 |   [{date, voucher, amount}]    |
  |                                 |                               |
  |                                 |-- Build Statement              |
  |                                 |   Line 1: Opening Balance     |
  |                                 |   For each transaction:       |
  |                                 |     RunningBalance += amount  |
  |                                 |     (positive for invoices,   |
  |                                 |      negative for payments)   |
  |                                 |   Last: Closing Balance       |
  |                                 |                               |
  |<-- Statement -------------------|                               |
  |    {header with entity info,   |                               |
  |     period, opening bal,       |                               |
  |     transaction lines[],       |                               |
  |     running bal, closing bal,  |                               |
  |     aging summary}             |                               |
```

### Statement Format Per Mau S03b-DN (TT 99/2025/TT-BTC)

```
SO CHI TIET CONG NO PHAI THU
(Customer Statement — Accounts Receivable Detail)
 
Customer: [Name]                          Tax Code: [MST]
Address: [Address]
Period: [MM/YYYY]

Date        Ref#        Description                  Amount         Balance
──────────  ──────────  ───────────────────────────  ─────────────  ─────────────
01/01/2026              Opening Balance                            100,000,000
15/01/2026  INV-001     Sales Invoice #001            50,000,000   150,000,000
20/01/2026  REC-001     Payment Received             -30,000,000   120,000,000
31/01/2026              Closing Balance                            120,000,000

Aging Summary as of 31/01/2026:
  Not Due:       20,000,000
  0-30 days:    100,000,000
  31-60 days:           0
  61-90 days:           0
  91-180 days:          0
  Over 180 days:        0
  ─────────────────────
  Total:        120,000,000
```
