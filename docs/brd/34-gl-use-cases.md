# GL Module — Use Cases

**Version:** 2.0
**Date:** 2026-07-24
**Note:** UC-G01 through UC-G06 are ✅ IMPLEMENTED in current codebase. UC-G07 through UC-G10 are 📋 PLANNED.

---

## UC-G01: Create Journal Entry ✅

**Actor:** Accountant (Kế toán viên)
**Precondition:** User logged in, company selected, at least one fiscal period OPEN, COA populated
**Implementation:** `JournalEntryFormPage.tsx` + `AccountingService.createJournalEntry()`

**Main Flow:**
1. User navigates to Journal Entry > Create
2. System displays journal entry form with fields: Date, Entry Type, Description, Reference #
3. User selects date → system auto-determines fiscal period
4. User adds lines: Account, Debit, Credit, optional Description
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

---

## UC-G02: Post Journal Entry ✅

**Actor:** Accountant / Chief Accountant
**Precondition:** Journal entry exists in DRAFT status
**Implementation:** `JournalEntryFormPage.tsx` post button + `AccountingService.postJournalEntry()`

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

## UC-G03: Reverse Journal Entry ✅

**Actor:** Chief Accountant (Kế toán trưởng)
**Precondition:** Posted journal entry exists
**Implementation:** `AccountingService.reverseJournalEntry()`

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

---

## UC-G04: View General Ledger (Sổ Cái) ✅

**Actor:** Accountant, Chief Accountant, Manager
**Precondition:** Company selected, accounts exist
**Implementation:** `LedgerPage.tsx` + `AccountingService.getLedgerEntries()`

**Main Flow:**
1. User navigates to Reports > General Ledger
2. User selects: Account, Period (optional filter)
3. System displays ledger table:
   - Opening balance (debit/credit)
   - Each transaction: Date, Entry #, Description, Debit, Credit, Running Balance
   - Closing balance
4. User can filter by account, period

**Alternative Flows:**
- AF-01: All accounts → display multi-ledger view with account summary
- AF-02: Zero transactions → display only opening/closing balances

---

## UC-G05: View Trial Balance (Bảng Cân Đối Tài Khoản) ✅

**Actor:** Accountant, Chief Accountant
**Precondition:** Period selected
**Implementation:** `TrialBalancePage.tsx` + `AccountingService.getTrialBalance()`

**Main Flow:**
1. User navigates to Reports > Trial Balance
2. User selects period
3. System displays trial balance table:
   - Account Number, Account Name
   - Opening Debit, Opening Credit
   - Period Debit, Period Credit
   - Closing Debit, Closing Credit
4. System shows totals row with debit = credit verification

---

## UC-G06: Generate Financial Statements (BCTC) ✅ (Partial)

**Actor:** Chief Accountant
**Precondition:** Period selected, entries posted
**Implementation:** `FinancialStatementPage.tsx` + `FinancialStatementService`

**Main Flow:**
1. User navigates to Reports > Financial Statements
2. User selects: Report Type (B01-DN, B02-DN), Period
3. System generates report from ledger and account balances:
   - B01-DN: Map account balances to statement line items per TT 99 (✅ built)
   - B02-DN: Map revenue/expense accounts from period activity (✅ built)
4. User can preview

**Missing:**
- B03-DN (Cash Flow Statement) — not implemented
- B09-DN (Notes to Financial Statements) — not implemented
- Export (PDF/Excel) — not implemented
- TT 133 regime — not implemented

**Alternative Flows:**
- AF-01: Period not closed → warning "Period not closed. Statements are provisional."

---

## UC-G07: Period-End Closing 📋 Planned

**Actor:** Chief Accountant (Kế toán trưởng)
**Precondition:** All entries for period posted, no unposted drafts

**Main Flow:**
1. User navigates to Period > Close
2. System displays closing checklist with verification steps
3. User checks off each step (or system auto-verifies)
4. User clicks "Close Period"
5. System locks period: status → Closed
6. System carries forward balances to next period
7. System logs closure with user, timestamp
8. System opens next period if exists

**Note:** `closeFiscalPeriod()` and `carryForwardBalances()` exist in backend. Missing: close checklist UI, balance verification UI, rollback.

---

## UC-G08: Manage Recurring Entries 📋 Planned

**Actor:** Accountant
**Precondition:** COA populated, at least one template needed

**Main Flow:**
1. User navigates to Journal Entry > Recurring Templates
2. User creates template with: Name, Frequency (monthly/quarterly/yearly), Lines (account, debit/credit formula)
3. System calculates next run date from frequency
4. On schedule, system generates journal entry from template
5. User reviews generated entry, posts or modifies

---

## UC-G09: Multi-Currency Journal Entry 📋 Planned

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

## UC-G10: Budget vs Actual Analysis 📋 Planned

**Actor:** Chief Accountant, Manager
**Precondition:** Budget entered for period

**Main Flow:**
1. User navigates to Reports > Budget vs Actual
2. User selects: Period, Department/Cost Center (optional)
3. System displays: Account, Budget Amount, Actual Amount, Variance, Variance %
4. User can drill down to transaction detail
5. User can export to Excel/PDF
