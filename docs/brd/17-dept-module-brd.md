# BRD: Departments (Phòng ban) Module — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (40+ yrs combined)
**Status:** V0 — NOT PROD Ready

---

## 1. Executive Summary

SmeAccounting Departments Module manages the organisational structure for management accounting — cost centres (trung tâm chi phí), profit centres (trung tâm lợi nhuận), and responsibility centres (trung tâm trách nhiệm) per TT 53/2006/TT-BTC and TT 99/2025/TT-BTC.

### Verdict: NOT PROD-READY — MISSING IN WHOLE

Current implementation stores a single boolean `enable_department_management` on `CompanySettings`. Zero department entities, zero hierarchy, zero cost allocation, zero departmental reporting.

| Component | Status | Notes |
|-----------|--------|-------|
| `enable_department_management` field | ✅ EXISTS | `CompanySettings.enableDepartmentManagement: boolean` defaults to `true` |
| Department entity | ❌ MISSING | No `Department` / `PhongBan` entity |
| Department hierarchy | ❌ MISSING | No tree/parent-child structure |
| User-department assignment | ❌ MISSING | No user → department binding |
| Cost allocation rules | ❌ MISSING | No direct/step-down/reciprocal |
| Budget by department | ❌ MISSING | No budget entity |
| P&L by department | ❌ MISSING | No multi-dimensional reporting |
| Analytic dimension in COA | ❌ MISSING | No department field on journal entries |
| Department head | ❌ MISSING | No manager assignment |
| Branch/department distinction | ❌ MISSING | Branch tracked as separate entity, not linked |

### 5 Blocking Gaps (cannot deploy without)

| # | Gap | Regulatory Reference | Impact |
|---|---|---|---|
| BG-D01 | No Department entity definition | TT 53/2006 Mục I.4 — định nghĩa trung tâm chi phí | Cannot track costs by department — management accounting non-functional |
| BG-D02 | No user-department assignment | TT 99/2025 Điều 3 — Quy chế quản trị nội bộ | Cannot enforce department-level access control |
| BG-D03 | No cost allocation mechanism | TT 53/2006; Thông tư 99 | Cannot distribute shared costs to departments — departmental P&L is wrong |
| BG-D04 | No department field on journal entries | TT 99/2025 Điều 11 (analytic dimension) | Cannot filter/report transactions by department |
| BG-D05 | No budget per department | TT 99/2025 — Kiểm soát nội bộ | Cannot enforce spending limits per department |

### 10 Major Gaps (blocking full utility)

| # | Gap | Severity |
|---|---|---|
| MG-D01 | No department hierarchy (tree structure) | High |
| MG-D02 | No department type (CostCenter / ProfitCenter / InvestmentCenter) | High |
| MG-D03 | No department head assignment | Medium |
| MG-D04 | No department-level P&L reporting | High |
| MG-D05 | No multi-period cost comparison by dept | Medium |
| MG-D06 | No integration with Chart of Accounts (salary cost mapping) | High |
| MG-D07 | No integration with Budget module (Ngân sách) | High |
| MG-D08 | No department-level balance sheet (for investment centres) | Low |
| MG-D09 | No inter-department transfer tracking (điều chuyển nội bộ) | Medium |
| MG-D10 | No Quy chế hạch toán kế toán generation | Low |

---

## 2. Regulatory Compliance Index

