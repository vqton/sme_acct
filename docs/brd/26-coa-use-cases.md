# COA Module — Use Cases

**Version:** 1.0
**Date:** 2026-07-23

---

## UC-01: Seed Standard COA on Company Creation

**Actor:** System (automatic)
**Trigger:** New company created
**Precondition:** Company created, `accounting_regime` set
**Postcondition:** Standard accounts populated per regime

### Happy Path
1. System reads `accounting_regime` from `company_settings`
2. System loads standard account list for that regime (TT 99 / TT 133 / TT 58)
3. System creates parent accounts first (level 1), then children in depth-order
4. All accounts marked `is_system = true`, `is_active = true`
5. Non-leaf accounts: `allow_transactions = false`
6. Leaf accounts (level 3+ detail): `allow_transactions = true`
7. Audit log: `COA_SEEDED`, regime name, account count

### Alternative Path
- **A1**: Regime not set → default to TT 133 (SME default per Luật Kế toán)
- **A2**: Company re-seeds (deleted COA) → clear all existing accounts first, warn user

### Exception Path
- **E1**: Regime code invalid → throw `InvalidRegimeError`
- **E2**: DB constraint failure → rollback entire seed, log error

---

## UC-02: Create Custom Account

**Actor:** Accounting Manager / Chief Accountant
**Trigger:** User clicks "Add Account"
**Precondition:** User has `account:create` permission, company exists, regime allows custom accounts

### Happy Path
1. User enters: account number, name, category, nature, parent (optional), description
2. System validates:
   - Account number format per regime (TT 99: 1-4 digits/level, max 4 levels)
   - Account number unique per company
   - Parent account exists and is not a leaf
   - Parent account is in same category
3. System infers: type (parent/child/detail), nature from category if not provided
4. System creates account with `is_system = false`
5. Audit log: `ACCOUNT_CREATED`, account number, user ID
6. Return created account with ID

### Alternative Path
- **A1**: Number already exists → prompt user with existing account info
- **A2**: Parent not in same category → warn, allow override
- **A3**: No parent → created as level-1 (require category match)

### Exception Path
- **E1**: Invalid number format → return validation error with format rules
- **E2**: Exceeds max depth (4 for TT 99, 3 for TT 133) → reject
- **E3**: Circular reference (child.parentId = child itself or descendant) → reject

---

## UC-03: Edit Account

**Actor:** Accounting Manager / Chief Accountant
**Trigger:** User edits existing account
**Precondition:** Account exists, not system account (is_system = false)

### Happy Path
1. User modifies: name, name_english, description, is_active, allow_transactions
2. System updates account, sets `updated_at`
3. Audit log: `ACCOUNT_UPDATED`, fields changed, before/after values

### Alternative Path
- **A1**: Renumber account → validate new number not in use, update all journal_entry_lines references
- **A2**: Change parent → validate no circular, validate category match

### Exception Path
- **E1**: Edit system account → blocked (is_system accounts are read-only)
- **E2**: Renumber to existing number → reject
- **E3**: Move to invalid parent (circular/wrong category) → reject

---

## UC-04: Deactivate Account

**Actor:** Accounting Manager / Chief Accountant
**Trigger:** User deactivates account
**Precondition:** Account has zero balance, no pending transactions

### Happy Path
1. System checks: balance = 0, no unposted journal entries
2. User confirms deactivation reason
3. System sets `is_active = false`
4. Audit log: `ACCOUNT_DEACTIVATED`, reason

### Alternative Path
- **A1**: Has balance but zero transactions → warn, require admin override
- **A2**: Deactivate with effective date in future → allow, schedule deactivation

### Exception Path
- **E1**: Has non-zero balance → reject, show current balance
- **E2**: Has posted transactions in current period → reject
- **E3**: Is system account → reject

---

## UC-05: Delete Account

**Actor:** System Admin
**Trigger:** User deletes account permanently
**Precondition:** Account has no transactions, no children, is not system

### Happy Path
1. System validates: no journal_entry_lines reference, no children
2. User confirms deletion
3. System deletes account
4. Audit log: `ACCOUNT_DELETED`

### Exception Path
- **E1**: Has transaction history → reject, direct user to deactivate instead
- **E2**: Has child accounts → reject, show children, direct to delete children first
- **E3**: Is system account → reject

---

## UC-06: Search / Filter Accounts

**Actor:** Any accounting user
**Trigger:** User searches accounts
**Precondition:** None

### Happy Path
1. User enters: search term (number or name), optional filters (category, nature, type, status)
2. System returns paginated results ordered by `account_number`
3. Results include: number, name, category label, nature label, balance (if period selected)

### Alternative Path
- **A1**: Empty search → return all active accounts in tree structure
- **A2**: Search by parent → return children tree

---

## UC-07: View Account Hierarchy

**Actor:** Any accounting user
**Trigger:** User opens account management screen
**Precondition:** None

### Happy Path
1. System loads all accounts for company ordered by `account_number`
2. System builds tree: parent → children → grandchildren
3. Display shows: indented tree, account number, name, nature icon, balance
4. Expandable/collapsible nodes
5. Leaf accounts marked with transaction icon

---

## UC-08: Import COA from Excel/CSV

**Actor:** Chief Accountant
**Trigger:** User imports accounts from file
**Precondition:** File uploaded, format validated

### Happy Path
1. User uploads Excel/CSV with columns: account_number, name, category, nature, parent_number, description
2. System validates all rows (format, uniqueness, hierarchy)
3. System shows validation summary: rows total, valid, errors
4. User confirms import
5. System creates all valid accounts in batch transaction
6. Audit log: `COA_IMPORTED`, row count

### Exception Path
- **E1**: File format invalid → reject with format requirements
- **E2**: Any row fails validation → reject entire batch, show row-level errors
- **E3**: Regime mismatch (account number doesn't match regime format) → reject

---

## UC-09: Export COA

**Actor:** Any accounting user
**Trigger:** User exports COA
**Precondition:** None

### Happy Path
1. User selects format (Excel or CSV)
2. User optionally filters: active only, by category, by regime
3. System generates file with: account_number, name, parent_number, category, nature, type, is_active
4. File downloaded

---

## UC-10: Switch Accounting Regime

**Actor:** Chief Accountant / System Admin
**Trigger:** Company changes from TT 133 to TT 99 (or vice versa)
**Precondition:** Company meets criteria for target regime, fiscal period is closed

### Happy Path
1. User selects target regime
2. System validates company eligibility (size criteria per NĐ 80/2021)
3. System maps current accounts to target accounts using mapping table
4. User reviews account mappings
5. System verifies: no data loss, no unmapped accounts with balances
6. User confirms switch
7. System updates `accounting_regime`, adjusts accounts
8. Audit log: `REGIME_SWITCHED`, from→to, timestamp

### Exception Path
- **E1**: Open fiscal period exists → reject, require period close
- **E2**: Unmapped accounts with balances → show unmapped, require manual mapping
- **E3**: Not eligible for target regime → show eligibility criteria
