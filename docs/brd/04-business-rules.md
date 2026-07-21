# Business Rules — User Management Module

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft

---

## BR-01: Account Security Rules

| Rule ID | Rule | Source Code Location | Implemented | Notes |
|---|---|---|---|---|
| BR-01.1 | Password min 8 characters | `AuthService.ts:59` | YES | `PASSWORD_RULES.minLength = 8` |
| BR-01.2 | Password must contain ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char | `AuthService.ts:60-63` | YES | Regex checks per type |
| BR-01.3 | Cannot reuse last 5 passwords | `AuthService.ts:390-395` | YES | `PASSWORD_HISTORY_LIMIT = 5`, bcrypt-compared |
| BR-01.4 | Account locks after 5 failed login attempts | `AuthService.ts:187-197` | YES | `LOCKOUT_THRESHOLD = 5` |
| BR-01.5 | Lockout duration: 30 minutes | `AuthService.ts:68` | YES | `LOCKOUT_DURATION_MS = 30 * 60 * 1000` |
| BR-01.6 | JWT access token: 15-minute expiry (HS256) | `jwt.ts:4` | YES | `JWT_EXPIRES_IN = '15m'` |
| BR-01.7 | Refresh token: 7-day expiry, SHA-256 hashed storage | `AuthService.ts:66` | YES | `REFRESH_TOKEN_DAYS = 7` |
| BR-01.8 | Token rotation on refresh | `AuthService.ts:354` | YES | Old token revoked before new one issued |
| BR-01.9 | Rate limiting: 5 login attempts per 15min per IP | `rateLimiter.ts:24-27` | YES | `windowMs=15min, maxAttempts=5` |
| BR-01.10 | bcrypt password hashing, 10 salt rounds | `AuthService.ts:141` | YES | `bcrypt.hashSync(password, 10)` |
| BR-01.11 | Password reset token: 1-hour expiry | `AuthService.ts:70` | YES | `RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000` |
| BR-01.12 | Password change + reset revokes ALL active sessions | `AuthService.ts:408,537` | YES | Forces re-login on all devices |
| BR-01.13 | Configurable session idle timeout | N/A | NO | Must be implemented per company |
| BR-01.14 | IP whitelist / geo-restriction | N/A | NO | Must be implemented |
| BR-01.15 | Device fingerprinting / trust scoring | N/A | NO | Recommended for suspicious login detection |

**Note:** BR-01.1 through BR-01.12 are hardcoded in `AuthService.ts` and NOT configurable per company. Per-company override requires extending `CompanySettings` entity.

---

## BR-02: Role & Permission Rules (11 Vietnamese Accounting Roles)

| Rule ID | Rule | Source | Implemented | Notes |
|---|---|---|---|---|
| BR-02.1 | Each user assigned ≥1 role via `user_roles` join table | `Role.ts:116-117`, `schema.ts:90-95` | YES | Foreign key to `users.id` with CASCADE delete |
| BR-02.2 | 11 system-defined Vietnamese accounting roles (see table below) | `Role.ts:26-115` | YES | Hardcoded in `ROLES` array |
| BR-02.3 | Roles have permissions via `role_permissions` join table | `schema.ts:97-103` | YES | Many-to-many role→permission |
| BR-02.4 | Permission check: `requirePermission('permission')` Express middleware | `auth.ts:35-48` | YES | Factory returns middleware function |
| BR-02.5 | Compound permission check: `requireAllPermissions([...])` | `auth.ts:51-64` | YES | All must be satisfied |
| BR-02.6 | Permission denied unless explicitly granted (default deny) | `auth.ts:42-45` | YES | Returns 403 if `!hasAnyPermission` |
| BR-02.7 | System admin role ('he-thong') is not an accounting role per Luật Kế toán 2015 | `Role.ts:28-34` | YES | Marked `isSystemRole: true` |
| BR-02.8 | SoD: Creator cannot approve own entries | `SoDConflictMatrix.ts:18-23` | PARTIAL | Check exists but NOT wired into transaction flow |
| BR-02.9 | SoD: Cashier + recording role conflict | `SoDConflictMatrix.ts:25-30` | PARTIAL | Check exists but NOT enforced |
| BR-02.10 | SoD: System admin cannot hold accounting role simultaneously | `SoDConflictMatrix.ts:32-37` | PARTIAL | Check exists but NOT enforced |
| BR-02.11 | Role scoping: roles can be company-specific via `UserCompany.role` | `UserCompany.ts:4` | YES | Optional per-company role override |

### The 11 Vietnamese Accounting Roles