| Document | Status | Key Department-Related Requirements | Current Compliance |
|---|---|---|---|
| **TT 53/2006/TT-BTC** (Kế toán quản trị) | Active since 2006 | Định nghĩa trung tâm chi phí, trung tâm trách nhiệm; phương pháp phân bổ chi phí; tổ chức bộ máy KTQT | ❌ MISSING |
| **TT 99/2025/TT-BTC** (Chế độ kế toán DN) | Active from 01/01/2026 | Điều 3: Quy chế quản trị nội bộ phân định trách nhiệm bộ phận. Điều 11: Tự chủ mở TK cấp 2/3 | ❌ MISSING — no dept integration |
| **TT 133/2016/TT-BTC** (SME accounting) | Active | Điều 9: Đơn vị hạch toán phụ thuộc — yêu cầu phân cấp hạch toán cho chi nhánh | ❌ MISSING — no dependent unit accounting |
| **Luật Kế toán 88/2015** | Active | Điều 4: Kế toán quản trị. Điều 39: Kiểm soát nội bộ. Điều 10: Đơn vị kế toán | ❌ PARTIAL — `enableDepartmentManagement` field only |
| **IFRS 8** (Segment Reporting) | Voluntary for SMEs | Operating segment definition, CODM approach, 10% thresholds | ❌ MISSING — no optional segment reporting |
| **VAS 28** (Báo cáo bộ phận) | Voluntary for SMEs | Primary/secondary segment structure | ❌ MISSING — no optional segment reporting |
| **TT 53** — Phương pháp phân bổ | Active since 2006 | Direct, Step-Down, Reciprocal | ❌ MISSING — no allocation engine |

---

## 3. Current State Analysis

### 3.1 Current Data Model

```
CompanySettings (domain/entities/CompanySettings.ts)
├── enableDepartmentManagement (boolean, default true)  ← ONLY existing field
└── [no other department-related fields or entities]
```

### 3.2 What Exists

| Component | Status | Notes |
|---|---|---|
| `enable_department_management` on CompanySettings | ✅ EXISTS | Boolean toggle, default `true` |
| DB schema has `enable_department_management` column | ✅ EXISTS | Created in schema migration, integer default 1 |

### 3.3 What Is Missing (Complete)

| Domain Area | Current State | Target State |
|---|---|---|
| Department definition | None | Entity with id, name, code, type, parentId, managerId, status |
| Department hierarchy | None | Tree (parent-child), unlimited depth |
| Department type | None | CostCenter, ProfitCenter, InvestmentCenter, SupportCenter |
| Cost allocation | None | Direct, Step-Down, Reciprocal methods |
| Budget | None | Budget per department per period, budget vs actual |
| Departmental P&L | None | Multi-dimensional reporting (dept × account × period) |
| User-department | None | Each user assigned to 1..N departments; primary department |
| Analytic dimension | None | Department field on journal entries, invoices, expenses |
| COA integration | None | Salary cost → department mapping; expense tracking by dept |
| Inter-department transfers | None | Internal transfer tracking (điều chuyển nội bộ) |
| Quy chế hạch toán | None | Auto-generate internal regulations for department-based accounting |
| Department seal/head | None | Manager assignment, digital signing scope |

---

## 4. Target Data Model

### 4.1 Department Entity

