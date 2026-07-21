# Workflows — Dept Module (Cong no — AP/AR)

**Domain:** Cong no (Accounts Payable/Receivable)
**Module:** Dept Management
**Regulatory basis:** TT 99/2025/TT-BTC, TT 133/2016/TT-BTC, VAS 01, VAS 10, VAS 18, TT 48/2019/TT-BTC, ND 254/2026/ND-CP

---

## W-01: Sales-to-Receipt Cycle (Full AR Lifecycle)

**Actors:** Ke toan cong no (KT), Thu quy (TQ), Ke toan truong (KTruong), Khach hang (KH)

**Trigger:** Customer places order or requests credit sale

**Preconditions:**
1. Customer master record exists
2. Sales invoice is authorized per company policy
3. TK 131 is active in chart of accounts

**Postconditions:**
1. Invoice posted with GL entry (Debit 131, Credit 511, Credit 3331)
2. Receipt recorded with GL entry (Debit 111/112, Credit 131)
3. Invoice fully or partially paid
4. Audit trail complete

### Swimlane Flow

```mermaid
graph TD
    subgraph "Ke toan cong no (AP/AR)"
        A1[Create Sales Invoice] --> A2[Enter Customer<br/>Invoice Details]
        A2 --> A3[Add Line Items<br/>Qtys, Prices, Taxes]
        A3 --> A4{Post or Draft?}
        A4 -->|Draft| A4a[Save as Draft]
        A4 -->|Post| A4b[Submit for Approval]
    end

    subgraph "Ke toan truong"
        B1[Review Invoice] --> B2{Approve?}
        B2 -->|Yes| B3[Approve & Post]
        B2 -->|No| B4[Reject with Reason]
        B3 --> B5[GL Entry Created<br/>Debit 131 / Credit 511,3331]
    end

    subgraph "Thu quy"
        C1[Receive Customer Payment] --> C2[Create Receipt Voucher]
        C2 --> C3[Select Customer]
        C3 --> C4[Select Outstanding Invoices]
        C4 --> C5[Allocate Payment<br/>FIFO by Due Date]
        C5 --> C6[Post Receipt]
        C6 --> C7[GL Entry Created<br/>Debit 111/112 / Credit 131]
    end

    subgraph "Khach hang"
        D1[Receive Invoice] --> D2[Make Payment]
    end

    subgraph "System"
        E1[Check SoD Creator != Approver] --> E2[Validate Credit Limit]
        E2 --> E3[Generate Invoice Number]
        E3 --> E4[Update AR Balance]
        E4 --> E5[Update Invoice Status]
        E5 --> E6[Generate Audit Log]
    end

    A4b --> B1
    B3 --> E1
    E1 --> E2 --> E3 --> E4 --> E5 --> E6
    B4 --> A1
    A4a --> E6
    D1 --> C1
    C6 --> E4
    D2 --> C1
```

### Step Details

| Step | Actor | Action | System Response | Validation |
|------|-------|--------|-----------------|------------|
| 1 | KT | Create sales invoice | Display blank invoice form | Permission `dept:invoice:create` |
| 2 | KT | Select customer, enter date/due date | Look up customer, auto-fill info | Customer exists, active |
| 3 | KT | Add line items | Calculate totals, validate credit limit | LineTotal = Qty x Price; Total <= CreditLimit - Outstanding |
| 4 | KT | Post or save draft | If Post: route to approval. If Draft: save pending | SoD: if same user is approver, require second approval |
| 5 | KTruong | Review and approve | Create GL entry, update invoice status | CreatorId != ApproverId |
| 6 | TQ | Receive payment | Create receipt voucher | Permission `dept:payment:create` |
| 7 | TQ | Select invoices to pay | Show outstanding invoices FIFO | Allocation total <= Payment amount |
| 8 | TQ | Post receipt | Create GL entry, update invoice balances | SoD: TQ != invoice creator |

---

## W-02: Purchase-to-Payment Cycle (Full AP Lifecycle)

**Actors:** Ke toan cong no (KT), Ke toan truong (KTruong), Thu quy (TQ), Nha cung cap (NCC)

**Trigger:** Purchase invoice received from supplier

**Preconditions:**
1. Supplier master record exists
2. Purchase invoice physically or electronically received from supplier

**Postconditions:**
1. Purchase invoice posted with GL entry (Debit expense/asset, Debit 133, Credit 331)
2. Payment recorded with GL entry (Debit 331, Credit 111/112)
3. Invoice fully or partially paid

