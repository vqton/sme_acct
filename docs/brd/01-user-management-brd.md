# BRD: User Management Module — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-16
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft — Not PROD Ready

---

## 1. Executive Summary

SmeAccounting user management module provides RBAC, JWT auth, MFA, password policy, login audit, and org-unit hierarchy. Designed as Vietnamese SME accounting platform.

Core domain entities: `User`, `Role`, `Permission`, `OrganizationUnit`, `Feature`, `FeaturePermission`, `RefreshToken`, `LoginAttempt`, `AuditEntity`.

---

## 2. PROD Readiness Verdict

**NOT PROD-READY** for Vietnamese SME accounting context.

### Critical (Blocking) Gaps

| # | Gap | Regulation | Impact |
|---|---|---|---|
| 1 | No VNeID / National Digital Identity integration | NĐ 69/2024/NĐ-CP, Công văn 2065/CT-NVT (01/07/2025) | Cannot perform tax e-transactions |
| 2 | No digital signature (chữ ký số) integration | TT 19/2021/TT-BTC, NĐ 23/2025/NĐ-CP | Cannot sign tax declarations |
| 3 | No e-invoice system connection | NĐ 254/2026/NĐ-CP (01/07/2026), TT 99/2025/TT-BTC Điều 28 | Cannot connect with tax authority e-invoice system |
| 4 | No audit trail for data correction (sửa chữa không để lại dấu vết) | TT 99/2025/TT-BTC Điều 28, Luật Kế toán 88/2015/QH13 Điều 26 | Illegal — all corrections must preserve trail |
| 5 | No data-manipulation alert/warning system | TT 99/2025/TT-BTC Điều 28 | Cannot prevent intentional data tampering |
| 6 | No tax authority system integration | TT 99/2025/TT-BTC Điều 28 | Cannot provide data to competent authorities |
| 7 | No biometric verification for legal reps | Công văn 3078/CT-NVT (15/05/2026) | Cannot register/change e-invoice use |

### High-Priority Gaps

| # | Gap | Regulation | Impact |
|---|---|---|---|
| 8 | No configurable session timeout | Security best practice + implicit regulatory | Session hijacking risk |
| 9 | No IP whitelist / geo-restriction | Security best practice | Unauthorized access risk |
| 10 | PasswordPolicy hardcoded (not per-company) | Should be configurable per organization | Inflexible for multi-tenant |
| 11 | No approval workflow for critical ops | FeatureAction supports Approve but not implemented | No dual-control for sensitive accounting ops |
| 12 | Company entity missing legal rep fields | Luật Kế toán, NĐ 174/2016/NĐ-CP | Cannot track legal responsibility |
| 13 | No device fingerprinting / trust scoring | Security best practice | Cannot detect suspicious login |

### Medium-Priority Gaps

| # | Gap | Regulation | Impact |
|---|---|---|---|
| 14 | No external system API for tax/fiscal data export | TT 99/2025/TT-BTC Điều 28 | Cannot integrate with tax authorities |
| 15 | No regulatory update mechanism | TT 99/2025/TT-BTC Điều 28 | Software must be upgradeable for law changes |
| 16 | Audit trail not linked to user sessions | Luật Kế toán implicit | Cannot trace who did what when |
| 17 | Multi-company user isolation inadequate | Multi-tenancy risk | Cross-company data leak |
| 18 | No geographic login tracking | Security best practice | Cannot detect unusual location access |

---

## 3. Applicable Laws & Regulations (Active, Verified 2026-07)

### 3.1 Primary Laws

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| Luật Kế toán 88/2015/QH13 | Active (amended by 56/2024/QH15) | 01/01/2017 | Accounting books, electronic records, audit, signatures |
| Luật Quản lý thuế 38/2019/QH14 | Active (replaced by 108/2025/QH15 from 01/07/2026) | 01/07/2020 | Tax declaration, e-transactions |
| Luật Quản lý thuế 108/2025/QH15 | NEW — replaces 38/2019 | 01/07/2026 | Updated tax management |
| Luật Giao dịch điện tử 2023 | Active | 01/07/2024 | Electronic transactions legal framework |

