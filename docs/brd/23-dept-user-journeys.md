# User Journeys — Dept Module (Cong no — AP/AR)

---

## J-01: AP Accountant Processing Supplier Payments (Ke toan cong no phai tra)

**Persona:** Nguyen Van An — AP Accountant (Ke toan cong no — phai tra)

- **Role:** Ke toan cong no at medium-sized manufacturing company (200 employees)
- **Experience Level:** 5 years, previously used MISA SME and Excel-based AP tracking
- **Daily Tasks:**
  - Record purchase invoices (15-30 per day)
  - Process supplier payments (weekly batch of 5-10 payments)
  - Reconcile supplier statements (monthly, 50+ suppliers)
  - Monitor payment due dates and cash flow
- **Goals:**
  - Reduce invoice processing time from 10 min to 3 min per invoice
  - Never miss a payment due date
  - Maintain clean supplier reconciliation with zero unresolved discrepancies
  - Avoid duplicate payments (a common error in Excel-based systems)
- **Pain Points:**
  - Current system: no centralized AP — invoices tracked in Excel, payments in separate banking app
  - No automatic GL posting: manually posts Debit 331, Credit 112 every payment
  - No aging view — has to manually calculate which invoices are overdue
  - Supplier calls asking about payment status — no portal for them to check

### Journey: Processing Supplier Payment Batch (Weekly)

```
Phase                Touchpoints                     Emotion     An's Actions                    System Responses
─────                ───────────                     ───────     ─────────────                   ───────────────
Morning Review       Dept module -> AP aging         😰 Anxious  Logs in Monday 8 AM.            No AP module exists.
(Weekday AM)                                                    Opens Excel spreadsheet         Current system: nothing.
                                                                with 50+ supplier rows.          Must use manual tracker.
                                                                Highlights due payments
                                                                for this week: 8 suppliers,
                                                                total 450,000,000 VND.

Invoice Entry        Purchase invoice form           😤 Frustrated Paper invoices arrive from      System (proposed):
(Throughout day)                                                suppliers. An keys in each       Auto-fill supplier info
                                                                invoice manually: supplier,      from Vendor master.
                                                                invoice #, date, amounts,        Validate tax code against
                                                                expense accounts.                Supplier master
                                                                Error-prone: mis-keyed            automatically.
                                                                amount last week caused          E-invoice data auto-
                                                                15M VND overpayment.             populate (future).

Payment Approval     Payment approval threshold       😐 Neutral  Prepares payment batch.         System (proposed):
(Wednesday)                                                     Each > 50M requires               Auto-check approval
                                                                giam-doc approval.                threshold. Route to
                                                                Prints payment list, walks        approver. Digital
                                                                to director's office for           signature per ND 23/2025.
                                                                physical signature.

Payment Execution    Payment voucher                  😊 Satisfied After approval, creates          System (proposed):
(Thursday)                                                     payment vouchers in system.       Generate bank payment
                                                                Exports payment file for          file (ISO 20022) for
                                                                online banking.                    corporate banking portal.
                                                                                                  Auto-record GL:
                                                                                                  Debit 331, Credit 112.

Reconciliation       Supplier statement               😤 Frustrated End of month: 50+ supplier     System (proposed):
(Month end)                                                     statements to reconcile.          Auto-match statement
                                                                Manually ticks off invoices       lines against system
                                                                in Excel. Takes 2 full days.      records. Flag exceptions
                                                                                                  only. Reduce to 2 hours.
```

### Key Requirements for An

| Need | Requirement ID | Priority |
|------|---------------|----------|
| AP invoice entry with auto-GL posting | UC-03 (`docs/brd/18-dept-use-cases.md`) | P0 |
| Payment batch processing with FIFO allocation | UC-04, BR-03 | P0 |
| Aging-driven payment prioritization | UC-06 | P1 |
| Supplier statement auto-reconciliation | UC-08 (alternative path) | P2 |
| Bank payment file export | DF-02, DF-03 | P1 |
| Supplier portal (future) | — | P3 |

---

## J-02: AR Accountant Chasing Customer Debts (Ke toan cong no phai thu)

**Persona:** Tran Thi Binh — AR Accountant (Ke toan cong no — phai thu)

