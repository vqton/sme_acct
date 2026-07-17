---
title: "Process Flows — Authentication & Authorization"
author: "Lead BA + Chief Accountant"
date: 2026-07-16
tags:
  - flows
  - authentication
  - authorization
  - data-flow
---

# Process Flows, Data Flows & Workflows

## 1. Authentication Data Flow Diagram

```
┌──────────┐     ┌──────────────────┐     ┌────────────────┐     ┌──────────────┐
│  CLIENT   │     │   WEB LAYER      │     │  APPLICATION    │     │  INFRASTRUCTURE │
│ (Browser) │     │   (Blazor/API)   │     │  (CQRS Handlers)│     │  (DB/Services)  │
└────┬─────┘     └────────┬─────────┘     └───────┬────────┘     └──────┬───────┘
     │                    │                       │                     │
     │  POST /login       │                       │                     │
     │───────────────────>│                       │                     │
     │                    │  LoginCommand         │                     │
     │                    │──────────────────────>│                     │
     │                    │                       │                     │
     │                    │                       │  GetByUsername()    │
     │                    │                       │────────────────────>│
     │                    │                       │  <── User (or null)─│
     │                    │                       │                     │
     │                    │                       │  Check: Active?     │
     │                    │                       │  LockedOut?         │
     │                    │                       │                     │
     │                    │                       │  GetPasswordPolicy()│
     │                    │                       │────────────────────>│
     │                    │                       │  <── Policy ────────│
     │                    │                       │                     │
     │                    │                       │  Verify(password)   │
     │                    │                       │  ─── PBKDF2 ───────>│
     │                    │                       │                     │
     │                    │                       │  GenerateTokens()   │
     │                    │                       │  ──────────────────>│
     │                    │                       │  <── JWT+Refresh ───│
     │                    │                       │                     │
     │                    │                       │  AddRefreshToken()  │
     │                    │                       │  AddLoginAttempt()  │
     │                    │                       │  SaveChangesAsync() │
     │                    │                       │────────────────────>│
     │                    │                       │  <── OK ────────────│
     │                    │  TokenResponse        │                     │
     │                    │<──────────────────────│                     │
     │  {accessToken,     │                       │                     │
     │   refreshToken,    │                       │                     │
     │   expiresAt}       │                       │                     │
     │<───────────────────│                       │                     │
     │                    │                       │                     │
```

## 2. Authorization Flow (Per-Request)

```
┌──────────────┐    ┌───────────────┐    ┌──────────────────┐    ┌─────────────┐
│  HTTP REQUEST │    │    MIDDLEWARE  │    │   AUTHORIZATION   │    │  CONTROLLER  │
│  + JWT Token   │    │    PIPELINE    │    │   HANDLER         │    │  + ACTION     │
└──────┬───────┘    └───────┬───────┘    └────────┬─────────┘    └──────┬──────┘
       │                    │                      │                     │
       │ Request            │                      │                     │
       │───────────────────>│                      │                     │
       │                    │                      │                     │
       │                    │ SessionValidationMw  │                     │
       │                    │  ─ Check token expiry│                     │
       │                    │  ─ Check concurrent  │                     │
       │                    │    sessions          │                     │
       │                    │                      │                     │
       │                    │ IpRestrictionMw      │                     │
       │                    │  ─ Load IP whitelist │                     │
       │                    │  ─ Match remote IP   │                     │
       │                    │                      │                     │
       │                    │ AuthenticationMw     │                     │
       │                    │  ─ Validate JWT sig  │                     │
       │                    │  ─ Populate identity │                     │
       │                    │                      │                     │
       │                    │ AuthorizationMw      │                     │
       │                    │─────────────────────>│                     │
       │                    │                      │                     │
       │                    │                      │ PolicyProvider      │
       │                    │                      │  ─ GetPolicy(policy)│
       │                    │                      │  ─ Parse Feature:Act│
       │                    │                      │                     │
       │                    │                      │ PermissionHandler   │
       │                    │                      │  ─ Read "permission"│
       │                    │                      │    claims           │
       │                    │                      │  ─ Match required   │
       │                    │                      │                     │
       │                    │                      │  Succeed or Fail   │
       │                    │<─────────────────────│                     │
       │                    │                      │                     │
       │                    │  Allow / 403         │                     │
       │<───────────────────│                      │                     │
       │                    │                      │                     │
       │                    │ (if 200)             │                     │
       │                    │──────────────────────────────────────────>│
       │                    │                      │                     │
       │  Response          │                      │                     │
       │<───────────────────────────────────────────────────────────────│
```