```
Department (Aggregate branch of Company aggregate)
│
├── Core
│   ├── id (UUID)
│   ├── companyId (UUID, FK → companies.id)
│   ├── code (string, 20) — mã phòng ban
│   ├── name (string, 200) — tên phòng ban
│   ├── nameEnglish (string?, 200)
│   ├── departmentType (DepartmentType enum)
│   ├── parentId (UUID?, self-ref FK)
│   ├── path (string, hierarchy materialized path: /root/parent/child)
│   ├── depth (int)
│   ├── sortOrder (int)
│   │
│   ├── Manager
│   │   ├── managerUserId (UUID?, FK → users.id)
│   │   ├── managerTitle (string?, 100) — chức danh quản lý
│   │   └── deputyManagerUserId (UUID?, FK → users.id)
│   │
│   ├── Cost Allocation Defaults
│   │   ├── defaultSalaryAccount (string?, TK mặc định cho lương)
│   │   ├── defaultExpenseAccount (string?, TK mặc định cho chi phí)
│   │   └── costAllocationMethod (CostAllocationMethod enum?)
│   │
│   ├── Budget Settings
│   │   ├── hasBudgetControl (boolean)
│   │   ├── budgetAlertThreshold (decimal?, % threshold)
│   │   └── budgetControlLevel (enum: Soft | Hard | None)
│   │
│   ├── Status & Lifecycle
│   │   ├── status (DepartmentStatus enum)
│   │   ├── effectiveDate (date, ngày thành lập)
│   │   └── dissolutionDate (date?, ngày giải thể)
│   │
│   └── Audit
│       ├── createdAt (DateTime)
│       ├── updatedAt (DateTime?)
│       ├── createdByUserId (UUID)
│       └── updatedByUserId (UUID?)
│
├── Department Type (enum)
│   ├── CostCenter = 1        — Trung tâm chi phí (chịu trách nhiệm chi phí)
│   ├── ProfitCenter = 2      — Trung tâm lợi nhuận (chịu trách nhiệm DT-CP)
│   ├── InvestmentCenter = 3  — Trung tâm đầu tư (chịu trách nhiệm LN + vốn)
│   └── SupportCenter = 4     — Trung tâm phụ trợ (phục vụ các trung tâm khác)
│
├── Department Status (enum)
│   ├── Active = 1      — Đang hoạt động
│   ├── Inactive = 2    — Ngừng hoạt động
│   └── Dissolved = 3   — Đã giải thể
│
├── CostAllocationMethod (enum)
│   ├── Direct = 1      — Phân bổ trực tiếp
│   ├── StepDown = 2    — Phân bổ bậc thang
│   └── Reciprocal = 3  — Phân bổ đối ứng
│
├── BudgetControlLevel (enum)
│   ├── None = 1     — Không kiểm soát
│   ├── Soft = 2     — Cảnh báo, không chặn
│   └── Hard = 3     — Chặn khi vượt ngân sách
│
└── UserDepartment (many-to-many)
    ├── userId (UUID, FK → users.id)
    ├── departmentId (UUID, FK → departments.id)
    ├── isPrimary (boolean) — phòng ban chính
    ├── jobTitle (string?, 200)
    ├── isActive (boolean)
    └── assignedAt (DateTime)
```

### 4.2 Supporting Entities

```
CostAllocationRule
├── id (UUID)
├── companyId (UUID)
├── ruleName (string, 200)
├── fromDepartmentId (UUID, FK → departments.id)
├── toDepartmentId (UUID, FK → departments.id) — nullable for all
├── allocationMethod (CostAllocationMethod)
├── allocationBasis (AllocationBasis enum: Headcount | Revenue | Area | Custom | Equal)
├── allocationPercentage (decimal, 5.2) — khi ALLOCATION_BASIS = Custom
├── accountCodes (string[]) — TK được phân bổ (trống = tất cả)
├── effectiveFrom (date)
├── effectiveTo (date?)
├── isActive (boolean)
└── createdAt/updatedAt

BudgetPlan
├── id (UUID)
├── companyId (UUID)
├── departmentId (UUID)
├── fiscalYear (int)
├── period (int, 1-12 or 0 for annual)
├── accountCode (string, TK ngân sách)
├── plannedAmount (decimal, 18,2)
├── actualAmount (decimal, 18,2) — auto-updated from transactions
├── remainingAmount (decimal, 18,2) — planned - actual
├── notes (string?)
├── status (BudgetStatus enum: Draft | Approved | Locked)
└── createdAt/updatedAt

DepartmentTransfer
├── id (UUID)
├── companyId (UUID)
├── transferDate (date)
├── fromDepartmentId (UUID)
├── toDepartmentId (UUID)
├── itemType (string: CCDC | TSCD | Inventory | Other)
├── itemDescription (string)
├── quantity (decimal)
├── unitValue (decimal, 18,2)
├── totalValue (decimal, 18,2)
├── voucherRef (string?, chứng từ gốc)
├── reason (string?)
├── approvedByUserId (UUID?)
└── createdAt/updatedAt
```

### 4.3 Entity Relationship Diagram