- **Role:** Ke toan cong no at trading company (150+ B2B customers)
- **Experience Level:** 8 years, strong Excel skills, frustrated with manual debt chasing
- **Daily Tasks:**
  - Issue sales invoices (20-40 per day)
  - Monitor customer payments and overdue accounts
  - Call/email customers about overdue invoices
  - Prepare weekly AR aging report for chief accountant
  - Handle customer disputes and credit notes
- **Goals:**
  - Reduce DSO (Days Sales Outstanding) from 65 to 45 days
  - Automate payment reminders to customers
  - Have real-time visibility into which customers are overdue
  - Reduce time spent on manual aging report preparation
- **Pain Points:**
  - Sends payment reminders manually via Outlook — time consuming
  - Customers dispute invoice amounts — no easy way to look up original invoice
  - No automatic escalation when debt reaches 90+ days overdue
  - End-of-month statement preparation takes 3 days

### Journey: Monthly AR Collection Cycle

```
Phase                Touchpoints                     Emotion     Binh's Actions                   System Responses
─────                ───────────                     ───────     ─────────────                    ───────────────
Week 1:              AR Aging Report                 😰 Anxious  Monday morning: runs Excel         No system today.
New Invoices                                         macro to calculate aging from              (Proposed: one click
                                                     her manual tracker. 2.3B VND               generates AR aging
                                                     outstanding, 800M overdue.                  with drill-down.)

Week 1:              Customer statement               😐 Neutral  Sends weekly statement             (Proposed: auto-send
Reminder emails                                                emails to 20 overdue                email with attached
                                                                customers. Copy-paste              statement PDF. Track
                                                                from Excel. Takes 3 hours.         open rate.)

Week 2:              Collection notes                 😤 Frustrated Calls top 10 overdue             (Proposed: system
Phone follow-ups                                               customers. Spends 30 min           shows last contact
                                                                finding contact info.              date, notes, escalation
                                                                One customer claims they           level per W-07.)
                                                                already paid — Binh                (Proposed: mark payment
                                                                must dig through bank              receipt from customer,
                                                                statements to verify.               auto-allocate.)

Week 3:              Credit check                     😡 Frustrated Sales manager asks: "Can we       (Proposed: system
Escalation                                                     extend credit to Customer X?"      shows credit limit,
                                                                Binh has to manually               current outstanding,
                                                                check all invoices + payments.      aging, payment history.
                                                                Takes 20 minutes per customer.     One-screen view.)

Week 4:              So chi tiet                      😊 Satisfied End-of-month: finally prints        (Proposed: system generates
Month-end close                                               statements for all customers.       all statements one-click.
                                                                Mails to those who require         Auto-archive for 5-year
                                                                physical copies. Archival          retention per Dieu 41.)
                                                                in file cabinet.
```

### Key Requirements for Binh

| Need | Requirement ID | Priority |
|------|---------------|----------|
| AR aging report with bucket analysis | UC-05, T-07 | P0 |
| Auto payment reminders (email) | W-07 (escalation levels) | P1 |
| Collection management (notes, tracking) | W-07 | P1 |
| Customer credit limit checking | UC-01 (exception path: credit limit) | P0 |
| Customer statement generation | UC-12, T-09 | P0 |
| So chi tiet export | UC-12, DF-08 | P0 |

---

## J-03: Chief Accountant Reviewing Debt Aging (Ke toan truong)

**Persona:** Le Van Cuong — Chief Accountant (Ke toan truong)

- **Role:** Ke toan truong at construction company (300 employees, complex AR/AP with subcontractors)
- **Experience Level:** 20+ years, CPA Vietnam, previously auditor at Big 4
- **Daily Tasks:**
  - Review and approve invoices and payments created by AR/AP accountants
  - Sign off on bad debt provisions at year-end
  - Review aging reports for management meetings
  - Ensure compliance with VAS, TT 99/2025, TT 48/2019
  - Approve AR/AP offsets for related parties
- **Goals:**
  - Ensure AR/AP sub-ledgers match GL at all times
  - Identify risky receivables before they become bad debts
  - Optimize payment timing (pay before penalty, not too early)
  - Maintain clean audit trail for external auditors
- **Pain Points:**
  - Cannot trust sub-ledger numbers — often finds discrepancies with GL
  - Bad debt provision is done in Excel — hard to trace methodology
  - Approval workflow is email-based — no formal SoD enforcement
  - No dashboard showing key AR/AP metrics

### Journey: Month-End AR/AP Review