### Swimlane Flow

```mermaid
graph TD
    subgraph "Nha cung cap (Supplier)"
        S1[Send Invoice to Buyer] --> S2[Send Statement<br/>Monthly]
    end

    subgraph "Ke toan cong no"
        A1[Receive Invoice from Supplier] --> A2[Create Purchase Invoice]
        A2 --> A3[Enter Invoice Number, Date, Amounts]
        A3 --> A4[Select Expense Accounts<br/>TK 152/156/641/642]
        A4 --> A5[Verify TaxCode matches Supplier Master]
        A5 --> A6[Enter Input VAT<br/>TK 133]
        A6 --> A7{Post or Draft?}
        A7 -->|Draft| A7a[Save Draft]
        A7 -->|Post| A7b[Submit for Approval]
    end

    subgraph "Ke toan truong"
        B1[Review Purchase Invoice] --> B2{Approve?}
        B2 -->|Yes| B3[Approve & Post]
        B2 -->|No| B4[Reject]
        B3 --> B5[GL Entry<br/>Debit Exp/Asset, 133 / Credit 331]
    end

    subgraph "Thu quy"
        C1[Payment Due Alert] --> C2[Create Payment Voucher]
        C2 --> C3[Select Supplier]
        C3 --> C4[Select Invoices to Pay]
        C4 --> C5{Amount > Threshold?}
        C5 -->|Yes| C6[Route for Approval]
        C5 -->|No| C7[Post Payment]
        C6 --> B1
        C7 --> C8[GL Entry<br/>Debit 331 / Credit 111/112]
    end

    S1 --> A1
    A7b --> B1
    B5 --> C1
    S2 --> C1
```

### Step Details

| Step | Actor | Action | System Response | Validation |
|------|-------|--------|-----------------|------------|
| 1 | KT | Receive supplier invoice | — | — |
| 2 | KT | Create purchase invoice | Display form | Supplier exists |
| 3 | KT | Enter invoice details | Load supplier info | Invoice number unique per supplier |
| 4 | KT | Select expense accounts | Show COA filtered by expense type | Account type must be expense/asset |
| 5 | KT | Verify tax code | Compare master vs invoice | Warn on mismatch |
| 6 | KT | Enter input VAT | Calculate tax amounts | TaxRate valid per regime |
| 7 | KT | Post or save draft | Route to approval or save | — |
| 8 | KTruong | Approve | Create GL, update status | SoD: Creator != Approver |
| 9 | TQ | Pay supplier | Create disbursement | Approval threshold check |

---

## W-03: Debt Aging Calculation (Phan tich tuoi no)

**Actors:** System (automated), Ke toan truong (review)

**Trigger:** Request for aging report (AR aging, AP aging, or provision calculation)

**Preconditions:**
1. Invoices exist with status Posted and BalanceDue > 0
2. AsOfDate specified

**Postconditions:**
1. Aging data computed per customer/vendor per bucket
2. No database writes (aging is computed query, unless materialized for performance)

### Flow

```mermaid
graph TD
    START[Trigger: Generate Aging] --> A[Set AsOfDate]
    A --> B{AR or AP?}
    B -->|AR| C1[Query Customers with<br/>BalanceDue > 0]
    B -->|AP| C2[Query Vendors with<br/>BalanceDue > 0]
    C1 --> D1[For each Customer:]
    C2 --> D2[For each Vendor:]
    D1 --> E[Per Invoice: calc DaysOverdue]
    D2 --> E
    E --> F{DaysOverdue <= 0?}
    F -->|Yes| G1[Bucket: Not Due]
    F -->|No| G2{DaysOverdue <= 30?}
    G2 -->|Yes| H1[Bucket: 0-30 Days]
    G2 -->|No| G3{DaysOverdue <= 60?}
    G3 -->|Yes| H2[Bucket: 31-60 Days]
    G3 -->|No| G4{DaysOverdue <= 90?}
    G4 -->|Yes| H3[Bucket: 61-90 Days]
    G4 -->|No| G5{DaysOverdue <= 180?}
    G5 -->|Yes| H4[Bucket: 91-180 Days]
    G5 -->|No| H5[Bucket: >180 Days]
    H1 --> I[Aggregate per Customer/Vendor]
    H2 --> I
    H3 --> I
    H4 --> I
    H5 --> I
    I --> J[Calculate % of Total per Bucket]
    J --> K[Return Aging Report]
    K --> L[User Reviews / Exports]

    style START fill:#396,stroke:#333
    style K fill:#369,stroke:#333
```

