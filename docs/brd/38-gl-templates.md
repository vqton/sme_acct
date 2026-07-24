# GL Module — Templates

**Version:** 2.0
**Date:** 2026-07-24

**Note:** All templates reflect target design. Actual UI screens may differ in layout. Core functionality matches.

---

## Template T-G01: Journal Entry Form ✅ Built

**Implementation:** `JournalEntryFormPage.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  JOURNAL ENTRY                                   [NEW]     │
├─────────────────────────────────────────────────────────────┤
│  Entry #: 202607-00001        (auto)                        │
│  Date:    [____/____/____]    (required)                    │
│  Period:  July 2026           (auto from date)              │
│                                                             │
│  Type:    [▼] ▸ Payment  Receipt  Sale  Purchase            │
│                  Depreciation  Allocation  Other             │
│                                                             │
│  Ref #:   [________________]   (optional)                    │
│  Description: [______________________________]              │
│                                                             │
│  ┌── Lines ────────────────────────────────────────────┐    │
│  │ # │ Account │ Name          │ Debit     │ Credit    │    │
│  │───┼─────────┼───────────────┼───────────┼───────────┤    │
│  │ 1 │ [☰]111  │ Tiền mặt     │ 10,000,000│           │    │
│  │ 2 │ [☰]511  │ Doanh thu BH │           │ 10,000,000│    │
│  │   │ [Add line]                                      │    │
│  │   │ Total:                 │ 10,000,000│ 10,000,000│    │
│  └───┴────────────────────────┴───────────┴───────────┘    │
│                                                             │
│  [Cancel]           [Save Draft]           [Save & Post]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Template T-G02: General Ledger (Sổ Cái) ✅ Built

**Implementation:** `LedgerPage.tsx`

```
┌──────────────────────────────────────────────────────────────────────┐
│  GENERAL LEDGER                          Account: 111 - Tiền mặt   │
│                                          Period: July 2026          │
├──────┬────────┬───────────┬──────────┬──────────┬───────────────────┤
│ Date│ Entry #│ Descr.    │ Debit    │ Credit   │ Running Balance   │
├──────┼────────┼───────────┼──────────┼──────────┼───────────────────┤
│      │        │ Op.Balance│          │          │ 50,000  (Dư Nợ)  │
│ 01/07│202607-1│ Thu tiền  │ 10,000   │          │ 60,000  (Dư Nợ)  │
│ 05/07│202607-2│ Chi tạm   │          │  2,000   │ 58,000  (Dư Nợ)  │
│ 15/07│202607-3│ Nộp NH    │          │ 20,000   │ 38,000  (Dư Nợ)  │
├──────┼────────┼───────────┼──────────┼──────────┼───────────────────┤
│      │        │ Period    │  10,000  │ 22,000   │ 38,000  (Closing)│
└──────┴────────┴───────────┴──────────┴──────────┴───────────────────┘
```

---

## Template T-G03: Trial Balance ✅ Built

**Implementation:** `TrialBalancePage.tsx`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TRIAL BALANCE                                      Period: July 2026        │
├────────┬──────────────────────┬──────────────────┬──────────────────┬────────┤
│ Acc #  │ Name                 │ Opening          │ Period           │Closing │
│        │                      ├────────┬─────────┼────────┬─────────┼────────┤
│        │                      │ Debit  │ Credit  │ Debit  │ Credit  │Debit   │
├────────┼──────────────────────┼────────┼─────────┼────────┼─────────┼────────┤
│ 111    │ Tiền mặt             │  50,000│         │  10,000│  22,000 │  38,000│
│ 112    │ Tiền gửi NH          │ 200,000│         │  50,000│  10,000 │ 240,000│
│ 131    │ Phải thu KH          │ 150,000│         │  30,000│  15,000 │ 165,000│
│ 331    │ Phải trả NB          │        │ 120,000 │  10,000│  25,000 │        │135,000
│ 511    │ Doanh thu BH         │        │ 300,000 │         │  10,000 │        │310,000
├────────┼──────────────────────┼────────┼─────────┼────────┼─────────┼────────┤
│        │ TOTAL                │ 400,000│ 420,000 │ 100,000│  82,000 │ 443,000│445,000
└────────┴──────────────────────┴────────┴─────────┴────────┴─────────┴────────┘
```

---

## Template T-G04: Financial Statement (B01-DN) ✅ Built

**Implementation:** `FinancialStatementPage.tsx` → `FinancialStatementService`

