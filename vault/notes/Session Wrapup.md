# Session Wrapup — Company Module + Departments BRD

**Date:** 2026-07-21
**Branch:** `main`

## Objective
Implement Company module (Phases 0-2) via TDD. Then research and produce comprehensive BRD suite for Departments (Phòng ban) module.

## Completed: Company Module via TDD (252 tests)

### Phase 0 — Foundation (12 enums + 3 value objects)
- CompanyType, AccountingRegime, TaxCalculationMethod, InventoryMethod, RoundingMethod, ExchangeRateSource, BranchType, BranchStatus, ContributorType, ContributorCategory, DocumentType, LicenseType, VNeIDStatus, AuditAssignmentStatus
- Value objects: EnterpriseCode, Address, VNeIDNumber

### Phase 1 — Company Aggregate (T1-T12)
- Company entity (40+ fields, CompanyStatus 6-state: Active/Suspended/Dissolved/Bankrupt/Merged/Converting)
- TaxCode + EnterpriseCode validation
- CompanyStatus state machine with transition map
- LegalRepresentative entity (multi-rep support) + repository
- CompanySettings (inventoryMethod, enableMultiCurrency, enableDepartmentManagement, defaultExchangeRateSource, lastPeriodClosed)
- CapitalContributor entity + ownership ratio validation + repository
- BusinessLine entity + VSIC seed data (300+ codes) + repository
- CompanyBankAccount entity + repository
- Correction reason framework (CompanyErrors.ts)
- CompanyUseCases (full CRUD + lifecycle + all sub-entities)
- CompanyController (PUT/DELETE company, POST dissolve/bankrupt/convert/merge, sub-entity CRUD)
- Migration script (001_company_expansion — idempotent ALTER TABLE)
- Tenant isolation middleware (tenantMiddleware, requireCompanyAccess, filterByCompany)

### Phase 2 — Secondary Entities (T13-T17)
- Branch (chi nhánh), FormerName, CompanyLicense, CompanySeal, CompanyDocument entities + repositories

## Departments Module Research & BRD
- 3 research documents (regulatory, ERP practices, IFRS 8)
- 8 BRD documents (17-24): BRD, Use Cases, Business Rules, Data Flows, Workflows, UI Templates, User Journeys, Implementation Roadmap
- Key finding: **NOT PROD-READY** — `enable_department_management` boolean exists but zero implementation
- 6 blocking gaps, 10 major gaps identified
- Cost allocation engine + budget management + departmental P&L = Phase 2 deliverables

## Stats
- **Server tests:** 252 passing (was 128, **+124 new**)
- **DB tables:** 17 (was 12)
- **New API endpoints:** ~30
- **New files:** 49 (Company module) + 11 (Dept research + BRD)
- **Lines added:** ~3,501 (commit `0abfc72`)

## Architecture (Company)

### Lifecycle
```
Active ←→ Suspended
Active → Dissolved (final)
Active → Bankrupt (final)
Active → Merged (final)
Active → Converting (final)
```

### Key Files
| Layer | File |
|---|---|
| Domain | `Company.ts`, `Branch.ts`, `FormerName.ts`, `CompanyLicense.ts`, `CompanySeal.ts`, `CompanyDocument.ts`, `LegalRepresentative.ts`, `CapitalContributor.ts`, `BusinessLine.ts`, `CompanyBankAccount.ts`, `CompanySettings.ts` |
| Domain | `CompanyErrors.ts` (correction reason framework) |
| Domain | `CompanyService.ts` (6-state lifecycle) |
| Application | `CompanyUseCases.ts` (aggregate CRUD) |
| Infrastructure | `schema.ts` (17 tables), `migrations/001_company_expansion.ts` |
| Presentation | `companyController.ts`, `tenantIsolation.ts` middleware |

## Vault Structure
```
vault/
├── index.md              ← root note
├── notes/
│   ├── Auth System.md    ← auth overview
│   └── Session Wrapup.md ← this file
├── adr/                  ← ADR templates
├── daily/                ← daily journals
├── templates/
│   ├── ADR.md
│   └── Daily.md
└── assets/
```

## Architecture — NestJS Migration (Current Session)

### Strategy
Module-by-module replacement, not big-bang. Zero NestJS coupling in domain/application/infrastructure layers. Factory providers in NestJS modules, not `@Injectable()` on existing classes.

### Migration Status
| Module | Express | NestJS | Tests |
|--------|:---:|:---:|:---:|
| Auth (15 routes) | 🟢 kept | 🟢 migrated | 16 TDD |
| Company (22+ routes) | 🟢 kept | 🟢 migrated | 9 TDD |
| Health/Root | 🟢 kept | 🟢 migrated | — |
| Future: Departments | — | — | — |

### NestJS Module Structure
```
src/nest/
├── app.module.ts               ← Root (imports Auth + Company)
├── bootstrap.ts                 ← NestFactory.create()
├── auth/
│   ├── auth.module.ts           ← Factory providers for 9 repos
│   ├── auth.controller.ts       ← 15 NestJS-decorated routes
│   └── auth.controller.test.ts  ← 16 integration tests
├── company/
│   ├── company.module.ts        ← Factory providers for 5 repos
│   ├── company.controller.ts    ← 22 NestJS-decorated routes
│   └── company.controller.test.ts ← 9 integration tests
└── common/
    ├── database.module.ts       ← DB_PROVIDER + test helper
    ├── health.controller.ts     ← GET / + GET /api/health
    ├── guards/
    │   ├── auth.guard.ts         ← JWT Bearer verification
    │   ├── permission.guard.ts   ← Role-based permission check
    │   └── permissions.decorator.ts
    ├── filters/
    │   └── http-exception.filter.ts ← Domain→HTTP status mapping
    └── lifecycle/
        └── app-lifecycle.ts      ← RoleSeeder on startup
```

### Key Files Added
| Layer | File |
|---|---|
| Config | `tsconfig.json` (experimentalDecorators, emitDecoratorMetadata) |
| Config | `package.json` (@nestjs/core, @nestjs/common, @nestjs/platform-express, @nestjs/testing, supertest) |
| Entry | `src/index.ts` (now boots NestJS instead of Express) |
| Nest common | `database.module.ts`, `auth.guard.ts`, `permission.guard.ts`, `http-exception.filter.ts`, `health.controller.ts` |
| Nest modules | `auth/`, `company/` controllers + modules |
| Test setup | `src/test/setup.ts` (added reflect-metadata import) |

## Stats
- **Server tests:** 277 passing (was 252, **+25 new** — 16 AuthController + 9 CompanyController)
- **Server boots:** NestJS (47 routes mapped, Express `app.ts` kept as backup)
- **New files:** 15 NestJS-specific files
- **Packages added:** `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/testing`, `reflect-metadata`, `rxjs`, `supertest`

## Next Candidates
- Departments module implementation (TDD, Phase 1) as NestJS module
- NestJS migration: remaining Express middleware → NestJS guards
- Integration test between NestJS server + client
- Reporting module
- Tax calculation (VAT, CIT)
