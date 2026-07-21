# Data Flows — User Management Module

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft

---

## DF-01: Authentication Flow (Express Middleware → AuthService → SQLite)

```
[Browser/Client]         [Express]              [AuthMiddleware]          [AuthService]              [SQLite]
      |                      |                        |                        |                        |
      |-- POST /api/auth --->|                        |                        |                        |
      |   /login             |                        |                        |                        |
      |   {username,         |                        |                        |                        |
      |    password}         |                        |                        |                        |
      |                      |-- req.body ----------->|                        |                        |
      |                      |                        |                        |                        |
      |                      |                        |-- RateLimiter          |                        |
      |                      |                        |   .isAllowed(ip) ----->|                        |
      |                      |                        |<-- boolean ------------|                        |
      |                      |                        |                        |                        |
      |                      |                        |-- service.login() ---->|                        |
      |                      |                        |   (input, ctx)         |                        |
      |                      |                        |                        |                        |
      |                      |                        |                        |-- findByUsername() ---->|
      |                      |                        |                        |   (SELECT * FROM users  |
      |                      |                        |                        |    WHERE username=?)    |
      |                      |                        |                        |<-- User row or null ----|
      |                      |                        |                        |                        |
      |                      |                        |                        |-- [bcrypt.compareSync] |
      |                      |                        |                        |                        |
      |                      |                        |                        |-- save() (update       |
      |                      |                        |                        |   failedLoginAttempts) |
      |                      |                        |                        |--[if 2FA: jwt.sign()] |
      |                      |                        |                        |   tempToken (5min)     |
      |                      |                        |                        |                        |
      |                      |                        |                        |-- createAccessToken()  |
      |                      |                        |                        |   jwt.sign() HS256     |
      |                      |                        |                        |                        |
      |                      |                        |                        |-- createRefreshToken() |
      |                      |                        |                        |   crypto.randomBytes() |
      |                      |                        |                        |   SHA-256 hash         |
      |                      |                        |                        |                        |
      |                      |                        |                        |-- save() (refresh_     |
      |                      |                        |                        |   tokens INSERT) ----->|
      |                      |                        |                        |                        |
      |                      |                        |                        |-- auditRepo.save() --->|
      |                      |                        |                        |   (audit_logs INSERT)  |
      |                      |                        |                        |                        |
      |                      |                        |<-- LoginResult --------|                        |
      |                      |                        |                        |                        |
      |                      |<-- res.json() ---------|                        |                        |
      |                      |   {token,              |                        |                        |
      |<-- 200 --------------|    refreshToken,        |                        |                        |
      |   {token,            |    user, companies}    |                        |                        |
      |    refreshToken,     |                        |                        |                        |
      |    user, companies}  |                        |                        |                        |
```

**Key:** `AuthService.login()` at `AuthService.ts:163-296`. SQL queries via `SQLiteUserRepository` at `database/UserRepository.ts`.

---

## DF-02: Token Lifecycle (Create → Use → Refresh → Revoke)

