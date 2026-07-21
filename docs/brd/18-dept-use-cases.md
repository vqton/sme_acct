# Use Cases: Departments (Phòng ban) Module

## UC-D01: Manage Departments

**Actor:** Kế toán trưởng (Chief Accountant), Quản trị viên (Admin)
**Preconditions:** Company exists, authenticated as admin/chief-accountant

### UC-D01.1: Create Department
1. User enters: code, name, type (CostCenter/ProfitCenter/InvestmentCenter/SupportCenter), parent (nullable)
2. System validates: code unique within company, parent exists if specified, type compatible with parent type
3. System computes: path = `${parent.path}/${id}`, depth = parent.depth + 1
4. System saves Department with status=Active
5. System returns created Department

### UC-D01.2: Edit Department
1. User modifies: name, type, parent (re-parenting)
2. System validates: no circular ref on reparent; type compatibility on subtree
3. System recomputes materialized path for entire subtree if parent changed
4. System saves

### UC-D01.3: Deactivate Department
1. User selects deactivate
2. System checks: department has no open transactions, no pending budgets
3. If check passes: status → Inactive
4. If fails: warn "Department has active obligations"

### UC-D01.4: Reactivate Department
1. User selects reactivate
2. System sets status → Active

### UC-D01.5: View Department Tree
1. System loads all departments for company
2. System returns tree structure (nested by parentId, ordered by sortOrder)
3. System shows: name, code, type, status, head count, budget vs actual summary

---

## UC-D02: Manage User-Department Assignments

**Actor:** Admin, Kế toán trưởng

### UC-D02.1: Assign User to Department
1. Admin selects user + department + role (primary flag)
2. System validates: user is active, department exists
3. If `isPrimary`: remove existing primary flag for this user
4. Systems saves UserDepartment record

### UC-D02.2: Change Primary Department
1. System unflags current primary, flags new
2. System updates default context for user

### UC-D02.3: Remove User from Department
1. System deletes UserDepartment record
2. If was primary: if user had other departments, pick oldest as primary
3. If was last department: error "User must belong to at least 1 department"

### UC-D02.4: View Department Members
1. System loads UserDepartment + User for department
2. Returns: user name, job title, primary flag, active status

---

## UC-D03: Cost Allocation Management

**Actor:** Kế toán trưởng, Kế toán tổng hợp (General Accountant)

### UC-D03.1: Create Allocation Rule
1. User defines: fromDepartment, toDepartment (nullable = all), accounts (nullable = all), method, basis, %, dates
2. System validates: departments type-compatible, % ≤ 100
3. System saves CostAllocationRule

### UC-D03.2: Execute Allocation Run
1. System collects all active rules for the period
2. For each rule by method type:
   - **Direct**: Allocate fromDepartment costs → toDepartment in one step
   - **Step-Down**: Order departments by sequence; allocate step by step; once allocated, not re-allocated onward
   - **Reciprocal**: Build linear equations; solve via Gaussian elimination or Gauss-Seidel; apply solution
3. System generates allocation journal entries for each department
4. System records allocation run in audit log

### UC-D03.3: Preview Allocation
1. System shows estimated allocation before committing
2. User can accept or adjust

### UC-D03.4: View Allocation Schedule
1. System shows: rule name, method, basis, last run, next scheduled run
2. User can trigger immediate run

---

## UC-D04: Budget Management

**Actor:** Kế toán trưởng, Giám đốc tài chính (CFO)

### UC-D04.1: Create Department Budget
1. User selects: department, fiscal year, period, account code
2. User enters planned amount
3. System saves as Draft

### UC-D04.2: Approve Budget
1. User (with approval authority) reviews Draft budgets
2. System changes status → Approved

### UC-D04.3: Lock Budget
1. Authorized user locks budget → Locked
2. System blocks further revisions

### UC-D04.4: Revise Budget
1. If Locked, user must unlock or create revision
2. System records audit trail: old value, new value, reason, timestamp, user

### UC-D04.5: Budget Check at Transaction Time
1. Transaction posted with department field
2. System checks BudgetPlan for matching department + account + period
3. If Hard mode and actual + transaction > planned: block transaction
4. If Soft mode and actual + transaction > planned: warn, allow
5. System records consumed amount

---

## UC-D05: Departmental Reports

**Actor:** All roles with report access

### UC-D05.1: P&L by Department
1. User selects: period range, department(s), comparison (prior period/budget)
2. System aggregates: revenue accounts by department, expense accounts by department
3. Output: multi-column report with department columns

### UC-D05.2: Cost Report by Department
1. User selects: period range, department, account level
2. System shows cost breakdown by account code
3. Drill-down: click amount → see individual vouchers

### UC-D05.3: Budget vs Actual
1. User selects: department, period, account
2. System shows: planned, actual, variance ($ and %)
3. Variance highlighting (>10% threshold configurable)

### UC-D05.4: IFRS 8 Segment Report
1. User selects: period, threshold (10% standard)
2. System identifies reportable segments (revenue ≥ 10% of total, profit ≥ 10%, assets ≥ 10%)
3. Output: revenue, profit, assets by segment

---

## UC-D06: Inter-Department Transfers

**Actor:** Kế toán TSCĐ, Kế toán kho

### UC-D06.1: Create Transfer
1. User selects: from dept, to dept, item type (CCDC/TSCD/Inventory/Other)
2. User enters: description, quantity, unit value, voucher ref
3. System validates: departments active, quantities available
4. System saves transfer record
5. System generates adjustment journal entries if applicable

### UC-D06.2: View Transfer History
1. User selects department
2. System shows transfers in (from others) and transfers out (to others)
3. Filter by date, type, value range

---

## Use Case Dependency Map

```
UC-D01 (Dept CRUD)
├── UC-D01.1 Create ← no deps
├── UC-D01.2 Edit
├── UC-D01.3 Deactivate
├── UC-D01.4 Reactivate
└── UC-D01.5 View Tree

UC-D02 (User-Dept) ← depends: UC-D01
├── UC-D02.1 Assign
├── UC-D02.2 Change Primary
├── UC-D02.3 Remove
└── UC-D02.4 View Members

UC-D03 (Cost Allocation) ← depends: UC-D01, D02
├── UC-D03.1 Create Rule
├── UC-D03.2 Execute Run
├── UC-D03.3 Preview
└── UC-D03.4 View Schedule

UC-D04 (Budget) ← depends: UC-D01
├── UC-D04.1 Create
├── UC-D04.2 Approve
├── UC-D04.3 Lock
├── UC-D04.4 Revise
└── UC-D04.5 Check at Tx Time

UC-D05 (Reports) ← depends: UC-D01, D02, D03, D04
├── UC-D05.1 P&L by Dept
├── UC-D05.2 Cost by Dept
├── UC-D05.3 Budget vs Actual
└── UC-D05.4 IFRS 8 Segment

UC-D06 (Transfers) ← depends: UC-D01
├── UC-D06.1 Create
└── UC-D06.2 View History
```
