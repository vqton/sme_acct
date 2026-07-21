# User Management BRD Analysis

**Date:** 2026-07-21
**Source:** `docs/brd/01-user-management-brd.md` v2.0

## PROD Readiness: NOT READY

7 critical blockers:
1. No VNeID (NĐ 69/2024)
2. No digital signature (NĐ 23/2025)
3. No e-invoice connection (NĐ 254/2026)
4. No audit trail interceptor (TT 99/2025 Điều 28)
5. No data-manipulation alerts (TT 99/2025 Điều 28)
6. No tax authority API (TT 99/2025 Điều 28)
7. No biometric verification (CV 3078/CT-NVT)

## Architecture

TypeScript + Express + SQLite (better-sqlite3). NOT C#/EF Core.

## Docs Updated

- `docs/brd/01-user-management-brd.md` — v2.0, correct TS arch
- `docs/brd/02-use-cases.md` — 13 use cases, all paths
- `docs/brd/03-workflows.md` — 9 mermaid workflows
- `docs/brd/04-business-rules.md` — 8 BR categories, 11 roles
- `docs/brd/05-data-flows.md` — 9 sequence diagrams
- `docs/brd/06-templates.md` — 9 templates + UI mockups
- `docs/brd/07-user-journeys.md` — 6 bilingual journeys
- `docs/archive/brd-auth-old/` — superseded C# docs

## Key Compliance Deadlines

| Deadline | Requirement |
|----------|-------------|
| Already passed (01/07/2025) | VNeID mandatory for tax e-transactions |
| 01/01/2026 | TT 99/2025 effective (replaced TT 200/2014) |
| 01/07/2026 | NĐ 254/2026 e-invoice regime (replaced 123/2020) |
| 01/07/2026 | Luật Quản lý thuế 108/2025 (replaced 38/2019) |
| 15/05/2026 | Biometric verification for e-invoice registration |

## Next Steps

Sprint 1-2: Wire audit interceptor, session config, IP whitelist, VNeID adapter stub
Sprint 3-4: Digital signature module, e-invoice connection, data-manipulation alerts
Sprint 5-6: Full VNeID integration, biometric verification, regulatory update mechanism