```
Company (root)
  │
  ├──1:N─── Department
  │           ├── self-ref (parentId → Department.id) — hierarchy
  │           ├── 1:N─── UserDepartment (→ User)
  │           ├── 1:N─── BudgetPlan
  │           ├── 1:N─── CostAllocationRule (from/tos)
  │           └── 1:N─── DepartmentTransfer (from/to)
  │
  ├──1:1─── CompanySettings
  │           └── enableDepartmentManagement (boolean)
  │
  └── [All scoped entities: JournalEntry, Invoice, Expense, ...]
              └── departmentId (UUID?, optional)
```

---

## 5. Functional Requirements

### FR-D01: Department CRUD

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D01.1 | System SHALL allow creating departments with code, name, type, parent | P0 | TT 53/2006 |
| FR-D01.2 | System SHALL enforce unique department code within a company | P0 | TT 53/2006 |
| FR-D01.3 | System SHALL support unlimited tree hierarchy (parent-child) | P1 | Thực tiễn (MISA 5 cấp) |
| FR-D01.4 | System SHALL maintain materialized path for efficient subtree queries | P1 | Best practice |
| FR-D01.5 | System SHALL allow deactivating departments (soft delete) | P1 | TT 53/2006 |
| FR-D01.6 | System SHALL block deletion of departments with transaction history | P1 | Data integrity |
| FR-D01.7 | System SHALL display department tree in explorer panel | P1 | UX standard |

### FR-D02: Department Type Classification

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D02.1 | System SHALL support CostCenter, ProfitCenter, InvestmentCenter, SupportCenter | P0 | TT 53/2006 |
| FR-D02.2 | InvestmentCenters SHALL track capital employed and ROI | P2 | TT 53/2006 suy diễn |
| FR-D02.3 | ProfitCenters SHALL have department-level P&L | P0 | TT 53/2006 |
| FR-D02.4 | SupportCenters SHALL be allocable to other centers | P1 | TT 53/2006 |
| FR-D02.5 | System SHALL restrict allowable parent types (ProfitCenter cannot be child of CostCenter) | P2 | Best practice |

### FR-D03: User-Department Assignment

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D03.1 | System SHALL assign each user to 1..N departments | P0 | TT 99/2025 Điều 3 |
| FR-D03.2 | User SHALL have exactly 1 primary department | P0 | TT 99/2025 Điều 3 |
| FR-D03.3 | User SHALL inherit default department context when creating transactions | P1 | UX standard |
| FR-D03.4 | System SHALL support department-scoped data access (optional) | P2 | Best practice |
| FR-D03.5 | System SHALL track user job title within each department | P1 | Nhân sự |

### FR-D04: Cost Allocation

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D04.1 | System SHALL support Direct allocation method (trực tiếp) | P0 | TT 53/2006 Mục IV |
| FR-D04.2 | System SHALL support Step-Down allocation method (bậc thang) | P1 | TT 53/2006 |
| FR-D04.3 | System SHALL support Reciprocal allocation method (đối ứng) | P2 | TT 53/2006 |
| FR-D04.4 | System SHALL support allocation bases: Headcount, Revenue, Area, Equal, Custom % | P0 | Thực tiễn |
| FR-D04.5 | System SHALL allow filtering allocation rules by account codes (TK) | P1 | TT 53/2006 |
| FR-D04.6 | System SHALL execute allocation in order for Step-Down method | P1 | TT 53/2006 |
| FR-D04.7 | System SHALL generate allocation journal entries automatically | P0 | TT 99/2025 |

### FR-D05: Budget Management

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D05.1 | System SHALL allow setting budget by department × account × period | P0 | Kiểm soát nội bộ |
| FR-D05.2 | System SHALL auto-calculate actual from transactions posted to department | P0 | TT 99/2025 |
| FR-D05.3 | System SHALL display budget vs actual comparison | P0 | Quản trị |
| FR-D05.4 | System SHALL support Soft (warn) and Hard (block) budget control | P1 | Kiểm soát nội bộ |
| FR-D05.5 | System SHALL support budget lock after approval | P2 | Kiểm soát nội bộ |
| FR-D05.6 | System SHALL support budget revision with audit trail | P2 | Kiểm soát nội bộ |

