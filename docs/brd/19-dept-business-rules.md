# Business Rules: Departments (Phòng ban) Module

## BR-D01: Department Code

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D01.1 | Department code SHALL be unique within a company (case-insensitive) | DEPT_CODE_DUPLICATE |
| BR-D01.2 | Department code SHALL be 2-20 characters, alphanumeric + underscore + hyphen | DEPT_CODE_INVALID |
| BR-D01.3 | Department code SHALL be immutable once created | DEPT_CODE_IMMUTABLE |
| BR-D01.4 | Department code SHALL be required | DEPT_CODE_REQUIRED |
| BR-D01.5 | Department code SHOULD follow convention: `PREFIX_N` where PREFIX = dept abbreviation, N = 2-digit sequence | — |

## BR-D02: Department Hierarchy

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D02.1 | A department SHALL have at most 1 direct parent | DEPT_PARENT_SINGLE |
| BR-D02.2 | A department SHALL NOT be its own ancestor (no circular reference) | DEPT_CIRCULAR_REF |
| BR-D02.3 | Maximum tree depth SHALL be 10 levels | DEPT_MAX_DEPTH |
| BR-D02.4 | Root department (no parent) SHALL have null parentId | — |
| BR-D02.5 | When parent department is deactivated, all descendants SHALL be deactivated recursively | DEPT_PARENT_INACTIVE |
| BR-D02.6 | Materialized path SHALL be updated for entire subtree when parent changes | — |
| BR-D02.7 | Sort order SHALL be unique within siblings | DEPT_SORT_DUPLICATE |

## BR-D03: Department Type

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D03.1 | Default type SHALL be CostCenter | DEPT_TYPE_DEFAULT |
| BR-D03.2 | Child department SHALL be same type as parent or narrower | DEPT_TYPE_INCOMPATIBLE |
| BR-D03.3 | Type hierarchy (allowable parent→child): All → All; ProfitCenter → CostCenter NOT allowed | DEPT_TYPE_HIERARCHY |
| BR-D03.4 | InvestmentCenter SHALL have at least one ProfitCenter or CostCenter child | — |
| BR-D03.5 | Completeness: every department SHALL have exactly 1 type | DEPT_TYPE_REQUIRED |

## BR-D04: User-Department Assignment

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D04.1 | A user SHALL be assigned to at least 1 department within a company | USER_NO_DEPT |
| BR-D04.2 | A user SHALL have exactly 1 primary department | USER_NO_PRIMARY_DEPT |
| BR-D04.3 | A user SHALL have at most N departments (configurable, default 20) | USER_TOO_MANY_DEPTS |
| BR-D04.4 | Same user-department pair SHALL be unique | USER_DEPT_DUPLICATE |
| BR-D04.5 | When user is deactivated, UserDepartment records SHALL be set inactive | — |
| BR-D04.6 | Primary department SHALL be used as default department for new transactions | — |
| BR-D04.7 | Department head SHALL be assigned from users belonging to that department | DEPT_HEAD_NOT_MEMBER |
| BR-D04.8 | Deputy department head SHALL be distinct from department head | DEPT_DEPUTY_SAME_HEAD |

## BR-D05: Cost Allocation

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D05.1 | An allocation rule SHALL have exactly 1 method (Direct/StepDown/Reciprocal) | ALLOC_METHOD_REQUIRED |
| BR-D05.2 | An allocation rule SHALL have exactly 1 basis (Headcount/Revenue/Area/Custom/Equal) | ALLOC_BASIS_REQUIRED |
| BR-D05.3 | When basis is Custom, allocationPercentage SHALL be > 0 and ≤ 100 | ALLOC_PERCENT_INVALID |
| BR-D05.4 | Sum of allocation percentages SHALL be ≤ 100 when distributing to multiple departments | ALLOC_SUM_EXCEEDS |
| BR-D05.5 | A department SHALL NOT allocate costs to itself | ALLOC_SELF_REF |
| BR-D05.6 | Step-Down SHALL have processing order based on department sequence number | — |
| BR-D05.7 | Reciprocal method SHALL converge within 50 iterations or throw | ALLOC_NO_CONVERGE |
| BR-D05.8 | Allocation run SHALL be idempotent: re-running generates same result | — |
| BR-D05.9 | Historical allocation SHALL be immutable after period close | ALLOC_PERIOD_CLOSED |
| BR-D05.10 | Allocation SHALL only apply to accounts not already fully allocated | — |
| BR-D05.11 | Allocation SHALL generate balanced journal entries (debit = credit) | ALLOC_UNBALANCED |