```
Phase                Touchpoints                     Emotion     Cuong's Actions                  System Responses
─────                ───────────                     ───────     ─────────────                    ───────────────

Day 1:              AR Aging Dashboard               😐 Neutral  Opens system to review.           No dashboard exists.
Review AR                                                     Currently: receives Excel           (Proposed: dashboard with
                                                              from AR accountant via email.        total AR, overdue %,
                                                              3 tabs: summary, detail, old         aging trend chart,
                                                              invoices > 180 days.                 high-risk flagging.)

Day 1:              AP Aging Dashboard               😐 Neutral  Reviews AP aging.                 (Proposed: dashboard
Review AP                                                     Checks: are we delaying              shows AP by due date
                                                              payments too much? Any              buckets, cash flow
                                                              critical suppliers overdue?          forecast, critical alerts.)

Day 2:              Reconciliation check              😤 Frustrated Compares AR total against        (Proposed: system
GL vs Sub-ledger                                               GL 131 balance. Finds               auto-compares. DF-07
                                                              2.1B AR vs 2.05B GL 131.            step checks: AR total =
                                                              50M discrepancy. Must trace:         Sum(BalanceDue) from
                                                              was an invoice posted but not        Invoice table vs GL
                                                              GL'd? Or GL'd but not invoiced?      131 balance. Flag
                                                              Takes 4 hours to find.               discrepancies instantly.)

Day 2:              Provision calculation              😌 Satisfied  Year-end provision due.            (Proposed: system calculates
Provision check                                                 Currently: AR accountant            automatically per
                                                                sends Excel with aging buckets,     TT 48/2019 rates.
                                                                rates applied, pro-forma.            Auto-generates
                                                                Cuong reviews, adjusts some         provision schedule
                                                                rates manually, signs PDF.           (T-10). One-click
                                                                                                    approval + GL posting.)

Day 3:              Approval queue                    😊 Satisfied Approves 12 pending invoices       (Proposed: approval queue
Invoice approval                                                and 5 pending payments.             with SoD check:
                                                                Verifies creator != approver         creator != approver
                                                                manually.                           enforced automatically.
                                                                                                    Digital signature for
                                                                                                    legally binding approval.)
```

### Key Requirements for Cuong

| Need | Requirement ID | Priority |
|------|---------------|----------|
| AR/AP dashboard with key metrics | UC-05, UC-06 | P0 |
| GL vs sub-ledger reconciliation check | DF-07 (month-end close) | P0 |
| Bad debt provision auto-calculation | UC-09, W-04, T-10 | P0 |
| Approval queue with SoD enforcement | BR-07.1 (creator != approver) | P0 |
| Audit trail for all dept transactions | BR-07.6, `docs/brd/17-dept-module-brd.md` Sec 5.2 | P0 |
| Write-off approval workflow | UC-10, BR-07.5 | P1 |

---

## J-04: Sales Manager Checking Customer Credit (Truong phong kinh doanh)

**Persona:** Pham Thi Dung — Sales Manager (Truong phong kinh doanh)

- **Role:** Truong phong kinh doanh at distribution company
- **Experience Level:** 12 years in sales, not an accountant
- **Daily Tasks:**
  - Approve credit sales for new/existing customers
  - Check customer payment history before extending credit
  - Review customer profitability (margin analysis)
  - Negotiate payment terms with key customers
- **Goals:**
  - Quick credit check before closing a deal (within 2 minutes)
  - Understand which customers are high-risk vs low-risk
  - Know which customers always pay late
  - Have visibility into customer AR status without bothering accounting
- **Pain Points:**
  - Must email AR accountant to ask: "Can we sell to Customer X?"
  - Response takes 30 minutes to 2 hours — loses sales momentum
  - No visibility into customer payment history
  - Once extended credit to a customer who was 90+ days overdue on existing invoices

### Journey: Credit Check Before Closing Deal