### FR-D06: Departmental Reporting

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D06.1 | System SHALL generate P&L by department (Báo cáo KQKD theo phòng ban) | P0 | TT 53/2006 |
| FR-D06.2 | System SHALL generate Cost report by department (chi tiết theo TK) | P0 | TT 53/2006 |
| FR-D06.3 | System SHALL generate Budget vs Actual by department | P0 | Kiểm soát nội bộ |
| FR-D06.4 | System SHALL generate Multi-period comparison by department | P1 | Quản trị |
| FR-D06.5 | System SHALL support drill-down from department total to individual vouchers | P1 | UX standard |
| FR-D06.6 | System SHALL optionally generate IFRS 8-style segment report | P2 | Best practice |
| FR-D06.7 | System SHALL allow export of department reports to Excel/PDF | P1 | UX standard |

### FR-D07: Inter-Department Transfers

| ID | Requirement | Priority | Regulation |
|---|---|---|---|
| FR-D07.1 | System SHALL support transfer of CCDC/tools between departments | P1 | Thực tiễn MISA |
| FR-D07.2 | System SHALL track transfer history with values | P2 | Thực tiễn MISA |
| FR-D07.3 | System SHALL generate internal transfer vouchers | P2 | Thực tiễn MISA |

### FR-D08: Integration Points

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-D08.1 | Journal entries SHALL carry optional departmentId field | P0 | Core integration |
| FR-D08.2 | Expense vouchers SHALL carry departmentId | P0 | Core integration |
| FR-D08.3 | Salary computation SHALL respect employee's department | P1 | HR integration |
| FR-D08.4 | Fixed asset tracking SHALL include department assignment | P1 | Asset integration |
| FR-D08.5 | Inventory transactions SHALL support department dimension | P2 | Inventory integration |
| FR-D08.6 | Chart of Accounts SHALL allow setting default department per account | P2 | COA integration |

---

## 6. Gap Analysis Matrix

| Gap ID | Description | Severity | Current State | Target State | Regulation | Effort |
|---|---|---|---|---|---|---|
| G-D01 | No Department entity | **BLOCKING** | Missing | Entity with code, name, type, parent, manager, status | TT 53/2006 | 5d |
| G-D02 | No department hierarchy | **BLOCKING** | Missing | Tree with materialized path, unlimited depth | TT 53/2006 | 3d |
| G-D03 | No user-department assignment | **BLOCKING** | Missing | UserDepartment many-to-many with primary flag | TT 99/2025 Điều 3 | 3d |
| G-D04 | No cost allocation | **BLOCKING** | Missing | Direct + Step-Down + Reciprocal allocation engine | TT 53/2006 Mục IV | 10d |
| G-D05 | No budget by department | **BLOCKING** | Missing | BudgetPlan entity with per-period, per-TK tracking | Kiểm soát nội bộ | 8d |
| G-D06 | No department field on journal entries | **BLOCKING** | Missing | departmentId column on all transaction entities | TT 99/2025 Điều 11 | 3d |
| G-D07 | No P&L by department | High | Missing | Multi-dimensional report (dept × account × period) | TT 53/2006 | 8d |
| G-D08 | No cost allocation rules UI | High | Missing | Rule CRUD with allocation method, basis, account filter | TT 53/2006 | 5d |
| G-D09 | No budget vs actual reporting | High | Missing | Comparison report with drill-down | Kiểm soát nội bộ | 5d |
| G-D10 | No department type classification | Medium | Missing | 4 types: Cost, Profit, Investment, Support | TT 53/2006 | 2d |
| G-D11 | No department head assignment | Medium | Missing | ManagerUserId field + deputy | TT 99/2025 Điều 3 | 1d |
| G-D12 | No inter-department transfers | Medium | Missing | Transfer entity with value tracking | Thực tiễn MISA | 5d |
| G-D13 | No COA-department mapping | Medium | Missing | Default expense/salary account per department | Thực tiễn | 3d |
| G-D14 | No Quy chế hạch toán generation | Low | Missing | Auto-generate internal regulations | TT 99/2025 Điều 9 | 3d |
| G-D15 | No IFRS 8 segment report | Low | Missing | Optional segment reporting | Best practice | 5d |
| G-D16 | No department dashboard | Medium | Missing | Department overview with KPIs | Quản trị | 5d |

