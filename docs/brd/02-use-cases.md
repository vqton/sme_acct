# Use Cases — User Management Module

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft

---

## UC-01: User Login

**Actor:** Accountant, Chief Accountant, Admin (all roles)

**Preconditions:** User account exists in `users` table, `is_active = 1`, password stored as bcrypt hash.

### Happy Path
1. User enters username + password via `POST /api/auth/login`
2. System validates credentials via `AuthService.login()`
3. System checks `user.isActive === true` — if false, throw `AccountDisabledError`
4. System checks `lockoutUntil` — if future, throw `AccountLockedError`
5. System verifies password via `bcrypt.compareSync()`
6. If `user.twoFactorEnabled === true`: system generates 5-minute JWT `tempToken` with purpose `'2fa'`, returns `{ requires2FA: true, tempToken }` (see UC-08)
7. If no 2FA: system calls `this.createAccessToken()` (15-min HS256 JWT with `userId`, `username`, `companyId`, `roles`, `jti`)
8. System calls `this.createRefreshToken()` (7-day, SHA-256 hashed, stored in `refresh_tokens` table)
9. System resets `failedLoginAttempts` to 0, clears `lockoutUntil`
10. If single company: token includes `companyId`, auto-selected. If multiple companies: returns company list, no access token yet (see UC-09)
11. System logs `USER_LOGIN` audit event with IP address and user agent
12. User receives `{ token, refreshToken, user, companies }`

### Alternative Path 1: Account Locked
1. Same as happy path A1-A4
2. A5: `lockoutUntil` is in the future (5 failed attempts, 30-min lockout)
3. System returns HTTP 423 with `retryAfter` seconds
4. System returns message: "Account locked due to too many failed attempts. Try again in X seconds."

### Alternative Path 2: Account Disabled
1. Same as happy path A1-A3
2. A4: `user.isActive === false`
3. System returns HTTP 403 with message "Account disabled"
4. No audit event logged (account disabled state already known)

### Exception Path 1: Invalid Credentials
1. Same as happy path A1-A5
2. A6: `bcrypt.compareSync()` returns false
3. System increments `failedLoginAttempts` in `users` table
4. If attempts >= 5 (LOCKOUT_THRESHOLD): sets `lockoutUntil = Date.now() + 30min`
5. System logs `LOGIN_FAILED` audit event with attempt count
6. Returns HTTP 401: "Invalid credentials"

### Exception Path 2: Rate Limited
1. Rate limiter middleware (in-memory sliding window, 5 attempts/15-min per IP) intercepts before `AuthService.login()`
2. System returns HTTP 429 with `retryAfter` header
3. Message: "Too many login attempts. Please try again later."

---

## UC-02: User Logout

**Actor:** Any authenticated user

**Preconditions:** User has valid JWT access token.

### Happy Path
1. User sends `POST /api/auth/logout` with `Authorization: Bearer <token>`
2. `authMiddleware` validates access token (HS256, not expired, valid signature)
3. `AuthService.logout(userId)` called
4. System revokes ALL refresh tokens for this user via `refreshTokenRepo.revokeAllForUser(userId)`
5. System logs `USER_LOGOUT` audit event
6. Returns `{ ok: true }`

### Alternative Path 1: Already Logged Out
1. User sends logout request with expired or invalid token
2. `authMiddleware` returns HTTP 401 before reaching service layer
3. No session state change needed

### Alternative Path 2: Partial Session Revocation
1. User logs out from one device but has active sessions on other devices
2. System revokes ALL sessions (not just current device)
3. Message: "All sessions terminated"

### Exception Path 1: Token Already Expired
1. User sends logout with expired access token
2. Middleware rejects before service call: HTTP 401
3. Refresh token remains active until natural expiry or explicit revocation

### Exception Path 2: Service Error
1. `refreshTokenRepo.revokeAllForUser()` throws database error
2. System returns HTTP 500

---

## UC-03: Token Refresh

**Actor:** Any user with valid refresh token

**Preconditions:** `refresh_token` exists in DB, not revoked, not expired (7-day window).

