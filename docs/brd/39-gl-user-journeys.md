# GL Module — User Journeys

**Version:** 1.0
**Date:** 2026-07-23

---

## Journey UJ-G01: Accountant Monthly Close

**Persona:** Trần Thị B — Accountant (3 yrs exp), manages books for 2 SMEs

**Scenario:** Monthly close for July 2026

1. **Day 1:** Logs into SmeAccounting → company dashboard
2. **Day 2:** Posts cash receipts from Quỹ module (auto-posted to GL) — verifies in GL report
3. **Day 3:** Posts bank transactions (auto-reconciled from bank statement)
4. **Day 5:** Posts sales invoices from Bán hàng module → verifies AR aging matches GL
5. **Day 7:** Runs "Recurring Entries" — executes Khấu hao TSCĐ template → auto-creates depreciation JE
6. **Day 8:** Runs "Prepayment Amortization" template
7. **Day 10:** Reviews Trial Balance — notices TK 642 seems high → drills down to ledger
8. **Day 10:** Finds double-posted rent expense → creates reversal entry → re-posts correct amount
9. **Day 12:** Checks for unposted drafts (0 found) — all posted
10. **Day 12:** Runs Trial Balance again — debit = credit ✅
11. **Day 15:** Chief Accountant reviews and approves close
12. **Day 15:** Clicks "Close Period" — system runs verification, locks period
13. **Day 16:** Exports GL report to Excel for auditor request

**Pain Points Addressed:**
- Auto-posting from sub-ledgers saves 3 days/month manual entry
- Recurring entry templates eliminate repetitive posting
- Drill-down from trial balance to ledger speeds error detection
- Period-end checklist prevents forgotten steps

---

## Journey UJ-G02: Chief Accountant Year-End Close

**Persona:** Lê Văn C — Chief Accountant (15 yrs exp), CPA, manages 5 companies

**Scenario:** Year-end close for 2026

1. **Week 1 (Jan):** Reviews Dec period close status — 11/12 months closed
2. **Week 1:** Verifies all adjustments posted:
   - Full-year depreciation reconciled
   - Inventory count adjustments entered
   - Bad debt provision calculated and posted
3. **Week 2:** Runs year-end tax calculations:
   - CIT provisional (4 quarters) vs actual full year
   - VAT reconciliation (output TK 3331 vs input TK 133)
4. **Week 2:** Executes revenue/expense close:
   - Revenue accounts (TK 511, 515, 711) → closed to TK 911
   - Expense accounts (TK 632, 635, 641, 642, 811, 821) → closed to TK 911
   - Net profit/loss → transferred to TK 421 (retained earnings)
5. **Week 2:** Generates annual BCTC:
   - B01-DN, B02-DN, B03-DN, B09-DN
   - Reviews each report against ledger
6. **Week 3:** Exports auditor package:
   - GL by account (full year)
   - Trial balance (monthly)
   - Account balance confirmations
   - Sub-ledger aging reports
7. **Week 3:** Locks fiscal year 2026 — opens January 2027 periods with opening balances
8. **Week 4:** Submits BCTC to tax authority via eTax (dichvucong.gdt.gov.vn)

**Pain Points Addressed:**
- TK 911 auto-close eliminates manual calculation errors
- BCTC templates follow TT 99 format — no manual formatting
- Auditor export package saves hours of report compilation
- Opening balance auto-carry-forward ensures continuity

---

## Journey UJ-G03: Accountant Multi-Currency Correction

**Persona:** Phạm Thị D — Senior Accountant (8 yrs), import-export company

**Scenario:** Correcting FX entry after supplier payment

1. **Jan 15:** Records purchase invoice from Chinese supplier:
   - Dr 156 (Hàng hóa): USD 10,000 × 25,500 = 255,000,000
   - Cr 331 (PT NB): USD 10,000 × 25,500 = 255,000,000
2. **Feb 20:** Makes payment:
   - Dr 331 (PT NB): USD 10,000 × 25,800 = 258,000,000
   - Cr 112 (TGNH): USD 10,000 × 25,800 = 258,000,000
   - Dr 635 (CP TC): 3,000,000 (realized FX loss)
3. **Mar 31:** Runs period-end FX revaluation:
   - Scans all foreign currency monetary accounts
   - Only USD bank balance remaining: USD 5,000
   - Current rate: 25,700
   - Original rate: 25,500 (last transaction)
   - Unrealized loss: (25,700 - 25,500) × 5,000 = 1,000,000
   - Auto-posts: Dr 635 (1,000,000) / Cr 413 (1,000,000)
4. Reviews FX report → exports to Excel for manager

**Pain Points Addressed:**
- Each journal line tracks original currency/amount/rate separately
- Period-end FX revaluation is automated with configurable rate source
- FX gain/loss automatically split between realized/unrealized

---

## Journey UJ-G04: Manager Budget Monitoring

**Persona:** Hoàng Văn E — Finance Manager (10 yrs), oversees department budgets

**Scenario:** Q3 budget review

1. Opens Budget vs Actual report for Q3 2026
2. Filters by Department: Phòng Kế toán
3. Sees TK 642 (Chi phí QLDN) budget: 150,000,000 — actual: 165,000,000
4. Variance: (15,000,000) — 10% over budget
5. Drills down to transaction level — identifies: unexpected legal fee 18,000,000
6. Notes: "Legal fee for new contract — approved separately"
7. Exports report to PDF for board meeting
8. Adjusts Q4 budget: reallocates from TK 641 to TK 642

**Pain Points Addressed:**
- Budget vs Actual with drill-down to source documents
- Department/cost center filtering for responsibility accounting
- Soft warning on over-budget (configurable to hard block)
- Export-ready reports for management presentation

---

## Journey UJ-G05: Auditor GL Review

**Persona:** Nguyễn Văn F — External Auditor (5 yrs), audit firm

**Scenario:** Auditing client BCTC for 2026

1. Client provides access to SmeAccounting GL module
2. Exports full General Ledger by account for fiscal year 2026
3. Verifies:
   - Opening balances match prior year signed BCTC
   - No gaps in journal entry numbering
   - No entries posted to closed periods
   - All posted entries have audit trail (who, when, what)
4. Tests samples:
   - Selects 10 high-value journal entries
   - Verifies supporting documents exist (via source reference #)
   - Confirms approval workflow followed
5. Reviews year-end close:
   - TK 911 closing entries complete
   - Revenue/expense accounts zero balance at year-end
   - Retained earnings (TK 421) matches B02-DN net profit
6. Confirms: GL integrity PASS — audit opinion UNMODIFIED

**Pain Points Addressed:**
- Immutable posted entries (no modification after posting)
- Complete audit trail per action
- Sequential entry numbering prevents gaps/fraud
- Balance carry-forward verified between periods
- Clean data export for audit software import
