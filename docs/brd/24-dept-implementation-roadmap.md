# Implementation Roadmap: Departments (Phòng ban) Module

**Target:** 5-6 weeks (Phase 1-2), +3 weeks Phase 3
**Strategy:** Parallel domain+batch where possible; sequential where dependency-bound. One server engineer.

---

## Phase 1: Core Data Model + Foundation (Weeks 1-2)

### Week 1 — Entity + Schema + Repository

| Day | Task | Output | Tests |
|-----|------|--------|-------|
| M | Department entity (code, name, nameEnglish, type, parentId, path, depth, sortOrder, managerUserId, deputyManagerUserId, managerTitle, defaultSalaryAccount, defaultExpenseAccount, costAllocationMethod, hasBudgetControl, budgetAlertThreshold, budgetControlLevel, status, effectiveDate, dissolutionDate, createdAt/updatedAt) | `domain/entities/Department.ts` | Entity unit tests |
| M | DepartmentType enum (CostCenter=1, ProfitCenter=2, InvestmentCenter=3, SupportCenter=4) | `domain/enums/DepartmentEnums.ts` | Enum tests |
| M | DepartmentStatus enum (Active=1, Inactive=2, Dissolved=3) | Same file | Enum tests |
| M | CostAllocationMethod enum (Direct=1, StepDown=2, Reciprocal=3) | Same file | Enum tests |
| M | BudgetControlLevel enum (None=1, Soft=2, Hard=3) | Same file | Enum tests |
| T | DepartmentRepository interface + in-memory implementation | `domain/repositories/DepartmentRepository.ts` | Interface contract tests |
| T | SQLiteDepartmentRepository + schema migration (002_departments) | `infrastructure/repositories/SQLiteDepartmentRepository.ts` + `migrations/002_departments.ts` | Repository integration tests |
| W | Department tree methods: getChildren, getAncestors, getSubtree, reparent | Repository layer | Tree query tests |
| W | Materialized path update on reparent (SQL UPDATE subtree) | Repository layer | Path integrity tests |
| Th | UserDepartment entity (userId, departmentId, isPrimary, jobTitle, isActive, assignedAt) | `domain/entities/UserDepartment.ts` | Entity unit tests |
| Th | UserDepartmentRepository + SQLiteUserDepartmentRepository | Dual repo layers | Repository tests |
| F | Department CRUD routes (POST /companies/:cid/departments, GET tree, GET/:id, PATCH/:id, PATCH/:id/reparent, DELETE/:id) | `presentation/controllers/departmentController.ts` | Controller integration tests |
| F | UserDepartment routes (POST/GET/DELETE /departments/:did/users) | Same controller | Controller integration tests |

### Week 2 — Transaction Integration + Migration

| Day | Task | Output | Tests |
|-----|------|--------|-------|
| M | AuditEntity base class integration for Department | Department entity | — |
| M | DepartmentUseCases (create, update, deactivate, reactivate, dissolve, reparent, view, list) | `application/DepartmentUseCases.ts` | Use case tests |
| M | UserDepartmentUseCases (assign, changePrimary, remove, list) | Same file | Use case tests |
| T | Add departmentId (nullable, FK) to JournalEntry schema | Migration | Schema tests |
| T | Add departmentId (nullable, FK) to Expense, Invoice, Payment schemas | Migration | Schema tests |
| W | DepartmentUseCases integration with CompanyAccessGuard (scoped to company) | Use cases | Security tests |
| W | DepartmentController composed into existing router | Router | Routing tests |
| Th | Default department autocreation when enableDepartmentManagement flips from false → true | SettingsUseCases hook | Settings tests |
| Th | EnableDepartmentManagement toggle warning logic | SettingsUseCases | Warning tests |
| F | All Phase 1 tests passing | — | CI pipeline |
| F | Code review + fix lint/types | — | — |

### Phase 1 Deliverables

| Artefact | Format |
|----------|--------|
| Department entity + 4 enums | TypeScript source |
| DepartmentRepository + UserDepartmentRepository (interface + SQLite) | TypeScript source |
| DepartmentUseCases + UserDepartmentUseCases | TypeScript source |
| DepartmentController with CRUD + tree + reparent routes | TypeScript source |
| Migration file (002_departments) | SQL migration |
| departmentId columns on JournalEntry, Expense, Invoice, Payment | Schema migration |
| Unit + Integration tests | Vitest suites |
| **Estimated line count** | **~2,500** |