```
┌─────────────────────────────────────────────────────────────────────┐
│  B01-DN — BÁO CÁO TÌNH HÌNH TÀI CHÍNH                               │
│  Tại ngày 31 tháng 12 năm 2026                                       │
├──────────────────────────────────────────────┬──────────┬───────────┤
│  TÀI SẢN                                     │31/12/2026│01/01/2026 │
├──────────────────────────────────────────────┼──────────┼───────────┤
│  100. Tiền và tương đương tiền               │   278,000│    250,000│
│  130. Hàng tồn kho                           │   450,000│    400,000│
│  200. Tổng tài sản ngắn hạn                  │ 1,128,000│  1,025,000│
│  250. Tổng tài sản dài hạn                   │   920,000│    920,000│
│  270. TỔNG TÀI SẢN                           │ 2,048,000│  1,945,000│
├──────────────────────────────────────────────┼──────────┼───────────┤
│  NGUỒN VỐN                                    │          │           │
├──────────────────────────────────────────────┼──────────┼───────────┤
│  330. Tổng nợ phải trả                       │   920,000│    900,000│
│  400. Vốn chủ sở hữu                         │ 1,128,000│  1,045,000│
│  440. TỔNG NGUỒN VỐN                        │ 2,048,000│  1,945,000│
└──────────────────────────────────────────────┴──────────┴───────────┘
```

---

## Template T-G05: Period Closing Checklist ❌ Not Built

**Implementation:** Planned for Phase 1.3. Backend close logic exists.

```
┌─────────────────────────────────────────────────────────────┐
│  PERIOD CLOSING CHECKLIST                                    │
│  Period: July 2026                  Status: IN PROGRESS     │
├──────┬────────────────────────────┬──────────┬──────────────┤
│ Step │ Task                      │ Status   │ Completed By │
├──────┼────────────────────────────┼──────────┼──────────────┤
│  1   │ Depreciation run           │ ✅ Done  │ Kế toán      │
│  2   │ Prepayment amortization    │ ✅ Done  │ Kế toán      │
│  3   │ Accrued entries posted     │ ⬜ Pending│              │
│  4   │ FX revaluation             │ ⬜ Pending│              │
│  5   │ Trial balance verification │ ⬜ Pending│              │
│  6   │ Unposted drafts reviewed   │ ⬜ Pending│              │
│  7   │ Sub-ledger reconciliation  │ ⬜ Pending│              │
│  8   │ Chief accountant approval  │ ⬜ Pending│              │
│  9   │ Close period               │ ⬜ Pending│              │
├──────┴────────────────────────────┴──────────┴──────────────┤
│  [Run Auto Steps]            [Verify & Close]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Template T-G06: Recurring Entry Template ❌ Not Built

**Implementation:** Planned for Phase 4.

```
┌─────────────────────────────────────────────────────────────┐
│  RECURRING ENTRY TEMPLATE                                    │
├─────────────────────────────────────────────────────────────┤
│  Template Name: Khấu hao TSCĐ tháng                         │
│  Frequency:    [▼] Monthly Quarterly Yearly On-demand       │
│  Next Run:     01/08/2026                                   │
│  Active:       [x] Yes                                       │
│                                                             │
│  ┌── Lines ────────────────────────────────────────────┐    │
│  │ # │ Account │ Debit Formula    │ Credit Formula     │    │
│  │───┼─────────┼──────────────────┼────────────────────┤    │
│  │ 1 │ 627     │ fixed:15000000   │                    │    │
│  │ 2 │ 641     │ fixed:5000000    │                    │    │
│  │ 3 │ 642     │ fixed:3000000    │                    │    │
│  │ 4 │ 2141    │                  │ sum:1,2,3         │    │
│  └───┴─────────┴──────────────────┴────────────────────┘    │
│                                                             │
│  [Save] [Run Now] [Delete]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Template T-G07: Budget Entry Form ❌ Not Built

**Implementation:** Planned for Phase 4.

```
┌─────────────────────────────────────────────────────────────┐
│  BUDGET ENTRY                               Period: 2026   │
├─────────────────────────────────────────────────────────────┤
│  Account:     [☰] 642 ─ Chi phí quản lý doanh nghiệp       │
│  Department:  [▼] Phòng Kế toán                            │
│                                                             │
│  ┌── Monthly Budget ───────────────────────────────────┐    │
│  │ Month    │ Budget Amount  │ Actual   │ Variance    │    │
│  │──────────┼────────────────┼──────────┼─────────────┤    │
│  │ January  │ 50,000,000     │ 48,000,00│ 2,000,000   │    │
│  │ February │ 50,000,000     │ 52,000,00│ (2,000,000) │    │
│  │ ...      │                │          │             │    │
│  └──────────┴────────────────┴──────────┴─────────────┘    │
│                                                             │
│  [Save Budget] [Import from Excel] [Clear]                 │
└─────────────────────────────────────────────────────────────┘
```
