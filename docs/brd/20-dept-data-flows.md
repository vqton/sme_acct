# Data Flows: Departments (Phòng ban) Module

## DF-D01: Create Department

```
[UI: Department Form]
    │ POST /api/companies/:companyId/departments
    │ body: { code, name, type, parentId?, sortOrder? }
    ▼
[CompanyController]
    │ deptCreateUseCase
    ▼
[DepartmentUseCases]
    │
    ├── Validate input (code format, name length, type enum)
    │   └── Fail → 400 BadRequest
    │
    ├── Check code uniqueness (Repository.findByCode)
    │   └── Duplicate → 409 Conflict
    │
    ├── If parentId: load parent
    │   ├── Not found → 404
    │   ├── Inactive → 400
    │   └── Validate type compatibility
    │
    ├── Compute path, depth
    │   path = parent ? `${parent.path}/${id}` : `/${id}`
    │   depth = parent ? parent.depth + 1 : 0
    │
    ├── Save Department (Repository.create)
    │   └── DB: INSERT INTO departments (...)
    │
    └── Return 201 + DepartmentDTO
           │
           ▼
        [UI: Department Tree refresh]
```

## DF-D02: Reparent Department

```
[UI: Drag department to new parent]
    │ PATCH /api/companies/:companyId/departments/:id/reparent
    │ body: { newParentId }
    ▼
[DepartmentUseCases]
    │
    ├── Load department → not found? 404
    ├── Load newParent → not found? 404
    ├── Circular check: is newParent in dept's subtree?
    │   └── Fail → 400 CIRCULAR_REF
    │
    ├── Validate type compatibility (BR-D03.2)
    │
    ├── Compute new path, new depth
    │
    ├── UPDATE departments SET parentId, path, depth WHERE id = dept.id
    │
    ├── Recursively update all children's path, depth
    │   UPDATE departments SET
    │     path = REPLACE(path, oldPrefix, newPrefix),
    │     depth = depth + (newDepth - oldDepth)
    │   WHERE path LIKE '${oldPathPrefix}%'
    │
    └── Return 200 + updated DepartmentDTO
```

## DF-D03: Create User-Department Assignment

```
[UI: Department → Members tab → Add User]
    │ POST /api/companies/:companyId/departments/:deptId/users
    │ body: { userId, isPrimary, jobTitle? }
    ▼
[DepartmentUseCases]
    │
    ├── Validate: user exists, dept exists, user not already assigned
    │
    ├── If isPrimary = true:
    │   ├── UPDATE user_departments SET is_primary = 0
    │   │   WHERE user_id = ? AND is_primary = 1
    │   └── (new record will set is_primary = 1)
    │
    ├── INSERT INTO user_departments (user_id, dept_id, is_primary, job_title)
    │
    └── Return 201
```

## DF-D04: Cost Allocation Execution

```
[Schedule trigger / Manual run]
    │ POST /api/companies/:companyId/cost-allocations/execute
    │ body: { period: "2026-07" }
    ▼
[CostAllocationService.executeAllocation]
    │
    ├── Load all active CostAllocationRules for company, period
    │   SELECT * FROM cost_allocation_rules WHERE company_id = ?
    │   AND is_active = 1 AND effective_from <= ? AND (effective_to IS NULL OR effective_to >= ?)
    │
    ├── Group rules by method:
    │   ├── Direct rules
    │   ├── StepDown rules (ordered by sequence)
    │   └── Reciprocal rules
    │
    ├── Step 1: Process Direct rules
    │   For each rule:
    │     │ Load fromDepartment's actual expenses for specified accounts
    │     │ Compute allocation amount = total * percentage (or basis calculation)
    │     │ Generate journal entry:
    │     │   Debit: 642_alloc (toDepartment)
    │     │   Credit: 642_direct (fromDepartment)
    │
    ├── Step 2: Process StepDown rules
    │   │ Sort fromDepartments by sequence
    │   │ For each fromDept in order:
    │   │   │ Allocate remaining costs to all toDepartments
    │   │   │ Mark fromDept as "allocated" — skip in subsequent steps
    │
    ├── Step 3: Process Reciprocal rules
    │   │ Build linear equations:
    │   │   Ai = direct_i + sum(j≠i, a_ij * Aj)
    │   │ Solve via Gauss-Seidel (max 50 iterations)
    │   │ Apply solution amounts
    │
    ├── Step 4: Persist AllocationResult records
    │   INSERT INTO allocation_results (run_id, rule_id, from_dept, to_dept,
    │     account_code, amount, period)
    │
    ├── Step 5: Generate allocation journal entries
    │   For each AllocationResult:
    │     INSERT INTO journal_entries (company_id, dept_id, account_code,
    │       debit, credit, period, description, source='ALLOCATION')
    │
    └── Return allocation summary
```

## DF-D05: Budget Check at Transaction Time