---

## Phase 2: Cost Allocation + Budget (Weeks 3-5)

### Week 3 — Budget

| Day | Task | Output | Tests |
|-----|------|--------|-------|
| M | BudgetPlan entity (departmentId, fiscalYear, period, accountCode, plannedAmount, actualAmount, remainingAmount, notes, status) | `domain/entities/BudgetPlan.ts` | Entity tests |
| M | BudgetStatus enum (Draft=1, Approved=2, Locked=3) | `domain/enums/BudgetEnums.ts` | Enum tests |
| T | BudgetPlanRepository + SQLiteBudgetPlanRepository | Dual repo | Repository tests |
| T | Schema migration (003_budget_plans + indexes) | Migration | — |
| W | BudgetUseCases (create, approve, lock, unlock, revise, delete if unused) | `application/BudgetUseCases.ts` | Use case tests |
| W | Budget auto-calc actual from transactions (trigger/query) | Query in repo | Integration tests |
| Th | BudgetCheckService (Soft/Hard control, threshold alert) | `domain/services/BudgetCheckService.ts` | Service tests |
| Th | BudgetController (CRUD + approve + lock) + routes | `presentation/controllers/budgetController.ts` | Controller tests |
| F | Budget vs actual auto-sync on transaction post | Use cases | Integration tests |
| F | Budget revision audit trail | Use cases | Audit tests |

### Week 4 — Cost Allocation Engine

| Day | Task | Output | Tests |
|-----|------|--------|-------|
| M | CostAllocationRule entity + enum (Direct, StepDown, Reciprocal) + AllocationBasis enum (Headcount, Revenue, Area, Custom, Equal) | `domain/entities/CostAllocationRule.ts` | Entity tests |
| T | CostAllocationRuleRepository + SQLite implementation + migration (004_cost_allocation_rules) | Dual repo | Repository tests |
| T | AllocationRun entity (runId, period, status, triggeredBy, results summary) | `domain/entities/AllocationRun.ts` | Entity tests |
| W | DirectAllocationStrategy — allocate fromDept costs to toDepts based on basis | `domain/services/allocations/DirectAllocationStrategy.ts` | Unit tests (known data) |
| W | StepDownAllocationStrategy — sequential, ordered, proportional | `domain/services/allocations/StepDownAllocationStrategy.ts` | Unit tests |
| Th | ReciprocalAllocationStrategy — Gauss-Seidel solver (max 50 iterations) | `domain/services/allocations/ReciprocalAllocationStrategy.ts` | Unit tests (linear eq verification) |
| Th | CostAllocationService orchestrator (validate rules → execute strategies → generate journal entries) | `application/CostAllocationService.ts` | Integration tests |
| F | Allocation rule CRUD controller + routes | Controller tests | — |
| F | Allocation execution endpoint (POST /execute) with preview | Controller tests | — |

### Week 5 — Allocation Integration + Reporting

| Day | Task | Output | Tests |
|-----|------|--------|-------|
| M | Allocation journal entry generation (balanced debit/credit) | CostAllocationService | Integration tests (balance check) |
| M | AllocationResult persistence | Repository | — |
| T | P&L by department report query (direct + allocated costs) | `application/reports/DeptPLReportService.ts` | Integration tests |
| T | Cost by department detail report (drill to account) | Same file | Integration tests |
| W | Budget vs actual comparison report | Same file | Integration tests |
| W | Multi-period comparison (current vs prior) | Same file | Integration tests |
| Th | Allocation schedule with periodic run capability | CostAllocationService | Schedule tests |
| Th | Department-specific budget check integrated into transaction flow | BudgetCheckService | End-to-end tests |
| F | Phase 2 tests passing | CI | — |
| F | Code review + fix lint/types | — | — |

### Phase 2 Deliverables

