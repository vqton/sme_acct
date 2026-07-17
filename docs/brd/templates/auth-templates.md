---
title: "Templates — Authentication & Authorization"
author: "Lead BA + Chief Accountant"
date: 2026-07-16
tags:
  - templates
  - authentication
  - authorization
  - compliance
---

# Templates for Authentication & Authorization Module

## T01: Login Audit Record

| Field | Type | Required | Description |
|---|---|---|---|
| Id | GUID | Yes | Primary key |
| UserId | GUID | No | Null for anonymous attempts |
| Username | nvarchar(256) | Yes | Attempted username |
| IpAddress | nvarchar(45) | Yes | Remote IP (supports IPv6) |
| DeviceInfo | nvarchar(512) | No | User-Agent / device fingerprint |
| Result | enum(LoginResult) | Yes | Success/InvalidCredentials/AccountLocked/AccountInactive/MfaRequired |
| AttemptedAt | datetime | Yes | UTC timestamp |
| FailureReason | nvarchar(256) | No | Reason code for failure |

**Current Implementation:** SmeAccounting.Domain.Security.LoginAttempt

**Regulatory Compliance:** Circular 99/2025/TT-BTC Art.28 — all corrections/attempts must leave audit trail

## T02: JWT Access Token Payload

| Claim | Type | Source | Example |
|---|---|---|---|
| sub | string | User.Id | "a1b2c3d4-..." |
| email | string | User.Email | "user@company.com" |
| unique_name | string | User.Username | "nguyen.van.a" |
| jti | string | Generated | "unique-token-id" |
| username | string | User.Username | "nguyen.van.a" |
| role | string[] | User.Roles | ["KeToan", "KeToanTruong"] |
| permission | string[] | Role.Permissions | ["GL_JOURNAL:View", "GL_JOURNAL:Create"] |
| iat | long | Generated | 1721123456 (Unix timestamp) |
| nbf | long | Generated | 1721123456 |
| exp | long | Generated | 1721124356 |
| iss | string | Configuration | "SmeAccounting" |
| aud | string | Configuration | "SmeAccountingClients" |

**Security Notes:**
- Never include password hash, MFA secret, or PII beyond email
- Token size should stay under 8KB (large permission sets impact perf)
- For large permission sets (>50), consider claim compression or reference tokens

## T03: Refresh Token Record

| Field | Type | Required | Description |
|---|---|---|---|
| Id | GUID | Yes | Primary key |
| Token | nvarchar(256) | Yes | Base64-encoded 64 random bytes |
| JwtId | nvarchar(64) | Yes | JWT ID of parent access token |
| UserId | GUID | Yes | FK to Users |
| ExpiresAt | datetime | Yes | UTC expiration |
| RevokedAt | datetime | No | UTC revocation timestamp |
| ReplacedByToken | nvarchar(256) | No | Token rotation chain |
| DeviceInfo | nvarchar(512) | No | Original device |
| IpAddress | nvarchar(45) | No | Original IP |

**Current Implementation:** SmeAccounting.Domain.Security.RefreshToken

## T04: Session Settings (Per Company)

| Field | Type | Default | Description |
|---|---|---|---|
| CompanyId | GUID | — | FK to Companies |
| AccessTokenExpiryMinutes | int | 15 | Access token lifetime |
| RefreshTokenExpiryDays | int | 7 | Refresh token lifetime |
| MaxConcurrentSessions | int | 3 | Max simultaneous sessions |
| EnforceSessionTimeout | bool | true | Enable/disable session enforcement |

**Current Implementation:** SmeAccounting.Domain.Entities.SessionSettings

## T05: Company Password Policy

| Field | Type | Default | Validation |
|---|---|---|---|
| CompanyId | GUID | — | FK to Companies |
| MinLength | int | 8 | 8-64 |
| MaxLength | int | 128 | 8-256 |
| RequireUppercase | bool | true | At least 1 A-Z |
| RequireLowercase | bool | true | At least 1 a-z |
| RequireDigit | bool | true | At least 1 0-9 |
| RequireSpecialChar | bool | true | At least 1 !@#$% etc |
| MaxLoginAttempts | int | 5 | 3-10 |
| LockoutMinutes | int | 15 | 5-1440 |
| PasswordHistoryCount | int | 5 | 3-24 |

**Regulatory Compliance:** Circular 99/2025/TT-BTC requires password controls

## T06: Feature Permission Matrix Template

