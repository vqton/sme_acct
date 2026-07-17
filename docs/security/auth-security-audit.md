---
title: "Security Audit — Authentication & Authorization Module"
author: "Lead BA + Chief Accountant"
date: 2026-07-16
tags:
  - security
  - audit
  - authentication
  - authorization
---

# Security Audit: Authentication & Authorization

> **Audit Type:** Code Review + Architecture Review + Regulatory Compliance Check
> **Scope:** All auth/auth files in SmeAccounting.Domain, Application, Infrastructure, Web
> **Date:** 2026-07-16

---

## Finding Summary

| Severity | Count | Key Issues |
|---|---|---|
| CRITICAL | 5 | Plaintext secrets, no VNeID/digital sig enforcement, no MFA |
| HIGH | 7 | Missing SoD, no token revocation on password change, no rate limiting |
| MEDIUM | 6 | Incomplete audit trail, no PII encryption, no geo-anomaly detection |
| LOW | 4 | Soft-delete missing, no concurrency, no CAPTCHA |

---

## Detailed Findings

### F01: JWT Secret Key in Plaintext (CRITICAL)
**File:** `src/SmeAccounting.Web/appsettings.json`
**Issue:** Symmetric signing key `"ThisIsADevelopmentSecretKeyThatIs32BytesLong!"` stored in plaintext config.
**Risk:** Anyone with file access can forge arbitrary JWT tokens.
**Fix:** Use Azure Key Vault / AWS KMS / HashiCorp Vault. Never store secrets in config.

### F02: MySQL Password in Plaintext (CRITICAL)
**File:** `src/SmeAccounting.Web/appsettings.json:10`
**Issue:** Connection string contains password `SmeApp@2026!` in plaintext.
**Risk:** Database compromise via config leak.
**Fix:** Use Managed Identity / environment variables / secret store.

### F03: Digital Signature Service is Mock (CRITICAL)
**File:** `src/SmeAccounting.Infrastructure/ESigner/MockESignerService.cs`
**Issue:** No real connection to any Vietnamese CA. Returns fake signatures.
**Risk:** E-invoices signed with mock service have no legal validity. Violates Decree 123/2020/ND-CP.
**Fix:** Integrate with VNPT-CA, Viettel-CA, or BKAV-CA production APIs.

### F04: VNeID Service is Mock (CRITICAL)
**File:** `src/SmeAccounting.Infrastructure/VNeID/MockVNeIDService.cs`
**Issue:** Mock returns success for any request. Real VNeIDService also registered but untested.
**Risk:** Identity verification bypass. Violates Official Letter 3078/CT-NVT.
**Fix:** Remove MockVNeIDService registration. Test real VNeIDService.

### F05: MFA Never Enforced (CRITICAL)
**File:** `src/SmeAccounting.Application/Security/Commands/Login/LoginCommandHandler.cs`
**Issue:** `LoginResult.MfaRequired` (5) exists in enum but NEVER returned by handler. MfaEnabled/MfaSecret exist in User but no TOTP verification.
**Risk:** Users with MFA enabled can login without second factor.
**Fix:** Implement MFA challenge step in login flow.

### F06: No Segregation of Duties (HIGH)
**Files:** `src/SmeAccounting.Domain/Workflow/ApprovalWorkflow.cs`, `src/SmeAccounting.Application/`
**Issue:** No enforcement that workflow creator ≠ approver. Any role can be assigned any permission without conflict checking.
**Risk:** Fraud risk — one person can create and approve transactions.
**Fix:** Implement SoD conflict matrix. Check on role/permission assignment.

### F07: No Token Revocation on Password Change (HIGH)
**File:** `src/SmeAccounting.Application/Security/Commands/ChangePassword/ChangePasswordCommandHandler.cs`
**Issue:** Password change does not revoke existing refresh tokens.
**Risk:** Stolen tokens remain valid after password reset.
**Fix:** Revoke all active refresh tokens for user on password change.

### F08: No Rate Limiting on Auth Endpoints (HIGH)
**Files:** All auth controllers
**Issue:** No rate limiting on /login, /refresh, /change-password endpoints.
**Risk:** Brute force, credential stuffing, DoS.
**Fix:** Implement ASP.NET Core rate limiting middleware. 5 attempts/min per IP.