```
[Client]                    [AuthService]                         [SQLite/DB]
   |                             |                                   |
   |-- login() ----------------->|                                   |
   |                             |-- crypto.randomUUID() → jti      |
   |                             |-- jwt.sign():                     |
   |                             |   payload: {userId, username,     |
   |                             |     companyId?, roles[], jti}    |
   |                             |   secret: JWT_SECRET (env)        |
   |                             |   options: {expiresIn: '15m',     |
   |                             |     issuer: 'sme-acct',           |
   |                             |     audience: 'sme-acct-client'} |
   |                             |-- crypto.randomBytes(48)          |
   |                             |   → raw refresh token (hex)      |
   |                             |-- SHA-256(raw) → tokenHash       |
   |                             |-- INSERT refresh_tokens --------->|
   |                             |   {id, userId, tokenHash,         |
   |                             |    companyId, ipAddress,          |
   |                             |    userAgent, deviceName,         |
   |                             |    expiresAt: now+7d,             |
   |                             |    createdAt: now}                |
   |<-- {token, refreshToken} ---|                                   |
   |                             |                                   |
   |-- [15 minutes pass] ------>|                                   |
   |                             |                                   |
   |-- refreshToken() ---------->|                                   |
   |                             |-- SHA-256(refreshToken)→hash     |
   |                             |-- SELECT from refresh_tokens ---->|
   |                             |   WHERE tokenHash=hash,           |
   |                             |   revokedAt IS NULL,              |
   |                             |   expiresAt > datetime('now')     |
   |                             |<-- row ---------------------------|
   |                             |                                   |
   |                             |-- UPDATE revokedAt=now ---------->|
   |                             |   (old token — rotation)         |
   |                             |                                   |
   |                             |-- createAccessToken() (same as    |
   |                             |   above, preserves companyId)     |
   |                             |-- createRefreshToken() (new)      |
   |                             |-- INSERT new refresh token ------>|
   |                             |                                   |
   |<-- {newToken, newRefresh} --|                                   |
   |                             |                                   |
   |-- [logout / password change]|                                   |
   |                             |-- UPDATE revokedAt=now FOR ALL --->|
   |                             |   WHERE userId=?                  |
   |                             |                                   |
   |-- [7 days pass, unused] --->|                                   |
   |                             |-- SELECT WHERE expiresAt<now ---->|
   |                             |   (eligible for cleanup)          |
```

**Key source files:** `infrastructure/auth/jwt.ts:22-29` (token generation), `infrastructure/auth/jwt.ts:31-33` (token verification), `application/AuthService.ts:702-716` (refresh token creation).

---

## DF-03: Permission Check Flow (JWT → Middleware → Role Check)

```
[Client Request]              [Express]                [authMiddleware]          [AuthorizationService]
      |                           |                          |                         |
      |-- GET /api/companies ---->|                          |                         |
      |   Authorization: Bearer   |                          |                         |
      |   <access_token>          |                          |                         |
      |                           |-- req.headers            |                         |
      |                           |   .authorization         |                         |
      |                           |--------->|               |                         |
      |                           |                          |-- jwt.verify():          |
      |                           |                          |   HS256, check issuer,   |
      |                           |                          |   audience, expiry       |
      |                           |                          |                         |
      |                           |                          |-- payload → req.user =   |
      |                           |                          |   {userId, username,     |
      |                           |                          |    roles[]}              |
      |                           |                          |                         |
      |                           |-- requirePermission() ->|                         |
      |                           |   ('company:read')       |                         |
      |                           |                          |-- hasAnyPermission():    |
      |                           |                          |   req.user.roles         |
      |                           |                          |   .some(r =>             |
      |                           |                          |     role[r].permissions  |
      |                           |                          |     .includes(perm))     |
      |                           |                          |                         |
      |                           |                          |-- [if false] 403 ------>|
      |                           |                          |                         |
      |                           |-- next() (controller) -->|                         |
      |                           |                          |                         |
      |                           |-- res.json(companies) -->|                         |
      |<-- 200 JSON --------------|                          |                         |
```

**Key:** `auth.ts:15-33` (authMiddleware), `auth.ts:35-48` (requirePermission), `Role.ts:129-136` (hasAnyPermission/hasAllPermissions). Uses in-memory `ROLES` array — no DB query needed for permission checks.

---

## DF-04: 2FA Setup + Verification Data Flow

