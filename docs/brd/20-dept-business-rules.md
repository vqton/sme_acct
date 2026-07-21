# Business Rules — Dept Module (Cong no — AP/AR)

**Domain:** Cong no (Accounts Payable/Receivable)
**Module:** Dept Management
**Law references:** TT 99/2025/TT-BTC, TT 133/2016/TT-BTC, VAS 01, VAS 10, VAS 18, TT 48/2019/TT-BTC, Luat Ke toan 88/2015, ND 254/2026/ND-CP, ND 23/2025/ND-CP, Luat Quan ly thue 38/2019, Luat Doanh nghiep 2020

---

## BR-01: Customer/Vendor Master Data Rules (Du lieu chu)

### BR-01.1: Tax Code Uniqueness

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Customer and Vendor tax codes must be unique within each type. No two customers may share the same tax code. No two vendors may share the same tax code. A customer and a vendor MAY share the same tax code (same entity in dual role). |
| Expression | IF Customer.TaxCode is set THEN no other Customer record has the same TaxCode. Similar rule for Vendor. |
| Source | Luat Quan ly thue 38/2019, Dien 30 |
| Severity | Critical |
| Validation Point | UI, API, DB |

### BR-01.2: Required Fields for Customer/Vendor

| Field | Customer | Vendor | Notes |
|-------|----------|--------|-------|
| Code (Ma) | Required, unique | Required, unique | Auto-generated if not provided |
| Name (Ten) | Required, max 400 | Required, max 400 | Vietnamese alphabet |
| TaxCode (MST) | Optional for individuals | Optional for individuals | Required if doing e-invoice |
| Address | Required | Required | Per TT 99/2025, invoice header |
| Phone | Required | Required | Contact purposes |
| ContactPerson | Recommended | Recommended | Nguoi lien he |
| PaymentTerms | Required, default Net30 | Required, default Net30 | Dieu khoan thanh toan |
| IsActive | Required, default true | Required, default true | Soft-delete flag |

Source: Luat Ke toan 88/2015, Dien 26 (chung tu ke toan bat buoc)

### BR-01.3: Code Auto-Generation

| Rule | Value |
|------|-------|
| Category | Generation |
| Description | Customer code and vendor code auto-generated with prefix: KH-YYYYMM-NNNNN for Customer, NCC-YYYYMM-NNNNN for Vendor. |
| Expression | IF Code is empty THEN Code = prefix + next sequence number in current month |
| Source | Convention (Vietnamese accounting software practice) |
| Severity | Medium |

### BR-01.4: Soft Delete Constraint

| Rule | Value |
|------|-------|
| Category | Lifecycle |
| Description | A customer/vendor with posted invoices or payments cannot be hard-deleted. Must set IsActive=false (soft delete). |
| Expression | IF Customer/Vendor has Invoice with Status != Draft THEN DELETE blocked, soft-delete only |
| Source | Good practice, audit requirement |
| Severity | Critical |

---

## BR-02: Invoice Recording Rules (Ghi nhan hoa don)

### BR-02.1: Invoice Number Uniqueness

| Field | Value |
|-------|-------|
| Category | Validation |
| Description | Invoice numbers must be unique within the company, across both sales and purchase invoices. Auto-generated with prefix: INV-YYYYMM-NNNNN. |
| Expression | IF invoice is created THEN InvoiceNumber must not already exist in Invoice table for the same company |
| Source | TT 99/2025/TT-BTC Dien 15, 16 |
| Severity | Critical |

### BR-02.2: Mandatory Invoice Fields

| Field | Required | Notes |
|-------|----------|-------|
| InvoiceNumber | Yes | Unique per company |
| InvoiceDate | Yes | Must be within open accounting period |
| Customer/Vendor | Yes | Must exist and be active |
| Line items (>=1) | Yes | At least one line required |
| SubTotal | Yes | Sum of line totals before tax |
| TaxTotal | Yes | Sum of tax on taxable lines |
| TotalAmount | Yes | SubTotal + TaxTotal |
| DueDate | Yes | Calculated from InvoiceDate + PaymentTerms |

### BR-02.3: Invoice Approval Workflow

| Rule | Value |
|------|-------|
| Category | Workflow |
| Description | Invoice must be approved before posting. Creator cannot approve own invoice (SoD). |
| Expression | IF Invoice.Status transitions from Draft to Posted THEN ApprovedByUserId != CreatedByUserId |
| Source | SoDConflictMatrix (see `docs/brd/17-dept-module-brd.md` Sec 5.2) |
| Severity | Critical |

### BR-02.4: Invoice Cancellation / Reversal

