# Use Cases — User Management Module

---

## UC-01: User Login

**Actor:** Accountant, Chief Accountant, Admin

**Preconditions:** User account exists, account active, password set

### Happy Path
1. User enters username + password
2. System validates credentials
3. System checks account active
4. System checks account not locked
5. System generates JWT access token (15min) + refresh token (7d)
6. System logs successful login attempt
7. User receives token pair

### Alternative Path: Locked Account
1. A1-2 same
2. A3: Account locked (FailedLoginAttempts >= 5)
3. System returns "Account locked. Try again later."
4. System logs `AccountLocked` attempt

### Alternative Path: Inactive Account
1. A1-2 same
2. A3: Account inactive (IsActive = false)
3. System returns "Account is inactive"
4. System logs `AccountInactive` attempt

### Exception Path: Invalid Credentials
1. A1 same
2. A2: Password mismatch
3. System increments FailedLoginAttempts
4. If FailedLoginAttempts >= 5, locks account (15min default)
5. System returns "Invalid username or password"
6. System logs `InvalidCredentials` attempt

### Exception Path: MFA Required (Future)
1. Happy path A1-A5
2. System detects MfaEnabled = true
3. System returns MFA challenge token (no full access yet)
4. User provides MFA code
5. System validates, issues full tokens

---

## UC-02: User Logout

**Actor:** Any authenticated user

**Preconditions:** User has valid refresh token

### Happy Path
1. User sends refresh token
2. System revokes token (RevokedAt set)
3. System returns 200 OK

### Alternative Path: Already Revoked/Expired
1. A1 same
2. Token already revoked or expired
3. System still returns 200 OK (idempotent)

---

## UC-03: Refresh Token

**Actor:** Any authenticated user

**Preconditions:** User has valid (access + refresh) token pair

### Happy Path
1. User sends expired access token + valid refresh token
2. System validates refresh token (exists, active, not revoked, not expired)
3. System validates access token (extracts userId, matches refresh token)
4. System validates user still exists and active
5. System revokes old refresh token (rotation)
6. System issues new token pair
7. User receives new tokens

### Exception Path: Invalid Refresh Token
1. A1 same
2. Refresh token not found or not active
3. System returns "Invalid or expired refresh token"

### Exception Path: User Deactivated
1. A1-A3 same
2. User inactive or deleted
3. System returns "User not found or inactive"
4. System revokes refresh token

---

## UC-04: Change Password

**Actor:** Any authenticated user

**Preconditions:** User logged in, knows current password

### Happy Path
1. User sends current password + new password
2. System validates current password matches
3. System checks new password not in last 10 password history
4. System validates new password against PasswordPolicy
5. System hashes new password, stores it
6. System updates password history
7. User notified success

### Exception Path: Wrong Current Password
1. A1 same
2. Current password mismatch
3. System returns "Current password is incorrect"

### Exception Path: Password Reuse
1. A1-A2 same
2. New password matches one of last 10 hashes
3. System returns "Cannot reuse a recent password"

### Exception Path: Weak Password
1. A1-A2 same
2. New password fails policy (min length, uppercase, digit, special char)
3. System returns validation errors

---

## UC-05: Get Current User

**Actor:** Any authenticated user

**Preconditions:** User has valid JWT token

### Happy Path
1. User sends GET /me with JWT
2. System extracts userId from token
3. System loads user + roles + permissions
4. Returns UserDto (id, username, email, name, roles, permissions)

### Exception Path: User Not Found
1. A1-A2 same
2. User deleted after token issued
3. System returns 404 "User not found"

---

## UC-06: Admin Create User (Future)

**Actor:** System Admin / Chief Accountant

**Preconditions:** Admin has permission `User.Create`

### Happy Path
1. Admin enters username, email, name, role assignment, org unit
2. System validates uniqueness (username, email)
3. System generates temporary password
4. User created in inactive state (must activate via email)
5. Invitation email sent

### Exception Path: Duplicate Username
1. A1 same
2. Username taken
3. System returns validation error

---

## UC-07: Admin Manage Roles (Future)

**Actor:** System Admin

**Preconditions:** Admin has `Role.Manage` permission

### Happy Path
1. Admin creates/edits role definition
2. Admin assigns FeaturePermissions (View/Create/Edit/Delete/Print/Export/Approve)
3. Role inheritance chain validated (no circular)
4. System saves role

### Alternative Path: System Role Modification
1. A1: System role (IsSystem=true) detected
2. Limited modification allowed
3. Cannot delete system role

---

## UC-08: Tax Declaration Permission (Regulatory Requirement — NEW)

**Actor:** Legal Representative (Người đại diện pháp luật)

**Preconditions:** Company has VNeID organization account, Legal rep has Level-2 eID

### Happy Path
1. Legal rep logs into VNeID
2. Selects organization identity
3. Adds member (accountant) with "Add member"
4. Member confirms on VNeID
5. Legal rep grants tax transaction permissions (checked "TCT")
6. Accountant can now log into thuế điện tử (thuedientu.gdt.gov.vn)
7. Accountant performs tax declarations on behalf of company

### Exception Path: Biometric Verification Required (from 05/2026)
1. Legal rep registers/changes e-invoice info
2. System requires biometric verification per Công văn 3078/CT-NVT
3. Legal rep must have VNeID Level-2 + eTax Mobile app
4. Personal info must match National Population Database
5. After verification, e-invoice registration proceeds

---

## UC-09: Digital Signature for Tax Filing (Regulatory Requirement)

**Actor:** Authorized accountant, Legal representative

**Preconditions:** Valid digital certificate (from CA provider) installed

### Happy Path
1. User prepares tax declaration form
2. System integrates with eSigner (Tổng cục Thuế) or CA-provided signing tool
3. User selects certificate, enters PIN
4. System applies digital signature
5. Signed XML file transmitted to tax authority via eTax gateway
6. Tax authority returns receipt with signature

### Alternative Path: SMS OTP (Individuals without digital cert)
1. User is individual taxpayer without digital certificate
2. System sends SMS OTP to registered phone
3. User enters OTP
4. System uses Smart OTP / SMS OTP as legal signature

---

## UC-10: Audit Trail for Data Correction (Regulatory Requirement)

**Actor:** Accountant, Chief Accountant

**Preconditions:** User has Edit/Delete permission on resource

### Happy Path: Correction with Trail
1. User edits journal entry / account / document
2. System does NOT overwrite original data
3. System creates correction entry with:
   - Original values (oldValues)
   - New values (newValues)
   - User ID, timestamp, IP, user-agent
   - Reason for correction
4. Both original and correction visible in audit report

### Exception Path: Silent Modification (PROHIBITED)
1. User attempts direct DB modification
2. (TT 99/2025/TT-BTC prohibits — system must detect and prevent)
3. System detects modification without proper audit trail
4. System logs security event, alerts admin, prevents save