```
[Client]                          [AuthController]               [AuthService]                  [SQLite]
   |                                    |                             |                            |
   |===== SETUP PHASE =====             |                             |                            |
   |-- POST /2fa/setup ---------------->|                             |                            |
   |   Authorization: Bearer            |-- setupTwoFactor() -------->|                            |
   |                                    |                             |-- crypto.randomUUID()      |
   |                                    |                             |-- new OTPAuth.TOTP({       |
   |                                    |                             |     issuer: 'SME Acct',    |
   |                                    |                             |     label: user.email,     |
   |                                    |                             |     algorithm: 'SHA1',     |
   |                                    |                             |     digits: 6, period: 30}|
   |                                    |                             |                            |
   |                                    |                             |-- Save totpSecret -------->|
   |                                    |                             |   UPDATE users SET         |
   |                                    |                             |   totp_secret=?,           |
   |                                    |                             |   two_factor_enabled=0     |
   |                                    |                             |                            |
   |                                    |                             |-- for i=0..9:              |
   |                                    |                             |   crypto.randomBytes(4)    |
   |                                    |                             |   → backup codes (hex UC) |
   |                                    |                             |   SHA-256 each → hashes   |
   |                                    |                             |                            |
   |                                    |                             |-- DELETE old backup codes->|
   |                                    |                             |-- INSERT 10 new codes ---->|
   |                                    |                             |                            |
   |<-- {secret, backupCodes[10]} ------|                             |                            |
   |                                    |                             |                            |
   |===== VERIFY + ENABLE PHASE =====   |                             |                            |
   |-- POST /2fa/verify --------------->|                             |                            |
   |   {code: "123456"}                 |-- verifyAndEnable() ------->|                            |
   |                                    |                             |-- new OTPAuth.TOTP({       |
   |                                    |                             |     secret: stored.base32})|
   |                                    |                             |-- totp.validate({token,    |
   |                                    |                             |     window:1}) → delta     |
   |                                    |                             |                            |
   |                                    |                             |-- [delta===null]           |
   |                                    |                             |   throw InvalidTOTPError   |
   |                                    |                             |                            |
   |                                    |                             |-- [delta!==null]           |
   |                                    |                             |   UPDATE two_factor_enabled|
   |                                    |                             |   =1, updated_at=now ----->|
   |                                    |                             |                            |
   |                                    |                             |-- auditRepo.save(          |
   |                                    |                             |   TWO_FACTOR_ENABLED) ---->|
   |<-- {ok: true} --------------------|                             |                            |
   |                                    |                             |                            |
   |===== LOGIN WITH 2FA =====          |                             |                            |
   |-- POST /auth/login --------------->|                             |                            |
   |                                    |-- login() ----------------->|                            |
   |                                    |                             |-- [detects 2FA enabled]   |
   |                                    |                             |-- jwt.sign({purpose:'2fa', |
   |                                    |                             |     userId, exp:'5m'})     |
   |<-- {requires2FA:true,              |                             |                            |
   |     tempToken} --------------------|                             |                            |
   |                                    |                             |                            |
   |-- POST /2fa/verify-login --------->|                             |                            |
   |   {tempToken, code}                |-- verifyTwoFactorLogin() -->|                            |
   |                                    |                             |-- jwt.verify(tempToken)   |
   |                                    |                             |-- TOTP validation         |
   |                                    |                             |   OR backup code check    |
   |                                    |                             |-- completeLogin()          |
   |                                    |                             |   → access+refresh tokens |
   |<-- {token, refreshToken, user} ----|                             |                            |
```

**Key source files:** `application/AuthService.ts:550-679`, `AuthService.2fa.test.ts`.

---

## DF-05: Company Selection Data Flow