## 3. Token Lifecycle State Machine

```
                 ┌──────────────┐
                 │              │
    ┌────────────>  ISSUED      │
    │            │  (Active)    │
    │            │              │
    │            └──────┬───────┘
    │                   │
    │                   │
    │         ┌─────────┴──────────┐
    │         │                    │
    │         v                    v
    │   ┌───────────┐       ┌──────────┐
    │   │           │       │          │
    │   │  EXPIRED  │       │ REVOKED  │
    │   │ (Passive) │       │ (Passive)│
    │   │           │       │          │
    │   └───────────┘       └──────────┘
    │                           ▲
    │                           │
    └───────────────────────────┘
       (rotation: replaced by
        new refresh token)

Note: "REVOKED" is terminal. "EXPIRED" cannot be renewed.
Neither state can transition back to "ISSUED".
```

## 4. Password Change Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PASSWORD CHANGE WORKFLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  START                                                          │
│    │                                                            │
│    v                                                            │
│  [User enters: Current Password + New Password]                 │
│    │                                                            │
│    v                                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Verify Current Password against stored hash (PBKDF2)    │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    ├── FAIL ──> Return 400 "Current password is incorrect"     │
│    │                              STOP                          │
│    │                                                            │
│    v (PASS)                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Validate New Password against CompanyPasswordPolicy     │    │
│  │  - Min/Max length                                        │    │
│  │  - Uppercase, lowercase, digit, special char             │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    ├── FAIL ──> Return 400 with validation errors              │
│    │                              STOP                          │
│    │                                                            │
│    v (PASS)                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Check Password History (last 10 hashes)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    ├── REUSED ─> Return 400 "Cannot reuse a recent password"   │
│    │                              STOP                          │
│    │                                                            │
│    v (PASS)                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Hash new password: PBKDF2(password, new salt, 100K)     │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    v                                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Store:                                                   │    │
│  │  - New hash → PasswordHash                                │    │
│  │  - Old hash → PreviousPasswordHashes[0]                   │    │
│  │  - Trim history to 10 entries                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    v                                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [BREAKING: Revoke all existing refresh tokens]           │    │
│  │  (Currently NOT implemented — security gap)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│    │                                                            │
│    v                                                            │
│  [Return 200 OK]                                                │
│    │                                                            │
│    v                                                            │
│  [Client redirects to login (or re-issues tokens)]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Account Lockout Decision Tree

```
                    ┌──────────────┐
                    │  LOGIN       │
                    │  ATTEMPT     │
                    └──────┬───────┘
                           │
                           v
                    ┌──────────────┐
                    │ User found?  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │ NO         │ YES        │
              v            │            │
     ┌──────────────┐     │            │
     │ Return 401   │     v            │
     │ "Invalid     │  ┌──────────────┐ │
     │ credentials" │  │ IsActive?    │ │
     │ Log attempt  │  └──────┬───────┘ │
     └──────────────┘         │         │
                    ┌─────────┼────────┐│
                    │ NO      │ YES    ││
                    v         │        ││
              ┌──────────┐   │        ││
              │ Return   │   v        ││
              │ 401      │ ┌────────┐ ││
              │ "Inactive│ │Locked? │ ││
              │ Log      │ └───┬────┘ ││
              └──────────┘     │      ││
                    ┌──────────┼──────┘│
                    │ YES      │ NO    │
                    v          │       │
              ┌──────────┐    │       │
              │ Return   │    v       │
              │ 401      │ ┌────────┐ │
              │ "Locked" │ │ Verify │ │
              │ Log      │ │Password│ │
              └──────────┘ └───┬────┘ │
                               │      │
                    ┌──────────┼──────┘
                    │ FAIL     │ PASS
                    v          │
              ┌──────────┐    v
              │ Increment│  ┌─────────────────────┐
              │ failed   │  │ Reset failed count  │
              │ attempts │  │ SetLastLogin()      │
              │ Check >= │  │ GenerateTokens()    │
              │ max →    │  │ Persist RefreshToken│
              │ Lockout  │  │ Log Success         │
              │ Log      │  │ Return TokenResponse│
              └──────────┘  └─────────────────────┘
                   │
                   v
              Return 401
              "Invalid credentials"
```