| Rule | Value |
|------|-------|
| Category | Lifecycle |
| Description | A posted invoice can be Cancelled only if no payment has been allocated. If partially paid, must reverse payment first. If fully paid, cannot be cancelled (must use credit note). |
| Expressions | IF Invoice.BalanceDue = Invoice.TotalAmount THEN can cancel (full reversal). IF Invoice.BalanceDue < Invoice.TotalAmount AND Invoice.PaidAmount > 0 THEN must create credit note (adjustment). |
| Source | TT 99/2025/TT-BTC Dien 15 |
| Severity | Critical |

### BR-02.5: Foreign Currency Invoice (VAS 10)

| Rule | Value |
|------|-------|
| Category | Multi-currency |
| Description | For invoices in foreign currency: record both foreign amount and VND equivalent at transaction date exchange rate. Exchange rate source per CompanySettings (NHNN state bank rate or commercial bank rate). |
| Expression | Invoice.TotalVND = Invoice.TotalForeign * ExchangeRate; ExchangeRate is recorded per invoice header |
| Source | VAS 10 — Anh huong cua viec thay doi ty gia hoi doai |
| Severity | High |

### BR-02.6: Tax Rate Validation

| Rule | Value |
|------|-------|
| Category | Validation |
| Description | Tax rates on invoice lines must match the company's registered tax calculation method. For Khau tru method: 0%, 5%, 10% are valid. For Truc tiep method: 0% or percentage of revenue. |
| Expression | IF CompanySettings.TaxCalculationMethod = KhauTru THEN line.TaxRate IN (0, 5, 10). IF TrucTiep THEN line.TaxRate IN (0, 1, 2, 3, 5). |
| Source | Luat Thue GTGT 2008 (amended), TT 219/2013/TT-BTC |
| Severity | High |

### BR-02.7: E-Invoice Reference (ND 254/2026/ND-CP)

| Rule | Value |
|------|-------|
| Category | Integration |
| Description | From 01/07/2026, all sales invoices must reference an e-invoice record from the tax authority system. Invoice must carry e-invoice serial number and code. |
| Expression | IF InvoiceDate >= 2026-07-01 AND Invoice.Type = Sale THEN Invoice.EInvoiceSerial is required |
| Source | ND 254/2026/ND-CP Dien 4 |
| Severity | Critical |
| Status | FUTURE — Phase 3 implementation |

---

## BR-03: Payment Allocation Rules (Phan bo thanh toan)

### BR-03.1: FIFO Allocation Default

| Field | Value |
|-------|-------|
| Category | Allocation |
| Description | When a payment is received from a customer, it is allocated to outstanding invoices in FIFO order by due date (oldest due date first). Same rule applies for supplier payments. |
| Expression | Sort outstanding invoices by DueDate ASC. Allocate payment amount to first invoice until paid, then next, etc. |
| Source | Accounting convention (first-in-first-out for debt settlement) |
| Severity | Medium |

### BR-03.2: User Override of Allocation

| Rule | Value |
|------|-------|
| Category | Allocation |
| Description | User may override FIFO allocation to allocate payment to specific invoices manually. Total allocation must equal payment amount. |
| Expression | Sum(Allocation[i].Amount) for i in selected invoices = Payment.TotalAmount |
| Severity | Low |

### BR-03.3: Excess Payment Handling

| Rule | Value |
|------|-------|
| Category | Allocation |
| Description | If payment amount exceeds total outstanding, excess becomes credit balance on customer account (advance / ung truoc). For suppliers, excess becomes debit balance (prepayment / tra truoc). |
| Expression | IF Payment.TotalAmount > Sum(Invoice.BalanceDue) THEN Customer.CreditBalance = difference |
| Severity | Medium |

### BR-03.4: Partial Payment Constraints

| Rule | Value |
|------|-------|
| Category | Allocation |
| Description | A partial payment against an invoice is allowed. Invoice remains open with reduced BalanceDue. Minimum partial payment = 0 (can allocate zero to an invoice). |
| Expression | IF AllocatedAmount < Invoice.BalanceDue THEN Invoice.Status remains Posted (not Paid). IF AllocatedAmount = 0 THEN allocation not created. |
| Severity | Low |

### BR-03.5: Payment Method Restrictions

| Rule | Value |
|------|-------|
| Category | Validation |
| Description | Payment method determines GL contra account. Cash -> TK 111. Bank transfer -> TK 112. Cheque -> TK 112 (with cheque holding sub-account if configured). Credit card -> TK 112 (merchant account). |
| Expression | PaymentMethod maps to GL account code per CompanySettings |
| Source | TT 99/2025/TT-BTC TK 111, 112 |
| Severity | High |

---

## BR-04: Debt Aging Rules (Phan tich tuoi no)

