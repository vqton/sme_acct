---
title: "Use Cases — Authentication & Authorization"
author: "Lead BA + Chief Accountant"
date: 2026-07-16
tags:
  - use-cases
  - authentication
  - authorization
  - vietnam
---

# Use Cases: Authentication & Authorization Module

## UC-01: User Login (Username/Password)

### Description
User authenticates with username + password. System validates credentials, checks lockout, enforces password policy, issues JWT tokens.

### Preconditions
- User account exists in system
- System is operational
- Network connectivity established

### Happy Path
1. User navigates to login page
2. System displays login form (username, password, device info)
3. User enters valid username + password
4. System validates credentials against stored hash
5. System checks account is active
6. System checks account not locked out
7. System records failed attempts reset (successful login)
8. System loads user roles + permissions
9. System generates access token (15min) + refresh token (7 days)
10. System persists refresh token in database
11. System records LoginAttempt (Result=Success)
12. System returns TokenResponse to client
13. Client stores tokens, redirects to dashboard

### Alternative Paths

**AP-01.1: First-time login — password change required**
1. Steps 1-4 same as happy path
2. System detects password was set by admin (temporary flag)
3. System returns 200 with `requiresPasswordChange: true`
4. Client redirects to change-password page
5. Flow continues at UC-04

**AP-01.2: MFA enabled (future — currently not implemented)**
1. Steps 1-7 same as happy path
2. System detects MfaEnabled = true for user
3. System returns partial success with `requiresMfa: true`
4. Client presents MFA challenge (TOTP / SMS OTP)
5. User submits valid MFA code
6. System verifies code, proceeds to step 8

**AP-01.3: Digital signature login (future — Vietnamese CA requirement)**
1. User inserts USB token
2. Browser detects token, prompts certificate selection
3. User selects digital certificate
4. System validates certificate against CA (VNPT-CA/Viettel-CA/BKAV-CA)
5. System extracts user identity from certificate
6. System maps certificate identity to system user
7. Proceeds to step 8 of happy path

**AP-01.4: VNeID authentication (regulatory requirement — not implemented)**
1. User selects "Login via VNeID"
2. System redirects to VNeID OAuth endpoint
3. User authenticates on VNeID app (face recognition)
4. VNeID returns identity token
5. System validates identity token, matches to user
6. Proceeds to step 8 of happy path

### Exception Paths

| Exception | Handling | Response |
|---|---|---|
| Invalid username/password | Record LoginAttempt(InvalidCredentials), increment failed count | 401 "Invalid username or password" |
| Account locked | Record LoginAttempt(AccountLocked) | 401 "Account is locked. Try again later." |
| Account inactive | Record LoginAttempt(AccountInactive) | 401 "Account is inactive" |
| Max concurrent sessions exceeded | SessionValidationMiddleware checks | 401 "Maximum concurrent sessions exceeded" |
| Database connection failure | Global exception handler | 500 Internal Server Error |
| JWT signing key not configured | Startup validation | 500 on application start |
| Rate limit exceeded (future) | Rate limiting middleware | 429 Too Many Requests |

### Rules
- R01: Max 5 failed attempts before 15-min lockout (configurable per company)
- R02: Lockout applies per user, not per IP
- R03: Successful login resets failed attempt counter
- R04: JWT access token expires in 15 min (configurable)
- R05: Refresh token expires in 7 days (configurable)
- R06: Max 3 concurrent sessions per user (configurable)
- R07: All login attempts MUST be logged for audit

---

## UC-02: Token Refresh

### Description
Client uses refresh token to obtain new access token without re-authentication. Implements token rotation for security.

### Happy Path
1. Client sends expired access token + valid refresh token
2. System validates refresh token exists and is active
3. System validates access token (even expired) matches refresh token's user
4. System verifies user still exists and is active
5. System generates new access token + new refresh token
6. System revokes old refresh token (rotation)
7. System persists new refresh token
8. System returns new TokenResponse

### Alternative Paths
- AP-02.1: Near-expiry refresh token (within 24h of expiry) — same flow, issued new 7-day token

### Exception Paths

| Exception | Handling | Response |
|---|---|---|
| Refresh token expired | Token.IsExpired = true | 401 "Invalid or expired refresh token" |
| Refresh token revoked | Token.IsRevoked = true | 401 "Invalid or expired refresh token" |
| User deactivated between tokens | Check user.IsActive | 401 "User not found or inactive" |
| Token replay (stolen token used after rotation) | Token already revoked | 401 "Invalid or expired refresh token" |
| User ID mismatch (access/refresh token mismatch) | userId != stored.UserId | 401 "Invalid access token" |

