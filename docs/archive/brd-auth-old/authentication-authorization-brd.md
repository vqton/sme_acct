---
title: "BRD — Authentication & Authorization Module"
author: "Lead BA (20yr) + Chief Accountant (20yr)"
date: 2026-07-16
status: draft
tags:
  - brd
  - authentication
  - authorization
  - security
  - compliance
  - vietnam
---

# Business Requirements Document
## Authentication & Authorization Subsystem — SmeAccounting

## 1. Executive Summary

| Item | Detail |
|---|---|
| System | SmeAccounting — SME accounting webapp for Vietnam market |
| Module | Authentication + Authorization |
| Current Status | Pre-alpha prototype (4/10 backend, 1/10 UI, 0/10 regulatory compliance) |
| PROD Readiness | **NOT PROD-READY** — 17 critical gaps identified |
| Regulatory Risk | Non-compliant with 6 active Vietnamese laws/regulations |

---

## 2. PROD-Readiness Verdict

> **Verdict: REJECTED for Production**
>
> As Lead BA + Chief Accountant with 40 years combined experience: this module will fail regulatory audit, expose the company to legal risk under Luật Giao dịch điện tử 2023 and Nghị định 123/2020/NĐ-CP, and cannot connect to Vietnamese tax/e-invoice systems.

### Critical Blockers (must fix before any production deployment)

| # | Gap | Regulation | Severity |
|---|---|---|---|
| 1 | No digital signature integration with Vietnamese CAs (VNPT-CA, Viettel-CA, BKAV-CA) | Decree 130/2018/ND-CP, Circular 19/2021/TT-BTC | **CRITICAL** |
| 2 | VNeID Level 2 biometric authentication not enforced | Official Letter 3078/CT-NVT (May 2026), Law on Data 60/2024 | **CRITICAL** |
| 3 | Corporate e-ID not supported | National Public Service Portal mandate | **CRITICAL** |
| 4 | MFA not enforced in login flow (MfaEnabled flag exists but unused) | Decree 165/2018/ND-CP | **HIGH** |
| 5 | SMS OTP / Token OTP absent | Circular 19/2021/TT-BTC Article 7 | **HIGH** |
| 6 | E-invoice signing authentication not integrated | Decree 123/2020/ND-CP | **HIGH** |
| 7 | JWT secret in plaintext appsettings.json | Circular 99/2025/TT-BTC Art 28 | **HIGH** |
| 8 | No field-level encryption for financial PII | Law on Data 60/2024, GDPR | **HIGH** |
| 9 | No segregation of duties enforcement | Circular 99/2025/TT-BTC, SOX equivalent | **HIGH** |
| 10 | No auth audit for authorization failures | Circular 99/2025/TT-BTC Art 28 | **MEDIUM** |

### Conditional Pass (adequate for dev/staging, needs upgrade for PROD)

| # | Item | Assessment |
|---|---|---|
| 1 | PBKDF2-SHA512 password hashing (100K iterations) | Adequate for 2026 |
| 2 | JWT access + refresh token rotation | Good pattern |
| 3 | Account lockout (configurable attempts/time) | Pass |
| 4 | Password history (10) + policy validation | Pass |
| 5 | IP whitelist with CIDR | Pass |
| 6 | Session management (max concurrent, expiry) | Pass |
| 7 | Login attempt auditing | Pass (but needs extension) |
| 8 | Role-based access control | Pass (but needs segregation) |
| 9 | Feature-based permissions (View/Create/Edit/Delete/Print/Export/Approve) | Pass |

---

## 3. Regulatory Compliance Matrix

### Vietnamese Laws & Regulations

| Regulation | Effective | Requirement | Current Status | Gap |
|---|---|---|---|---|
| Luật Kế toán 2015 (Accounting Law) | 2015 | Accounting software must ensure security, confidentiality, data integrity | Partial — audit trail exists but auth gap | MEDIUM |
| Luật Giao dịch điện tử 2023 (20/2023/QH15) | July 2024 | E-signature categories, legal equivalence | DigitalSignatureService exists but MOCK | CRITICAL |
| Nghị định 130/2018/NĐ-CP (Digital Signatures) | 2018 | Public CA digital certificates for tax transactions | No CA integration | CRITICAL |
| Nghị định 123/2020/NĐ-CP (E-Invoices) | July 2022 | E-invoices must be digitally signed, authenticated | No e-invoice auth flow | HIGH |
| Thông tư 78/2021/TT-BTC (E-Invoice Guidance) | 2021 | Technical requirements for e-invoice systems | Not implemented | HIGH |
| Thông tư 19/2021/TT-BTC (Tax E-transactions) | 2021 | Digital signature OR OTP for tax auth | OTP missing, sig mock | HIGH |
| Nghị định 165/2018/NĐ-CP (E-transactions in Finance) | 2018 | Biometric authentication for financial e-transactions | Biometric service present but not integrated | HIGH |
| Công văn 3078/CT-NVT (Biometric Verification) | May 2026 | VNeID facial recognition for e-invoice registration | VNeID service mock, not enforced | CRITICAL |
| Luật An ninh mạng 2018 (Cybersecurity Law) | 2019 | Data localization, security measures | Partial | MEDIUM |
| Luật Dữ liệu 60/2024/QH15 (Data Law) | July 2025 | Data protection, consent, encryption | Missing | HIGH |
| Circular 99/2025/TT-BTC (New Accounting Regime) | Jan 2026 | Software must detect/prevent data manipulation, connect with e-invoice/signature systems | Missing most | HIGH |
| Law on Tax Administration 108/2025/QH15 | July 2026 | Standardized e-invoice format, taxpayer infrastructure | Not assessed | MEDIUM |