## 6. Session Validation Middleware Flow

```
                   ┌──────────────────────┐
                   │  REQUEST ARRIVES     │
                   └──────────┬───────────┘
                              │
                              v
              ┌──────────────────────────────┐
              │ User authenticated (JWT)?    │
              └──────────┬───────────────────┘
                         │
              ┌──────────┼──────────┐
              │ NO       │ YES      │
              v          │          │
         ┌──────────┐    │          │
         │ Skip     │    v          │
         │ check    │  ┌─────────────────────────────────┐
         └──────────┘  │ Load User from DB               │
                       │ Load SessionSettings for Company│
                       └──────────┬──────────────────────┘
                                  │
                                  v
                 ┌──────────────────────────────────┐
                 │ EnforceSessionTimeout == true?    │
                 └──────────┬───────────────────────┘
                            │
                 ┌──────────┼──────────┐
                 │ NO       │ YES      │
                 v          │          │
            ┌──────────┐   │          │
            │ Skip     │   v          │
            │ session  │ ┌──────────────────────────┐
            │ checks   │ │ Check token "iat" claim  │
            └──────────┘ │ (issued-at timestamp)    │
                         │ Current - iat > expiry?  │
                         └──────────┬───────────────┘
                                    │
                         ┌──────────┼──────────┐
                         │ EXPIRED  │ VALID    │
                         v          │          │
                   ┌──────────┐     v          │
                   │ Return   │   ┌─────────────────────────┐
                   │ 401      │   │ Check active sessions   │
                   └──────────┘   │ Count RefreshTokens    │
                                  │ activeSessions > max?  │
                                  └──────────┬──────────────┘
                                             │
                                  ┌──────────┼──────────┐
                                  │ EXCEEDED │ OK       │
                                  v          │          │
                            ┌──────────┐     v          │
                            │ Return   │   ┌──────────┐ │
                            │ 401      │   │ Allow    │ │
                            └──────────┘   │ request  │ │
                                           └──────────┘ │
                                                        │
                                                        v
                                           ┌─────────────────────┐
                                           │ NEXT MIDDLEWARE /   │
                                           │ CONTROLLER          │
                                           └─────────────────────┘
```

## 7. IP Restriction Flow

```
              ┌──────────────────────┐
              │  REQUEST AFTER AUTH  │
              └──────────┬───────────┘
                         │
                         v
         ┌─────────────────────────────────┐
         │ Load IP whitelist for company   │
         │ from IpWhitelistEntries table   │
         └──────────┬──────────────────────┘
                    │
                    v
         ┌─────────────────────────────────┐
         │ Whitelist entries count == 0?   │
         └──────────┬──────────────────────┘
                    │
         ┌──────────┼──────────┐
         │ YES      │ NO       │
         v          │          │
    ┌──────────┐    │          │
    │ Allow    │    v          │
    │ request  │  ┌──────────────────────────┐
    └──────────┘  │ Parse remote IP address  │
                  │ For each entry:          │
                  │   Exact match?           │
                  │   CIDR match?            │
                  └──────────┬───────────────┘
                             │
                  ┌──────────┼──────────┐
                  │ MATCH    │ NO MATCH │
                  v          │          │
             ┌──────────┐    v          │
             │ Allow    │  ┌──────────┐ │
             │ request  │  │ Return   │ │
             └──────────┘  │ 403      │ │
                           └──────────┘ │
                                        │
                                        v
                           ┌─────────────────────┐
                           │ NEXT MIDDLEWARE /   │
                           │ CONTROLLER          │
                           └─────────────────────┘
```