### Rules
- R08: Refresh token rotation MUST be enforced (old token revoked on each refresh)
- R09: Old refresh token's ReplacedByToken field references new token
- R10: Refresh token expiry = 7 days from issue (configurable per company)

---

## UC-03: Logout

### Description
User explicitly logs out. Refresh token is revoked.

### Happy Path
1. Authenticated user sends logout request with refresh token
2. System locates stored refresh token
3. System marks token as revoked (RevokedAt = UtcNow)
4. System persists change
5. Client discards local tokens
6. Client redirects to login page

### Exception Paths
- Token already expired → still accept, cleanup gracefully
- Token not found → return success (idempotent)

### Rules
- R11: Logout MUST be idempotent (multiple calls safe)
- R12: Revoked tokens remain in database for audit trail

---

## UC-04: Password Change

### Description
Authenticated user changes own password with current password verification.

### Happy Path
1. User enters current password + new password
2. System verifies current password hash matches
3. System validates new password against company password policy
4. System checks new password not in password history (last 10)
5. System hashes new password with new salt (PBKDF2)
6. System stores new hash, pushes old hash to history
7. System returns success

### Exception Paths

| Exception | Handling | Response |
|---|---|---|
| Current password wrong | Hash mismatch | 400 "Current password is incorrect" |
| Password reused | Check history list | 400 "Cannot reuse a recent password" |
| Policy violation | Validator rejects | 400 with validation errors |
| User not found | DB lookup fails | 400 "User not found" |

### Rules
- R13: Password history count: 10 (maintained in User.PreviousPasswordHashes)
- R14: Password min length: 8, max: 128 (configurable per company)
- R15: Must contain: uppercase, lowercase, digit, special char (configurable)
- R16: Password hash: PBKDF2-SHA512, 100,000 iterations, 16-byte salt, 32-byte hash
- R17: On password change, ALL existing refresh tokens SHOULD be revoked (not currently implemented)

---

## UC-05: Role Assignment

### Description
Admin assigns a role to a user. Role determines permission set.

### Happy Path
1. Admin selects user + role
2. System validates both exist
3. System checks role not already assigned
4. System adds role to user's Roles collection
5. System records audit log
6. System returns success

### Exception Paths
- Role already assigned → return conflict
- User/role not found → return not found
- Circular role hierarchy → blocked (future)

### Rules
- R18: One user can have multiple roles
- R19: Role changes affect active sessions (future: session re-evaluation)
- R20: Role assignment MUST be logged for audit

---

## UC-06: Permission Grant/Revoke

### Description
Admin grants or revokes specific feature permissions for a role.

### Happy Path (Grant)
1. Admin selects role + feature + access level (View/Create/Edit/Delete/Print/Export/Approve)
2. System validates role and feature exist
3. System creates/updates FeaturePermission with granted access
4. System records audit log
5. System returns success

### Rules
- R21: Permissions are additive (union of all roles)
- R22: FeatureAccess uses bitwise flags for efficient storage
- R23: Feature hierarchy: Child features inherit parent permissions (future)
- R24: Permission changes MUST be logged

---

## UC-07: IP Whitelist Enforcement

### Description
System restricts access to pre-approved IP addresses/ranges.

### Happy Path
1. User authenticates successfully
2. IpRestrictionMiddleware fires on each request
3. System loads company's active IP whitelist entries
4. System compares remote IP against whitelist entries
5. If whitelist is empty → allow all (no restriction)
6. If whitelist has entries → match required
7. IP matches → allow request to proceed

### Exception Paths
| Exception | Handling |
|---|---|
| No whitelist entries | Skip check (allow all) |
| CIDR mismatch | 403 Forbidden |
| IPv4/IPv6 mismatch during CIDR check | Return false |
| Remote IP null | 403 Forbidden |

### Rules
- R25: Empty whitelist = no restriction (permit all)
- R26: Supports CIDR notation (192.168.1.0/24)
- R27: Supports exact IP match
- R28: Whitelist is per-company
- R29: Response: 403 "Access restricted by IP policy"

---

## UC-08: Permission-Based Access Control

### Description
System enforces feature+action-level permissions on all protected endpoints.

### Happy Path
1. Controller action decorated with `[RequirePermission("GL_JOURNAL", FeatureAction.View)]`
2. PermissionPolicyProvider creates PermissionRequirement from policy string
3. On each request, PermissionAuthorizationHandler fires
4. Handler reads user's "permission" claims from JWT
5. Handler checks if required permission string exists in claims
6. Match found → context.Succeed(requirement)
7. Request proceeds to controller action

