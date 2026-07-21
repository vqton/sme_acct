# Company Module BRD Analysis

**Date:** 2026-07-21
**Source:** `docs/brd/08-company-module-brd.md` v1.1

## PROD Readiness: NOT PROD-READY

Skeleton implementation — 12 fields on Company, 7 on CompanySettings. Needs 60+ fields across 10+ entities.

### 5 Blocking Gaps
| # | Gap | Status |
|---|-----|--------|
| BG-01 | No VNeID linkage (NĐ 69/2024) | MISSING |
| BG-02 | enterpriseCode field exists | ✅ PARTIAL |
| BG-03 | Charter capital + contributors | MISSING |
| BG-04 | Multiple legal reps | MISSING |
| BG-05 | Accounting regime enforcement | ✅ PARTIAL |

### 18 Major Gaps (4 partial, 14 missing)

## Corrected Inaccuracies (v1.1)
- BG-02: enterpriseCode field actually exists in entity + DB (was marked missing)
- MG-02: nameVietnamese field exists (was marked missing)
- MG-05: CompanyStatus enum + CompanyService exist (was marked missing)
- MG-15: taxCalculationMethod in CompanySettings (was marked missing)
- MG-17: decimalPlaces in CompanySettings (was marked missing)
- Fixed data model to match actual TS interface (not C#)
- Removed EF Core / C# references from 12-data-flows and 16-roadmap

## Docs Verified (all clean — no C# refs)
- 09-use-cases.md, 10-workflows.md, 11-business-rules.md, 13-templates.md, 14-user-journeys.md, 15-user-stories.md

## Docs Corrected
- 08-company-module-brd.md → v1.1 (gap analysis corrected)
- 12-company-data-flows.md → EF Core refs removed
- 16-company-implementation-roadmap.md → C#/.NET/EF Core refs → TS/SQLite

## Regulatory
- TT 99/2025/TT-BTC effective 01/01/2026
- NĐ 69/2024: VNeID mandatory from 01/07/2025
- NĐ 168/2025/NĐ-CP: enterprise registration
- Luật DN 2020: charter capital, legal reps, business lines