### Aging Bucket Definitions (Vietnamese Practice)

| Bucket ID | Label | Days Overdue | TT 48/2019 Provision Rate |
|-----------|-------|-------------|--------------------------|
| 0 | Chua den han (Not due) | <= 0 | 0% |
| 1 | Trong han 30 ngay | 1-30 | 0% |
| 2 | Qua han 31-60 ngay | 31-60 | 5% |
| 3 | Qua han 61-90 ngay | 61-90 | 10% |
| 4 | Qua han 91-180 ngay | 91-180 | 20% |
| 5 | Qua han 181-365 ngay | 181-365 | 50% |
| 6 | Qua han tren 365 ngay | >365 | 100% |

Note: The 181-365 and >365 buckets are used for provision calculation per TT 48 but consolidated into >180 for standard aging reports. The software MUST support both the 6-bucket report view and the 7-bucket provision calculation view.

---

## W-04: Bad Debt Provision Calculation (Trich lap du phong)

**Actors:** Ke toan truong (initiate and post)

**Trigger:** Year-end closing or mid-year assessment

**Preconditions:**
1. AR aging computed as of period end date
2. Company settings define provision method (TT 48/2019 only in v1)
3. Existing provision balance (if any) known

**Postconditions:**
1. Provision calculated per TT 48/2019 rates
2. GL entry posted (Debit 6426, Credit 2293)
3. Provision schedule created for audit trail

### Flow

```mermaid
graph TD
    A[Period End Date Set] --> B[Run AR Aging as of Period End]
    B --> C[Filter Out Excluded Items]
    C --> C1[Exclude: credit balance customers]
    C1 --> C2[Exclude: inter-company balances]
    C2 --> C3[Exclude: secured debts]
    C3 --> D[For Each Customer:]

    D --> E[Aggregate Balance per Bucket]
    E --> F[Apply Provision % per Bucket]
    
    F --> G1[Bucket 0-30: 0%]
    F --> G2[Bucket 31-60: 5%]
    F --> G3[Bucket 61-90: 10%]
    F --> G4[Bucket 91-180: 20%]
    F --> G5[Bucket 181-365: 50%]
    F --> G6[Bucket >365: 100%]

    G1 --> H[Customer Provision = Sum per Bucket]
    G2 --> H
    G3 --> H
    G4 --> H
    G5 --> H
    G6 --> H

    H --> I[Total Provision = Sum all Customers]
    I --> J[Compare with Existing<br/>Provision Balance (TK 2293)]
    J --> K{Difference > 0?}
    K -->|Yes - Additional| L1[New Provision: Debit 6426 / Credit 2293]
    K -->|No - Reversal| L2[Reversal: Credit 6426 / Debit 2293]
    K -->|Zero| L3[No Entry Needed]
    L1 --> M[Generate Provision Report]
    L2 --> M
    L3 --> M
    M --> N[User Reviews & Posts]
    N --> O[Audit Trail: ProvisionCreated]

    style A fill:#396,stroke:#333
    style O fill:#369,stroke:#333
```

### Provision Calculation per TT 48/2019/TT-BTC Dien 6

```
Provision_i = Sum_over_buckets( Balance_i_bucket x Rate_bucket )
Total_Provision = Sum_over_customers( Provision_i )
Adjustment = Total_Provision - Existing_Provision_Balance
```

Where:
- Balance_i_bucket = total outstanding for customer i in bucket b
- Rate_bucket = provision rate for bucket b per table above
- Existing_Provision_Balance = current credit balance of TK 2293
- If Adjustment > 0: additional provision (Debit 6426, Credit 2293)
- If Adjustment < 0: reversal (Credit 6426, Debit 2293)

---

## W-05: Customer Account Reconciliation (Doi chieu cong no)

**Actors:** Ke toan cong no (KT), Khach hang (KH)

**Trigger:** Monthly/quarterly customer statement review, or customer disputes balance

**Preconditions:**
1. Customer has at least one transaction in period
2. Customer statement available (from customer or system-generated)

**Postconditions:**
1. Reconciliation record created
2. Discrepancies identified and documented
3. Either confirmed matched or flagged for investigation

### Swimlane Flow

