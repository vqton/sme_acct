# BRD: User Management Module — SME Accounting

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft — NOT PROD-READY (7 critical blockers)

---

## 1. Executive Summary

SME Accounting user management module provides RBAC, JWT auth (HS256), TOTP 2FA, password policy enforcement, login audit logging, session management, and multi-company support for Vietnamese SME accounting context.

**Actual Architecture (not C#):**
- **Runtime:** Node.js + TypeScript 5.x (strict mode)
- **Web Framework:** Express.js (ESM modules)
- **Database:** SQLite via better-sqlite3 (synchronous, zero-copy prepared statements)
- **Authentication:** JWT (HS256, 15-min access token, 7-day refresh token with rotation)
- **Password Hashing:** bcryptjs, 10 salt rounds
- **Two-Factor Auth:** TOTP via otpauth library (SHA1, 30-sec period, 6-digit codes, 10 backup codes)
- **Authorization:** Role-based (11 Vietnamese accounting roles), permission-based middleware
- **Session Storage:** SQLite `refresh_tokens` table, SHA-256 hashed token storage
- **Rate Limiting:** In-memory sliding window (5 attempts/15min per IP)
- **Lockout:** 5 failed attempts triggers 30-min lockout
- **Password History:** 5 most recent hashes, bcrypt-compare for reuse check
- **Audit:** SQLite `audit_logs` table with action, IP, user_agent tracking

**Core domain entities:** `User`, `Role`, `RefreshToken`, `AuditLog`, `BackupCode`, `Company`, `UserCompany`, `CompanySettings`, `PasswordHistory`, `PasswordResetToken`.

**Key repository pattern:** Domain interfaces in `domain/repositories/`, implementation in `infrastructure/database/` (e.g., `SQLiteUserRepository` implements `UserRepository`). Prepared statements lazy-initialized to avoid circular import issues.

---

## 2. PROD Readiness Verdict

**NOT PROD-READY** for Vietnamese SME accounting context. Seven critical regulatory blockers prevent deployment.

### Critical (Blocking) Gaps

| # | Gap | Regulation | Impact | Severity |
|---|---|---|---|---|
| 1 | No VNeID / National Digital Identity integration | NĐ 69/2024/NĐ-CP (25/06/2024), Công văn 2065/CT-NVT (01/07/2025) | Cannot perform tax e-transactions; illegal per tax law | BLOCKER |
| 2 | No digital signature (chữ ký số) integration | NĐ 23/2025/NĐ-CP (10/04/2025), TT 19/2021/TT-BTC | Cannot sign tax declarations or e-invoices | BLOCKER |
| 3 | No e-invoice system connection | NĐ 254/2026/NĐ-CP (01/07/2026), TT 99/2025/TT-BTC Điều 28 | Cannot connect with tax authority e-invoice system | BLOCKER |
| 4 | No audit trail interceptor for data corrections (sửa chữa không để lại dấu vết) | TT 99/2025/TT-BTC Điều 28, Luật Kế toán 88/2015/QH13 Điều 26 | All corrections must preserve original values; silent modification is illegal | BLOCKER |
| 5 | No data-manipulation alert/warning system | TT 99/2025/TT-BTC Điều 28 | Cannot prevent intentional data tampering | BLOCKER |
| 6 | No tax authority system integration API | TT 99/2025/TT-BTC Điều 28 | Cannot provide output data to competent authorities | BLOCKER |
| 7 | No biometric verification for legal representatives | Công văn 3078/CT-NVT (15/05/2026) | Cannot register/change e-invoice usage for legal reps | BLOCKER |

### High-Priority Gaps

| # | Gap | Regulation | Impact |
|---|---|---|---|
| 8 | No configurable session timeout | Security best practice + implicit regulatory | Session hijacking risk; no idle timeout |
| 9 | No IP whitelist / geo-restriction | Security best practice | Unauthorized access from unexpected locations |
| 10 | PasswordPolicy hardcoded in AuthService (not per-company) | Should be configurable per organization | Inflexible for multi-tenant, cannot override per company |
| 11 | No approval workflow for critical accounting operations | TT 99/2025/TT-BTC (dual control principle) | No dual-control for sensitive operations |
| 12 | Company entity missing legal rep fields (full name, ID number, position) | Luật Kế toán 88/2015, NĐ 174/2016/NĐ-CP | Cannot track legal responsibility properly |
| 13 | No device fingerprinting / trust scoring | Security best practice | Cannot detect suspicious login patterns |
| 14 | decimal_places default = 2 in schema.ts, but TT 99/2025 requires 0 for VND | TT 99/2025/TT-BTC | Accounting rounding violation for VND-denominated books |

### Medium-Priority Gaps

| # | Gap | Regulation | Impact |
|---|---|---|---|
| 15 | No external system API for tax/fiscal data export | TT 99/2025/TT-BTC Điều 28 | Cannot integrate with tax authorities |
| 16 | No regulatory update mechanism | TT 99/2025/TT-BTC Điều 28 | Software must be upgradeable for law changes |
| 17 | Audit trail not linked to user sessions (no session_id in audit_logs) | Luật Kế toán implicit | Cannot correlate audit events to specific sessions |
| 18 | Multi-company user isolation could be stronger (UserCompanyRepo findByUserId returns all) | Multi-tenancy risk | Potential cross-company data leak |
| 19 | No geographic login tracking | Security best practice | Cannot detect unusual location access |
| 20 | No company type enum (required by law: enterprise, cooperative, private business) | Luật Doanh nghiệp 2020 | Missing legal classification |
| 21 | No charter capital tracking on Company entity | Luật Doanh nghiệp 2020 | Missing legal financial info |
| 22 | No business lines with VSIC codes | Regulatory requirement | Missing industry classification |
| 23 | No data retention enforcement (auto-purge after 5yr/10yr) | Luật Kế toán Điều 41, Luật Quản lý thuế | No lifecycle management for records |
| 24 | SoDConflictMatrix checks work but not wired into transaction processing | Internal control best practice | Creator-approver, cashier-recording, admin-accounting conflicts not enforced |

---

## 3. Applicable Laws & Regulations (Active, Verified 2026-07)

### 3.1 Primary Laws

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| Luật Kế toán 88/2015/QH13 | Active (amended by 56/2024/QH15) | 01/01/2017 | Accounting books (Điều 16-26), electronic records, audit trail (Điều 26), signatures (Điều 19), retention (Điều 41) |
| Luật Quản lý thuế 38/2019/QH14 | Active (superseded by 108/2025/QH15 from 01/07/2026) | 01/07/2020 | Tax declaration, e-transactions, taxpayer rights |
| Luật Quản lý thuế 108/2025/QH15 | NEW — replaces 38/2019 | 01/07/2026 | Updated tax management, digital transformation, e-tax filing mandate |
| Luật Giao dịch điện tử 2023 (20/2023/QH15) | Active | 01/07/2024 | Electronic transactions legal framework, e-signature validity |
| Luật Doanh nghiệp 2020 (59/2020/QH14) | Active | 01/01/2021 | Enterprise types, legal representatives, charter capital |

### 3.2 Decrees

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| NĐ 174/2016/NĐ-CP | Active (amended by 151/2018/NĐ-CP) | 01/01/2017 | Accounting law implementation details; accounting software requirements |
| NĐ 69/2024/NĐ-CP | Active | 25/06/2024 | Electronic identification and authentication; VNeID mandatory for tax e-transactions from 01/07/2025 |
| NĐ 23/2025/NĐ-CP | NEW | 10/04/2025 | Electronic signatures and trust services; types of e-signatures; provider requirements |
| NĐ 254/2026/NĐ-CP | NEW — replaces 123/2020/NĐ-CP | 01/07/2026 | E-invoices and e-documents; connection to tax authority system |
| NĐ 122/2025/NĐ-CP | Active | 2025 | Tax management procedures; e-tax declaration formats |

### 3.3 Circulars

| Document | Status | Effective | Key Provisions |
|---|---|---|---|
| TT 99/2025/TT-BTC | NEW — replaces 200/2014/TT-BTC, 75/2015/TT-BTC, 53/2016/TT-BTC, 195/2012/TT-BTC | 01/01/2026 | Enterprise accounting regime; Điều 28: software requirements (audit trail, correction traces, alerts, connectivity, upgradeability) |
| TT 133/2016/TT-BTC | Active (optional for SMEs meeting criteria) | 01/01/2017 | SME accounting regime; simplified chart of accounts |
| TT 58/2026/TT-BTC | NEW — replaces 132/2018/TT-BTC | 01/07/2026 | Micro-enterprise accounting regime |
| TT 19/2021/TT-BTC | Active | 2021 | E-transactions in tax field; digital signature requirements |
| TT 86/2024/TT-BTC | Active | 23/12/2024 | Tax registration procedures; electronic tax registration |
| TT 103/2005/TT-BTC | Active (not replaced) | 2005 | Software standards; user permission requirements (Điều 5-7) |

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

### 4.1 User Permission Requirements (TT 103/2005/TT-BTC Điều 5-7)

- All accounting software must support **per-role permission delegation** based on function (Điều 5)
- **Segregation of duties:** Chief Accountant (Kế toán trưởng) vs Accountant (Nhân viên kế toán) must have distinct permission sets (Điều 6)
- **No unauthorized access:** Users cannot access others' work without explicit authorization
- **Data security policy** must include: server management, data backup, access rules (Điều 7)

### 4.2 Accounting Software Requirements (TT 99/2025/TT-BTC Điều 28)

- Processes must strictly comply with accounting law and tax law
- **Correction must leave trace** — no silent deletion or modification of recorded data
- Information security, confidentiality, and safety must be ensured
- **Warning/alert system** to prevent and detect intentional data manipulation
- Must provide complete, timely output data to competent authorities upon request
- Must **connect with e-invoice, digital signature, and tax authority systems**
- Must be **upgradeable** to accommodate regulatory changes
- **Chart of accounts** must follow the standard list in Appendix 1 of TT 99/2025

### 4.3 Electronic Identification (NĐ 69/2024/NĐ-CP, Công văn 2065/CT-NVT)

- From 01/07/2025: **VNeID mandatory** for all tax electronic transactions
- Personal identification number (số định danh cá nhân) replaces tax ID for individuals
- Organization digital identity accounts (tài khoản định danh điện tử tổ chức) required
- Three levels: Level 1 (basic), Level 2 (verified biometric), Level 3 (on-site verification)

### 4.4 Electronic Signatures (NĐ 23/2025/NĐ-CP)

- Digital signatures with valid certificates from licensed providers required for tax documents
- eSigner software from General Department of Taxation (Tổng cục Thuế) is the mandated tool
- SMS OTP / Smart OTP alternatives for individual taxpayers without digital certificates
- Specialized e-signature for accounting software (chữ ký điện tử chuyên dùng) per Điều 22

### 4.5 E-Invoice Requirements (NĐ 254/2026/NĐ-CP)

- E-invoices must be created, signed (ký số), and transmitted per regulated XML format
- **Biometric verification** for legal representatives when registering/changing e-invoice usage (Công văn 3078/CT-NVT, 15/05/2026)
- Mandatory connection to tax authority e-invoice system (hệ thống hóa đơn điện tử của cơ quan thuế)
- E-invoice data must be stored for minimum 10 years

### 4.6 Data Retention (Luật Kế toán 88/2015 Điều 41, Luật Quản lý thuế 38/2019 Điều 34)

- Accounting documents: minimum **5 years** from closing date
- Tax documents: minimum **10 years** from end of tax period
- Electronic records must be accessible and readable for entire retention period
- Records of dissolved/defunct enterprises: transfer to archiving authority

---

## 5. Actual Implementation Review

### 5.1 Implemented Features — Verified Against Source Code

| Feature | Location | Quality | Notes |
|---|---|---|---|
| RBAC with 11 Vietnamese accounting roles | `domain/entities/Role.ts` | Solid | 11 roles with Vietnamese names, descriptions, permission arrays |
| Permission-based middleware | `presentation/middleware/auth.ts` | Solid | `requirePermission()`, `requireAllPermissions()` middleware factory |
| JWT auth HS256, 15-min access | `infrastructure/auth/jwt.ts` | Good | `generateToken()`, `verifyToken()` using jsonwebtoken |
| Token rotation on refresh | `application/AuthService.ts:343` | Good | Old token revoked before new one issued |
| bcrypt password hashing (10 rounds) | `application/AuthService.ts:141` | Good | `bcrypt.hashSync(password, 10)` |
| Login attempt tracking + lockout (5/30min) | `application/AuthService.ts:187-197` | Good | Counter per user in `users.failed_login_attempts` + `lockout_until` |
| Password history (5 recent) | `application/AuthService.ts:390-395` | Good | bcrypt-compared against `password_history` table |
| TOTP 2FA (fully implemented) | `application/AuthService.ts:550-679` | Excellent | Setup, verify-enable, login-verify, disable, backup codes (10) |
| Session listing + individual/bulk revoke | `application/AuthService.ts:419-459` | Good | `listActiveSessions()`, `revokeSession()`, `revokeAllSessions()` |
| Multi-company support | `application/AuthService.ts:254-296` | Good | Auto-select single company, company picker for multi-company |
| Company-scoped JWT claims | `infrastructure/auth/jwt.ts:14-20` | Good | `companyId` in `TokenPayload` |
| Login/audit rate limiting (5/15min per IP) | `presentation/middleware/rateLimiter.ts` | Good | In-memory sliding window, per-IP |
| Audit logging (login, logout, password events) | `application/AuthService.ts:114-120` | Good | AuditLog table saves action, userId, IP, userAgent |
| Password reset flow | `application/AuthService.ts:473-546` | Good | Token generated, SHA-256 hashed, 1-hour expiry, revokes sessions on reset |
| Email/password validation | `application/AuthService.ts:72-88,126-131` | Good | Min 8 chars, uppercase, lowercase, number, special |
| SoD conflict matrix | `domain/services/SoDConflictMatrix.ts` | Partial | CREATOR_APPROVER, CASHIER_RECORDING, ADMIN_ACCOUNTING checks exist but not wired into transaction processing |
| Company entity (status enum, tax code) | `domain/entities/Company.ts` | Good | Active, Suspended, Dissolved, Bankrupt, Merged, Converting |

### 5.2 Weaknesses — Verified Gaps

| Area | Issue | Detail |
|---|---|---|
| Audit trail interceptor | AuditLog exists but NOT wired as middleware/interceptor for all data mutations | Only auth events are logged; journal entry corrections leave no trace |
| decimal_places default | Default = 2 in `schema.ts:53` | TT 99/2025 requires VND with 0 decimal places |
| Company type | Missing from `Company` entity | Luật Doanh nghiệp requires enterprise type classification |
| Charter capital | Missing from `Company` entity | Required for legal entity registration |
| Business lines / VSIC codes | Missing from domain model | Required for statistical classification |
| Approval workflow | SoDConflictMatrix defines rules but no workflow engine | No dual-control for critical ops |
| Session timeout | No idle timeout enforcement | refresh_token expires in 7d, but access token 15-min timeout is not configurable |
| IP restrictions | No whitelist/geo-restriction middleware | Accepted from any IP |
| Password policy config | Hardcoded in `AuthService.ts:58-64` | Not per-company configurable |
| Data retention | No auto-purge mechanism | Records accumulate indefinitely |
| VNeID integration | Not implemented | BLOCKER |
| Digital signature | Not implemented | BLOCKER |
| E-invoice connection | Not implemented | BLOCKER |
| Biometric verification | Not implemented | BLOCKER |
| Tax authority API | Not implemented | BLOCKER |

### 5.3 Segregation of Duties — Current State

| Conflict Type | Check Logic | Wired? | Location |
|---|---|---|---|
| Creator cannot approve own entries | `checkCreatorApprover()` | No — not integrated into transaction approval | `SoDConflictMatrix.ts:18-23` |
| Cashier cannot record accounting entries | `checkCashierRecords()` | No — not enforced at journal entry time | `SoDConflictMatrix.ts:25-30` |
| System admin not accounting role | `checkSystemAdminAccounting()` | No — warning only | `SoDConflictMatrix.ts:32-37` |

---

## 6. Recommendation

**Do NOT deploy to PROD** without addressing all 7 critical and 6 high-priority gaps.

### Immediate (Sprint 1-2)

| Task | Est. Effort | Depends On |
|---|---|---|
| 1. Wire AuditLog interceptor into all Express route handlers (journal entry, invoice, account corrections) | 3 days | AuditLogRepository |
| 2. Add configurable session idle timeout (middleware + DB config per company) | 2 days | AuthService |
| 3. Make PasswordPolicy configurable per company (from `company_settings` table, not hardcoded) | 2 days | CompanySettings |
| 4. Add IP whitelist / geo-restriction middleware (configurable per company) | 2 days | Express middleware |
| 5. Fix `decimal_places` default to 0 for VND (TT 99/2025 requirement) | 0.5 days | schema.ts |
| 6. Implement VNeID Level 1-3 mock integration + adapter pattern (adapter abstraction) | 5 days | External API |

### Short-term (Sprint 3-4)

| Task | Est. Effort | Depends On |
|---|---|---|
| 7. Implement digital signature module (eSigner adapter for NĐ 23/2025) | 5 days | Crypto module |
| 8. Implement e-invoice connection API for NĐ 254/2026 | 5 days | External API |
| 9. Add data-manipulation alerts on journal entry/account modifications | 3 days | AuditLog |
| 10. Implement approval workflow for critical accounting operations (dual control) | 5 days | SoDConflictMatrix |

### Medium-term (Sprint 5-8)

| Task | Est. Effort | Depends On |
|---|---|---|
| 11. Full VNeID / National Digital Identity integration (Level 2-3) | 8 days | VNeID adapter |
| 12. Biometric verification for legal representatives | 5 days | VNeID |
| 13. Regulatory update mechanism (config-driven compliance rules) | 5 days | Config system |
| 14. Tax authority system integration (eTax, customs, social insurance) | 10 days | External API |
| 15. Data retention enforcement (auto-archive/purge at 5yr/10yr) | 3 days | Cron job |
| 16. Add company type enum, charter capital, VSIC codes to domain model | 3 days | Company entity |

---

## 7. Related Documents

| Doc | Location |
|---|---|
| BRD — Use Cases | `docs/brd/02-use-cases.md` |
| BRD — Workflows | `docs/brd/03-workflows.md` |
| BRD — Business Rules | `docs/brd/04-business-rules.md` |
| BRD — Data Flows | `docs/brd/05-data-flows.md` |
| BRD — Templates | `docs/brd/06-templates.md` |
| BRD — User Journeys | `docs/brd/07-user-journeys.md` |
| Domain Glossary | `docs/domain/user-management-terms.md` |
| UBISOFT Language | `UBIQUITOUS_LANGUAGE.md` |
| Code Quality Standards | `CODE_QUALITY.md` |
| Test Strategy | `TEST_STRATEGY.md` |
| ADR — Architecture Decisions | `docs/adr/` |
