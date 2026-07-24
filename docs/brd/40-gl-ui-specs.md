# GL Module — UI Specifications

**Version:** 2.0
**Date:** 2026-07-24

**Note:** UI-G01 through UI-G04 are ✅ BUILT. UI-G05 is ✅ partially built (B01/B02 only). UI-G06 is ❌ planned.

---

## UI-G01: Journal Entry List ✅ Built

**Implementation:** `client/src/pages/JournalEntryListPage.tsx`
**Route:** `/journal-entries`

```
┌─────────────────────────────────────────────────────────────────────┐
│  [←] Journal Entries                               [+ New Entry]   │
├─────────────────────────────────────────────────────────────────────┤
│  Filter: [Period: ▼ Jul 2026] [Type: ▼ All] [Status: ▼ All]       │
│  Search: [________________________________]  [Search]              │
├──────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────┤
│  #   │ Date     │ Entry #  │ Descr.   │ Total    │ Status   │       │
│      │          │          │          │          │          │       │
├──────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────┤
│  1   │ 01/07/26 │ 202607   │ Thu tiền │ 10,000,00│ ✅ Posted│ [▼]  │
│      │          │ -00001   │ bán hàng │          │          │       │
│  2   │ 05/07/26 │ 202607   │ Chi tạm  │  2,000,00│ ✅ Posted│ [▼]  │
│  3   │ 15/07/26 │ 202607   │ Khấu hao │ 23,000,00│ ✅ Posted│ [▼]  │
│  4   │ 20/07/26 │ DRAFT    │ Điều     │  5,000,00│ ⬜ Draft │ [▼]  │
│      │          │          │ chỉnh    │          │          │       │
│  5   │ 25/07/26 │ 202607   │ Đảo ngược│  2,000,00│ 🔄 Rev'd│ [▼]  │
│      │          │ -00005   │ #00002   │          │          │       │
├──────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────┤
│  [< Prev]  Page 1 of 3  [Next >]                                    │
└─────────────────────────────────────────────────────────────────────┘

[▼] context menu: View / Edit (draft only) / Post (draft only) / Reverse (posted only) / Delete (draft only)
```

---

## UI-G02: Journal Entry Detail / Edit ✅ Built

**Implementation:** `client/src/pages/JournalEntryFormPage.tsx`
**Route:** `/journal-entries/new` | `/journal-entries/:id/edit`

```
┌──────────────────────────────────────────────────────────────────────┐
│  [←] Journal Entry: 202607-00001                     [Posted] [✅]  │
├──────────────────────────────────────────────────────────────────────┤
│  Entry #:  202607-00001                                              │
│  Date:     01/07/2026                                                │
│  Period:   July 2026                                                 │
│  Type:     Thu tiền (Cash Receipt)                                   │
│  Ref #:    HD001234                                                   │
│  Descr.:   Thu tiền bán hàng theo HĐ 001234                          │
│                                                                      │
│  ┌── Lines ─────────────────────────────────────────────────────┐    │
│  │ # │ Account    │ Name            │ Debit      │ Credit      │    │
│  │───┼────────────┼─────────────────┼────────────┼─────────────┤    │
│  │ 1 │ 111        │ Tiền mặt       │ 10,000,000 │             │    │
│  │ 2 │ 5111       │ DTBH hàng hóa  │            │ 10,000,000  │    │
│  │   │            │                 │            │             │    │
│  │   │ Total:     │                 │ 10,000,000 │ 10,000,000  │    │
│  │   │            │                 │  ✅        │  ✅          │    │
│  └───┴────────────┴─────────────────┴────────────┴─────────────┘    │
│                                                                      │
│  Created by: Nguyễn Văn A on 01/07/2026 08:30                       │
│  Posted by:  Nguyễn Văn A on 01/07/2026 08:31                       │
│                                                                      │
│  [Post]  [Reverse]  [Print]  [Export PDF]                           │
└──────────────────────────────────────────────────────────────────────┘
```

**Enhancements planned:**
- Add Audit Trail view button (Phase 5)
- Add multi-currency line support (Phase 2)
- Add cost center/department/project fields per line (Phase 2)

---

## UI-G03: General Ledger View (Sổ Cái) ✅ Built

**Implementation:** `client/src/pages/LedgerPage.tsx`
**Route:** `/reports/general-ledger`

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [←] Reports > General Ledger                                            │
├──────────────────────────────────────────────────────────────────────────┤
│  Account: [☰] 111 — Tiền mặt                                            │
│  Period:  [▼] July 2026                                                 │
│                                                                          │
│  Account: 111 - Tiền mặt          Nature: Dư Nợ                         │
│──────────────────────────────────────────────────────────────────────────│
│  Opening Balance:                         Debit: 50,000,000             │
│──────────────────────────────────────────────────────────────────────────│
│  Date     │ Entry #    │ Descr.         │ Debit     │ Credit    │ Balance│
│──────────┼────────────┼────────────────┼───────────┼───────────┼────────┤
│ 01/07/26 │ 202607-001 │ Opening        │           │           │ 50,000 │
│ 01/07/26 │ 202607-001 │ Thu tiền BH    │ 10,000,00 │           │ 60,000 │
│ 05/07/26 │ 202607-002 │ Chi tạm ứng    │           │  2,000,00 │ 58,000 │
│ 15/07/26 │ 202607-003 │ Nộp tiền NH    │           │ 20,000,00 │ 38,000 │
│ 25/07/26 │ 202607-005 │ Đảo ngược #002 │           │  2,000,00 │ 36,000 │
├──────────┼────────────┼────────────────┼───────────┼───────────┼────────┤
│          │            │ Period Total   │ 10,000,00 │ 24,000,00 │        │
│          │            │ Closing Balance│           │           │ 36,000 │
├──────────┴────────────┴────────────────┴───────────┴───────────┴────────┤
│  [Export PDF] [Export Excel] [Print]                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Enhancements planned:**
- Add export (Phase 1.4)
- Add multi-period comparison
- Add department/cost center filter (Phase 2)
- Add drill-down to source journal entry