### Effort Summary

| Category | Count | Total Effort |
|---|---|---|
| Blocking | 6 | ~32 days |
| High | 3 | ~18 days |
| Medium | 5 | ~14 days |
| Low | 2 | ~8 days |
| **Total** | **16** | **~72 days** (parallelizable to 5-6 weeks) |

---

## 7. PROD Readiness Criteria

### 7.1 Must-Have (PROD Gate)

| # | Criterion | Verification |
|---|---|---|
| P1 | Department entity with CRUD | Unit + integration tests |
| P2 | Department hierarchy (tree) with materialized path | Integration tests (parent-child, depth, path) |
| P3 | User-department assignment (1 user → N depts, 1 primary) | Integration tests |
| P4 | Department field on all transaction entities (journal entries, expenses) | Schema migration + tests |
| P5 | Cost allocation engine (Direct method minimum) | Unit tests + integration tests |
| P6 | Budget by department × account × period | Integration tests |
| P7 | P&L by department report | Integration test on report query |
| P8 | Budget vs Actual report | Integration test on report query |
| P9 | Department code unique within company | Integration test |
| P10 | Cost allocation generates correct journal entries | Integration test (debit/credit check) |

### 7.2 Nice-to-Have (Post-PROD)

| # | Criterion | Priority |
|---|---|---|
| N1 | Step-Down allocation method | Phase 2 |
| N2 | Reciprocal allocation method | Phase 2 |
| N3 | Budget lock/revision workflow | Phase 2 |
| N4 | IFRS 8 segment report | Phase 3 |
| N5 | Inter-department transfer module | Phase 2 |
| N6 | Department dashboard with KPIs | Phase 3 |
| N7 | Quy chế hạch toán auto-generation | Phase 3 |
| N8 | Department-scoped data access | Phase 3 |

---

## 8. Implementation Roadmap

### Phase 1: Core Data Model + Foundation (Weeks 1-2)

| Week | Deliverables | Dependencies |
|---|---|---|
| W1 | Department entity (code, name, type, parent, status) + DB migration | Company module |
| W1 | Department tree hierarchy (parentId, path, depth, materialized path triggers) | W1 entity |
| W1 | UserDepartment entity (many-to-many, primary, job title) | W1 entity + User module |
| W2 | Department field on JournalEntry, Expense, Invoice entities | All transaction entities |
| W2 | Department CRUD API endpoints | W1 complete |
| W2 | Department tree explorer API | W1 hierarchy |
| W2 | Unit + integration tests for all W1-W2 items | All |

### Phase 2: Cost Allocation + Budget (Weeks 3-5)

| Week | Deliverables | Dependencies |
|---|---|---|
| W3 | BudgetPlan entity + CRUD | Phase 1 complete |
| W3 | Budget vs actual auto-calculation logic | Phase 1 + transaction dept field |
| W3 | Budget control (Soft/Hard enforcement) | W3 budget |
| W4 | CostAllocationRule entity + CRUD | Phase 1 complete |
| W4 | Direct allocation method implementation | W4 rules |
| W4 | Step-Down allocation method | W4 direct |
| W5 | Reciprocal allocation (system of linear equations) | W4 step-down |
| W5 | Allocation journal entry generation | W4-5 allocation engine |
| W5 | Cost allocation schedule (periodic execution) | W5 allocation |

### Phase 3: Reporting + Integration (Weeks 5-8)