```
Phase                Touchpoints                     Emotion     Dung's Actions                   System Responses
─────                ───────────                     ───────     ─────────────                    ───────────────

Sales Call           Customer inquiry                 😊 Happy   Customer wants to place            No credit check
(Real-time)                                                    500M VND order on credit.          available.
                                                                Dung needs to know:                Must call or email
                                                                - Is customer under credit limit?  AR accountant.
                                                                - Any overdue invoices?            Response delay:
                                                                - Payment history?                  30 min to 2 hrs.

Workaround           Email to AR team                 😤 Frustrated Emails Binh: "Credit check        Binh responds with
                                                    for Customer X, please."                 screenshot from Excel.
                                                                                                Takes 30 min.

Deal lost            Customer calls competitor         😡 Angry   Customer calls back:              Lost sale due to delay.
                                                                "We found another supplier.        System could have auto-
                                                                Your competitor offers              responded: credit limit
                                                                faster delivery and credit."         available, no overdue,
                                                                                                    limit: 800M. Proceed.

Post-mortem          Sales meeting                    😞 Disappointed Dung raises issue in weekly     (Proposed: self-service
                                                                  meeting: "Lost 500M deal           credit check portal
                                                                  because we couldn't check           or API in CRM.
                                                                  credit fast enough."               Real-time AR status
                                                                                                    per customer.)
```

### Key Requirements for Dung

| Need | Requirement ID | Priority |
|------|---------------|----------|
| Real-time customer credit check (self-service) | UC-01 (credit limit validation) | P1 |
| Customer payment history view | UC-12 (customer statement) | P1 |
| Alert when customer exceeds credit limit | BR-01.3 (credit limit) | P1 |
| Read-only access to AR aging (limited scope) | UC-05 (filtered view) | P2 |

---

## J-05: Supplier Sending Statement for Reconciliation (Nha cung cap)

**Persona:** Cong ty XYZ — Supplier (Nha cung cap)

While not a direct system user, the supplier interacts through statements, inquiries, and payment receipts.

- **Role:** Supplier providing raw materials to the company
- **Interaction Points:**
  - Sends monthly statements with invoices listed
  - Calls to check payment status
  - Sends payment reminders
  - Receives payments via bank transfer
- **Goals:**
  - Get paid on time (within agreed terms)
  - Quick resolution of invoice discrepancies
  - Clear communication on payment status
- **Pain Points:**
  - Company often delays payment without notice
  - Disputed invoices take weeks to resolve
  - No supplier portal to check payment status

### Journey: Monthly Statement Submission and Reconciliation

```
Phase                Touchpoints                     Emotion     Supplier Actions                  Company System Response
─────                ───────────                     ───────     ──────────────────                ──────────────────────

Day 1:              Email statement                  😐 Neutral  XYZ's accountant prepares          System (proposed):
Statement                                                 monthly statement PDF:                Import supplier statement
Submission                                                 "Statement for July 2026:             PDF/CSV automatically.
                                                          Opening: 150M, Invoices: 200M,        UC-08 alternative path.
                                                          Payments: 180M, Closing: 170M."       Auto-match against
                                                          Emails to company's AP team.          system records.

Day 3:              Phone call                        😤 Frustrated No response after 3 days.           (Proposed: auto-
Payment inquiry                                                       Calls AP accountant.               acknowledgement.
                                                                      "Did you receive our              Payment status:
                                                                      statement? Any issues?"           real-time view.
                                                                      AP: "We're reviewing."           Portal for supplier:
                                                                                                       upcoming payments,
                                                                                                       invoice status.)

Day 10:             Payment received                  😌 Relieved Receives 120M bank transfer.       (Proposed: system sends
                                                                      Partial payment, not full        remittance advice
                                                                      170M closing balance.             automatically with
                                                                      Must call to find out            payment allocation
                                                                      which invoices were paid.        details.)
```

### Key Requirements for Supplier Interaction

| Need | Requirement ID | Priority |
|------|---------------|----------|
| Supplier statement import/entry | UC-08 (alternative: import) | P1 |
| Payment remittance advice (auto) | UC-04 (post-condition: notification) | P1 |
| Dispute tracking for invoices | UC-08 (exception: disputed invoice) | P2 |
| Supplier portal (future) | — | P3 |

---

## J-06: Month-End Closing of AR/AP (Ke toan tong hop)

**Persona:** Hoang Van Em — General Accountant (Ke toan tong hop)

- **Role:** Ke toan tong hop at service company
- **Experience Level:** 10 years, responsible for period-end closing and financial statements
- **Daily Tasks:**
  - Oversee month-end closing across all modules (not just dept)
  - Ensure all sub-ledgers match GL
  - Prepare trial balance after close
  - Coordinate with AR and AP accountants to resolve discrepancies