```
[Client]                       [AuthService]                      [SQLite]
   |                                |                                |
   |===== SINGLE COMPANY =====      |                                |
   |-- login() -------------------->|                                |
   |                                |-- userCompanyRepo              |
   |                                |   .findByUserId(userId) ------>|
   |                                |   FILTER isActive=true         |
   |                                |<-- [{companyId, role, ...}] ---|
   |                                |                                |
   |                                |-- [count === 1]                |
   |                                |-- createAccessToken()          |
   |                                |   → jwt with companyId         |
   |                                |-- createRefreshToken()         |
   |                                |   → refreshToken with companyId|
   |                                |                                |
   |<-- {token (with companyId),    |                                |
   |     refreshToken,              |                                |
   |     companies[{1}]}            |                                |
   |                                |                                |
   |===== MULTI COMPANY =====       |                                |
   |-- login() -------------------->|                                |
   |                                |-- findByUserId(userId) ------->|
   |                                |<-- [{id:c1}, {id:c2}] ---------|
   |                                |                                |
   |                                |-- [count >= 2]                 |
   |                                |-- createRefreshToken() (NO     |
   |                                |   companyId)                   |
   |                                |                                |
   |<-- {token: null,               |                                |
   |     refreshToken (no co),      |                                |
   |     companies[{2}]}            |                                |
   |                                |                                |
   |-- selectCompany(---------------|                                |
   |   refreshToken, companyId)     |-- SHA-256(refreshToken)        |
   |                                |-- SELECT from refresh_tokens ->|
   |                                |<-- row ------------------------|
   |                                |                                |
   |                                |-- findByUserIdAndCompanyId() ->|
   |                                |<-- UserCompany row ------------|
   |                                |                                |
   |                                |-- [isActive check]             |
   |                                |-- REVOKE old refresh token     |
   |                                |-- createAccessToken(co=c1)     |
   |                                |-- createRefreshToken(co=c1)    |
   |                                |                                |
   |<-- {token (companyId=c1),      |                                |
   |     refreshToken (co=c1),      |                                |
   |     companyId: c1,             |                                |
   |     companies[{2}]}            |                                |
```

**Key source files:** `application/AuthService.ts:254-341`, `AuthService.company.test.ts`.

---

## DF-06: Audit Logging Data Flow

```
[Action occurs]               [AuthService/Controller]          [AuditLogRepository]              [SQLite audit_logs]
      |                              |                                |                              |
      |-- login / logout /           |                                |                              |
      |   password change /          |                                |                              |
      |   2FA enable/disable /       |                                |                              |
      |   token refresh /            |                                |                              |
      |   session revoke             |                                |                              |
      |                              |-- auditRepo.save({             |                              |
      |                              |     id: crypto.randomUUID(),   |                              |
      |                              |     userId,                    |                              |
      |                              |     action: string,            |                              |
      |                              |     resource: string|null,     |                              |
      |                              |     resourceId: string|null,   |                              |
      |                              |     detail: string|null,       |                              |
      |                              |     ipAddress: string|null,    |                              |
      |                              |     userAgent: string|null,    |                              |
      |                              |     createdAt: new Date()      |                              |
      |                              |   })                           |                              |
      |                              |-------------------------------->|                              |
      |                              |                                |-- stmts.insert.run(params)-->|
      |                              |                                |   INSERT INTO audit_logs     |
      |                              |                                |   (id, user_id, action,      |
      |                              |                                |    resource, resource_id,     |
      |                              |                                |    detail, ip_address,        |
      |                              |                                |    user_agent, created_at)    |
      |                              |                                |   VALUES (...)               |
      |                              |                                |                              |
      |                              |<-- void -----------------------|                              |
      |                              |                                |                              |
      |                              |-- [GAP: data corrections not   |                              |
      |                              |    captured by this flow]      |                              |
```

**Key source files:** `application/AuthService.ts:114-120`, `domain/entities/AuditLog.ts`, `database/AuditLogRepository.ts`.

