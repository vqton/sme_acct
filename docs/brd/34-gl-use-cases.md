# GL Module — Use Cases

**Version:** 1.0
**Date:** 2026-07-23

---

## UC-G01: Create Journal Entry

**Actor:** Accountant (Kế toán viên)
**Precondition:** User logged in, company selected, at least one fiscal period OPEN, COA populated

**Main Flow:**
1. User navigates to Journal Entry > Create
2. System displays journal entry form with fields: Date, Entry Type, Description, Reference #
3. User selects date → system auto-determines fiscal period
4. User adds lines: Account, Debit, Credit, optional Description, Department/Cost Center
5. System validates each line: account exists, account active, account allows transactions
6. System validates total debit = total credit (within 0.001 tolerance)
7. User clicks Save (Draft) or Save & Post
8. If Save & Post: system posts to ledger, updates running balances, updates account_balances
9. System generates entry number format: YYYYMM-XXXXX
10. System logs to audit trail

**Alternative Flows:**
- AF-01: Period is closed → block with message "Selected period is closed"
- AF-02: Account not found → inline error "Account XXXX not found"
- AF-03: Account is parent/control account → error "Account XXXX is a control account; select a detail account"
- AF-04: Debit ≠ Credit → error "Total debit must equal total credit (diff: X)"
- AF-05: Save as Draft → system saves but does NOT post to ledger
- AF-06: Entry type not relevant for period → system auto-selects based on common patterns

---

## UC-G02: Post Journal Entry

**Actor:** Accountant / Chief Accountant
**Precondition:** Journal entry exists in DRAFT status

**Main Flow:**
1. User opens draft journal entry
2. User reviews lines, verifies debit = credit
3. User clicks Post
4. System re-validates: account active, period open, lines balanced
5. System posts to ledger: inserts ledger_entries with running balances
6. System updates account_balances for affected accounts
7. System marks entry as posted (is_posted = true, posted_at = now)
8. System logs to audit trail

**Alternative Flows:**
- AF-01: Period was closed after entry created → block posting
- AF-02: Account deactivated after entry created → block with specific account reference

---

## UC-G03: Reverse Journal Entry

**Actor:** Chief Accountant (Kế toán trưởng)
**Precondition:** Posted journal entry exists

**Main Flow:**
1. User opens posted journal entry
2. User clicks Reverse
3. System displays confirmation with reversal reason field
4. User enters reason, confirms
5. System creates reversal entry: all amounts swapped (debit ↔ credit), description prefixed "Đảo ngược:"
6. System posts reversal entry to ledger immediately
7. System marks original entry as reversed
8. System logs to audit trail

**Business Rules:**
- Can only reverse a posted entry (not a draft)
- Reversal gets current date, not original date
- Reversal must be in same fiscal year (cross-year reversal needs manual adjustment)
- Reversal entry number: RR-{original_entry_number}

---

## UC-G04: View General Ledger (Sổ Cái)

**Actor:** Accountant, Chief Accountant, Manager
**Precondition:** Company selected, accounts exist

**Main Flow:**
1. User navigates to Reports > General Ledger
2. User selects: Account, Date Range / Period, optional Department/Cost Center
3. System displays ledger table:
   - Opening balance (debit/credit)
   - Each transaction: Date, Entry #, Description, Debit, Credit, Running Debit, Running Credit, Running Balance
   - Closing balance
4. User can filter by account number/name, date range
5. User can export to Excel/PDF

**Alternative Flows:**
- AF-01: All accounts → display multi-ledger view with account summary
- AF-02: Zero transactions → display only opening/closing balances

---

## UC-G05: View Trial Balance (Bảng Cân Đối Tài Khoản)

**Actor:** Accountant, Chief Accountant
**Precondition:** Period selected

**Main Flow:**
1. User navigates to Reports > Trial Balance
2. User selects period
3. System displays trial balance table:
   - Account Number, Account Name
   - Opening Debit, Opening Credit
   - Period Debit, Period Credit
   - Closing Debit, Closing Credit
4. System shows totals row with debit = credit verification
5. User can drill down on any account → see ledger detail
6. User can filter by account category, active accounts only
7. User can export to Excel/PDF

---

## UC-G06: Generate Financial Statements (BCTC)

**Actor:** Chief Accountant
**Precondition:** Period closed, all entries posted

**Main Flow:**
1. User navigates to Reports > Financial Statements
2. User selects: Report Type (B01-DN, B02-DN, B03-DN, B09-DN), Period, Regime (TT 99 / TT 133)
3. System generates report from ledger and account balances:
   - B01-DN: Map account balances to statement line items per TT 99 template
   - B02-DN: Map revenue/expense accounts from period activity
   - B03-DN: Compute from balance sheet changes + cash transactions
   - B09-DN: Compile notes from system configuration and period data
4. User can preview, print, export to PDF/Excel/XML-for-tax
5. System logs report generation to audit trail

**Alternative Flows:**
- AF-01: Period not closed → warning "Period not closed. Statements are provisional."
- AF-02: Missing configuration → error "Company settings incomplete: fiscal year start, tax method"
- AF-03: TT 133 regime → use simplified BCTC templates per TT 133

---

## UC-G07: Period-End Closing

**Actor:** Chief Accountant (Kế toán trưởng)
**Precondition:** All entries for period posted, no unposted drafts

**Main Flow:**
1. User navigates to Period > Close
2. System displays closing checklist:
   - [ ] Verify all sub-ledgers posted to GL
   - [ ] Run depreciation for period
   - [ ] Run prepayment amortization
   - [ ] Post accrued entries
   - [ ] Run FX revaluation
   - [ ] Verify trial balance (debit = credit)
   - [ ] Verify BCTC
3. User checks off each step (or system auto-verifies)
4. User clicks "Close Period"
5. System locks period: status → Closed
6. System carries forward balances to next period
7. System logs closure with user, timestamp
8. System opens next period if exists

**Alternative Flows:**
- AF-01: Trial balance not equal → block with detail "Total debit ≠ Total credit (diff: X)"
- AF-02: Unposted drafts exist → warning "X draft entries not posted"
- AF-03: Year-end closing → system calculates retained earnings (TK 911, 421)

---

## UC-G08: Manage Recurring Entries

**Actor:** Accountant
**Precondition:** COA populated, at least one template needed

**Main Flow:**
1. User navigates to Journal Entry > Recurring Templates
2. User creates template with: Name, Frequency (monthly/quarterly/yearly), Lines (account, debit/credit formula)
3. System calculates next run date from frequency
4. On schedule, system generates journal entry from template
5. User reviews generated entry, posts or modifies

**Alternative Flows:**
- AF-01: On-demand run → user runs template manually for current period
- AF-02: Account deactivated → system flags template as needing update

---

## UC-G09: Multi-Currency Journal Entry

**Actor:** Accountant
**Precondition:** Company enables multi-currency, exchange rate configured

**Main Flow:**
1. User creates journal entry with foreign currency line
2. User selects currency, enters foreign amount + exchange rate
3. System calculates VND equivalent
4. On posting, system records: original currency, original amount, exchange rate, VND amount
5. At period end: system calculates unrealized FX gain/loss
6. System posts FX adjustment entry automatically

---

## UC-G10: Budget vs Actual Analysis

**Actor:** Chief Accountant, Manager
**Precondition:** Budget entered for period

**Main Flow:**
1. User navigates to Reports > Budget vs Actual
2. User selects: Period, Department/Cost Center (optional)
3. System displays: Account, Budget Amount, Actual Amount, Variance, Variance %
4. User can drill down to transaction detail
5. User can export to Excel/PDF