### Exception Paths
| Exception | Handling |
|---|---|
| Permission missing | Handler does not call Succeed → 403 Forbidden |
| Policy format invalid | Falls back to DefaultAuthorizationPolicyProvider |
| FeatureAction enum parse failure | Falls back to default policies |
| User has no permission claims | Permission HashSet empty → 403 |

### Rules
- R30: Permission format: `"{FeatureCode}:{FeatureAction}"` e.g. `"GL_JOURNAL:View"`
- R31: Unrecognized policy names fall back to default ASP.NET Core policy provider
- R32: Permission claims are embedded in JWT at login time
- R33: Dynamic permission changes require re-login (currently — no real-time claim update)
- R34: All denied access attempts SHOULD be logged (not currently implemented)

---

## UC-09: VNeID Identity Verification (Regulatory)

### Description
Legal representative verifies identity via VNeID Level 2 for e-invoice registration (per Official Letter 3078/CT-NVT, May 2026).

### Preconditions
- User has VNeID Level 2 account
- VNeID service integration active

### Happy Path
1. User initiates e-invoice registration
2. System prompts VNeID authentication
3. User opens VNeID app, performs face recognition
4. VNeID returns identity token to system
5. System calls IVNeIDService.VerifyIdentityAsync(vneidNumber, fullName, dateOfBirth)
6. System verifies identity data matches company legal representative
7. System records verification in audit log
8. User proceeds with e-invoice registration

### Exception Paths
| Exception | Handling |
|---|---|
| VNeID Level 2 not activated | Guide user to activate at nearest police station |
| Identity mismatch | Block operation, alert security |
| VNeID service unavailable | Fallback to in-person verification (manual process) |
| Biometric mismatch | Retry up to 3 times, then block |

### Rules
- R35: VNeID verification REQUIRED for e-invoice registration/changes (Official Letter 3078/CT-NVT)
- R36: Must complete within 1 business day or application rejected
- R37: Tax registration data must match National Population Database
- R38: VNeID verification must be logged with timestamp, result, identity data hash

---

## UC-10: Digital Signature for E-Invoice (Regulatory)

### Description
E-invoices are digitally signed before submission to tax authority per Decree 123/2020/ND-CP.

### Preconditions
- User has valid digital certificate from VNPT-CA / Viettel-CA / BKAV-CA
- USB token or HSM connected

### Happy Path
1. System generates invoice XML per MOF format
2. System prompts user to select digital certificate
3. User confirms signing operation
4. System calls IDigitalSignatureService.SignAsync(documentData, userId)
5. System validates signature
6. System submits signed invoice to tax authority
7. Tax authority returns confirmation
8. System stores signed invoice + confirmation for audit

### Exception Paths
| Exception | Handling |
|---|---|
| Certificate expired | Block, request renewal |
| USB token disconnected | Prompt reconnection |
| CA validation failure | Block, alert security |
| SignAsync mock response | Currently returns fake data — NOT PROD-READY |

### Rules
- R39: Digital signature MUST use public CA (VNPT-CA/Viettel-CA/BKAV-CA)
- R40: Signature MUST use asymmetric-key algorithm (private key sign, public key verify)
- R41: Signature MUST uniquely link signer to data
- R42: Any post-signing modification MUST be detectable
- R43: Signed invoices MUST be stored immutable for audit

---

## UC-11: Corporate e-ID Authentication (Regulatory)

### Description
Companies authenticate using corporate electronic identification (Định danh doanh nghiệp điện tử).

### Preconditions
- Company has registered for corporate e-ID via National Public Service Portal
- Corporate e-ID account linked to company record in system

### Happy Path
1. Company admin selects "Login via Corporate e-ID"
2. System redirects to National Public Service Portal
3. Admin authenticates using corporate digital certificate
4. Portal validates corporate e-ID
5. Portal returns authentication token with company info
6. System matches corporate e-ID to company record
7. System authorizes access based on corporate role

### Exception Paths
| Exception | Handling |
|---|---|
| Corporate e-ID not registered | Guide registration process |
| Corporate e-ID expired | Prompt renewal |
| Old provincial-level digital account | Reject — only corporate e-ID accepted |

### Rules
- R44: Old provincial-level digital accounts NO LONGER ACCEPTED
- R45: Corporate e-ID is MANDATORY per National Portal directive
- R46: Corporate e-ID replaces all previous company digital identity schemes
