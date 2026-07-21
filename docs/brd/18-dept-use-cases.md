# Use Cases — Dept Module (Cong no — AP/AR)

**Domain:** Cong no (Accounts Payable/Receivable)
**Module:** Dept Management
**Regulatory basis:** TT 99/2025/TT-BTC, TT 133/2016/TT-BTC, VAS 01, VAS 10, VAS 18, TT 48/2019/TT-BTC, Luat Ke toan 88/2015, ND 254/2026/ND-CP, ND 23/2025/ND-CP, Luat Quan ly thue 38/2019

**Entity Reference** (see `docs/brd/17-dept-module-brd.md` for full definitions):

| Entity | Key Fields |
|--------|-----------|
| `Customer` | Id, Code, Name, TaxCode, Address, ContactPerson, PaymentTerms, CreditLimit, OpeningBalance |
| `Vendor` | Id, Code, Name, TaxCode, Address, ContactPerson, PaymentTerms, BankAccount, OpeningBalance |
| `Invoice` | Id, Number, Type (Sale/Purchase), Customer/VendorId, Date, DueDate, Currency, SubTotal, TaxTotal, Total, PaidAmount, Balance, Status |
| `InvoiceLine` | Id, InvoiceId, Description, Quantity, UnitPrice, TaxRate, TaxAmount, LineTotal |
| `Payment` | Id, VoucherNumber, Type (Receipt/Disbursement), Customer/VendorId, Date, Amount, Method, Status |
| `InvoicePaymentAllocation` | Id, PaymentId, InvoiceId, AllocatedAmount |

---

## UC-01: Record Customer Invoice (Ghi nhan hoa don ban hang — phai thu)

**Actor:** Ke toan cong no (AP/AR Accountant), Ke toan vien (Staff Accountant)

**Description:** Record a sales invoice issued to a customer. Creates accounts receivable (TK 131) entry. Per TT 99/2025/TT-BTC, every sales invoice must be recorded with customer detail, invoice number, date, due date, and line items.

**Preconditions:**
1. User has permission `dept:invoice:create`
2. Customer master record exists (see UC-01 in `docs/brd/17-dept-module-brd.md`)
3. Company settings define accounting regime (TT99 or TT133)
4. Invoice number sequence is configured for current period

**Postconditions:**
1. Invoice record created with status `Draft`
2. Invoice number assigned from sequence
3. Audit log: `InvoiceCreated`
4. If posted directly: GL journal entry created (Debit TK 131, Credit TK 511/TK 3331)

### Happy Path
1. User navigates to Dept -> Sales Invoice -> Create New
2. System displays Invoice form (see Template T-03 in `docs/brd/22-dept-templates.md`)
3. User selects Customer from lookup (search by name, code, or tax code)
4. System loads Customer info: name, address, PaymentTerms, TaxCode, CreditLimit
5. User enters InvoiceDate, DueDate (auto-calculated from PaymentTerms)
6. User adds line items: Description, Quantity, UnitPrice, TaxRate
7. System calculates line totals: LineTotal = Quantity x UnitPrice; TaxAmount = LineTotal x TaxRate
8. System calculates SubTotal, TaxTotal, TotalAmount
9. System validates: TotalAmount does not exceed Customer CreditLimit + current outstanding balance
10. User clicks Save (or Save & Post)
11. If Save: invoice saved as Draft
12. If Save & Post: system checks SoD (creator != approver) — if user also has `dept:invoice:approve`, requires second approval
13. On Post: system creates GL journal entry (Debit 131, Credit 511, Credit 3331)
14. System logs `InvoiceCreated` audit event
15. System displays success with InvoiceNumber

### Alternative Path: Save Draft for Later
1. A1-A9 same
2. User clicks Save (not Save & Post)
3. System saves invoice with status Draft, no GL posting
4. System displays "Invoice saved as draft — pending approval"
5. Draft appears in "Pending Invoices" list for approver

