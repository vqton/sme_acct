# User Journeys — User Management Module

---

## Journey J-01: New Accountant Onboarding

**Persona:** Nguyễn Văn A — Newly hired General Accountant at SME

**Goal:** Get access to accounting system, start working

```
Day 1: Welcome
  - HR notifies admin about new hire
  - Admin creates account in system
  - Admin assigns role: Kế toán tổng hợp (General Accountant)
  - Admin assigns Org Unit: Phòng Kế toán
  - System sends email to Nguyen Van A
        Subject: Your SmeAccounting account
        Content: Username, temp password, login URL

Day 1: First Login
  - Nguyen Van A opens login URL
  - Enters temp password
  - System forces password change
  - Nguyen sets new password (must meet policy)
  - Nguyen completes MFA setup (optional)
  - Dashboard shows: General Ledger, AP, AR modules

Day 1-7: Learning
  - Nguyen explores system
  - Creates first journal entry
  - Realizes needs "Print" permission for reports
  - Submits request to Chief Accountant
  - Chief Accountant adjusts permissions

Day 30: Full Productivity
  - Nguyen can create, edit, print entries
  - Cannot approve (Chief Accountant only)
  - Can export reports for tax filing
  - Working efficiently
```

## Journey J-02: Chief Accountant Monthly Review

**Persona:** Trần Thị B — Chief Accountant, 15 years experience

**Goal:** Verify accounting data integrity before monthly close

```
Step 1: Login
  - MFA required (2FA via authenticator app)
  - Dashboard shows pending approvals (5)

Step 2: Review Pending Corrections
  - Checks correction #1: Journal entry 1230, Amount 10M->12M
  - Verifies correction reason: "Adj for invoice #789"
  - Checks supporting document attached
  - Approves correction

Step 3: Review Audit Trail
  - Runs audit log for current period
  - Checks all modifications traceable
  - No silent deletions detected

Step 4: Generate Compliance Report
  - System generates compliance checklist
  - All items verified
  - Signs off digitally

Step 5: Month-End Close
  - Verifies all entries posted
  - Verifies no unapproved corrections pending
  - Initiates month-end close
  - Dual approval process: Chief Accountant approves, Director reviews
```

## Journey J-03: Tax Accountant Filing VAT Return

**Persona:** Lê Văn C — Tax Accountant, 5 years experience

**Goal:** File monthly VAT declaration to tax authority

```
Pre-requisites:
  - Company VNeID: Active
  - Legal rep: Verified
  - Digital signature: Valid
  - eTax connection: Active

Step 1: Prepare Data
  - Runs VAT summary report from accounting system
  - Reviews input/output VAT
  - Verifies e-invoice data matches system

Step 2: Generate Tax Declaration
  - System generates XML file per Tổng cục Thuế format
  - Pre-fills data from GL accounts (3331, 133)

Step 3: Sign Digitally
  - Opens eSigner (Tổng cục Thuế software)
  - Selects company digital certificate
  - Enters PIN
  - System applies signature

Step 4: Submit to Tax Authority
  - Transmits signed XML via T-VAN
  - Receives receipt from tax system
  - Stores receipt in system

Step 5: Confirm Payment
  - System shows amount due
  - Generates payment order
  - Submits to bank for payment
  - Records payment confirmation
```

## Journey J-04: Legal Representative — VNeID Setup

**Persona:** Phạm Văn D — Company Director / Legal Representative

**Goal:** Enable company for electronic tax transactions

```
Step 1: Get VNeID Level-2
  - Goes to police station or uses app
  - Verifies identity with CCCD gắn chip
  - Gets Level-2 eID account

Step 2: Register Organization eID
  - Logs into VNeID
  - Selects "Định danh tổ chức"
  - Enters company info: Tax ID, name, address
  - Info must match ĐKKD + tax registration exactly

Step 3: Add Tax Accountant as Member
  - In VNeID, selects "Thêm thành viên"
  - Enters accountant's info
  - Accountant receives notification

Step 4: Grant Tax Permissions
  - In VNeID, selects "Phân quyền giao dịch trực tuyến"
  - Ticks "TCT" (Tax Transaction)
  - Confirms delegation

Step 5: Notify System
  - Informs system admin about VNeID setup
  - Admin records VNeID info in company profile
  - E-tax integration activated
```