### Happy Path
1. User sends `POST /api/auth/refresh` with `{ refreshToken: "<token>" }`
2. System SHA-256 hashes the provided token, looks up in `refresh_tokens` table
3. System verifies `revokedAt === null` and `expiresAt > Date.now()`
4. System REVOKES the old refresh token (token rotation — prevents replay)
5. System loads user from `users` table, verifies `isActive === true`
6. System generates new 15-min access token (preserves `companyId` from old token)
7. System generates new 7-day refresh token, stores SHA-256 hash in `refresh_tokens`
8. System logs `TOKEN_REFRESHED` audit event
9. Returns `{ token, refreshToken, user, companyId }`

### Alternative Path 1: Company Selection Required
1. User has multiple companies and no `companyId` is set on the refresh token
2. System returns `{ token, refreshToken, user, companies: [...] }`
3. User must call UC-09 (Company Selection) before accessing company-scoped resources

### Alternative Path 2: Refresh Without Company Context
1. User logs in with single company, refresh token has `companyId` set
2. Refresh preserves company context
3. New access token includes the same `companyId`

### Exception Path 1: Revoked Token
1. Old token already revoked (e.g., password change, logout, or previous refresh)
2. `refreshTokenRepo.findValid(hash)` returns null
3. System returns HTTP 401: "Invalid credentials"

### Exception Path 2: Expired Token
1. Token expired (>7 days old)
2. `refreshTokenRepo.findValid(hash)` returns null (query filters by `expires_at`)
3. System returns HTTP 401: "Invalid credentials"
4. User must re-authenticate via UC-01

---

## UC-04: Change Password

**Actor:** Any authenticated user

**Preconditions:** User is logged in, knows current password.

### Happy Path
1. User sends `POST /api/auth/change-password` with `{ oldPassword, newPassword }` + Bearer token
2. `authMiddleware` validates access token
3. `AuthService.changePassword(userId, oldPassword, newPassword)` called
4. System loads user, verifies `bcrypt.compareSync(oldPassword, user.passwordHash)`
5. System validates `newPassword` against policy: min 8 chars, uppercase, lowercase, digit, special char
6. System checks password history (last 5) via `bcrypt.compareSync(newPassword, historyHash)` for each — if match, throw `ValidationError("Cannot reuse last 5 passwords")`
7. System hashes new password: `bcrypt.hashSync(newPassword, 10)`
8. System saves old password hash to `password_history` table
9. System updates user's `passwordHash` in `users` table
10. System revokes ALL refresh tokens (forces re-login on all devices)
11. System logs `PASSWORD_CHANGED` audit event
12. Returns `{ ok: true }`

### Alternative Path 1: Password History Reuse
1. Same as happy path A1-A6
2. A7: `bcrypt.compareSync()` matches one of the 5 recent hashes
3. System returns HTTP 400: "Cannot reuse last 5 passwords"
4. User must choose a different password

### Alternative Path 2: Weak New Password
1. Same as happy path A1-A5
2. A6: `validatePassword()` fails (e.g., no special character)
3. System returns HTTP 400 with specific validation message

### Exception Path 1: Wrong Old Password
1. `bcrypt.compareSync(oldPassword, user.passwordHash)` returns false
2. System returns HTTP 401: "Invalid credentials"
3. No lockout increment (unlike login)
4. No audit event logged for this failure

### Exception Path 2: User Not Found
1. `userRepo.findById(userId)` returns null (deleted during session)
2. System returns HTTP 401: "Invalid credentials"

---

## UC-05: List/Revoke Sessions

**Actor:** Any authenticated user

**Preconditions:** User has valid access token, sessions exist in `refresh_tokens` table.

### Happy Path — List Sessions
1. User sends `GET /api/auth/sessions` with Bearer token
2. `AuthService.listActiveSessions(userId)` queries `refresh_tokens WHERE userId AND revokedAt IS NULL AND expiresAt > NOW`
3. Returns `{ sessions: [{ id, ipAddress, userAgent, deviceName, createdAt, lastUsedAt }] }`