```mermaid
graph TD
    subgraph "Ke toan cong no"
        A1[Select Customer & Period] --> A2[Generate System Statement]
        A2 --> A3[Obtain Customer Statement]
        A3 --> A4[Import or Enter Customer Data]
    end

    subgraph "System"
        B1[Compare Opening Balance] --> B2{Match?}
        B2 -->|No| B3[Flag Opening Diff]
        B2 -->|Yes| B4[Compare Invoice List]
        B4 --> B5[Match by Invoice Number + Amount]
        B5 --> B6[Compare Payment List]
        B6 --> B7[Match by Date + Amount]
        B7 --> B8[Compare Closing Balance]
        B8 --> B9{All Match?}
        B9 -->|Yes| B10[Status: MATCHED]
        B9 -->|No| B11[Status: DISCREPANCY]
    end

    subgraph "Ke toan cong no"
        C1[Review Discrepancies] --> C2{Can Resolve?}
        C2 -->|Yes| C3[Adjust System Record]
        C3 --> C4[Re-run Reconciliation]
        C2 -->|No| C5[Document Difference]
        C5 --> C6[Flag for Next Period]
    end

    A4 --> B1
    B10 --> D[Reconciliation Complete]
    B11 --> C1
    C4 --> B1
    C6 --> D
```

### Reconciliation Categories

| Category | Description | Resolution |
|----------|-------------|------------|
| Opening balance diff | Prior period mismatch | Investigate prior period transactions |
| Invoice in system not in customer | Customer does not acknowledge invoice | Send copy to customer, verify delivery |
| Invoice in customer not in system | Customer claims invoice not recorded | Verify if invoice belongs to company |
| Payment in system not in customer | Customer claims they paid but not recorded | Check bank statement, trace payment |
| Payment in customer not in system | Customer paid but not received | Check bank, record missing receipt |
| Timing difference | Transaction near period boundary | Note for next period reconciliation |
| Amount difference | Quantity or price dispute | Verify contract/purchase order terms |

---

## W-06: AR/AP Offset (Bu tru cong no phai thu / phai tra)

**Actors:** Ke toan truong (KTruong), Giam doc (GD — for large offsets)

**Trigger:** Entity is both customer and supplier, mutual offset agreement exists

**Preconditions:**
1. Same entity (or linked entities) has both AR and AP balances
2. Bilateral offset agreement signed
3. Legal right of offset exists per VAS 01

**Postconditions:**
1. Offset executed: Debit TK 331, Credit TK 131
2. Both balances reduced
3. Offset agreement documented in audit trail

### Flow

```mermaid
graph TD
    A[Identify Dual-Role Entity] --> B[Verify AR Balance > 0]
    B --> C[Verify AP Balance > 0]
    C --> D[Set Offsettable Amount = Min(AR, AP)]
    D --> E[Enter Offset Amount]
    E --> F[Upload Offset Agreement]
    F --> G{Amount > Threshold?}
    G -->|Yes| H[Route to Giam doc Approval]
    G -->|No| I[Ke toan truong Approves]
    H --> J[Post Offset]
    I --> J
    J --> K[GL Entry: Debit 331 / Credit 131]
    K --> L[Update Invoice Allocations]
    L --> M[Update AR/AP Balances]
    M --> N[Audit Log: OffsetCompleted]

    style A fill:#396,stroke:#333
    style N fill:#369,stroke:#333
```

### Allocation Rules for Offset

When multiple invoices exist on both sides:

1. Offsetting party's AP invoices are matched against customer's AR invoices
2. Default: FIFO (oldest invoices first)
3. Manual override: user selects specific invoice pairs
4. Remaining balances persist on both sides after offset

---

## W-07: Debt Collection Process (Quy trinh thu hoi cong no)

**Actors:** Ke toan cong no (KT), Ke toan truong (KTruong), Bo phan phap ly (Legal), Khach hang (KH)

**Trigger:** Invoice reaches overdue status (past due date)

**Preconditions:**
1. Invoice status = Posted and BalanceDue > 0
2. DueDate < current date

**Postconditions:**
1. Collection actions recorded per escalation level
2. Customer contact log updated
3. Escalation triggered if no payment received

### Flow

```mermaid
graph TD
    A[Invoice Becomes Overdue] --> B[Day 1: Send Payment Reminder<br/>Email to Customer]
    B --> C[Day 7: Follow-Up Call<br/>KT contacts AP of Customer]
    C --> D{Payment Received?}
    D -->|Yes| E[Record Payment<br/>Close Collection]
    D -->|No| F[Day 15: Send Formal Demand Letter]
    F --> G{Payment Received?}
    G -->|Yes| E
    G -->|No| H[Day 30: Escalate to KTruong]
    H --> I{Debt Aging > 90 Days?}
    I -->|Yes| J[Day 45: Send Final Demand<br/>via Registered Mail]
    I -->|No| K[Continue Monitoring]
    J --> L{Payment Received?}
    L -->|Yes| E
    L -->|No| M[Day 60: Handover to Legal]
    M --> N[Legal Action]
    N --> O{Collectible?}
    O -->|Yes| E
    O -->|No| P[Recommend Write-Off]
    P --> Q[Begin Write-Off Process<br/>See UC-10]

    style A fill:#963,stroke:#333
    style M fill:#933,stroke:#333
    style Q fill:#F99,stroke:#333
```