- **Goals:**
  - Close books within 5 working days of month end
  - Zero discrepancies between sub-ledger and GL
  - Complete audit trail for statutory reporting
  - Reduce manual checking and reconciliation effort
- **Pain Points:**
  - Current close takes 7-10 days (target: 5 days)
  - AR/AP discrepancies are the #1 cause of delay
  - Manual checking: runs SQL queries against raw database
  - No close checklist — steps are tribal knowledge

### Journey: Month-End Close (Days 1-5)

```
Phase                Touchpoints                     Emotion     Em's Actions                      System Responses
─────                ───────────                     ───────     ─────────────                    ───────────────

Day 1:              Close preparation                 😐 Neutral  Sends email to all department:     System (proposed):
Pre-close                                                     "All invoices and payments          Auto-block new entries
                                                              must be posted by end of day."      for the closed period.
                                                                                                  Show pending items
                                                                                                  count dashboard.

Day 2:              Verification                      😤 Frustrated Runs AR vs GL 131 check.            Proposed (DF-07):
Cross-check AR/AP                                              Finds difference:                    One-click verification:
                                                                  AR total: 3.2B                    System shows:
                                                                  GL 131 balance: 3.15B              AR = 3.2B, GL 131 = 3.15B
                                                                  Difference: 50M                    Difference: 50M
                                                                                                  Drill down into cause:
                                                                                                  - 2 invoices posted but
                                                                                                    GL entry pending?
                                                                                                  - GL entry orphaned?

Day 3:              Cross-check AP                      😐 Neutral  AP vs GL 331 check.               Same automated
Reconciliation                                                      All matched this month.           verification.

Day 4:              Provision and reports             😊 Satisfied  Year-end: runs provision.           System generates:
Report generation                                                   Generates reports.                 - So chi tiet (S03b-DN)
                                                                                                     - Provision schedule (T-10)
                                                                                                     - Aging reports (T-07, T-08)
                                                                                                     - All one-click

Day 5:              Sign-off                          😊 Satisfied  Final check: signs digital           System generates close
Close complete                                                     close certificate. Period         certificate with:
                                                                    is locked for dept                 - Date/time of close
                                                                    transactions.                      - User who closed
                                                                                                     - Count of posted documents
                                                                                                     - Hash of period data
                                                                                                     - All reports archived
                                                                                                       per Dieu 41, 5-year
                                                                                                       retention
```

### Key Requirements for Em

| Need | Requirement ID | Priority |
|------|---------------|----------|
| Month-end close workflow with checklist | W-08 (month-end AR/AP closing) | P0 |
| AR vs GL 131 auto-verification | DF-07 (month-end close data flow) | P0 |
| AP vs GL 331 auto-verification | DF-07 | P0 |
| Period lock for dept transactions | W-08 Step 1 (block new entries) | P0 |
| One-click report generation | UC-12, T-07, T-08, T-09 | P0 |
| Close certificate with audit trail | W-08 final step | P1 |
| 5-year archival compliance | `docs/brd/17-dept-module-brd.md` Sec 3 (Luat Ke toan Dieu 41) | P1 |

---

## Summary: Persona-Role Mapping

| Persona | System Role | Key UC | Key Workflow | Key Template |
|---------|-------------|--------|-------------|--------------|
| Nguyen Van An | Ke toan cong no (AP) | UC-03, UC-04, UC-08 | W-02, W-08 | T-04, T-06, T-08 |
| Tran Thi Binh | Ke toan cong no (AR) | UC-01, UC-02, UC-05, UC-12 | W-01, W-07 | T-03, T-05, T-07, T-09 |
| Le Van Cuong | Ke toan truong | UC-09, UC-10, UC-11 | W-03, W-04, W-06 | T-07, T-10 |
| Pham Thi Dung | Sales Manager | UC-01 (credit check) | W-01 (read-only) | T-09 (portal view) |
| Cong ty XYZ | Supplier (external) | UC-08 (statement) | W-05 (reconciliation) | T-09 (supplier view) |
| Hoang Van Em | Ke toan tong hop | All UC (review) | W-08 (month-end close) | T-07, T-08, T-09 |

See full use case definitions in `docs/brd/18-dept-use-cases.md`, workflows in `docs/brd/19-dept-workflows.md`, business rules in `docs/brd/20-dept-business-rules.md`, data flows in `docs/brd/21-dept-data-flows.md`, and templates in `docs/brd/22-dept-templates.md`.