**Current audit events captured:**
- `USER_REGISTERED`, `LOGIN_FAILED`, `USER_LOGIN`, `USER_LOGOUT`
- `TOKEN_REFRESHED`, `PASSWORD_CHANGED`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`
- `SESSION_REVOKED`, `SESSIONS_REVOKED`
- `TWO_FACTOR_ENABLED`, `TWO_FACTOR_DISABLED`

**Events NOT captured (gaps):**
- Journal entry create/update/delete
- Account/COA modifications
- Company settings changes
- Data corrections (TT 99/2025 Điều 28 violation)

---

## DF-07: Password Reset Flow

```
[Client]                         [AuthService]                       [SQLite]
   |                                  |                                |
   |===== REQUEST PHASE =====          |                                |
   |-- POST /forgot-password --------->|                                |
   |   {email}                         |                                |
   |                                  |-- findByEmail(email) --------->|
   |                                  |<-- User or null ---------------|
   |                                  |                                |
   |                                  |-- [if user found]              |
   |                                  |   passwordResetTokenRepo       |
   |                                  |   .deleteExpired() ----------->|
   |                                  |                                |
   |                                  |-- crypto.randomBytes(32)       |
   |                                  |   → rawToken (hex, 64 chars)  |
   |                                  |-- SHA-256(rawToken) → hash    |
   |                                  |                                |
   |                                  |-- INSERT password_reset_tokens |
   |                                  |   {userId, tokenHash,          |
   |                                  |    expiresAt: now+1h,          |
   |                                  |    createdAt: now} ----------->|
   |                                  |                                |
   |                                  |-- auditRepo.save(              |
   |                                  |   PASSWORD_RESET_REQUESTED)    |
   |                                  |                                |
   |<-- {ok:true, token: rawToken} ---|                                |
   |                                  |                                |
   |===== RESET PHASE =====           |                                |
   |-- POST /reset-password --------->|                                |
   |   {token, newPassword}           |                                |
   |                                  |-- SHA-256(token) → hash       |
   |                                  |-- SELECT from password_reset   |
   |                                  |   _tokens WHERE token_hash     |
   |                                  |   =hash, used_at IS NULL,      |
   |                                  |   expires_at > now() --------->|
   |                                  |<-- row or null ----------------|
   |                                  |                                |
   |                                  |-- [null → throw                |
   |                                  |    InvalidResetTokenError]     |
   |                                  |                                |
   |                                  |-- validatePassword(newPassword)|
   |                                  |-- bcrypt.hashSync(new,10)      |
   |                                  |                                |
   |                                  |-- INSERT password_history      |
   |                                  |   (old hash) ----------------->|
   |                                  |-- UPDATE users SET             |
   |                                  |   password_hash=newHash,       |
   |                                  |   failed_attempts=0,           |
   |                                  |   lockout_until=null --------->|
   |                                  |                                |
   |                                  |-- UPDATE used_at=now --------->|
   |                                  |                                |
   |                                  |-- refreshTokenRepo             |
   |                                  |   .revokeAllForUser(userId) -->|
   |                                  |                                |
   |                                  |-- auditRepo.save(              |
   |                                  |   PASSWORD_RESET_COMPLETED)    |
   |                                  |                                |
   |<-- {ok:true} --------------------|                                |
```

**Key source files:** `application/AuthService.ts:473-546`.

---

## DF-08: VNeID Integration (Required — Not Implemented)

```
[Client]                    [VNeID Proxy Adapter]             [VNeID National API]          [SQLite]
   |                              |                                |                            |
   |===== IDENTITY VERIFICATION =|                                |                            |
   |-- Verify identity with      |                                |                            |
   |   VNeID app QR or           |                                |                            |
   |   citizen ID number ------->|                                |                            |
   |                              |-- POST /api/vneid/verify ---->|                            |
   |                              |   {soDinhDanh, hoTen,         |                            |
   |                              |    ngaySinh, token}           |                            |
   |                              |                                |                            |
   |                              |<-- {verified: true/false,     |                            |
   |                              |     level: 1|2|3,             |                            |
   |                              |     thongTinCongDan,          |                            |
   |                              |     thongTinToChuc}            |                            |
   |                              |                                |                            |
   |                              |-- [if verified]                |                            |
   |                              |   UPDATE users SET             |                            |
   |                              |   vneid_level=2,               |                            |
   |                              |   vneid_verified_at=now ------>|                            |
   |                              |                                |                            |
   |<-- {verified, level,         |                                |                            |
   |     identityInfo} -----------|                                |                            |
   |                              |                                |                            |
   |===== TAX E-TRANSACTION ===== |                                |                            |
   |-- Start tax e-transaction    |                                |                            |
   |   requires VNeID Level >=2   |                                |                            |
   |   (per NĐ 69/2024) --------->|                                |                            |
   |                              |-- Verify VNeID token still     |                            |
   |                              |   valid (session check)        |                            |
   |                              |-- [if not valid]               |                            |
   |                              |--> Re-authenticate via VNeID   |                            |
   |                              |                                |                            |
   |                              |-- [if valid]                   |                            |
   |                              |   Proceed with tax transaction |                            |
   |                              |                                |                            |
   |===== LEGAL REP =====        |                                |                            |
   |-- Register/changed e-invoice |                                |                            |
   |   usage for legal rep ------>|                                |                            |
   |                              |-- VNeID biometric verification |                            |
   |                              |   (Công văn 3078/CT-NVT) ---->|                            |
   |                              |<-- biometric match result -----|                            |