| Role ID | English Name | Vietnamese Name | Permissions | System Role? | Legal Basis |
|---|---|---|---|---|---|
| he-thong | System Admin | Quản trị hệ thống | ALL | YES | Technical role, not accounting |
| giam-doc | Director | Giám đốc | read/create/update/delete/approve | NO | Luật Doanh nghiệp 2020 |
| ke-toan-truong | Chief Accountant | Kế toán trưởng | read/create/update/approve/audit | NO | Luật Kế toán 88/2015 Điều 54-55 |
| ke-toan-tong-hop | General Accountant | Kế toán tổng hợp | read/create/update/report | NO | General ledger responsibility |
| ke-toan-thue | Tax Accountant | Kế toán thuế | read/report | NO | Tax filing role |
| ke-toan-cong-no | AP/AR Accountant | Kế toán công nợ | read | NO | Payables/receivables |
| ke-toan-kho | Inventory Accountant | Kế toán kho | read | NO | Stock management |
| ke-toan-tien-luong | Payroll Accountant | Kế toán tiền lương | read/report | NO | Salary + insurance |
| thu-quy | Cashier | Thủ quỹ | read | NO | Cash custody only |
| ke-toan-vien | Staff Accountant | Kế toán viên | read/create | NO | Data entry, no approve |
| kiem-soat | Controller | Kiểm soát viên | read/report/audit | NO | Independent oversight |

---

## BR-03: Regulatory Compliance Rules

| Rule ID | Rule | Regulation | Implemented | Priority |
|---|---|---|---|---|
| BR-03.1 | All data modifications must have comprehensive audit trail | TT 99/2025/TT-BTC Điều 28 | PARTIAL (auth events only) | CRITICAL |
| BR-03.2 | Data corrections must preserve original values + timestamp | TT 99/2025/TT-BTC Điều 28 | NO | CRITICAL |
| BR-03.3 | System must alert/warn on data manipulation attempts | TT 99/2025/TT-BTC Điều 28 | NO | CRITICAL |
| BR-03.4 | Accounting data retention: minimum 5 years from closing | Luật Kế toán 88/2015 Điều 41 | NO | HIGH |
| BR-03.5 | Tax documents retention: minimum 10 years | Luật Quản lý thuế 38/2019 Điều 34 | NO | HIGH |
| BR-03.6 | E-invoice data must connect to tax authority system | NĐ 254/2026/NĐ-CP | NO | BLOCKER |
| BR-03.7 | Digital signature required for e-tax filing | TT 19/2021/TT-BTC, NĐ 23/2025/NĐ-CP | NO | BLOCKER |
| BR-03.8 | VNeID Level ≥2 required for tax e-transactions | NĐ 69/2024/NĐ-CP (01/07/2025) | NO | BLOCKER |
| BR-03.9 | Biometric verification for legal representatives on e-invoice | Công văn 3078/CT-NVT (15/05/2026) | NO | BLOCKER |
| BR-03.10 | Chart of accounts must follow TT 99/2025 Appendix 1 | TT 99/2025/TT-BTC | PARTIAL | HIGH |
| BR-03.11 | VND amounts: 0 decimal places (not 2) | TT 99/2025/TT-BTC | PARTIAL (schema default=2) | HIGH |
| BR-03.12 | Segregation of duties enforcement in all financial transactions | TT 103/2005/TT-BTC | PARTIAL | HIGH |
| BR-03.13 | Software must be upgradeable for regulatory changes | TT 99/2025/TT-BTC Điều 28 | PARTIAL | MEDIUM |
| BR-03.14 | Provide output data to competent authorities on request | TT 99/2025/TT-BTC Điều 28 | NO | HIGH |

---

## BR-04: Multi-Tenancy Rules (Company Isolation)

| Rule ID | Rule | Implementation | Status |
|---|---|---|---|
| BR-04.1 | Users can be assigned to one or more companies via `UserCompany` | `UserCompany.ts`, `user_companies` table | Implemented |
| BR-04.2 | UserCompany records have `isActive` flag for soft-disable per company | `UserCompany.ts:5` | Implemented |
| BR-04.3 | JWT access tokens carry `companyId` claim for request-scoped access | `jwt.ts:17` | Implemented |
| BR-04.4 | Single-company users auto-select company on login | `AuthService.ts:276-285` | Implemented |
| BR-04.5 | Multi-company users get company picker, no token issued until selection | `AuthService.ts:288-296` | Implemented |
| BR-04.6 | Company selection requires valid `UserCompany` membership with `isActive=true` | `AuthService.ts:314-318` | Implemented |
| BR-04.7 | Refresh tokens are scoped to `companyId` (if selected) | `RefreshToken.ts:4` | Implemented |
| BR-04.8 | Cross-company data access must be prevented at query level | NOT YET ENFORCED | Gap |
| BR-04.9 | Company admin can manage users within their company only | `companyController.ts` uses `authMiddleware` | Partial |
| BR-04.10 | System admin ('he-thong') has cross-company access (technical only) | `Role.ts:28-34` | Implemented |

---

## BR-05: User State Machine (5 States with Transitions)

| State | Description | Entry Condition | Allowed Actions | Exit Condition |
|---|---|---|---|---|
| Created | User record created, `isActive=true` | `register()` or admin create | Login (if active), edit profile | Locked, Disabled, Deleted |
| Active | Normal operating state | Auto after Created | All permitted operations | 5 failed logins → Locked |
| Locked | Login blocked, `lockoutUntil` set | 5 failed attempts | None (wait for unlock) | Time passes OR password reset |
| Disabled | Admin-deactivated, `isActive=false` | Admin action | None | Admin reactivates |
| Deleted | Record removed from `users` table | Admin action (CASCADE) | None | Data purged per retention policy |