```
[Transaction posted with departmentId]
    │
    ▼
[BudgetService.checkBudget]
    │
    ├── Load active budget for (company, deptId, accountCode, period)
    │
    ├── Not found → allow (no budget control)
    │
    ├── Calculate consumed = SUM(transactions for same (dept, account, period))
    │
    ├── remaining = planned - consumed
    │
    ├── If Hard mode AND transactionAmount > remaining:
    │   └── Block → return BUDGET_HARD_BLOCKED error
    │
    ├── If Soft mode AND transactionAmount > remaining:
    │   └── Warn → return { allowed: true, warning: "Budget exceeded by X" }
    │
    └── If consumed / planned >= alertThreshold (80%):
        └── Return { allowed: true, warning: "Budget at X%" }
```

## DF-D06: P&L by Department Report

```
[API: GET /api/reports/pl-by-department]
    │ query: { companyId, fromDate, toDate, deptIds? }
    ▼
[ReportService.getPLByDepartment]
    │
    ├── Step 1: Get direct departmental transactions
    │   SELECT d.id, d.name,
    │     SUM(CASE WHEN j.debit_account LIKE '5%' OR j.debit_account LIKE '6%'
    │         OR j.debit_account LIKE '8%' THEN j.debit - j.credit ELSE 0 END) AS revenue,
    │     SUM(CASE WHEN j.debit_account LIKE '6%' OR j.debit_account LIKE '8%'
    │         THEN j.debit - j.credit ELSE 0 END) AS cost_of_goods,
    │     SUM(CASE WHEN j.debit_account LIKE '642%' THEN j.debit ELSE 0 END) AS operating_expense,
    │     SUM(CASE WHEN j.debit_account LIKE '635%' THEN j.debit - j.credit ELSE 0 END) AS finance_cost,
    │     SUM(CASE WHEN j.debit_account LIKE '821%' THEN j.debit ELSE 0 END) AS income_tax
    │   FROM departments d
    │   LEFT JOIN journal_entries j ON j.department_id = d.id
    │     AND j.company_id = ? AND j.period BETWEEN ? AND ?
    │     AND j.debit IS NOT NULL
    │   WHERE d.company_id = ? AND d.status = 1
    │   [AND d.id IN (...deptIds)]
    │   GROUP BY d.id, d.name
    │
    ├── Step 2: Get allocation costs
    │   SELECT to_department_id, SUM(amount) as allocated_cost
    │   FROM allocation_results
    │   WHERE company_id = ? AND period BETWEEN ? AND ?
    │   GROUP BY to_department_id
    │
    ├── Step 3: Merge data → DeptPLRow { deptId, deptName, revenue, cogs,
    │     grossProfit, opEx, allocatedCost, totalCost, netProfit,
    │     budgetRevenue, budgetCost, varianceRevenue, varianceCost }
    │
    └── Return { rows: DeptPLRow[], totals: { revenue, cogs, grossProfit, netProfit } }
```

## DF-D07: Department Deactivation Cascade

```
[Dept status → Inactive]
    │
    ▼
[DepartmentUseCases.deactivateDepartment]
    │
    ├── Load department + children
    │
    ├── Validate no open transactions → fail if found
    ├── Validate no open budgets → fail if found
    ├── Validate no pending allocations → fail if found
    │
    ├── If has active children:
    │   └── For each child: recurse deactivate (BR-D02.5)
    │
    ├── Update UserDepartment: set is_active = false for this dept
    │
    ├── For each user whose last department this was:
    │   └── Error: "Cannot deactivate — user X has no other department"
    │
    ├── UPDATE departments SET status = 2 WHERE id = ? OR path LIKE '${path}%'
    │
    └── Log audit event
```

## DF-D08: Enable/Disable Department Management

```
[CompanySettings update: enableDepartmentManagement = false]
    │
    ▼
[SettingsUseCases]
    │
    ├── Load all departments for company
    ├── If departments have transactions:
    │   └── Warn: "N departments have transaction history — settings change
    │        will hide them. Transactions remain in ledger."
    │
    ├── UPDATE company_settings SET enable_department_management = false
    │
    └── UI hides all department controls
    │
    ▼
    ┌─────────────────────────────────────────────────┐
    │ WARNING: Departments are soft-hidden. Data is   │
    │ preserved. Re-enabling restores visibility.     │
    └─────────────────────────────────────────────────┘
```

## Data Flow Dependency Graph

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ DF-D01      │────→│ DF-D02      │────→│ DF-D04          │
│ Create Dept │     │ Reparent    │     │ Cost Allocation │
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                  │
┌─────────────┐                                   ▼
│ DF-D03      │                           ┌─────────────────┐
│ User Assign │                           │ DF-D06          │
└─────────────┘                           │ P&L Report      │
                                          └─────────────────┘
┌─────────────┐
│ DF-D05      │──────────────────────────→
│ Budget Check│
└─────────────┘
```