### Alternative Path: Foreign Currency Invoice (VAS 10)
1. A1-A5 same
2. User selects CurrencyCode != VND (USD, EUR, etc.)
3. System shows ExchangeRate field, defaults to CompanySettings.DefaultRateSource
4. User enters ExchangeRate (or system auto-fills if API available)
5. System records both foreign amount and VND equivalent
6. System tracks exchange rate on invoice header for future reconciliation
7. Posting generates: Debit 131 (VND equivalent), Credit 511 (VND equivalent), with FX memo

### Exception Path: Customer Credit Limit Exceeded
1. A1-A9 same
2. System calculates: current outstanding balance (existing unpaid invoices) + new invoice TotalAmount > CreditLimit
3. System warns: "Invoice amount exceeds customer credit limit. Current outstanding: [X]. Credit limit: [Y]. Overage: [Z]."
4. User can: (a) reduce invoice amount, (b) request credit limit increase from giam-doc, (c) override with approval from ke-toan-truong
5. If no override: invoice save blocked

### Exception Path: Duplicate Invoice Number
1. A1-A5 same
2. User manually enters InvoiceNumber (override auto-number)
3. System queries existing — number already used
4. System rejects: "Invoice number [N] already exists in system"
5. User must use auto-generated number or different manual number

---

## UC-02: Record Customer Payment (Ghi nhan phieu thu tu khach hang)

**Actor:** Thu quy (Cashier), Ke toan cong no (AP/AR Accountant)

**Description:** Record receipt of payment from a customer. Allocates payment against outstanding invoices. Reduces AR balance (Credit TK 131).

**Preconditions:**
1. User has permission `dept:payment:create`
2. Customer has at least one posted invoice with balance > 0
3. Cash/bank account is configured in CompanyBankAccount

**Postconditions:**
1. Payment record created with status `Posted`
2. InvoicePaymentAllocation records created
3. Customer invoices updated: PaidAmount increased, BalanceDue decreased
4. GL journal entry created (Debit TK 111/112, Credit TK 131)
5. Audit log: `PaymentReceived`

### Happy Path
1. User navigates to Dept -> Receipt -> Create New
2. System displays Receipt form (see Template T-05 in `docs/brd/22-dept-templates.md`)
3. User selects Customer from lookup
4. System loads outstanding invoices for customer (unpaid/partially paid, sorted by due date ascending — FIFO)
5. User enters PaymentDate, PaymentMethod (Cash/BankTransfer/Cheque/CreditCard)
6. If BankTransfer: user selects BankAccount from company bank accounts
7. User enters TotalAmount received
8. System auto-allocates TotalAmount across outstanding invoices (FIFO by due date per BR-03 in `docs/brd/20-dept-business-rules.md`)
9. User can override allocation amounts manually
10. User clicks Save & Post
11. System validates: sum of AllocatedAmounts <= TotalAmount
12. System posts payment
13. System creates GL entry: Debit TK 111/112, Credit TK 131
14. System updates invoice balances
15. System logs `PaymentReceived`
16. System displays success with VoucherNumber

### Alternative Path: Partial Payment
1. A1-A7 same
2. User enters TotalAmount less than total outstanding
3. System auto-allocates proportionally (or FIFO per user preference)
4. User reviews partial allocation
5. System posts partial payment, invoices remain with reduced balances
6. System flags underpayment on the oldest invoice

### Alternative Path: Advance Payment (Ung truoc)
1. A1-A5 same
2. User checks "Advance Payment (Ung truoc)" flag
3. No invoices to allocate against
4. System posts payment directly to customer account as credit balance (TK 131 credit balance)
5. Future invoices will auto-allocate against the advance
6. GL: Debit TK 111/112, Credit TK 131 (advance)

