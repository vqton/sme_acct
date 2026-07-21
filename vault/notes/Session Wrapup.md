# Session Wrapup — Auth Overhaul

**Date:** 2026-07-21
**Branch:** `main`

## Objective
Implement all must-have auth features for Vietnamese SME accounting system (intranet), comparing against MISA SME, VNPT Easy, Fast Accounting Online. TDD end-to-end.

## Completed: 13 items

### P0 — Core Auth Infrastructure (10 items)
| # | Feature | Tests |
|---|---|---|
| 1 | JWT expiry 24h→15min + `iss`/`aud`/`jti` claims | 9 |
| 2 | Server-side logout (revoke refresh tokens) | 3 |
| 3 | Rate limiting (5 attempts/15min/IP) | 7 |
| 4 | Account lockout (5 fails → 30min) | 5 |
| 5 | Password history (last 5 blocked) | 3 |
| 6 | Audit logging (IP + user-agent capture) | 1 |
| 7 | Forgot/reset password (1hr token) | 8 |
| 8 | Registration UI (VN validation) | — |
| 9 | Login page rewrite (VN, responsive, loading, errors) | — |

### P1 — Production Auth Features (3 items)
| # | Feature | Tests |
|---|---|---|
| 10 | Company switching at login | 7 |
| 11 | Session management dashboard | 6 |
| 12 | 2FA / TOTP + backup codes | 10 |

### P1 — Polish
| # | Feature |
|---|---|
| 13 | Multi-language (VI/EN) with toggle |

## Stats
- **Server tests:** 128 passing (was 78, **+50 new**)
- **Client type check:** Clean
- **DB tables:** 12 (was 10)
- **New API endpoints:** 7
- **New packages:** `otpauth`
- **New files:** 20

## Architecture

### Auth Flow (final)
```
Login → credentials → rate limit check → lockout check → password verify
  → 2FA check (if enabled: tempToken issued)
  → company check (0: error / 1: auto-select / N: list)
  → JWT (15min) + refresh token (7 days, rotated)
  → logout revokes all refresh tokens
```

### Key Files
| Layer | File |
|---|---|
| Domain | `entities/User.ts`, `entities/RefreshToken.ts`, `entities/BackupCode.ts` |
| Domain | `errors/AuthErrors.ts` (11 error classes) |
| Application | `AuthService.ts` (9 repos injected, 15 methods) |
| Infrastructure | `jwt.ts`, `schema.ts`, `*Repository.ts` (8 repos) |
| Presentation | `authController.ts` (17 endpoints) |
| Client | `LoginPage`, `RegisterPage`, `ForgotPasswordPage` |
| Client | `CompanySelector`, `SessionsPage` |
| Client | `TwoFactorSetupPage`, `TwoFactorVerifyPage` |
| Client | i18n `vi.json`/`en.json` (90 keys each) |

## Vault Structure
```
vault/
├── index.md              ← root note
├── notes/
│   └── Auth System.md    ← auth overview
├── adr/                  ← ADR templates
├── daily/                ← daily journals
├── templates/
│   ├── ADR.md
│   └── Daily.md
└── assets/
```

## Next Candidates
- Accounting engine (journal entries, ledger, reports)
- Company settings UI
- Permissions / RBAC UI
- Reporting module
- Tax calculation (VAT, CIT)