### BR-04.1: Aging Calculation Basis

| Field | Value |
|-------|-------|
| Category | Calculation |
| Description | Aging is calculated from DueDate to AsOfDate. Not from InvoiceDate. Days Overdue = AsOfDate - DueDate. Negative values = not yet due. |
| Expression | DaysOverdue = DATEDIFF(day, Invoice.DueDate, AsOfDate) |
| Source | Vietnamese accounting practice |
| Severity | High |

### BR-04.2: Aging Buckets (Standard Report)

| Bucket | Label | Days Overdue Range |
|--------|-------|-------------------|
| 1 | 0-30 ngay | 1 to 30 |
| 2 | 31-60 ngay | 31 to 60 |
| 3 | 61-90 ngay | 61 to 90 |
| 4 | 91-180 ngay | 91 to 180 |
| 5 | Tren 180 ngay | > 180 |

### BR-04.3: Aging Buckets (Provision Calculation)

| Bucket | Label | Days Overdue Range | Rate |
|--------|-------|-------------------|------|
| 1 | 0-30 ngay | 1 to 30 | 0% |
| 2 | 31-60 ngay | 31 to 60 | 5% |
| 3 | 61-90 ngay | 61 to 90 | 10% |
| 4 | 91-180 ngay | 91 to 180 | 20% |
| 5 | 181-365 ngay | 181 to 365 | 50% |
| 6 | Tren 365 ngay | > 365 | 100% |

### BR-04.4: Aging Exclusions

| Rule | Value |
|------|-------|
| Category | Calculation |
| Description | The following items are excluded from AR aging for provision purposes: (a) customers with credit balance, (b) inter-company balances (same ownership group), (c) secured debts (mortgage/collateral), (d) debts that were already provisioned at 100% in prior period. |
| Source | TT 48/2019/TT-BTC Dien 6, Khoan 2 |
| Severity | High |

---

## BR-05: Bad Debt Provision Rules (Du phong phai thu kho doi)

### BR-05.1: Provision Rate Table

| Field | Value |
|-------|-------|
| Category | Calculation |
| Description | Provision rate applied per aging bucket as defined in BR-04.3. Rate applied to total outstanding balance in each bucket per customer. |
| Expression | Provision = SUM_over_buckets( Balance_in_bucket x Rate_bucket ) |
| Source | TT 48/2019/TT-BTC Dien 6, Khoan 1 |
| Severity | Critical |

### BR-05.2: Provision Posting

| Rule | Value |
|------|-------|
| Category | Posting |
| Description | Provision is recorded as: Debit TK 6426 (Chi phi quan ly doanh nghiep — phan du phong), Credit TK 2293 (Du phong phai thu kho doi). |
| Expression | IF Provision adjustment > 0: Debit 6426, Credit 2293. IF < 0: Debit 2293, Credit 6426. |
| Source | TT 48/2019/TT-BTC Dien 7, TT 99/2025/TT-BTC TK 2293, 6426 |
| Severity | Critical |

### BR-05.3: Tax Deductibility Condition

| Rule | Value |
|------|-------|
| Category | Tax |
| Description | Bad debt provision is tax deductible only when: (a) debt is over 6 months overdue, (b) seller has sent multiple collection notices, (c) debt is not secured. Additionally, for tax deduction: must be provisioned at year-end, not mid-year. |
| Source | TT 48/2019/TT-BTC Dien 6, Khoan 4; Luat Thue TNDN (CIT Law) |
| Severity | High |
| Note | System must track which portion is tax deductible vs book-only |

### BR-05.4: Provision Reversal

| Rule | Value |
|------|-------|
| Category | Lifecycle |
| Description | When a customer pays a previously provisioned debt, the corresponding provision is reversed. When a debt is written off, the provision is utilized. |
| Expression | IF payment received on provisioned invoice THEN reverse provision: Debit 2293, Credit 6426. IF write-off THEN: Debit 2293 (prov amount), Debit 6426 (shortfall), Credit 131 (total). |
| Severity | Critical |

### BR-05.5: Provision Schedule Requirements

| Rule | Value |
|------|-------|
| Category | Documentation |
| Description | The provision calculation must be documented with: (a) date of calculation, (b) aging data as of that date, (c) provision rate applied per bucket, (d) per-customer breakdown, (e) total before and after adjustment, (f) name and signature of ke toan truong. |
| Source | TT 48/2019/TT-BTC Dien 7, Khoan 2 |
| Severity | High |

---

## BR-06: Reconciliation Rules (Doi chieu cong no)

### BR-06.1: Reconciliation Frequency