### 3.2 Decrees

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| NĐ 174/2016/NĐ-CP | Active (amended 151/2018/NĐ-CP) | 01/01/2017 | Accounting law implementation details |
| NĐ 69/2024/NĐ-CP | Active | 25/06/2024 | Electronic identification — VNeID required from 01/07/2025 |
| NĐ 23/2025/NĐ-CP | NEW | 10/04/2025 | Electronic signatures, trust services |
| NĐ 254/2026/NĐ-CP | NEW — replaces 123/2020 | 01/07/2026 | E-invoices, e-documents |
| NĐ 122/2025/NĐ-CP | Active | 2025 | Tax management procedures |

### 3.3 Circulars

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| TT 99/2025/TT-BTC | NEW — replaces 200/2014 | 01/01/2026 | Enterprise accounting regime — software requirements |
| TT 133/2016/TT-BTC | Active (optional for SMEs) | 01/01/2017 | SME accounting regime |
| TT 58/2026/TT-BTC | NEW | 01/07/2026 | Micro-enterprise accounting regime |
| TT 19/2021/TT-BTC | Active | 2021 | E-transactions in tax field |
| TT 86/2024/TT-BTC | Active | 23/12/2024 | Tax registration |
| TT 103/2005/TT-BTC | Active (not replaced) | 2005 | Software standards — user permission requirements |

### 3.4 Expired/Replaced Documents

| Document | Replaced By | Effective Date |
|---|---|---|
| TT 200/2014/TT-BTC | TT 99/2025/TT-BTC | 01/01/2026 |
| TT 75/2015/TT-BTC | TT 99/2025/TT-BTC | 01/01/2026 |
| TT 53/2016/TT-BTC | TT 99/2025/TT-BTC | 01/01/2026 |
| TT 195/2012/TT-BTC | TT 99/2025/TT-BTC | 01/01/2026 |
| TT 132/2018/TT-BTC | TT 58/2026/TT-BTC | 01/07/2026 |
| NĐ 123/2020/NĐ-CP | NĐ 254/2026/NĐ-CP | 01/07/2026 |

---

## 4. User Management — Regulatory Requirements (Vietnamese Accounting Context)

### 4.1 User Permission Requirements (TT 103/2005/TT-BTC)

- Must support **per-role permission delegation** to each user based on function
- **Segregation of duties**: Chief Accountant (Kế toán trưởng) vs Accountant (Nhân viên kế toán)
- **No unauthorized access**: Users cannot access others' work without authorization
- **Data security policy** required: server management, data backup, access rules

### 4.2 Accounting Software Requirements (TT 99/2025/TT-BTC Điều 28)

- Processes must comply with accounting/tax law
- **Correction must leave trace** — no silent deletion/modification
- Information security, confidentiality, safety
- **Warning/alert system** to prevent intentional data manipulation
- Provide complete, timely output data to competent authorities
- **Connect with e-invoice, digital signature, tax systems**
- **Upgradeable** for regulatory changes

### 4.3 Electronic Identification (NĐ 69/2024/NĐ-CP, Công văn 2065/CT-NVT)

- From 01/07/2025: **VNeID mandatory** for all tax electronic transactions
- Personal identification number replaces tax ID for individuals
- Organization digital identity accounts required

### 4.4 Electronic Signatures (NĐ 23/2025/NĐ-CP)

- Digital signatures with valid certificates required for tax documents
- eSigner software from General Department of Taxation
- SMS OTP / Smart OTP alternatives for individuals without digital certs

### 4.5 E-Invoice Requirements (NĐ 254/2026/NĐ-CP)

- E-invoices must be created, signed, and transmitted per format
- **Biometric verification** for legal representatives (Công văn 3078/CT-NVT)
- Connection to tax authority e-invoice system