**Transitions matrix:**

```
               ┌──────── Enabled ────────┐
               │                         │
          Created ──► Active ◄── Locked  │
               │       │    │            │
               │       │    └──► Deleted │
               │       ▼                 │
               └──► Disabled ──► Deleted │
                         │              │
                         └──► Active     │
                               (reactivate)
```

---

## BR-06: Approval Workflow Rules (Future — Not Implemented)

| Rule ID | Rule | Notes |
|---|---|---|
| BR-06.1 | Journal entries above configurable threshold require approval | Threshold per company setting |
| BR-06.2 | Creator != Approver (SoD enforcement) | `SoDConflictMatrix.checkCreatorApprover()` already defined |
| BR-06.3 | Approval chain: Staff → Chief Accountant → Director | Configurable per company |
| BR-06.4 | Approve/reject with required comment and digital signature | Regulatory requirement |
| BR-06.5 | Rejected entries return to Draft state with rejection reason | User must fix and resubmit |
| BR-06.6 | Escalation: pending approval >3 business days auto-escalates | Optional |
| BR-06.7 | Batch approval allowed for same-type entries | With caution note |
| BR-06.8 | ALL approval actions logged in audit trail | Mandatory per TT 99/2025 |
| BR-06.9 | Chief Accountant cannot self-approve own created entries | Luật Kế toán 88/2015 |

---

## BR-07: Segregation of Duties Rules (Creator != Approver, Cashier != Record, etc.)

| Rule ID | Rule | SoD Type | Enforcement Status |
|---|---|---|---|
| BR-07.1 | User who creates a journal entry cannot approve it | CREATOR_APPROVER | Check defined, not wired |
| BR-07.2 | Cashier (thu-quy) cannot also record accounting entries | CASHIER_RECORDING | Check defined, not wired |
| BR-07.3 | System Admin cannot simultaneously hold accounting role | ADMIN_ACCOUNTING | Check defined, not wired |
| BR-07.4 | Person who approves payment cannot also execute payment | CREATOR_APPROVER | Not defined |
| BR-07.5 | Payroll preparer cannot be payroll approver | CREATOR_APPROVER | Not defined |
| BR-07.6 | Inventory count verifier cannot be inventory recorder | CASHIER_RECORDING | Not defined |
| BR-07.7 | Bank reconciliation preparer must be different from reviewer | CREATOR_APPROVER | Not defined |

**Current state:** `SoDConflictMatrix.ts` defines 3 conflict types with `validateAll()` method. These should be wired into:
- Journal entry creation → approval flow
- User role assignment (block if SoD violated)
- Company admin UI (show warnings when assigning conflicting roles)

---

## BR-08: Audit & Data Retention Rules

| Rule ID | Rule | Regulation | Retention Period |
|---|---|---|---|
| BR-08.1 | Audit logs must capture: userId, action, resource, before/after, IP, timestamp | TT 99/2025 Điều 28 | 10 years |
| BR-08.2 | Accounting vouchers and ledgers | Luật Kế toán 88/2015 Điều 41 | Minimum 5 years |
| BR-08.3 | Annual financial statements | Luật Kế toán 88/2015 Điều 41 | Minimum 5 years |
| BR-08.4 | Tax declarations and supporting documents | Luật Quản lý thuế 38/2019 Điều 34 | Minimum 10 years |
| BR-08.5 | E-invoice records | NĐ 254/2026/NĐ-CP | Minimum 10 years |
| BR-08.6 | Employee payroll and social insurance records | Bộ Luật Lao động | Minimum 5 years |
| BR-08.7 | User accounts and permission history | Security best practice | 3 years after user deletion |
| BR-08.8 | Login/logout audit logs | Security best practice | 2 years |
| BR-08.9 | Refresh tokens (after revocation) | Security best practice | 90 days |

**Implementation status:**
- Audit logging implemented for auth events (`USER_LOGIN`, `LOGOUT`, `PASSWORD_CHANGED`, etc.) but NOT for data corrections
- No auto-purge/cron job for expired records
- SQLite `audit_logs` table has no index on `created_at` for efficient retention queries
- No archive mechanism for old records

---

## Business Rules Cross-Reference

| BR Category | Related UC | Related Workflow | Related Templates |
|---|---|---|---|
| BR-01 Account Security | UC-01, UC-03, UC-04, UC-07 | W-02, W-03, W-06 | T-01, T-06 |
| BR-02 Role & Permission | UC-01, UC-10, UC-11 | W-01, W-07 | T-01, T-03, T-05 |
| BR-03 Regulatory Compliance | UC-11, UC-12, UC-13 | W-07, W-08, W-09 | T-04 |
| BR-04 Multi-Tenancy | UC-09 | W-05 | T-01, T-07 |
| BR-05 User State Machine | UC-01, UC-06, UC-10 | W-01 | T-01 |
| BR-06 Approval Workflow | (future) | (future) | T-03 |
| BR-07 Segregation of Duties | UC-10, UC-11 | W-01, W-07 | T-02, T-05 |
| BR-08 Audit & Data Retention | UC-05, UC-13 | W-08 | T-02, T-04 |