### F09: Authorized Session Updates Missing (HIGH)
**File:** `src/SmeAccounting.Application/Security/Commands/Login/LoginCommandHandler.cs`
**Issue:** No `_unitOfWork.SaveChangesAsync(ct)` call before `_userRepo.Update(user)` for `SetLastLogin()`. The `SetLastLogin` also resets failed attempts and lockout — DB update may not persist if token generation fails.
**Risk:** Lockout state may not persist if token generation throws.
**Fix:** SaveChanges before generating tokens.

### F10: No Authorization Failure Audit (MEDIUM)
**File:** `src/SmeAccounting.Web/Authorization/RequirePermissionAttribute.cs`
**Issue:** PermissionAuthorizationHandler does not log denied access attempts.
**Risk:** Blind spot for security monitoring — no way to detect brute-force authorization attempts.
**Fix:** Inject ILogger in PermissionAuthorizationHandler, log all denials with user claims.

### F11: No PII/Financial Data Encryption (MEDIUM)
**Files:** All entity classes
**Issue:** Sensitive fields (TaxId, Email, etc.) stored as plaintext nvarchar.
**Risk:** Data breach exposure violates Law on Data 60/2024.
**Fix:** Implement field-level encryption (AES-256) for PII fields.

### F12: No Geographic Anomaly Detection (MEDIUM)
**Issue:** No check for login from unexpected geographic locations.
**Risk:** Account takeover from foreign IPs undetected.
**Fix:** Add geo-IP lookup on login, flag anomalies.

### F13: Incomplete Login Attempt Audit (MEDIUM)
**Files:** `src/SmeAccounting.Domain/Security/LoginAttempt.cs`
**Issue:** Authorization failures not logged. Only authentication attempts tracked.
**Risk:** Cannot reconstruct security incidents involving authorized-but-denied actions.
**Fix:** Add AuthorizationAttempt entity or extend LoginAttempt for authZ events.

### F14: HTTP Port Not Restricted (MEDIUM)
**File:** `src/SmeAccounting.Web/Program.cs`
**Issue:** No HTTPS redirect or HSTS enforcement visible in code.
**Risk:** Credentials transmitted over unencrypted HTTP.
**Fix:** Add HTTPS redirection middleware + HSTS headers.

### F15: No Soft Delete on Accounts (LOW)
**File:** `src/SmeAccounting.Domain/GeneralLedger/Account.cs`
**Issue:** `Delete(Account)` uses hard delete. Accounting data should never be hard-deleted.
**Risk:** Audit trail broken if accounts are deleted.
**Fix:** Add IsDeleted flag + filter.

### F16: No Optimistic Concurrency (LOW)
**File:** `src/SmeAccounting.Infrastructure/Persistence/ApplicationDbContext.cs`
**Issue:** No row versioning on financial entities.
**Risk:** Lost updates under concurrent access.
**Fix:** Add `[ConcurrencyCheck]` or `[Timestamp]` attributes.

### F17: No CAPTCHA After Repeated Failures (LOW)
**Issue:** No CAPTCHA challenge after N failed login attempts.
**Risk:** Automated brute force tools can cycle through multiple accounts.
**Fix:** Show CAPTCHA after 3 failed attempts from same IP.

---

## Security Scorecard

| Category | Score | Notes |
|---|---|---|
| Authentication (password) | 8/10 | PBKDF2-SHA512 good, lockout good, history good |
| Authentication (advanced) | 1/10 | No MFA, OTP, biometric, VNeID, digital sig enforcement |
| Authorization (RBAC) | 7/10 | Feature permissions good, per-action granularity good |
| Authorization (SoD) | 0/10 | No segregation of duties whatsoever |
| Token Management | 7/10 | Rotation good, no revocation on events |
| Audit Trail | 4/10 | Login audit good, no authZ audit |
| Infrastructure Security | 2/10 | Plaintext secrets, no HTTPS enforcement, no rate limiting |
| Data Protection | 2/10 | No encryption at rest for PII |
| **OVERALL** | **3.9/10** | **NOT PROD-READY** |

---

Prepared by: Lead BA (20yr) + Chief Accountant (20yr)
Cross-referenced: OWASP ASVS v5.0, Vietnamese regulations per vbpl.vn/mof.gov.vn/gdt.gov.vn