### International Standards

| Standard | Relevance | Current Status |
|---|---|---|
| IFRS (International Financial Reporting Standards) | Revenue recognition, lease accounting, etc. | Auth module has no IFRS impact |
| ISA (International Standards on Auditing) | Audit trail requirements | Login audit exists but incomplete |
| ISO 27001 (Information Security) | Access control, encryption, incident response | Partial alignment |
| SOC 2 Type II | Security, availability, processing integrity | Not assessed |

---

## 4. Current Architecture Assessment

### What Exists (Code Verified)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENT ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Web/Program.cs                                              │
│  ├── JWT Bearer Authentication                               │
│  ├── SessionValidationMiddleware                              │
│  ├── IpRestrictionMiddleware                                  │
│  ├── PermissionAuthorizationHandler                           │
│  └── PermissionPolicyProvider                                 │
│                                                             │
│  Controllers:                                                 │
│  ├── POST /api/auth/login        → LoginCommandHandler        │
│  ├── POST /api/auth/refresh      → RefreshTokenCommandHandler │
│  ├── POST /api/auth/logout       → LogoutCommandHandler       │
│  ├── GET  /api/auth/me           → GetCurrentUserQueryHandler │
│  ├── POST /api/auth/change-password                          │
│  ├── CRUD /api/users/*                                       │
│  ├── CRUD /api/roles/*                                       │
│  ├── CRUD /api/permissions                                   │
│  └── POST/DELETE .../roles/{id}/permissions/{id}              │
│                                                             │
│  Domain Entities:                                             │
│  ├── User (MFA, lockout, password history, roles)             │
│  ├── Role (permissions)                                       │
│  ├── Feature (hierarchical feature catalog)                   │
│  ├── FeaturePermission (role-feature bridge)                  │
│  ├── LoginAttempt (full audit)                                │
│  ├── RefreshToken (revocable, rotatable)                      │
│  ├── SessionSettings (per-company timeout/concurrent)         │
│  ├── IpWhitelistEntry (CIDR matching)                         │
│  └── CompanyPasswordPolicy (configurable rules)               │
│                                                             │
│  Services:                                                    │
│  ├── JwtTokenService                                         │
│  ├── PasswordHasher (PBKDF2-SHA512, 100K iter)               │
│  ├── MockVNeIDService ───────── VNeIDService (real)          │
│  ├── MockESignerService ─────── Digital Signature (mock)     │
│  ├── BiometricService ──────── Real implementation           │
│  └── CurrentUserService                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What's Missing (Critical)

```
┌─────────────────────────────────────────────────────────────┐
│                      REQUIRED ADDITIONS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication Enhancements:                                 │
│  ├── Digital Signature Authentication (USB Token / HSM)      │
│  │   ├── VNPT-CA integration                                 │
│  │   ├── Viettel-CA integration                              │
│  │   └── BKAV-CA integration                                 │
│  ├── VNeID Level 2 Verification Flow                         │
│  ├── Face Recognition (KYC) for Legal Rep                    │
│  ├── SMS OTP Service Integration                             │
│  ├── Email OTP Service Integration                           │
│  ├── TOTP/MFA Enforcement in Login Flow                      │
│  ├── Corporate e-ID (Định danh doanh nghiệp)                 │
│  └── Hardware Security Module (HSM) Support                  │
│                                                             │
│  Authorization Enhancements:                                  │
│  ├── Segregation of Duties (SoD) Engine                      │
│  │   ├── Conflict detection (creator ≠ approver)             │
│  │   ├── Dual control for critical transactions              │
│  │   └── Mandatory approval chains per module                │
│  ├── Authorization Audit Logging                             │
│  │   ├── Denied access attempt logging                       │
│  │   ├── Permission change audit                             │
│  │   └── Role assignment audit                               │
│  └── Dynamic Permission Re-evaluation                        │
│      ├── Role change → immediate session update              │
│      └── Permission cache invalidation                       │
│                                                             │
│  Security Infrastructure:                                     │
│  ├── Field-level encryption for PII                          │
│  ├── Secrets management (Azure Key Vault / AWS KMS)          │
│  ├── Session management dashboard                            │
│  │   ├── Force logout capability                             │
│  │   ├── Active session monitoring                           │
│  │   └── Geographic anomaly detection                        │
│  ├── Rate limiting for auth endpoints                        │
│  ├── CAPTCHA for repeated auth failures                      │
│  └── Audit log export for regulatory review                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Cost & Effort Estimate (BA Assessment)

| Phase | Scope | Estimated Effort | Priority |
|---|---|---|---|
| P0 — Regulatory Blockers | Digital sig integration, VNeID, e-ID, MFA enforcement | 8-10 weeks | **IMMEDIATE** |
| P1 — Security Hardening | Secrets management, field encryption, rate limiting | 4-6 weeks | HIGH |
| P2 — Authorization Deepening | SoD engine, auth audit logging, dynamic permissions | 6-8 weeks | HIGH |
| P3 — Advanced Auth | Biometric login, SMS OTP, KYC, session dashboard | 6-8 weeks | MEDIUM |
| P4 — Testing & Compliance | Regulatory testing, security audit, penetration test | 4-6 weeks | HIGH |
| **Total** | | **28-38 weeks** | |

---

Prepared by: Lead BA (20yr) + Chief Accountant (20yr)
Reviewed regulations: vbpl.vn, mof.gov.vn, gdt.gov.vn, thuedientu.gdt.gov.vn, dichvucong.gov.vn, vacpa.org.vn, vaa.net.vn