| Artefact | Format |
|----------|--------|
| BudgetPlan entity + repository + use cases + controller | TypeScript source |
| Cost allocation rule entity + 3 strategy implementations | TypeScript source |
| CostAllocationService orchestrator | TypeScript source |
| BudgetCheckService with Soft/Hard control | TypeScript source |
| 4 department reports: P&L, Cost detail, Budget vs Actual, Multi-period | TypeScript source |
| Schema migrations (003, 004, 005) + allocation journal entries | SQL migration |
| **Estimated line count** | **~4,500** |

---

## Phase 3: Polish + Advanced Features (Weeks 5-8, overlaps W5)

### Week 5-6 — Reporting Completion

| Task | Output |
|------|--------|
| IFRS 8 segment report (10% threshold, 75% coverage) | ReportService |
| Department dashboard with KPI cards | Presentation layer |
| Export P&L to Excel/PDF | Export service |
| Drill-down from report → journal entries | UX integration |

### Week 6-7 — Inter-Department Transfers

| Task | Output |
|------|--------|
| DepartmentTransfer entity (from, to, item type, qty, value, voucher ref) | Entity + repository |
| Transfer use cases (create, list, approve) | Use cases |
| Transfer controller + routes | Controller |
| Schema migration | Migration |

### Week 7-8 — Advanced Features

| Task | Output |
|------|--------|
| Quy chế hạch toán theo phòng ban auto-generator | Document generator |
| Department-scoped data access (optional) | Middleware |
| Department head dashboard | Dashboard |
| COA→Department default mapping | Settings |
| Mass budget import from Excel | Import service |
| Performance optimization for large orgs (100+ depts) | Query optimization |

---

## Effort Estimate Summary

| Phase | Weeks | Files | Lines | Tests |
|-------|-------|-------|-------|-------|
| Phase 1 — Core + Foundation | 2 | ~25 | ~2,500 | ~200 |
| Phase 2 — Allocation + Budget | 3 | ~35 | ~4,500 | ~350 |
| Phase 3 — Reporting + Polish | 3 | ~20 | ~3,000 | ~150 |
| **Total** | **~8** | **~80** | **~10,000** | **~700** |

### Parallelization

- Week 1 entity + enum work can overlap with schema migration planning
- Week 4 allocation strategy algorithms are independent per method (3 engineers could do each strategy in parallel)
- Phase 3 reporting and transfers are largely independent
- **Realistic calendar:** 6 weeks with 2 engineers; 8 weeks with 1

---

## Dependency Graph

```
Phase 1 (W1-2)
  │
  ├── Department entity ───→ DepartmentRepository ───→ DepartmentUseCases ───→ Controller
  ├── UserDepartment entity ───→ UserDepartmentRepo ───→ UserDeptUseCases
  │
  └── departmentId on JournalEntry/Expense (W2)
        │
        ▼
Phase 2 (W3-5)
  │
  ├── BudgetPlan (W3) ← depends on deptId on JournalEntry
  │     └── BudgetCheckService ← used by transaction posting
  │
  └── CostAllocationRule (W4) ← depends on deptId on Expense accounts
        ├── DirectAlgo
        ├── StepDownAlgo
        └── ReciprocalAlgo
              └── CostAllocationService → generates JournalEntry
                    │
                    ▼
Phase 3 (W5-8)
  ├── Dept PL Report ← depends on allocation engine
  ├── Budget vs Actual ← depends on  budget check service
  ├── IFRS 8 ← depends on dept PL report
  └── Transfers ← independent of allocation
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|:---:|:---:|-----------|
| Adding departmentId to existing transactions may conflict with existing FK constraints | Medium | High | Make FK nullable; alter table with SET NULL for existing rows; no NOT NULL in Phase 1 |
| Cost allocation engine bugs cause incorrect P&L | Medium | Critical | Integration tests with known test data (fixed inputs → known outputs); preview before commit |
| Gauss-Seidel reciprocal solver may not converge for large rule sets | Low | Medium | Cap iterations at 50; fall back to StepDown approximation with warning |
| Budget check at transaction time adds latency to every post | Medium | Medium | Async budget actual update; synchronous check only for Hard mode; cache planned amounts |
| Tree reparenting must update path for entire subtree potentially hundreds of rows | Low | Low | Single SQL UPDATE with REPLACE on path; transaction-scoped; index on path |
| Department management toggling could orphan data | Low | High | Soft hide only; always preserve data; warn on disable |