## BR-D06: Budget

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D06.1 | BudgetPlan SHALL have at most 1 entry per (department, fiscalYear, period, accountCode) | BUDGET_DUPLICATE |
| BR-D06.2 | PlannedAmount SHALL be ≥ 0 | BUDGET_NEGATIVE |
| BR-D06.3 | Budget SHALL transition: Draft → Approved → Locked | BUDGET_STATE_FLOW |
| BR-D06.4 | Locked budget SHALL NOT be edited; must unlock or create revision | BUDGET_LOCKED |
| BR-D06.5 | Budget revision SHALL preserve original + create new version | — |
| BR-D06.6 | BudgetLocked SHALL be a one-way gate: Locked → Unlocked requires approval | — |
| BR-D06.7 | Hard budget control SHALL block transactions exceeding planned + threshold | BUDGET_HARD_BLOCKED |
| BR-D06.8 | Soft budget control SHALL warn but allow | — |
| BR-D06.9 | BudgetAlertThreshold SHALL default to 80% | — |
| BR-D06.10 | Budget SHALL NOT be deleted after period is closed | BUDGET_PERIOD_CLOSED |

## BR-D07: Reporting

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D07.1 | P&L by department SHALL only include transactions with departmentId set | — |
| BR-D07.2 | Cost allocation SHALL be shown separately from direct departmental costs | — |
| BR-D07.3 | Budget vs Actual SHALL recalculate actual on each period close | — |
| BR-D07.4 | IFRS 8 threshold: reportable if revenue ≥ 10% of total, or profit ≥ 10%, or assets ≥ 10% | — |
| BR-D07.5 | IFRS 8: at least 75% of total revenue SHALL be reported in segments | — |

## BR-D08: Lifecycle

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D08.1 | Department SHALL transition: Active ↔ Inactive, Active → Dissolved (final) | DEPT_STATE_FLOW |
| BR-D08.2 | Dissolved department SHALL NOT be reactivated | DEPT_DISSOLVED_FINAL |
| BR-D08.3 | Department with children SHALL NOT be dissolved until all children dissolved | DEPT_HAS_CHILDREN |
| BR-D08.4 | Department with users assigned SHALL NOT be dissolved; must reassign users first | DEPT_HAS_MEMBERS |
| BR-D08.5 | Department with open budgets SHALL NOT be deactivated | DEPT_HAS_BUDGET |
| BR-D08.6 | Department with pending allocations SHALL NOT be deactivated | DEPT_HAS_ALLOC |

## BR-D09: Data Integrity

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D09.1 | Department deletion SHALL be blocked if any transactions refer to it | DEPT_REFERENCED |
| BR-D09.2 | Department SHALL support soft delete (isDeleted = true) | — |
| BR-D09.3 | Parent department deletion SHALL cascade (soft) to children | — |
| BR-D09.4 | All department-related changes SHALL be audit-logged | — |
| BR-D09.5 | Name SHALL be 1-200 characters, required | DEPT_NAME_REQUIRED |

## BR-D10: Default Settings

| Rule ID | Rule | Error Code |
|---------|------|------------|
| BR-D10.1 | When `enableDepartmentManagement = false`, department field SHALL be hidden from UI | — |
| BR-D10.2 | When `enableDepartmentManagement` changes from true → false, system SHALL warn "N departments will be deactivated" | — |
| BR-D10.3 | When `enableDepartmentManagement` changes from false → true, system SHALL create a default "Main Department" | — |
| BR-D10.4 | Default Main Department SHALL be type=CostCenter, no parent | — |