### Collection Escalation Matrix

| Level | Timeframe | Action | Responsible |
|-------|-----------|--------|-------------|
| 1 | Day 1 overdue | Email reminder (auto) | System |
| 2 | Day 7 overdue | Phone call | Ke toan cong no |
| 3 | Day 15 overdue | Formal demand letter (van ban) | Ke toan cong no |
| 4 | Day 30 overdue | Notify ke toan truong | Ke toan cong no |
| 5 | Day 45 overdue | Final demand, registered mail | Ke toan truong |
| 6 | Day 60 overdue | Legal team / collection agency | Bo phan phap ly |

---

## W-08: Month-End AR/AP Closing (Khoa so cuoi thang cong no)

**Actors:** Ke toan tong hop (KTH), Ke toan cong no (KT), Ke toan truong (KTruong)

**Trigger:** Last day of accounting period (month/quarter/year)

**Preconditions:**
1. All transactions for period have been entered
2. No pending approvals for period transactions
3. Bank reconciliation up to date (if bank module exists)

**Postconditions:**
1. All AR/AP transactions posted to GL
2. Aging reports generated for period end
3. Provision calculated (if year-end)
4. Period closed for AR/AP transactions

### Flow

```mermaid
graph TD
    A[Start Month-End AR/AP Close] --> B[Step 1: Post All Pending Invoices]
    B --> C[Step 2: Post All Pending Payments]
    C --> D[Step 3: Reconcile All Payments<br/>to Bank Statement]
    D --> E[Step 4: Run AR Aging as of Period End]
    E --> F[Step 5: Run AP Aging as of Period End]
    F --> G{Year-End?}
    G -->|Yes| H[Step 6: Calculate Bad Debt Provision]
    G -->|No| I[Skip Provision]
    H --> J[Step 7: Run Customer Statements]
    I --> J
    J --> K[Step 8: Run Supplier Statements]
    K --> L[Step 9: Generate So chi tiet<br/>cong no phai thu (Mau S03b-DN)]
    L --> M[Step 10: Generate So chi tiet<br/>cong no phai tra (Mau S04-DN)]
    M --> N[Step 11: Print/Export All Reports]
    N --> O[Step 12: Verify AR = Debit balance TK 131<br/>in GL Trial Balance]
    O --> P{Match?}
    P -->|Yes| Q[AR/AP Close Complete]
    P -->|No| R[Investigate Discrepancy]
    R --> O

    style A fill:#693,stroke:#333
    style Q fill:#369,stroke:#333
    style R fill:#933,stroke:#333
```

### Month-End Checklist

| # | Item | Responsible | Verification |
|---|------|-------------|--------------|
| 1 | All invoices posted; no Drafts older than 3 days | Ke toan cong no | Query: Status=Draft AND CreatedDate < PeriodEnd-3 |
| 2 | All payments allocated; no unallocated amounts | Ke toan cong no | Sum of InvoicePaymentAllocation = Payment.TotalAmount |
| 3 | GL posting complete for all dept transactions | Ke toan tong hop | Compare dept transaction count vs GL entry count |
| 4 | AR aging report generated | Ke toan cong no | Report date = PeriodEnd |
| 5 | AP aging report generated | Ke toan cong no | Report date = PeriodEnd |
| 6 | Customer statements generated | Ke toan cong no | All active customers |
| 7 | Supplier statements generated | Ke toan cong no | All active suppliers |
| 8 | Bad debt provision (year-end) | Ke toan truong | Posted to GL |
| 9 | AR balance = TK 131 GL balance | Ke toan tong hop | Sum(AR) = GL trial balance for 131 |
| 10 | AP balance = TK 331 GL balance | Ke toan tong hop | Sum(AP) = GL trial balance for 331 |
| 11 | So chi tiet printed/signed | Ke toan truong | Physical or digital signature |
| 12 | Reports archived for 5-year retention | System | Per Luat Ke toan 2015 Dieu 41 |