---

## UI-G04: Trial Balance ✅ Built

**Implementation:** `client/src/pages/TrialBalancePage.tsx`
**Route:** `/reports/trial-balance`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [←] Reports > Trial Balance                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  Period: [▼] July 2026        Category: [▼] All                             │
├────────┬─────────────────────┬──────────────────┬──────────────────┬─────────┤
│ Acc #  │ Name                │ Opening          │ Period           │Closing  │
│        │                     ├────────┬─────────┼────────┬─────────┼────────┤
│        │                     │ Debit  │ Credit  │ Debit  │ Credit  │ Balance│
├────────┼─────────────────────┼────────┼─────────┼────────┼─────────┼────────┤
│ 111    │ Tiền mặt            │ 50,000 │        │ 10,000 │ 24,000  │ 36,000 │
│ 112    │ Tiền gửi NH         │200,000 │        │ 50,000 │ 10,000  │240,000 │
│ 131    │ Phải thu KH         │150,000 │        │ 30,000 │ 15,000  │165,000 │
│...     │                     │        │         │        │         │        │
├────────┼─────────────────────┼────────┼─────────┼────────┼─────────┼────────┤
│        │ TOTAL               │400,000 │ 420,000 │ 90,000 │ 70,000  │441,000 │
│        │                     │        │         │        │         │439,000 │
│        │                     │ Δ: -20K│         │ Δ:20K  │         │ Δ:2K  │
├────────┴─────────────────────┴────────┴─────────┴────────┴─────────┴────────┤
│  Status: ⚠️ Cumulative imbalance 2,000 VND. Investigate.                    │
│  [Refresh] [Export PDF] [Export Excel] [Drill Down]                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Enhancements planned:**
- Add category filter (asset/liability/equity/revenue/expense)
- Add drill-down to account ledger
- Add export (Phase 1.4)

---

## UI-G05: Financial Statement Viewer ✅ Partial (B01/B02 only)

**Implementation:** `client/src/pages/FinancialStatementPage.tsx`
**Route:** `/reports/financial-statements`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [←] Reports > Financial Statements                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Report Type : [▼] B01-DN — Báo cáo tình hình tài chính                   │
│  Period      : [▼] 2026 (Year)    Regime: [▼] TT 99                        │
│                                                                            │
│  [Generate]                                            [Export ▼] [Print] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    B01-DN — BÁO CÁO TÌNH HÌNH TÀI CHÍNH                     │
│                    Tại ngày 31 tháng 12 năm 2026                            │
│                    Công ty TNHH SME Accounting                              │
│                                                                            │
│  ┌──────────────────────────────────────────────┬──────────┬───────────┐   │
│  │ TÀI SẢN                                     │31/12/2026│31/12/2025 │   │
│  ├──────────────────────────────────────────────┼──────────┼───────────┤   │
│  │ 100. Tiền và tương đương tiền               │278,000   │250,000    │   │
│  │ 130. Hàng tồn kho                           │450,000   │400,000    │   │
│  │ 200. Tổng tài sản ngắn hạn                  │1,128,000 │1,025,000  │   │
│  │ 250. Tổng tài sản dài hạn                   │920,000   │920,000    │   │
│  │ 270. TỔNG TÀI SẢN                           │2,048,000 │1,945,000  │   │
│  └──────────────────────────────────────────────┴──────────┴───────────┘   │
│                                                                            │
│  B02-DN — BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH                            │
│  ┌──────────────────────────────────────────────┬──────────┬───────────┐   │
│  │ 01. Doanh thu bán hàng                      │500,000   │450,000    │   │
│  │ 11. Giá vốn hàng bán                        │(300,000) │(270,000)  │   │
│  │ 20. Lợi nhuận gộp                           │200,000   │180,000    │   │
│  │ 60. Lợi nhuận sau thuế                      │120,000   │108,000    │   │
│  └──────────────────────────────────────────────┴──────────┴───────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Missing (planned):**
- B03-DN (Cash Flow Statement) — Phase 1.1
- B09-DN (Notes to Financial Statements) — Phase 1.2
- PDF/Excel export — Phase 1.4
- TT 133 regime templates — Phase 5
- Multi-period comparison — Enhancement

---

## UI-G06: Period Close Dashboard ❌ Planned

**Implementation:** Planned for Phase 1.3

```
┌──────────────────────────────────────────────────────────────────────┐
│  [←] Period Close                              Period: Jul 2026    │
├──────────────────────────────────────────────────────────────────────┤
│  ┌── Checklist ─────────────────────────────────────────────────┐    │
│  │ ✅  1. Depreciation run                        by Admin 08:30│    │
│  │ ✅  2. Prepayment amortization                 by Admin 08:35│    │
│  │ ⬜  3. Accrued entries                         [Run Now]     │    │
│  │ ⬜  4. FX revaluation                          [Run Now]     │    │
│  │ ⬜  5. Trial balance verification               [Verify]     │    │
│  │ ⬜  6. Unposted drafts review (2 drafts)       [Review]     │    │
│  │ ⬜  7. Chief accountant approval               [Approve]    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌── Period Status ────────────────────────────────────────────┐    │
│  │  Entries: 125 posted, 2 drafts                               │    │
│  │  Total Debit: 1,250,000,000                                 │    │
│  │  Total Credit: 1,250,000,000                                │    │
│  │  Status: ✅ Balanced                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  [Close Period] (disabled until all steps complete)                │
└──────────────────────────────────────────────────────────────────────┘
```