| Week | Deliverables | Dependencies |
|---|---|---|
| W5 | P&L by department report | Phase 2 complete |
| W6 | Cost report by department (detail by account) | Phase 2 complete |
| W6 | Budget vs actual report | Phase 2 complete |
| W6 | Multi-period comparison report | Phase 2 complete |
| W7 | Salary account mapping per department | HR module |
| W7 | Fixed asset department tracking | Asset module |
| W7 | CCDC transfer between departments | Phase 2 |
| W8 | IFRS 8 segment report (optional) | Phase 3 reports |
| W8 | Department dashboard | Phase 3 reports |
| W8 | Quy chế hạch toán generator | Phase 3 complete |
| W8 | Full test suite + documentation | All |

### Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Adding departmentId to all transaction entities creates migration complexity | Phase 1 delay | Make departmentId nullable; no NOT NULL constraint until Phase 2 |
| Cost allocation mis-calculations cause incorrect P&L | Data integrity issue | Extensive integration tests with known test data; manual verification |
| Reciprocal method requires solving linear equations — performance risk | Allocation slowdown | Cap iterations; use Gauss-Seidel approximation for large rule sets |
| Budget control at transaction time adds latency | UX degradation | Async allocation; synchronous budget check only for Hard mode |
| No existing module for analytic dimensions — architectural decision needed | Architecture refactor | Decide: segment in COA vs independent field. Recommendation: independent field (MISA pattern) |

---

## 9. Related Documents

| Doc | Location |
|---|---|
| BRD — Departments | `docs/brd/17-dept-module-brd.md` |
| Use Cases — Departments | `docs/brd/18-dept-use-cases.md` |
| Business Rules — Departments | `docs/brd/19-dept-business-rules.md` |
| Data Flows — Departments | `docs/brd/20-dept-data-flows.md` |
| Workflows — Departments | `docs/brd/21-dept-workflows.md` |
| UI Templates — Departments | `docs/brd/22-dept-templates.md` |
| User Journeys — Departments | `docs/brd/23-dept-user-journeys.md` |
| Research — Department Regulations | `docs/research/department-accounting-regulations.md` |
| Research — ERP Practices | `docs/research/department-erp-practices.md` |
| Research — IFRS 8 Segment Reporting | `docs/research/ifrs8-segment-reporting.md` |
| Luật Kế toán 88/2015 | Điều 3, 4, 10, 39 |
| TT 53/2006/TT-BTC | Full text — Hướng dẫn Kế toán quản trị |
| TT 99/2025/TT-BTC | Điều 3, 9, 11, 12, 18; Phụ lục II |
| TT 133/2016/TT-BTC | Điều 9 |

---

## 10. Appendix A: Key Vietnamese Domain Terms

| VN Term | EN Translation | Context |
|---|---|---|
| Phòng ban | Department | Internal organisational unit |
| Trung tâm chi phí | Cost center | Department responsible for costs only |
| Trung tâm lợi nhuận | Profit center | Department responsible for revenue + costs |
| Trung tâm đầu tư | Investment center | Department responsible for profit + capital employed |
| Trung tâm trách nhiệm | Responsibility center | General term for any accountable unit |
| Trung tâm phụ trợ | Support center | Department serving other departments (HR, IT, Accounting) |
| Phân bổ chi phí | Cost allocation | Distributing shared costs to departments |
| Phương pháp trực tiếp | Direct method | Simplest allocation method |
| Phương pháp bậc thang | Step-down method | Sequential allocation |
| Phương pháp đối ứng | Reciprocal method | Algebraic allocation (most accurate) |
| Ngân sách phòng ban | Department budget | Planned spending per department |
| Điều chuyển nội bộ | Internal transfer | Transferring assets between departments |
| Mã phân tích | Analytic code | Independent coding dimension for management accounting |
| Quy chế hạch toán kế toán | Internal accounting regulations | Required when deviating from standard charts |
| Đơn vị hạch toán phụ thuộc | Dependent accounting unit | Branch with partial accounting autonomy |
| Báo cáo bộ phận | Segment report | IFRS 8 / VAS 28 style |



