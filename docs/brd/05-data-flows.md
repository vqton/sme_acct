# Data Flows — User Management Module

---

## DF-01: Authentication Flow

```
[Client]                    [AuthController]              [LoginCommandHandler]             [UserRepository]          [JwtTokenService]
    |                              |                              |                              |                         |
    |-- POST /api/auth/login ----->|                              |                              |                         |
    |   {username, password,       |                              |                              |                         |
    |    deviceInfo, ip}          |                              |                              |                         |
    |                              |-- LoginCommand ------------->|                              |                         |
    |                              |                              |-- GetByUsernameAsync() ------>|                         |
    |                              |                              |<-- User (or null) ------------|                         |
    |                              |                              |                              |                         |
    |                              |                              |-- [Validate active, locked]  |                         |
    |                              |                              |-- [Verify password hash]     |                         |
    |                              |                              |                              |                         |
    |                              |                              |-- RecordFailedAttempt() ---->|                         |
    |                              |                              |   (if invalid)              |                         |
    |                              |                              |                              |                         |
    |                              |                              |-- SetLastLogin() ----------->|                         |
    |                              |                              |-- GetUserEffectivePerms()   |                         |
    |                              |                              |                              |                         |
    |                              |                              |-- GenerateTokens() --------->|-----> TokenResult -------|
    |                              |                              |<-- TokenResult --------------|                         |
    |                              |                              |                              |                         |
    |                              |                              |-- AddRefreshToken() -------->|                         |
    |                              |                              |-- AddLoginAttempt() -------->|                         |
    |                              |                              |-- SaveChangesAsync() ------->|                         |
    |                              |                              |                              |                         |
    |                              |<-- Result<TokenResponse> ----|                              |                         |
    |<-- 200 {accessToken,         |                              |                              |                         |
    |    refreshToken, expiresAt} -|                              |                              |                         |
```

## DF-02: Data Flow — User Creation to First Login

```
[Admin] -> [CreateUserCommand] -> [Validate] -> [UserRepository.Add()]
                                              -> [GenerateTempPassword]
                                              -> [EmailService.SendInvite]
                                                    |
[User]  <- [Receives Email with Link] <- [*] <- [Temp Password]
  |
  +-> [First Login] -> [Validate Temp Password]
                    -> [ForceChangePassword]
                    -> [SetPassword(newHash)]
                    -> [User Active State]
                    -> [Can Now Access System]
```

## DF-03: Permission Check Flow

```
[Request with JWT] -> [AuthMiddleware] -> [ValidateToken]
                                        -> [Extract Claims (sub, roles, permissions)]
                                        -> [Set HttpContext.User]
                                              |
[Authorize] -> [PermissionAuthorizationHandler]
            -> [Check required permission in claims]
            -> [Match against FeatureAccess flags]
            -> [Allow/Deny]
```

## DF-04: Token Refresh Flow

```
[Client] -> [POST /api/auth/refresh] -> [RefreshTokenCommandHandler]
                                      -> [GetRefreshTokenAsync(token)]
                                      -> [ValidateToken(accessToken)]
                                      -> [Validate User Active]
                                      -> [Rotate: Revoke old, Create new]
                                      -> [SaveChanges]
                                      -> [Return new TokenPair]
```

## DF-05: VNeID Integration Flow (NEW — Required Regulatory)

```
[SmeAccounting] <-> [VNeID API (Bộ Công An)] <-> [thuedientu.gdt.gov.vn]
     |                       |                            |
     |-- VerifyIdentity ---->|                            |
     |<-- IdentityResult ----|                            |
     |                       |                            |
     |-- CheckTaxPerms ----->|----> CheckOrganization --->|
     |                       |<--- TaxOrgStatus ----------|
     |<-- TaxPermResult -----|                            |
     |                       |                            |
     |-- SubmitTaxFile ----->|----> ForwardToTaxSystem -->|
     |<-- Receipt -----------|<--- TaxReceipt ------------|
```

## DF-06: Audit Trail Data Flow

```
[User Action] -> [Command Handler] -> [IUnitOfWork.SaveChangesAsync]
                                           |
                                           +-> [ApplicationDbContext SaveChanges Interceptor]
                                           |       |
                                           |       +-> [Detect Entity Changes]
                                           |       +-> [Capture OldValues / NewValues]
                                           |       +-> [Get Current User from HttpContext]
                                           |       +-> [Get IP / UserAgent]
                                           |       +-> [Create AuditEntity record]
                                           |
                                           +-> [Database: AuditLog table]
```

## DF-07: Data Correction Audit (Regulatory — TT 99/2025)

```
BEFORE CORRECTION:
  [JournalEntry: Id=123, Amount=10M, Posted=true]

CORRECTION ACTION:
  Step 1: Load original JournalEntry
  Step 2: Create CorrectionEntry (Id=456)
          - ReferenceId = 123
          - OldAmount = 10M
          - NewAmount = 12M
          - Reason = "Adjusted for additional invoice #789"
          - CorrectedBy = UserId
          - CorrectedAt = UTC now
          - IpAddress, UserAgent
  Step 3: Update JournalEntry.Amount = 12M
          (Original still visible in correction trail)
  Step 4: If posted, require Chief Accountant approval first
  Step 5: Log to AuditLog

OUTPUT: Full correction history visible in reports
  - Original entry: 10M (created 2026-07-01 by UserA)
  - Correction #1: 10M -> 12M (2026-07-10 by UserB, reason: "Adj for inv #789")
```

## DF-08: Digital Signature Flow

```
[Tax Declaration prepared in system]
         |
         v
[Convert to XML format per Tổng cục Thuế spec]
         |
         v
[User selects digital certificate (via eSigner)]
         |
         v
[System calls eSigner API / external signing provider]
         |
         v
[User enters PIN to authorize signing]
         |
         v
[XML file digitally signed]
         |
         v
[Transmit to thuedientu.gdt.gov.vn via T-VAN]
         |
         v
[Tax authority returns signed receipt]
         |
         v
[Receipt stored in system for record]
```
