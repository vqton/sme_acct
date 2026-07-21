# Workflows: Departments (Phòng ban) Module

## WF-D01: Department Lifecycle

```
[START]
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│ [Create Department]                                          │
│ code, name, type, parent?, sortOrder                         │
│ → path = parent.path + "/" + id                              │
│ → depth = parent.depth + 1                                   │
│ → status = Active                                            │
│ → createdByUserId = currentUser                              │
└────────────────────────────────┬─────────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Department Active    │
                     │   (status = 1)         │
                     └───────┬───────┬───────┘
                             │       │
              ┌──────────────┘       └──────────────┐
              ▼                                     ▼
  ┌─────────────────────┐             ┌─────────────────────┐
  │ [Edit Department]   │             │ [Deactivate]        │
  │ name, type, parent, │             │ Validate: no open   │
  │ manager, accounts   │             │ transactions, no    │
  └──────────┬──────────┘             │ open budgets, no    │
             │                        │ pending allocations │
             │                        └──────────┬──────────┘
             │                                   │ pass
             │                                   ▼
             │                     ┌───────────────────────┐
             │                     │  Department Inactive   │
             │                     │  (status = 2)          │
             │                     └───────┬───────┬───────┘
             │                             │       │
             └──────────────────┐          │       │
                                │          │       │
                                ▼          ▼       │
                     ┌─────────────────────────┐   │
                     │ [Reactivate]            │   │
                     │ status → Active         │   │
                     └─────────────────────────┘   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │ [Dissolve]          │
                                        │ Validate: no        │
                                        │ children, no users, │
                                        │ no budgets, no      │
                                        │ transactions        │
                                        └──────────┬──────────┘
                                                   │ pass
                                                   ▼
                                        ┌─────────────────────┐
                                        │ Department Dissolved │
                                        │ (status = 3)         │
                                        │ TERMINAL             │
                                        └─────────────────────┘
```

## WF-D02: Cost Allocation Cycle

```
[Period End / Manual Trigger]
  │
  ├── Lock period actual costs (no more changes to current period)
  │
  ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 1: Review & Validate Rules]                              │
│ • Load all active CostAllocationRules for the period           │
│ • Inactivate expired rules (effective_to < period_end)         │
│ • Flag rules with missing basis data (e.g., no headcount)     │
│ • Verify: for each StepDown rule, processing order is set      │
└────────────────────────────────┬───────────────────────────────┘
                                 │ user reviews & confirms
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 2: Run Allocation Preview]                              │
│ • Calculate estimated allocation amounts                      │
│ • Show: from → to, method, basis value, amount, account       │
│ • User can: {Accept, Adjust %, Skip}                          │
└────────────────────────────────┬───────────────────────────────┘
                                 │ Accept
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 3: Execute Allocation]                                  │
│ • Process Direct rules first                                  │
│ • Process StepDown rules in order                             │
│ • Process Reciprocal rules (solve equations)                  │
│ • Generate balanced journal entries                           │
│ • Update BudgetPlan.actualAmount for each dept                │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 4: Review Results]                                      │
│ • Show allocation summary: total distributed, dept totals     │
│ • Show generated journal entries (debit/credit, balanced)     │
│ • Export option: PDF, Excel                                   │
└────────────────────────────────────────────────────────────────┘
```

## WF-D03: Budget Planning Cycle

```
[Fiscal Year Start / Budget Season]
  │
  ▼
┌────────────────────────────────────────────────────────────────┐
│ [Dept Managers Submit Budget Requests]                        │
│ • Department head enters planned amounts by account per month │
│ • System copies prior year actual as baseline                 │
│ • Status: Draft                                               │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Kế toán trưởng Reviews]                                       │
│ • Compare against company targets                             │
│ • Flag departments > 20% above prior year                     │
│ • Modify amounts with audit trail comment                     │
│ • Revenue department → Approved                               │
│ • Over-budget → Return to Dept Manager for revision           │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
         ┌──────────────────┐      ┌──────────────────────┐
         │ [Approved]       │      │ [Return for Revision] │
         │ Budget locked    │      │ Dept manager resubmits│
         │ Status: Approved │      └──────────┬───────────┘
         └────────┬─────────┘                 │
                  │                           ▼
                  │               ┌──────────────────────┐
                  │               │ [Re-submitted]      │
                  │               │ Status: Draft        │
                  │               └──────────┬───────────┘
                  │                          │ review again
                  │                          ▼
                  ▼               (back to Kế toán trưởng Reviews)
         ┌──────────────────┐
         │ [Budget Locked]   │
         │ Status: Locked     │
         │ Edits blocked      │
         │ unless revision    │
         └────────────────────┘
```

## WF-D04: Transaction with Department Context

```
[User creates transaction]
  │
  ▼
┌────────────────────────────────────────────────────────────────┐
│ [Select Department]                                           │
│ • Default: user's primary department                          │
│ • Can override: department selector (if access to multiple)   │
│ • If enableDepartmentManagement = false: field hidden         │
└────────────────────────────────┬───────────────────────────────┘
                                 │ department selected
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Enter Transaction Details]                                   │
│ • Account code, amount, description, etc.                     │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Budget Check]                                               │
│ • Load BudgetPlan for (dept, account, period)                  │
│ • Check Soft/Hard budget control                              │
│ • Hard: transaction > remaining? → BLOCK                      │
│ • Soft: transaction > remaining? → WARN (allow)               │
│ • Budget at >80%? → WARN                                      │
└────────────────────────────────┬───────────────────────────────┘
                                 │ allow
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Post Transaction]                                            │
│ • Save JournalEntry with departmentId                         │
│ • Update BudgetPlan.actualAmount by consumed                  │
│ • Return success                                              │
└────────────────────────────────────────────────────────────────┘
```

## WF-D05: Month-End Close — Department Process

```
[Period Close Triggered]
  │
  ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 1: Lock Transactions for Period]                        │
│ • No new/modified entries for closed period                   │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 2: Run Cost Allocation (WF-D02)]                       │
│ • Must be run before departmental reports are final           │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 3: Verify Dept Balances]                                │
│ • Each department's P&L = sum of direct + allocated costs      │
│ • Total allocated costs = total expenses (no double-count)    │
│ • Flag departments with negative profit margins > threshold   │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│ [Step 4: Generate Department Reports]                         │
│ • P&L by department                                           │
│ • Cost report by department                                   │
│ • Budget vs actual                                            │
│ • Segment report (if IFRS 8)                                  │
└────────────────────────────────────────────────────────────────┘
```

## State Machine Summary

```
Department:
  ┌──────────┐     [deactivate]     ┌──────────┐     [dissolve]
  │  Active  │────────────────────→│ Inactive │──────────────┐
  │          │←────────────────────│          │              │
  └──────────┘     [reactivate]    └──────────┘              ▼
                                                      ┌──────────┐
                                                      │Dissolved │
                                                      │ (TERMINAL)│
                                                      └──────────┘

BudgetPlan:
  ┌───────┐   [approve]   ┌──────────┐   [lock]   ┌────────┐
  │ Draft │──────────────→│ Approved │───────────→│ Locked │
  └───┬───┘              └───┬───────┘           └───┬────┘
      │                      │                        │
      │[reject/return]       │[resubmit]             │[unlock+approve]
      └──────────────────────┘───────────────────────┘
```