### Exception Path: Payment Exceeds Outstanding Balance
1. A1-A7 same
2. TotalAmount > sum of all outstanding invoice balances
3. System warns: "Payment amount exceeds total outstanding balance. Excess: [X]"
4. Options: (a) process as advance (credit balance), (b) reduce payment amount, (c) verify with customer
5. User must confirm before posting

### Exception Path: Duplicate Voucher Number
1. A1-A7 same
2. User enters manual VoucherNumber
3. System detects duplicate
4. System rejects: "Voucher number already exists"
5. User uses system-generated number

---

## UC-03: Record Supplier Invoice (Ghi nhan hoa don mua hang — phai tra)

**Actor:** Ke toan cong no (AP/AR Accountant)

**Description:** Record purchase invoice received from a supplier. Creates accounts payable (TK 331) entry.

**Preconditions:**
1. User has permission `dept:invoice:create`
2. Supplier master record exists
3. Purchase order exists (if procurement module integrated)

**Postconditions:**
1. Invoice record created (type Purchase) with status Draft or Posted
2. GL journal entry created (Debit TK 152/156/641/642, Debit TK 133, Credit TK 331)
3. Audit log: `PurchaseInvoiceRecorded`

### Happy Path
1. User navigates to Dept -> Purchase Invoice -> Create New
2. System displays form (see Template T-04 in `docs/brd/22-dept-templates.md`)
3. User selects Supplier from lookup
4. System loads supplier info: name, tax code, PaymentTerms, bank account
5. User enters InvoiceNumber (from supplier's invoice), InvoiceDate, DueDate
6. User enters line items: Expense account (TK 152/156/641/642), Description, Quantity, UnitPrice, TaxRate
7. System calculates line totals
8. System validates: TaxRate matches company tax calculation method
9. User clicks Save & Post
10. System posts: GL Debit expense account, Debit TK 133 (input VAT), Credit TK 331
11. System logs `PurchaseInvoiceRecorded`
12. System displays success with internal InvoiceNumber

### Alternative Path: Invoice Without Purchase Order
1. A1-A3 same
2. No PO linked (direct invoice entry)
3. User enters expense accounts manually for each line
4. Remaining steps same as happy path

### Alternative Path: Credit Note (Dieu chinh giam)
1. A1-A5 same
2. User selects InvoiceType = "Adjustment" with AdjustmentType = "CreditNote"
3. User references original InvoiceNumber
4. User enters negative amounts (or positive with CreditNote flag)
5. System creates reversal entry: Debit TK 331, Credit TK 152/156/641/642, Credit TK 133
6. Original invoice reference recorded

### Exception Path: Supplier Tax Code Mismatch
1. A1-A5 same
2. User enters InvoiceNumber from supplier
3. System detects supplier's TaxCode on invoice differs from Vendor master TaxCode
4. System warns: "Supplier tax code on invoice does not match master record. Verify with supplier."
5. User must confirm override or update master data

### Exception Path: Duplicate Supplier Invoice
1. A1-A5 same
2. User enters InvoiceNumber + Supplier combination
3. System finds existing invoice with same Supplier + InvoiceNumber
4. System rejects: "Invoice [N] from supplier [X] already recorded on [date]"
5. User must verify: is this a duplicate? a credit note? or a correction?

---

## UC-04: Record Supplier Payment (Ghi nhan phieu chi cho nha cung cap)

**Actor:** Thu quy (Cashier), Ke toan cong no (AP/AR Accountant)

**Description:** Record payment disbursement to a supplier. Reduces AP balance (Debit TK 331).

**Preconditions:**
1. User has permission `dept:payment:create`
2. Supplier has at least one posted invoice with balance > 0
3. Sufficient cash/bank balance (if cash/bank module integrated)
4. Payment approved by ke-toan-truong or giam-doc (if amount exceeds approval threshold)

**Postconditions:**
1. Payment record created (type Disbursement) with status Posted
2. InvoicePaymentAllocation records created
3. Supplier invoices reduced
4. GL: Debit TK 331, Credit TK 111/112
5. Audit log: `PaymentDisbursed`

### Happy Path
1. User navigates to Dept -> Payment -> Create New
2. System displays form (see Template T-06 in `docs/brd/22-dept-templates.md`)
3. User selects Supplier from lookup
4. System loads outstanding invoices (oldest first per BR-03)
5. User enters PaymentDate, PaymentMethod, BankAccount
6. User enters TotalAmount
7. System auto-allocates FIFO across invoices
8. User adjusts allocation if needed (e.g., pay specific invoices)
9. System checks approval threshold: if TotalAmount > company-defined limit, routes to ke-toan-truong for approval
10. If threshold exceeded: status = PendingApproval
11. If under threshold (or after approval): status = Posted
12. System creates GL: Debit TK 331, Credit TK 111/112
13. System logs `PaymentDisbursed`

### Alternative Path: Early Payment Discount (Chiet khau thanh toan)
1. A1-A6 same
2. Supplier offers early payment discount (e.g., 2/10 net 30)
3. PaymentDate within discount period
4. System calculates discount amount
5. Actual payment amount = Invoice total - discount
6. GL: Debit TK 331 (full amount), Credit TK 111/112 (actual paid), Credit TK 515 (discount income)
7. System logs discount taken

### Exception Path: Payment Exceeds Approval Threshold
1. A1-A6 same
2. TotalAmount > company payment approval threshold
3. System blocks direct posting: "Payment exceeds approval threshold. Routing to Ke toan truong for approval."
4. System sends notification to ke-toan-truong
5. Status = PendingApproval
6. When approved: status changes to Posted, GL created

### Exception Path: Insufficient Bank Balance
1. A1-A6 same
2. PaymentMethod = BankTransfer
3. System checks BankAccount balance (if bank module integrated)
4. Balance < TotalAmount
5. System warns: "Insufficient balance in bank account [X]. Current balance: [Y]. Payment amount: [Z]."
6. User can: (a) select different bank account, (b) proceed with warning (will overdraft), (c) cancel

---

## UC-05: Generate AR Aging Report (Bao cao tuoi no phai thu)

**Actor:** Ke toan cong no, Ke toan truong, Ke toan tong hop, Giam doc

**Description:** Generate accounts receivable aging analysis. Classifies outstanding customer balances into aging buckets per Vietnamese accounting practice.

**Preconditions:**
1. User has permission `dept:aging:view`
2. At least one customer has posted invoices with unpaid balance

**Postconditions:**
1. AR Aging Report generated and displayed
2. Report parameters logged for audit (if exported)
3. No data changes

### Happy Path
1. User navigates to Dept > Reports > AR Aging
2. System displays filter form: AsOfDate (default today), Customer filter (optional), Aging Buckets
3. User selects AsOfDate, clicks Generate
4. System queries: all customers with unpaid invoices as of AsOfDate
5. For each customer: calculates aging by due date vs AsOfDate
6. System classifies into buckets: 0-30, 31-60, 61-90, 91-180, >180 days
7. System groups by customer, shows totals per bucket
8. System displays: Customer Name, Total Due, per-bucket amounts, % of total
9. System highlights overdue > 90 days in red
10. User can sort by any column, drill into customer detail
11. User can export to Excel/PDF (see Template T-07 in `docs/brd/22-dept-templates.md`)

### Alternative Path: Aging by Aging Date (not AsOfDate)
1. A1-A2 same
2. User selects "By Invoice Date" instead of "By Due Date"
3. System calculates aging from InvoiceDate instead of DueDate
4. Different aging picture — shows how long invoices have been outstanding regardless of terms

### Alternative Path: Filter by Customer Group
1. A1-A2 same
2. User applies customer group filter (e.g., "Only active customers", "Only government customers")
3. System restricts query
4. Report shows only filtered subset

### Exception Path: No Data
1. A1-A2 same
2. No outstanding invoices found for the AsOfDate
3. System displays: "No outstanding receivables as of [date]. All customer invoices are paid."
4. Empty report with header only

### Exception Path: AsOfDate in Closed Period
1. A1-A2 same
2. User selects AsOfDate prior to last closed period date
3. System warns: "Selected date falls in closed accounting period. Data is frozen as of period close."
4. Report generated with closed-period data (no current transactions mixed)

---

## UC-06: Generate AP Aging Report (Bao cao tuoi no phai tra)

**Actor:** Ke toan cong no, Ke toan truong, Ke toan tong hop, Giam doc

**Description:** Generate accounts payable aging analysis for supplier management and cash flow planning.

**Preconditions:** Same as UC-05 but for suppliers

**Postconditions:** Same as UC-05

### Happy Path
1. User navigates to Dept > Reports > AP Aging
2. System displays filter form: AsOfDate, Vendor filter (optional)
3. User selects AsOfDate, clicks Generate
4. System queries all suppliers with unpaid invoices
5. System classifies into same aging buckets (0-30, 31-60, 61-90, 91-180, >180)
6. System displays report (see Template T-08 in `docs/brd/22-dept-templates.md`)
7. Aging calculated from DueDate to AsOfDate
8. Negative aging (not yet due) shown separately
9. User can drill into supplier detail

### Alternative Path: Group by Payment Terms
1. User applies grouping by PaymentTerms (Net 15, Net 30, Net 60, etc.)
2. System groups suppliers by their payment terms
3. Shows aging within each payment term group

### Exception Path: Negative Aging Values
1. Some invoices not yet due (due date > AsOfDate)
2. System shows these as "Not Yet Due" or negative days
3. NotYetDue column separate from aging buckets

### Exception Path: Currency Mismatch
1. System detects mixed-currency payables
2. Warns: "Report contains foreign currency payables. VND equivalent shown at exchange rate as of AsOfDate."
3. Shows both original currency and VND equivalent columns

---

## UC-07: Reconcile Customer Account (Doi chieu cong no khach hang)

**Actor:** Ke toan cong no, Ke toan truong

**Description:** Reconcile internal AR records against customer-provided statements. Identify discrepancies and resolve differences.

**Preconditions:**
1. User has permission `dept:reconcile`
2. Customer has at least one posted invoice
3. Customer has provided statement (external), or system compares against last month's closing balance

**Postconditions:**
1. Reconciliation record created with comparison details
2. Discrepancies identified and logged
3. If full match: reconciliation status set to Matched
4. If mismatch: status set to DiscrepancyFound, differences documented
5. Audit log: `ReconciliationPerformed`

### Happy Path
1. User navigates to Dept -> Reconciliation -> Customer
2. User selects Customer from lookup
3. System displays current AR detail for customer: opening balance, invoices, payments, adjustments, closing balance
4. User enters or imports customer's statement data (opening balance, invoices, payments per their records)
5. System compares side by side:
   - Opening balance: system vs statement
   - Each invoice: number, date, amount
   - Each payment: date, amount
   - Closing balance
6. System highlights matching items green, discrepancies red
7. If all match: user clicks "Confirm Reconciliation"
8. System marks period as reconciled for this customer
9. System logs `ReconciliationConfirmed`

### Alternative Path: Import Statement from Excel
1. A1-A3 same
2. User imports customer statement as CSV/Excel
3. System parses file, matches by InvoiceNumber and amount
4. System displays comparison
5. Unmatched items flagged for manual review

### Alternative Path: Carry-Forward Reconciliation
1. Previous month/period was reconciled
2. System starts from last reconciled closing balance
3. Only compares transactions since last reconciliation date
4. Faster review for recurring reconciliation

### Exception Path: Opening Balance Mismatch
1. Customer statement shows opening balance different from system record
2. System flags: "Opening balance discrepancy: system [X], statement [Y], difference [Z]"
3. Possible causes: unrecorded invoices, adjustments, prior-period error
4. User must investigate before continuing with current period reconciliation

### Exception Path: Payment Not Recorded in System
1. Customer statement shows a payment that system does not have
2. System flags: "Payment [date, amount] on customer statement not found in system"
3. User must: check bank statement, verify if payment was posted to wrong customer, or record missing payment
4. Reconciliation can proceed with discrepancy noted but not closed

---

## UC-08: Reconcile Supplier Account (Doi chieu cong no nha cung cap)

**Actor:** Ke toan cong no, Ke toan truong

**Description:** Reconcile internal AP records against supplier-provided statements. (Structure mirrors UC-07 but for supplier direction.)

**Preconditions:** Same structure as UC-07

**Postconditions:** Same structure as UC-07

### Happy Path
1. User navigates to Dept -> Reconciliation -> Supplier
2. User selects Supplier from lookup
3. System displays AP detail: opening balance, invoices, payments, adjustments, closing
4. User enters supplier statement data
5. System compares
6. Confirmation on full match

### Alternative Path: Supplier Sends Electronic Statement
1. Supplier provides machine-readable statement (PDF with structured data, CSV, EDI)
2. System parses electronically
3. Automated matching of invoice numbers and amounts
4. Manual review only for exceptions

### Exception Path: Invoice in Dispute
1. Supplier statement includes invoice that company is disputing
2. User marks invoice as "In Dispute" in system
3. Reconciliation notes dispute reason
4. Disputed amount shown separately on reconciliation report
5. Not included in "payable" until dispute resolved

---

## UC-09: Create Bad Debt Provision (Trich lap du phong phai thu kho doi)

**Actor:** Ke toan truong (Chief Accountant)

**Description:** Calculate and record bad debt provision per VAS 18 and TT 48/2019/TT-BTC. Based on aging of outstanding AR at period end.

**Preconditions:**
1. User has permission `dept:provision:create`
2. Period-end closing has been initiated (or it is year-end)
3. AR aging report has been generated for the period end date

**Postconditions:**
1. BadDebtProvision records created per customer
2. GL entry posted: Debit TK 6426, Credit TK 2293
3. Period provision amount calculated per TT 48/2019 rates
4. Audit log: `BadDebtProvisionCreated`

### Happy Path
1. User navigates to Dept -> Bad Debt Provision -> Create New
2. System selects period end date (last day of current accounting period, per company settings)
3. System generates AR aging as of period end date
4. System applies provision rates per TT 48/2019/TT-BTC:
   - 0-30 days overdue: 0%
   - 31-60 days overdue: 5%
   - 61-90 days overdue: 10%
   - 91-180 days overdue: 20%
   - 181-365 days overdue: 50%
   - Over 365 days overdue: 100%
5. System calculates provision for each customer per aging bucket
6. System excludes: (a) customers with credit balance, (b) inter-company balances, (c) secured debts
7. System summarizes total provision
8. User reviews calculation, can manually adjust specific provisions with reason
9. User clicks "Post Provision"
10. System saves provision records
11. System creates GL entry: Debit TK 6426 (or TK 642) by amount, Credit TK 2293 by amount
12. System logs `BadDebtProvisionCreated`

### Alternative Path: Draft Provision for Review
1. A1-A8 same
2. User clicks "Save as Draft" instead of Post
3. Provision saved as Draft for ke-toan-truong review
4. Draft provision appears in "Pending Provisions" list
5. Another user with `dept:provision:create` can review and post

### Alternative Path: Mid-Year Provision Check
1. User selects mid-year date (not year-end)
2. System processes same calculation
3. Provision is recorded as "additional provision" for current period
4. If provision < existing balance: reversal entry (Credit TK 6426, Debit TK 2293)

### Exception Path: Existing Provision for Same Period
1. A1-A2 same
2. System detects provision already exists for this period
3. System warns: "Provision already posted for period [YYYY-MM]. Current provision: [X]. Overwrite?"
4. Option to adjust (difference only) or create new replacement
5. If replace: reversal of old provision first, then new provision

### Exception Path: No Outstanding AR
1. A1-A2 same
2. System finds zero outstanding AR as of period end
3. System displays: "No outstanding receivables. Provision amount = 0."
4. User can confirm zero provision
5. If existing provision from prior period: system prompts reversal

---

## UC-10: Write Off Bad Debt (Xoa so no kho doi)

**Actor:** Ke toan truong (with Giam doc approval if amount > threshold)

**Description:** Write off receivables determined to be uncollectible. Per VAS 18, bad debt write-off requires: (a) debt has been fully provisioned, (b) evidence of uncollectibility, (c) approval chain.

**Preconditions:**
1. User has permission `dept:writeoff`
2. Customer has outstanding balance > 0
3. Debt meets uncollectibility criteria per VAS 18 (customer dissolved, bankrupt, or 3+ years overdue)
4. Bad debt provision exists covering the write-off amount (or partial)

**Postconditions:**
1. Customer invoice(s) written off (status changed to WrittenOff)
2. Payment-like record created (write-off type)
3. GL entry: Debit TK 2293 (against provision), Debit TK 6426 (if insufficient provision), Credit TK 131
4. Write-off reason documented
5. Audit log: `BadDebtWrittenOff`

### Happy Path
1. User navigates to Dept -> Bad Debt -> Write Off
2. User selects Customer from lookup
3. System displays outstanding invoices with aging
4. User selects invoice(s) to write off
5. User enters WriteOffDate, WriteOffReason (required)
6. User attaches supporting evidence (bankruptcy notice, dissolution cert, collection agency report)
7. System checks: total provision available for this customer
8. If provision >= invoice amount: GL Debit TK 2293, Credit TK 131
9. If provision < invoice amount: Debit TK 2293 (provision amount), Debit TK 6426 (shortfall), Credit TK 131 (total)
10. User confirms write-off
11. System posts, changes invoice status to WrittenOff
12. System removes invoice from active aging
13. System logs `BadDebtWrittenOff`

### Alternative Path: Partial Write-Off
1. A1-A4 same
2. User enters WriteOffAmount less than full invoice amount
3. System updates invoice: partial write-off, remaining balance stays
4. Partial write-off leaves invoice open with reduced balance
5. Future collection continues on remaining balance

### Alternative Path: Write Off Without Provision
1. A1-A4 same
2. No provision has been created for this customer
3. System warns: "No bad debt provision exists. Write-off will be expensed directly to P&L."
4. GL: Debit TK 6426 (full amount), Credit TK 131
5. Requires giam-doc approval (always, regardless of amount)

### Exception Path: Debt Under Collection
1. A1-A4 same
2. Customer has been assigned to collection agency
3. System flags: "This debt is currently under collection. Write-off may affect collection rights."
4. User must confirm from legal that write-off is appropriate
5. Write-off proceeds with "UnderCollection" flag

### Exception Path: Customer With Credit Balance
1. A1-A2 same
2. Customer has credit balance (overpaid)
3. System rejects: "Customer has credit balance of [X]. Cannot write off. Offset credit balance first."
4. User must process refund or offset before write-off

---

## UC-11: Offset AP with AR (Bu tru cong no)

**Actor:** Ke toan truong (Chief Accountant)

**Description:** Offset accounts payable against accounts receivable when the same counterparty is both customer and supplier. Requires mutual agreement and supporting documentation. Per VAS 01 and TT 99/2025, balance sheet presentation must not net unless legal right of offset exists.

**Preconditions:**
1. User has permission `dept:offset`
2. Same entity exists as both Customer and Vendor (or different entities with mutual agreement)
3. Both AR and AP balances are non-zero
4. Offset agreement document exists

**Postconditions:**
1. Offset record created
2. AR balance reduced (Credit TK 131)
3. AP balance reduced (Debit TK 331)
4. GL entry: Debit TK 331, Credit TK 131
5. Audit log: `ArApOffsetCompleted`

### Happy Path
1. User navigates to Dept -> AR/AP Offset -> Create New
2. User selects entity from Customer lookup (must also be a Vendor)
3. System displays:
   - AR balance (total outstanding invoices from customer)
   - AP balance (total outstanding invoices to vendor)
   - Offsettable amount = minimum(AR, AP)
4. User enters offset amount (default: offsettable amount)
5. User enters OffsetDate, Reference document number
6. User attaches offset agreement (scanned PDF)
7. System validates: amount <= AR balance and <= AP balance
8. User confirms
9. System creates GL: Debit TK 331, Credit TK 131
10. System updates invoice balances (proportionally or per user allocation)
11. System logs `ArApOffsetCompleted`

### Alternative Path: Partial Offset
1. A1-A3 same
2. User enters Amount less than offsettable amount
3. Remaining AR and AP balances persist
4. Future offset possible for remaining balances

### Alternative Path: Different Counterparty Names
1. Customer name differs from Vendor name (same entity, 2 master records)
2. User manually links the two master records for offset
3. System requires comment explaining relationship
4. Offset proceeds with linked records

### Exception Path: No Dual Role
1. A1-A2 same
2. Entity is only a Customer (not a Vendor)
3. System: "This entity is not registered as a supplier. Cannot offset AP."
4. User must register entity as Vendor first

### Exception Path: Amount Exceeds Smaller Balance
1. A1-A4 same
2. User enters offset amount > min(AR, AP)
3. System rejects: "Offset amount [X] exceeds offsettable amount [Y]."
4. User corrects amount

---

## UC-12: Generate Customer Statement (So chi tiet cong no phai thu)

**Actor:** Ke toan cong no, Khach hang (Customer — external)

**Description:** Generate per-customer statement showing all transactions for a period (opening balance, invoices, receipts, adjustments, closing balance). Per Mau S03b-DN per TT 99/2025/TT-BTC.

**Preconditions:**
1. User has permission `dept:aging:view`
2. Customer has at least one transaction in selected period

**Postconditions:**
1. Statement generated and displayed
2. If exported: audit log `StatementExported`

### Happy Path
1. User navigates to Dept -> Reports -> Customer Statement
2. User selects Customer, Period (month/quarter/year)
3. System loads:
   - Opening balance as of start of period
   - All invoices in period (date, number, description, amount)
   - All payments in period (date, number, description, amount)
   - Adjustments, credit notes, write-offs
   - Closing balance
4. System computes running balance after each transaction
5. System displays statement (see Template T-09 in `docs/brd/22-dept-templates.md`)
6. User can print or export (PDF/Excel/CSV)
7. System logs `StatementExported`

### Alternative Path: Multi-Period Statement
1. A1-A2 same
2. User selects date range spanning multiple periods
3. System opens with opening balance from range start
4. Shows all transactions in range
5. Closing balance at range end

### Alternative Path: Send Statement to Customer
1. Statement generated
2. User clicks "Send to Customer"
3. System attaches PDF to email
4. Email sent to Customer.Email with Vietnamese template
5. Audit log: `StatementSentToCustomer`

### Exception Path: No Transactions
1. A1-A2 same
2. Customer has zero transactions in selected period
3. System displays: "No transactions for [Customer] in [period]."
4. Opening balance = closing balance (carried forward)
5. Statement shows header and balances only

### Exception Path: Foreign Currency Transactions
1. Customer has invoices in foreign currency
2. System displays both foreign currency and VND equivalent columns
3. Statement footer shows exchange rate used for conversion
4. Warning: "Exchange rate fluctuations may cause rounding differences"
