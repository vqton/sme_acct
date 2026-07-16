# Templates — User Management Module

---

## T-01: User Registration Form

```
====================================================================
                USER REGISTRATION FORM
====================================================================

Company: _________________________________ Company Tax ID: _________

--- PERSONAL INFORMATION ---
Username:       ___________________________
Email:          ___________________________
First Name:     ___________________________
Last Name:      ___________________________
Phone:          ___________________________

--- ROLE ASSIGNMENT ---
Primary Role:   [Dropdown: Chief Accountant / General Accountant /
                           Tax Accountant / AP Accountant /
                           AR Accountant / Inventory Accountant /
                           Payroll Accountant / Cashier / Admin]

Additional Roles: [Multi-select list]

--- ORGANIZATION UNIT ---
Org Unit:       [Dropdown: hierarchy of company org units]

--- PERMISSIONS (auto-derived from role, can override) ---
Feature         | View | Create | Edit | Delete | Print | Export | Approve
----------------|------|--------|------|--------|-------|--------|--------
General Ledger  | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Accounts Receiv.| [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Accounts Payable| [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Fixed Assets    | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Inventory       | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Payroll         | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Tax             | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Reports         | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]
Admin           | [_]  | [_]    | [_]  | [_]    | [_]  | [_]    | [_]

--- SECURITY SETTINGS ---
MFA Required:           [Yes / No]
Session Timeout (min):  [____] (default: 15)
Max Login Attempts:     [____] (default: 5)

--- STATUS ---
Active:         [Yes / No]

Created by:     ___________________
Date:           ___________________

====================================================================
```

## T-02: User Audit Log Report

```
====================================================================
                  USER AUDIT LOG REPORT
                  Period: ___ to ___
====================================================================

Date/Time          | User         | Action        | Resource     | IP Address   | Details
-------------------|--------------|---------------|--------------|--------------|--------
2026-07-16 08:30   | nguyen.van.a | Login Success  | Auth         | 192.168.1.10 | -
2026-07-16 08:35   | nguyen.van.a | Create JEntry  | GL           | 192.168.1.10 | JEntry #1234
2026-07-16 09:00   | tran.thi.b   | Login Failed   | Auth         | 10.0.0.5     | Invalid password
2026-07-16 09:01   | tran.thi.b   | Login Failed   | Auth         | 10.0.0.5     | Invalid password
2026-07-16 09:02   | tran.thi.b   | Account Locked | Auth         | 10.0.0.5     | 5/5 attempts
2026-07-16 09:15   | admin        | Unlock User    | Admin        | 192.168.1.1  | Unlocked tran.thi.b
2026-07-16 10:00   | le.van.c     | Correction     | GL           | 192.168.2.50 | JEntry #1230 (10M->12M)
2026-07-16 14:00   | system       | Token Expired  | Auth         | -            | Refresh token cleanup

--- SUMMARY ---
Total Users:          25
Active Users:         22
Locked Accounts:      1
Disabled Accounts:    2
Failed Logins Today:  8
Successful Logins:    45
Corrections:          3

====================================================================
```

## T-03: Tax Declaration Permission Template

```
====================================================================
        TAX DECLARATION PERMISSION AUTHORIZATION FORM
====================================================================

Company Name:    _________________________________
Tax ID (MST):    _________________________________

--- LEGAL REPRESENTATIVE ---
Full Name:       _________________________________
VNeID Account:   _________________________________
ID/CCCD:         _________________________________

--- AUTHORIZED ACCOUNTANT ---
Full Name:       _________________________________
VNeID Account:   _________________________________
ID/CCCD:         _________________________________
Email:           _________________________________
Phone:           _________________________________

--- PERMISSIONS GRANTED ---
[_] Tờ khai thuế GTGT (VAT Declaration)
[_] Tờ khai thuế TNDN (CIT Declaration)
[_] Tờ khai thuế TNCN (PIT Declaration)
[_] Tờ khai thuế môn bài (License Tax)
[_] Báo cáo tài chính (Financial Statements)
[_] Hóa đơn điện tử (E-Invoice)
[_] Hoàn thuế (Tax Refund)
[_] Nộp thuế (Tax Payment)

--- VALIDITY ---
From: ___/___/2026      To: ___/___/2026

--- AUTHORIZATION ---
Legal Representative Signature: _______________
Date: ___/___/2026

Accountant Acknowledgment: ___________________
Date: ___/___/2026

====================================================================
```

## T-04: Compliance Checklist (Periodic)

```
====================================================================
          REGULATORY COMPLIANCE CHECKLIST
                Period: Q__/2026
====================================================================

Company: _________________________________   Date: _______________

A. USER MANAGEMENT
[_] All users have appropriate roles assigned
[_] No orphaned users (no role)
[_] No shared accounts
[_] Chief Accountant assigned
[_] Segregation of duties: Creator != Approver
[_] Temporary/inactive users disabled
[_] Departing employees removed within 24h

B. ACCESS SECURITY
[_] Passwords meet policy (8+ chars, mixed case, digit, special)
[_] MFA enabled for admin/chief accountant
[_] Failed login lockout configured
[_] Session timeout configured
[_] IP whitelist active (if applicable)

C. AUDIT TRAIL
[_] All corrections logged with original values
[_] Modifications traceable to user + timestamp
[_] No silent data modifications detected
[_] Audit logs backed up

D. TAX COMPLIANCE
[_] VNeID accounts active for tax e-transactions
[_] Digital signatures valid and unexpired
[_] E-invoice connection to tax authority active
[_] Tax declarations filed on time

E. DATA RETENTION
[_] Accounting records retained >= 5 years
[_] Tax records retained >= 10 years
[_] User audit logs retained >= 2 years
[_] Data backup configured and tested

PREPARED BY: ___________________   DATE: _______________
REVIEWED BY: ___________________   DATE: _______________
(Chief Accountant)

====================================================================
```

## T-05: User Role Definition Template

```
====================================================================
                    ROLE DEFINITION
====================================================================

ROLE NAME:        _________________________________
DESCRIPTION:      _________________________________
COMPANY:          _________________________________
IS SYSTEM ROLE:   [Yes / No]
PARENT ROLE:      [Dropdown / None]

--- ASSIGNED FEATURES ---
Feature                  | Access Level
-------------------------|----------------------
Quản lý sổ quỹ          | [________________]
Quản lý ngân hàng        | [________________]
Mua hàng                 | [________________]
Bán hàng                 | [________________]
Kho                      | [________________]
Tài sản cố định          | [________________]
Tiền lương               | [________________]
Giá thành                | [________________]
Tổng hợp                 | [________________]
Thuế                     | [________________]
Báo cáo                  | [________________]

Access Level: View / Create+View / Full / None

--- USERS ASSIGNED ---
1. _______________________________
2. _______________________________
3. _______________________________

CREATED BY:  ___________________   DATE: _______________
APPROVED BY: ___________________   DATE: _______________
(Chief Accountant)

====================================================================
```