---

## 5. Existing Implementation Review

### 5.1 Implemented Features (GOOD)

| Feature | Location | Quality |
|---|---|---|
| RBAC with Role + Permission entities | Domain/Entities/Role.cs, Permission.cs | Solid |
| Feature-based access control with CRUD+Print+Export+Approve | Domain/Security/FeaturePermission.cs | Excellent |
| Password hashing with PBKDF2-SHA512, 100K iterations | Infrastructure/Security/PasswordHasher.cs | Strong |
| JWT auth with refresh tokens | Infrastructure/Security/JwtTokenService.cs | Good |
| Login attempt tracking & lockout | Domain/Security/LoginAttempt.cs | Good |
| Password history (10 recent) | Domain/Entities/User.cs | Good |
| MFA support (entity-level, not wired) | Domain/Entities/User.cs | Partial |
| Organization unit hierarchy | Domain/Security/OrganizationUnit.cs | Good |
| Audit trail entity | Domain/Entities/AuditEntity.cs | Present but not wired |
| CQRS with MediatR | Application/Security/Commands/Queries | Good architecture |

### 5.2 Weaknesses

| Area | Issue |
|---|---|
| Audit trail | AuditEntity exists but NOT integrated into command handlers |
| MFA | Entity supports MfaEnabled/MfaSecret but NO implementation |
| Approval workflow | FeatureAction.Approve defined but NO approval process |
| Session management | No session timeout, no concurrent session enforcement |
| Multi-tenancy | CompanyId on entities but isolation not enforced in queries |
| IP tracking | Login saves IP but no geo-analysis or restriction |
| Biometric | Not implemented |
| VNeID integration | Not implemented |
| Digital signature | Not implemented |
| E-invoice connection | Not implemented |
| Tax authority API | Not implemented |

---

## 6. Recommendation

**Do NOT deploy to PROD** without addressing all critical and high-priority gaps.

### Immediate (Sprint 1-2)
1. Wire AuditEntity into all command handlers via EF Core SaveChanges interceptor
2. Add configurable session timeout (appsettings + per-company override)
3. Make PasswordPolicy configurable per company (from DB, not hardcoded)
4. Add IP whitelist / geo-restriction middleware
5. Implement VNeID mock integration + adapter pattern

### Short-term (Sprint 3-4)
6. Implement digital signature module (eSigner adapter)
7. Implement e-invoice connection API
8. Add data-manipulation alerts on journal entry/account modifications
9. Implement approval workflow for critical accounting operations

### Medium-term (Sprint 5-6)
10. Full VNeID / National Digital Identity integration
11. Biometric verification for legal representatives
12. Regulatory update mechanism
13. Tax authority system integration (eTax, customs, social insurance)

---

## 14. Related Documents

| Doc | Location |
|---|---|
| BRD — Use Cases | `docs/brd/02-use-cases.md` |
| BRD — Workflows | `docs/brd/03-workflows.md` |
| BRD — Business Rules | `docs/brd/04-business-rules.md` |
| BRD — Data Flows | `docs/brd/05-data-flows.md` |
| BRD — User Journeys | `docs/brd/07-user-journeys.md` |
| ADR — VNeID Integration | `docs/adr/01-vneid-integration.md` |
| ADR — Digital Signature | `docs/adr/02-digital-signature-module.md` |
| Domain Glossary | `docs/domain/user-management-terms.md` |
| Coding Standards | `docs/standards/01-csharp-coding-standards.md` |
| C# Analyzer Configuration | `docs/standards/02-analyzer-configuration.md` |
| Project Structure | `docs/standards/03-project-structure.md` |
| Security & Exceptions | `docs/standards/04-security-and-exceptions.md` |
| **Test Strategy** | **`docs/standards/05-test-strategy.md`** |
| **Test Approach** | **`docs/standards/06-test-approach.md`** |
| **Test Process** | **`docs/standards/07-test-process.md`** |