| Feature Code | Feature Name | Module | View | Create | Edit | Delete | Print | Export | Approve |
|---|---|---|---|---|---|---|---|---|---|
| GL_JOURNAL | Journal Entry | GL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| GL_ACCOUNT | Chart of Accounts | GL | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| AP_INVOICE | AP Invoice | AP | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| AR_INVOICE | AR Invoice | AR | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| CASH_BANK | Cash & Bank | CASH | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| FIXED_ASSET | Fixed Assets | FA | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TAX_DECLARE | Tax Declaration | TAX | ✓ | ✓ | — | — | ✓ | ✓ | ✓ |
| REPORT_GL | GL Reports | RPT | ✓ | — | — | — | ✓ | ✓ | — |
| REPORT_BS | Balance Sheet | RPT | ✓ | — | — | — | ✓ | ✓ | — |
| REPORT_IS | Income Statement | RPT | ✓ | — | — | — | ✓ | ✓ | — |
| ADMIN_USER | User Management | ADMIN | ✓ | ✓ | ✓ | ✓ | — | — | — |
| ADMIN_ROLE | Role Management | ADMIN | ✓ | ✓ | ✓ | ✓ | — | — | — |
| ADMIN_AUDIT | Audit Log | ADMIN | ✓ | — | — | — | — | ✓ | — |
| WORKFLOW_APPR | Approval Workflow | WKF | ✓ | ✓ | ✓ | ✓ | — | — | NA |

**Note:** This is a proposed matrix. The current system has Feature entity with Code/Name/Module/SortOrder but no seed data defined.

## T07: SoD Conflict Matrix Template

| Role A | Role B | Conflict Reason |
|---|---|---|
| GL Accountant (Ghi sổ) | GL Approver (Duyệt) | Creator cannot approve own entries |
| AP Clerk (Nhập hóa đơn) | AP Approver (Duyệt) | Creator cannot approve own invoices |
| AR Clerk (Nhập hóa đơn) | AR Collector (Thu tiền) | Separation of invoice creation from collection |
| Cashier (Thủ quỹ) | Accountant (Kế toán) | Physical custody vs record keeping |
| Payroll Processor (Lương) | Payroll Approver (Duyệt) | Creator cannot approve payroll |
| System Admin (Quản trị) | Any accounting role | Admin cannot perform accounting functions |
| Audit (Kiểm toán) | Any operational role | Auditor must be independent |

**Current Status:** SoD engine NOT IMPLEMENTED — this is a CRITICAL gap for regulatory compliance.

## T08: Regulatory Compliance Checklist

| Requirement | Source | Status | Target |
|---|---|---|---|
| Digital signature for e-invoices | Decree 123/2020/ND-CP | ❌ Mock only | P0 |
| VNeID Level 2 biometric | Official Letter 3078/CT-NVT | ❌ Mock only | P0 |
| Corporate e-ID authentication | National Portal directive | ❌ Missing | P0 |
| MFA enforcement | Decree 165/2018/ND-CP | ❌ Not enforced | P0 |
| Audit trail for all corrections | Circular 99/2025/TT-BTC Art 28 | ⚠️ Partial | P1 |
| Segregation of duties | Circular 99/2025/TT-BTC | ❌ Missing | P1 |
| Data encryption (field-level) | Law on Data 60/2024 | ❌ Missing | P1 |
| E-invoice data format compliance | Law on Tax Admin 108/2025 | ❌ Missing | P2 |
| Connectivity with e-invoice software | Circular 99/2025/TT-BTC Art 28 | ❌ Missing | P2 |
| Upgradeable for regulatory changes | Circular 99/2025/TT-BTC Art 28 | ⚠️ Configurable rules engine | P3 |
| Detection of data manipulation | Circular 99/2025/TT-BTC Art 28 | ⚠️ DataIntegrityChecker exists | P1 |

## T09: Security Incident Response Template

| Phase | Action | Responsible | Timeline |
|---|---|---|---|
| Detection | Monitor auth logs for anomalies (brute force, geo-anomaly) | System | Real-time |
| Triage | Analyze suspicious pattern, determine severity | Security team | 15 min |
| Containment | Force logout all sessions, temporarily disable account | Admin | 5 min |
| Investigation | Review LoginAttempt audit trail, IP logs | Security + BA | 2h |
| Remediation | Rotate credentials, update IP whitelist | Admin | 30 min |
| Notification | Inform affected users, regulatory notification if required | Compliance | Per regulatory timeline |
| Post-mortem | Document incident, update controls | Security | 1 week |

**Regulatory Requirement:** Law on Cybersecurity 2018 Art. 22 — incident response plan mandatory