### Happy Path — Revoke Single Session
1. User sends `DELETE /api/auth/sessions/:id` with Bearer token
2. System loads session by ID, verifies `session.userId === current userId` (cannot revoke another user's session)
3. System sets `revokedAt` on the token row
4. System logs `SESSION_REVOKED` audit event
5. Returns `{ ok: true }`

### Happy Path — Revoke All Sessions (Bulk)
1. User sends `DELETE /api/auth/sessions` with Bearer token
2. `AuthService.revokeAllSessions(userId)` sets `revokedAt` on ALL active tokens for user
3. System logs `SESSIONS_REVOKED` audit event
4. Returns `{ ok: true }`

### Alternative Path 1: No Active Sessions
1. User has no active sessions (all expired or revoked)
2. Returns empty array: `{ sessions: [] }`

### Alternative Path 2: Revoke Nonexistent Session
1. User sends `DELETE /api/auth/sessions/nonexistent-id`
2. `refreshTokenRepo.findById()` returns null
3. Returns HTTP 404: "Session not found"

### Exception Path 1: Revoke Another User's Session
1. User sends `DELETE /api/auth/sessions/:id` where session belongs to different user
2. System detects `session.userId !== req.user.userId`
3. Returns HTTP 404: "Session not found" (no information leak about existence)

### Exception Path 2: Database Error During Revocation
1. System fails to update `revokedAt` (DB constraint violation, etc.)
2. Returns HTTP 500: "Failed to revoke session"

---

## UC-06: Register New User

**Actor:** Unauthenticated user (self-registration) or Admin (manual creation)

**Preconditions:** Username and email must be unique in `users` table.

### Happy Path
1. User submits `POST /api/auth/register` with `{ username, email, password, fullName }`
2. System validates username (min 3 chars, trimmed)
3. System validates email (regex pattern, lowercase, trimmed)
4. System validates password against `validatePassword()` (min 8, upper, lower, digit, special)
5. System checks `userRepo.findByUsername()` — if exists, throw `UsernameTakenError`
6. System checks `userRepo.findByEmail()` — if exists, throw `EmailTakenError`
7. System hashes password: `bcrypt.hashSync(password, 10)`
8. System creates user with `id: crypto.randomUUID()`, `isActive: true`, `createdAt: new Date()`
9. System logs `USER_REGISTERED` audit event
10. Returns HTTP 201: `{ id, username, email, fullName }`

### Alternative Path 1: Username Taken
1. `userRepo.findByUsername(username)` returns existing user
2. Returns HTTP 409: "Username already taken"

### Alternative Path 2: Email Taken
1. `userRepo.findByEmail(email)` returns existing user
2. Returns HTTP 409: "Email already in use"

### Exception Path 1: Invalid Input
1. Username < 3 characters, or invalid email format
2. Returns HTTP 400 with specific validation message
3. No database write occurs

### Exception Path 2: Weak Password
1. Password fails strength requirements
2. Returns HTTP 400 with message (e.g., "Password must contain at least one uppercase letter")
3. No database write occurs

---

## UC-07: Forgot/Reset Password

**Actor:** Unauthenticated user (forgot) / User with valid reset token (reset)

**Preconditions:** User's email exists in system (forgot). Reset token stored with SHA-256 hash (reset).

### Happy Path — Forgot Password
1. User submits `POST /api/auth/forgot-password` with `{ email }`
2. System looks up user by email via `userRepo.findByEmail()`
3. If found: generates `crypto.randomBytes(32).toString('hex')` as raw token
4. System SHA-256 hashes the raw token, stores in `password_reset_tokens` table with 1-hour expiry
5. System logs `PASSWORD_RESET_REQUESTED` audit event
6. Returns `{ ok: true, token: "<rawToken>" }`

### Happy Path — Reset Password
1. User submits `POST /api/auth/reset-password` with `{ token, newPassword }`
2. System SHA-256 hashes token, looks up in `password_reset_tokens` where `usedAt IS NULL AND expiresAt > NOW`
3. System validates `newPassword` strength
4. System loads user, hashes new password via `bcrypt.hashSync(newPassword, 10)`
5. System saves old hash to `password_history` table
6. System updates `users.passwordHash`, resets `failedLoginAttempts = 0`, clears `lockoutUntil`
7. System marks reset token as used (`usedAt = now()`)
8. System revokes ALL refresh tokens for user
9. System logs `PASSWORD_RESET_COMPLETED` audit event
10. Returns `{ ok: true }`

### Alternative Path 1: Email Not Found
1. `userRepo.findByEmail()` returns null
2. System returns `{ ok: true, token: '' }` — no information disclosure about whether email exists
3. No database write or audit event

### Alternative Path 2: Multiple Reset Requests
1. User requests multiple resets within 1 hour
2. Previous tokens remain valid (not invalidated) — first-come-first-served
3. `passwordResetTokenRepo.deleteExpired()` called before each new token creation

### Exception Path 1: Invalid/Expired Reset Token
1. Token not found in DB (invalid hash) or expired (>1 hour) or already used
2. System returns HTTP 400: "Invalid or expired reset token"

### Exception Path 2: Weak New Password
1. New password fails policy check
2. Returns HTTP 400 with validation message
3. Token remains valid for retry until expiry

---

## UC-08: 2FA Setup + Verify + Disable + Backup Codes

**Actor:** Any authenticated user

**Preconditions:** User has valid access token. 2FA not yet enabled for setup. 2FA enabled for login flow.

### Happy Path — Setup
1. User sends `POST /api/auth/2fa/setup` with Bearer token
2. `AuthService.setupTwoFactor(userId)` generates:
   - TOTP secret from `OTPAuth.TOTP` (issuer: 'SME Accounting', label: user.email, SHA1, 6 digits, 30s period)
   - 10 backup codes: each `crypto.randomBytes(4).toString('hex').toUpperCase()`
3. System stores `totpSecret` on user (but does NOT enable yet)
4. System deletes old backup codes, stores SHA-256 hashes of new backup codes
5. Returns `{ secret: "<base32>", backupCodes: ["ABCD1234", ...] }` (10 codes)

### Happy Path — Verify and Enable
1. User sends `POST /api/auth/2fa/verify` with `{ code: "<6-digit-totp>" }` + Bearer token
2. `AuthService.verifyAndEnableTwoFactor(userId, code)` creates TOTP from stored secret, validates code with window=1
3. On success: sets `user.twoFactorEnabled = true`, `user.updatedAt = now()`
4. System logs `TWO_FACTOR_ENABLED` audit event
5. Returns `{ ok: true }`

### Happy Path — Login with 2FA
1. User completes UC-01 A1-A5
2. System detects `user.twoFactorEnabled === true`
3. System generates 5-minute JWT `tempToken` with `{ userId, purpose: '2fa' }`
4. Returns `{ requires2FA: true, tempToken }` — NO access token yet
5. User sends `POST /api/auth/2fa/verify-login` with `{ tempToken, code }`
6. `AuthService.verifyTwoFactorLogin(tempToken, code)`:
   - Verifies `tempToken` JWT (HS256, 5-min expiry, purpose='2fa')
   - Tries TOTP validation first (window=1)
   - If fails: tries backup code validation (uppercase, SHA-256 hash match)
   - On success: calls `this.completeLogin(user)` which generates access + refresh tokens
   - On failure: throws `InvalidTOTPError`

### Happy Path — Disable
1. User sends `POST /api/auth/2fa/disable` with `{ code: "<6-digit-totp>" }` + Bearer token
2. `AuthService.disableTwoFactor(userId, code)` validates TOTP code
3. On success: clears `totpSecret`, sets `twoFactorEnabled = false`
4. System logs `TWO_FACTOR_DISABLED` audit event
5. Returns `{ ok: true }`

### Alternative Path 1: Login via Backup Code
1. User completes UC-01 A1-A5 with 2FA enabled
2. User loses authenticator app, uses backup code instead of TOTP
3. `verifyTwoFactorLogin()` tries TOTP (fails), falls back to backup code check
4. System SHA-256 hashes the provided code (uppercased), looks up in `backup_codes` where `usedAt IS NULL`
5. On match: marks code as used, completes login
6. Used backup code cannot be reused (one-time use)

### Alternative Path 2: Setup Without Backup Code Storage
1. If `backupCodeRepo` not configured (null), setup still works
2. Backup codes returned but not persisted
3. User must save codes — no recovery option if lost

### Exception Path 1: Invalid TOTP Code
1. TOTP code does not match (wrong time, wrong secret, wrong period)
2. `delta` returned as `null`
3. System returns HTTP 400/401: "Invalid verification code"

### Exception Path 2: Expired TempToken During 2FA Login
1. User takes >5 minutes to enter 2FA code
2. `jwt.verify(tempToken)` throws (expired)
3. Returns HTTP 401: "Invalid credentials"
4. User must restart login from UC-01

---

## UC-09: Company Selection (Multi-Company)

**Actor:** User assigned to multiple companies

**Preconditions:** User has valid refresh token (no company context). User belongs to >= 2 active companies.

### Happy Path
1. User calls UC-01, system detects `userCompanies.length > 1`
2. System returns `{ token: null, refreshToken, user, companies: [...] }`
3. User selects company and sends `POST /api/auth/select-company` with `{ refreshToken, companyId }`
4. `AuthService.selectCompany(refreshToken, companyId)`:
   - SHA-256 hashes refresh token, looks it up
   - Verified `UserCompany` membership: `findByUserIdAndCompanyId(userId, companyId)` with `isActive = true`
   - Generates new access token WITH `companyId` in payload
   - Generates new refresh token WITH `companyId`
   - REVOKES old refresh token
5. Returns `{ token, refreshToken, user, companyId, companies }`

### Alternative Path 1: Single Company — Auto-Select
1. User has exactly 1 active company membership
2. UC-01 A7 auto-selects: token includes `companyId`, no company selection needed
3. Refresh token also scoped to that `companyId`

### Alternative Path 2: Switch Company
1. User is already working in company A (access token has companyId=A)
2. To switch to company B: user calls refresh (UC-03) with company-scoped token
3. Gets new refresh token scoped to company A
4. User calls `selectCompany` with that refresh token and company B's ID
5. System verifies membership in B, generates new token for B

### Exception Path 1: Company Not Assigned
1. User tries to select a company they don't belong to
2. `findByUserIdAndCompanyId()` returns null, or `isActive = false`
3. Returns HTTP 403: "User is not a member of company X"

### Exception Path 2: Invalid Refresh Token
1. Token hash not found (revoked, expired, or never issued)
2. Returns HTTP 401: "Invalid credentials"

---

## UC-10: Admin Create User (NOT IMPLEMENTED)

**Actor:** System Admin (he-thong) or Chief Accountant (ke-toan-truong)

**Preconditions:** Admin has `user:create` permission. User must not exist (unique username/email).

### Happy Path
1. Admin submits `POST /api/admin/users` with `{ username, email, fullName, roleIds[], companyIds[], phone? }`
2. System validates input fields
3. System checks creating user has `user:create` permission
4. System checks uniqueness of username and email
5. System generates temporary password (random 12-char meeting policy)
6. System creates user with `isActive = true`, temp password as bcrypt hash
7. System assigns roles via `AuthorizationService.assignRole()`
8. System assigns company memberships via `UserCompanyRepository.create()`
9. System logs `USER_CREATED_BY_ADMIN` audit event with creator userId
10. Returns HTTP 201: `{ id, username, email, fullName, tempPassword }`

### Alternative Path 1: With Company-Scoped Roles
1. Admin assigns different roles per company
2. `role` stored on `UserCompany` record instead of global `user_roles`

### Alternative Path 2: Admin Cannot Self-Assign System Admin Role
1. Admin tries to assign `he-thong` role to self or another user
2. `SoDConflictMatrix.checkSystemAdminAccounting()` returns warning
3. System requires second admin approval

### Exception Path 1: Insufficient Permissions
1. Creating user lacks `user:create` permission
2. Middleware returns HTTP 403: "Insufficient permissions"

### Exception Path 2: Duplicate Username/Email
1. Username or email already exists
2. Returns HTTP 409: "Username already taken" / "Email already in use"

---

## UC-11: Tax Declaration Permission (Regulatory Requirement — NOT IMPLEMENTED)

**Actor:** Chief Accountant (ke-toan-truong), Director (giam-doc)

**Preconditions:** Company is active. Tax accountant user exists.

### Happy Path
1. Chief Accountant navigates to Tax Declaration Permissions screen
2. System displays list of users with role `ke-toan-thue` (Tax Accountant)
3. Chief Accountant selects user and grants `tax:declare` permission
4. System records authorization: userId, taxPeriod, grantedAt, grantedBy, expiryDate
5. System logs tax declaration authorization in audit log
6. Tax Accountant can now access e-tax filing module

### Alternative Path 1: Time-Limited Authorization
1. Chief Accountant sets expiry date on tax declaration permission
2. Permission auto-revokes at expiry
3. Audit log records the time limit

### Alternative Path 2: Revoke Authorization
1. Chief Accountant revokes tax declaration permission before expiry
2. Tax Accountant immediately loses access to e-tax filing
3. Audit log records revocation

### Exception Path 1: Unauthorized Granting
1. Non-Chief-Accountant tries to grant tax declaration permission
2. Returns HTTP 403: "Only Chief Accountant can authorize tax declarations"

### Exception Path 2: Duplicate Authorization
1. Same tax period already has an authorized user
2. System warns: "Tax declaration permission already granted for this period"
3. Requires confirmation to override

---

## UC-12: Digital Signature for Tax Filing (Regulatory Requirement — NOT IMPLEMENTED)

**Actor:** Tax Accountant, Chief Accountant

**Preconditions:** NĐ 23/2025/NĐ-CP compliant digital signature certificate installed. VNeID identity verified.

### Happy Path
1. User initiates tax declaration submission
2. System detects tax declaration requires digital signature (NĐ 23/2025)
3. System calls eSigner API (Tổng cục Thuế mandated software) to sign document
4. System receives signed document with valid certificate
5. System logs digital signature event: userId, documentId, timestamp, certificateId
6. System submits signed document to tax authority API
7. Returns submission confirmation with tax authority receipt ID

### Alternative Path 1: SMS OTP Signature
1. User is an individual without digital certificate
2. System sends SMS OTP to registered phone number
3. User enters OTP to authorize tax submission
4. OTP serves as e-signature equivalent per NĐ 23/2025 Điều 22

### Alternative Path 2: Certificate Expired
1. Digital certificate is expired or revoked
2. System detects via certificate validation API
3. Returns error: "Digital signature certificate expired. Please renew."
4. Submission blocked until valid certificate installed

### Exception Path 1: No Digital Certificate Installed
1. System detects no valid digital certificate on server or client
2. Returns error: "Digital signature required (NĐ 23/2025/NĐ-CP). Install eSigner client."
3. Tax declaration cannot proceed

### Exception Path 2: Signature Verification Failed
1. eSigner API returns signature verification failure
2. System logs failed signature attempt
3. Alert sent to Chief Accountant
4. Tax declaration not submitted

---

## UC-13: Audit Trail for Data Correction (Regulatory Requirement — NOT IMPLEMENTED)

**Actor:** Any accounting role with edit permission

**Preconditions:** TT 99/2025/TT-BTC Điều 28 requires all corrections to leave trace. Removed from the `Express` middleware pipeline currently.

### Happy Path
1. User edits a journal entry (bút toán) or account balance
2. Express middleware interceptor captures:
   - Original data (before image): full record as JSON
   - Modified data (after image): full record as JSON
   - User ID, session ID, IP address, timestamp
   - Resource type and resource ID
3. System stores audit record in `audit_logs` table with `action: 'DATA_CORRECTION'`
4. Edit proceeds normally
5. Original values viewable via audit trail UI (read-only)

### Alternative Path 1: Batch Correction
1. User corrects multiple records (e.g., month-end adjustment)
2. System captures before/after for EACH record
3. Audit entries linked by batch ID
4. Batch correction viewed as group

### Alternative Path 2: Reversal Instead of Edit
1. User chooses to reverse+recreate rather than edit
2. System records reversal as new transaction (not correction)
3. Both original and reversal preserved in audit trail
4. Preferred method per accounting best practice

### Exception Path 1: Silent Modification Attempt
1. User or background job attempts direct SQL update bypassing middleware
2. No audit record created (gap — must use TRIGGER-level capture)
3. PROD readiness: must add SQLite trigger or application-layer interceptor

### Exception Path 2: Immutable Record
1. User tries to edit an already-approved/closed-period record
2. System blocks edit: "Cannot modify approved record. Create reversal entry."
3. Returns HTTP 403 with reason
4. No audit trail entry needed (operation not performed)

---

## Use Case Summary

| UC ID | Name | Implemented | Depends On |
|---|---|---|---|
| UC-01 | User Login | YES | — |
| UC-02 | User Logout | YES | UC-01 |
| UC-03 | Token Refresh | YES | UC-01 |
| UC-04 | Change Password | YES | UC-01 |
| UC-05 | List/Revoke Sessions | YES | UC-01 |
| UC-06 | Register New User | YES | — |
| UC-07 | Forgot/Reset Password | YES | — |
| UC-08 | 2FA Setup + Verify + Disable | YES | UC-01 |
| UC-09 | Company Selection | YES | UC-01 |
| UC-10 | Admin Create User | NO | UC-01, BR-02 |
| UC-11 | Tax Declaration Permission | NO | BR-02, NĐ 23/2025 |
| UC-12 | Digital Signature for Tax Filing | NO | NĐ 23/2025, NĐ 69/2024 |
| UC-13 | Audit Trail for Data Correction | NO | TT 99/2025 Điều 28 |
