# GL Module — User Journeys

**Version:** 2.0
**Date:** 2026-07-24

**Note:** All journeys are aspirational target workflows. Current system supports Journeys 1-2 core steps. Journeys 3-5 require Phase 2-5 features.

---

## Journey UJ-G01: Accountant Monthly Close

**Persona:** Trần Thị B — Accountant (3 yrs exp), manages books for 2 SMEs
**Current support:** ⚠️ Partial (steps 4, 5, 7, 8, 10, 12 work)

**Scenario:** Monthly close for July 2026

1. **Day 1:** Logs into SmeAccounting → company dashboard
2. **Day 2:** Posts cash receipts from Quỹ module (auto-posted to GL) — verifies in GL report
   - ❌ Quỹ module not built — must enter JE manually
3. **Day 3:** Posts bank transactions (auto-reconciled from bank statement)
   - ❌ Bank module not built — must enter JE manually
4. **Day 5:** Posts sales invoices from Bán hàng module → verifies AR aging matches GL
   - ✅ Can enter JE directly via JournalEntryFormPage
5. **Day 7:** Runs "Recurring Entries" — executes Khấu hao TSCĐ template → auto-creates depreciation JE
   - ❌ No recurring entry templates
   - ✅ Can enter depreciation JE manually
6. **Day 8:** Runs "Prepayment Amortization" template
   - ❌ Not built
7. **Day 10:** Reviews Trial Balance — notices TK 642 seems high → drills down to ledger
   - ✅ TrialBalancePage + LedgerPage work
8. **Day 10:** Finds double-posted rent expense → creates reversal entry → re-posts correct amount
   - ✅ ReverseJournalEntry() works
9. **Day 12:** Checks for unposted drafts (0 found) — all posted
   - ✅ JournalEntryListPage shows draft/posted status
10. **Day 12:** Runs Trial Balance again — debit = credit ✅
    - ✅ Trial balance verification works
11. **Day 15:** Chief Accountant reviews and approves close
    - ⚠️ No formal approval workflow
12. **Day 15:** Clicks "Close Period" — system runs verification, locks period
    - ✅ Backend close works; no close UI
13. **Day 16:** Exports GL report to Excel for auditor request
    - ❌ No export (planned Phase 1.4)

**Pain Points Addressed (current system vs manual bookkeeping):**
- ✅ Electronic journal entry vs paper sổ sách
- ✅ Real-time trial balance vs end-of-period manual aggregation
- ✅ Running balance ledger vs manual calculation
- ✅ Reversal entries with audit trail vs correction fluid on paper
- ❌ No auto-posting from sub-ledgers (still manual data entry)
- ❌ No recurring templates (repetitive entries manual)

---

## Journey UJ-G02: Chief Accountant Year-End Close

**Persona:** Lê Văn C — Chief Accountant (15 yrs exp), CPA, manages 5 companies
**Current support:** ⚠️ Partial (steps 1, 4, 5 work)

**Scenario:** Year-end close for 2026

1. **Week 1 (Jan):** Reviews Dec period close status — 11/12 months closed
   - ❌ No close status dashboard
2. **Week 1:** Verifies all adjustments posted
   - ✅ Entries visible
3. **Week 2:** Runs year-end tax calculations
   - ❌ Not built
4. **Week 2:** Executes revenue/expense close (TK 911)
   - ✅ Built in PeriodCloseService
5. **Week 2:** Generates annual BCTC
   - ✅ B01-DN, B02-DN built
   - ❌ B03-DN, B09-DN missing
6. **Week 3:** Exports auditor package
   - ❌ No export
7. **Week 3:** Locks fiscal year — opens January 2027 with opening balances
   - ✅ Backend exists
8. **Week 4:** Submits BCTC to tax authority via eTax
   - ❌ No eTax integration

---

## Journey UJ-G03: Accountant Multi-Currency Correction

**Persona:** Phạm Thị D — Senior Accountant (8 yrs), import-export company
**Current support:** ❌ Not supported (requires multi-currency Phase 2)

---

## Journey UJ-G04: Manager Budget Monitoring

**Persona:** Hoàng Văn E — Finance Manager (10 yrs), oversees department budgets
**Current support:** ❌ Not supported (requires budget Phase 4)

---

## Journey UJ-G05: Auditor GL Review

**Persona:** Nguyễn Văn F — External Auditor (5 yrs), audit firm
**Current support:** ⚠️ Partial (steps 2-4 possible via direct DB access)

**Scenario:** Auditing client BCTC for 2026

1. Client provides access to SmeAccounting GL module
2. Exports full General Ledger by account for fiscal year 2026
   - ❌ No export — can view on-screen
3. Verifies opening balances, entry numbering, period integrity
   - ✅ Data is available but requires DB query
4. Tests samples — high-value JE, supporting documents
   - ✅ Data integrity rules enforced
5. Reviews year-end close — TK 911, revenue/expense zero balance
   - ✅ TK 911 close built
6. Confirms GL integrity
   - ✅ Core integrity rules enforced
   - ❌ No auditor-specific export or reports