| Field | Value |
|-------|-------|
| Category | Schedule |
| Description | Customer and supplier accounts must be reconciled at least monthly. At year-end, all accounts must be reconciled before financial statements are prepared. |
| Source | VAS 01 — matching principle; accounting convention |
| Severity | Medium |

### BR-06.2: Reconciliation Documentation

| Rule | Value |
|------|-------|
| Category | Documentation |
| Description | Each reconciliation requires: (a) system statement, (b) counterparty statement (or confirmed balance), (c) discrepancy list (if any), (d) resolution actions, (e) reconciled balance confirmation. |
| Source | TT 99/2025/TT-BTC Dien 28 (mau so chi tiet) |
| Severity | High |

### BR-06.3: Discrepancy Resolution Timeline

| Rule | Value |
|------|-------|
| Category | Lifecycle |
| Description | Discrepancies must be investigated and resolved within 30 days of identification. If unresolved after 30 days, escalate to ke toan truong. If unresolved after 60 days, escalate to giam doc. |
| Severity | Medium |

### BR-06.4: Third-Party Confirmation

| Rule | Value |
|------|-------|
| Category | Process |
| Description | At year-end, for material balances (>= 5% of total AR/AP), third-party confirmation is recommended. System supports generating confirmation letters. |
| Source | VAS 01, audit practice |
| Severity | Low |

---

## BR-07: Segregation of Duties Rules (Phan quyen)

### BR-07.1: Creator != Approver (All Invoices and Payments)

| Field | Value |
|-------|-------|
| Category | SoD |
| Description | The user who creates an invoice or payment in Draft status cannot be the same user who approves/posts it. Exception: if no other user has `dept:invoice:approve` permission in the company, a warning is shown but override allowed with audit trail. |
| Enforcement | SoDConflictMatrix.checkCreatorApprover() |
| Severity | Critical |

### BR-07.2: AP Clerk != AP Approver

| Rule | Value |
|------|-------|
| Category | SoD |
| Description | A user with role `ke-toan-cong-no` who enters a purchase invoice cannot approve the corresponding supplier payment. Payment approval requires role `ke-toan-truong` or `giam-doc`. |
| Severity | Critical |

### BR-07.3: AR Clerk != Cash Handler

| Rule | Value |
|------|-------|
| Category | SoD |
| Description | A user with role `ke-toan-cong-no` who creates sales invoices and manages AR should not also handle cash receipts. Cash receipt handling is role `thu-quy`. If same user has both roles, system enforces per-transaction SoD check. |
| Enforcement | SoDConflictMatrix.checkCashierRecords() |
| Severity | Critical |

### BR-07.4: Payment Approval Threshold

| Rule | Value |
|------|-------|
| Category | Authorization |
| Description | Payments above the company-defined threshold require additional approval from giam-doc (director). Threshold is configurable in CompanySettings. Default: 50,000,000 VND. |
| Expression | IF Payment.TotalAmount > CompanySettings.PaymentApprovalThreshold THEN Payment.Status = PendingApproval, requires giam-doc approval |
| Severity | High |

### BR-07.5: Write-Off Approval Chain

| Rule | Value |
|------|-------|
| Category | Authorization |
| Description | Bad debt write-off always requires approval from both ke toan truong AND giam doc, regardless of amount. Write-off without provision requires additional legal department sign-off. |
| Severity | Critical |

### BR-07.6: System Admin Restriction

| Rule | Value |
|------|-------|
| Category | SoD |
| Description | System admin (he-thong) cannot create, approve, or post invoices or payments. He-thong role is technical administration only, per Luat Ke toan 2015. |
| Enforcement | SoDConflictMatrix.checkSystemAdminAccounting() |
| Severity | Critical |

### BR-07.7: Role-Permission Matrix for Dept Module

| Operation | ke-toan-cong-no | ke-toan-vien | ke-toan-truong | thu-quy | giam-doc | kiem-soat |
|-----------|----------------|--------------|----------------|---------|----------|-----------|
| Create draft invoice | Yes | Yes | No | No | No | No |
| Approve invoice | No | No | Yes | No | No | No |
| Create payment | Yes | No | Yes | Yes | No | No |
| Approve payment | No | No | Yes | No | Yes | No |
| View aging | Yes | No | Yes | No | Yes | Yes |
| Create provision | No | No | Yes | No | No | No |
| Write off bad debt | No | No | Yes* | No | Yes* | No |
| Reconcile | Yes | No | Yes | No | No | No |
| Offset AP/AR | No | No | Yes | No | No | No |
| Export reports | Yes | No | Yes | No | Yes | Yes |
| View audit log | No | No | Yes | No | No | Yes |

*Write-off requires dual approval (ke-toan-truong + giam-doc)