```

**Regulatory basis:** NĐ 69/2024/NĐ-CP, Công văn 2065/CT-NVT. **NOT implemented.**

---

## DF-09: Digital Signature Flow (Required — Not Implemented)

```
[Client]                    [SME Accounting Server]           [eSigner Service]          [Tax Authority API]
   |                              |                                |                            |
   |===== PREPARE TAX DECLARATION|                                |                            |
   |-- User finalizes tax return  |                                |                            |
   |   (VAT/CIT/PIT) ------------>|                                |                            |
   |                              |                                |                            |
   |                              |===== DIGITAL SIGNING =====     |                            |
   |                              |-- Prepare XML document per     |                            |
   |                              |   tax authority schema         |                            |
   |                              |                                |                            |
   |                              |-- POST /api/sign (eSigner) --->|                            |
   |                              |   {document, certificateId,    |                            |
   |                              |    pin, userId}                |                            |
   |                              |                                |                            |
   |                              |                                |-- Verify certificate       |
   |                              |                                |   (validity, expiry,      |
   |                              |                                |    revocation)             |
   |                              |                                |-- Apply digital signature  |
   |                              |                                |   (NĐ 23/2025/NĐ-CP)      |
   |                              |                                |                            |
   |                              |<-- {signedDocument,            |                            |
   |                              |     signatureInfo,             |                            |
   |                              |     signingTime}               |                            |
   |                              |                                |                            |
   |                              |-- [Verify signature internally]|                            |
   |                              |                                |                            |
   |                              |===== SUBMIT TO TAX AUTHORITY =|                            |
   |                              |-- POST /api/tax/submit ------->|                            |
   |                              |   {signedXML, taxPeriod,       |                            |
   |                              |    declarationType,            |                            |
   |                              |    digitalCertificateInfo}     |                            |
   |                              |                                |                            |
   |                              |                                |<-- {receiptId,            |
   |                              |                                |     submissionRef,         |
   |                              |                                |     status, timestamp}     |
   |                              |                                |                            |
   |                              |-- Save submission receipt ---->|                            |
   |                              |   audit log                    |                            |
   |                              |                                |                            |
   |<-- {receipt, status,         |                                |                            |
   |     submissionTime} ---------|                                |                            |
```

**Regulatory basis:** NĐ 23/2025/NĐ-CP (Electronic signatures), TT 19/2021/TT-BTC (E-transactions in tax). **NOT implemented.**

---

## Data Flow Cross-Reference

| DF-ID | Name | UC Reference | W Reference | Status |
|---|---|---|---|---|
| DF-01 | Authentication Flow | UC-01 | W-02 | Implemented |
| DF-02 | Token Lifecycle | UC-01, UC-03 | W-03 | Implemented |
| DF-03 | Permission Check | UC-01 | W-02 | Implemented |
| DF-04 | 2FA Setup + Verification | UC-08 | W-04 | Implemented |
| DF-05 | Company Selection | UC-09 | W-05 | Implemented |
| DF-06 | Audit Logging | UC-01, UC-04, UC-05 | W-02 | Partial |
| DF-07 | Password Reset | UC-07 | W-06 | Implemented |
| DF-08 | VNeID Integration | (future) | (future) | Not implemented |
| DF-09 | Digital Signature | (future) | (future) | Not implemented |