## 8. Permission Evaluation Flow

```
              ┌──────────────────────────────┐
              │  CONTROLLER ACTION DECORATED  │
              │  [RequirePermission("X:View")]│
              └──────────┬───────────────────┘
                         │
                         v
              ┌──────────────────────────────┐
              │ AuthorizationMiddleware      │
              │ calls IAuthorizationService  │
              │ .AuthorizeAsync(context,     │
              │  policy="X:View")            │
              └──────────┬───────────────────┘
                         │
                         v
              ┌──────────────────────────────┐
              │ PermissionPolicyProvider     │
              │ .GetPolicyAsync("X:View")    │
              │                              │
              │ Contains ':' ?               │
              │   YES → Split[0]=FeatureCode │
              │         Split[1]=Action      │
              │         Enum.TryParse<       │
              │          FeatureAction>      │
              │         Build PermissionReq  │
              │   NO  → fallback to default  │
              └──────────┬───────────────────┘
                         │
                         v
              ┌──────────────────────────────┐
              │ PermissionAuthorization      │
              │ Handler                      │
              │ .HandleRequirementAsync()    │
              │                              │
              │ Read user claims:            │
              │   Where(Type == "permission")│
              │ Build permissions HashSet    │
              │                              │
              │ Required = "X:View"          │
              │ permissions.Contains(req) ?  │
              └──────────┬───────────────────┘
                         │
              ┌──────────┼──────────┐
              │ YES      │ NO       │
              v          │          │
         ┌──────────┐    │          │
         │ context. │    v          │
         │ Succeed  │  ┌──────────┐ │
         │ (require │  │ (FAIL —  │ │
         │ -ment)   │  │ no call) │ │
         └──────────┘  └──────────┘ │
              │                     │
              v                     │
         ┌──────────┐              │
         │ Allow    │              v
         │ 200 OK   │         ┌──────────┐
         └──────────┘         │ 403      │
                              │ Forbidden│
                              └──────────┘
```

## 9. Token Rotation Detail

```
┌─────────────────────────────────────────────────────────────────────┐
│                       TOKEN ROTATION PATTERN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  INITIAL LOGIN                                                      │
│  ─────────────                                                      │
│  Access Token 1  (15min)  ──── JWT with claims (sub, email, roles,  │
│  Refresh Token 1 (7 days) ──── random bytes, stored in DB           │
│                                       IsActive=true, JwtId=X        │
│                                                                      │
│  AFTER 15 MIN (ACCESS TOKEN EXPIRED)                                │
│  ─────────────────────────────                                       │
│  POST /refresh { accessToken: AT1, refreshToken: RT1 }              │
│                                                                      │
│  1. Validate RT1 in DB: exists + IsActive = true                    │
│  2. Validate AT1 (even expired): extract userId, match RT1.UserId   │
│  3. Generate:                                                        │
│     Access Token 2  (15min)                                          │
│     Refresh Token 2 (7 days)                                         │
│  4. Revoke RT1: RevokedAt=now, ReplacedByToken=RT2                  │
│  5. Store RT2: IsActive=true, JwtId=Y                               │
│  6. Return { AT2, RT2 }                                             │
│                                                                      │
│  IF ATTACKER INTERCEPTS RT1 AND TRIES TO USE IT:                    │
│  ───────────────────────────────────────────────                     │
│  POST /refresh { accessToken: AT1, refreshToken: RT1 }              │
│  1. Find RT1 in DB: exists but IsActive = false (already revoked)   │
│  2. Return 401 "Invalid or expired refresh token"                   │
│  3. Potential token REPLAY DETECTED — alert security (future)       │
│                                                                      │
│  LEGITIMATE USER: still has AT2 + RT2 — continues normally          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
