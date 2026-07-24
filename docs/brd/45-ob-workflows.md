# Workflows — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## WF-OB-01: Company Onboarding — New Company Setup

```
[Company created]
      │
      ▼
[Seed standard COA (TT99 / TT133)]
      │
      ▼
[Open first fiscal period]
      │
      ▼
┌──────────────────────────────────────────────┐
│         OPENING BALANCE ENTRY                 │
│                                              │
│   ┌─────────────────┐  ┌──────────────────┐  │
│   │ Manual Entry    │  │ Excel Import      │  │
│   │ (UC-OB-01)      │  │ (UC-OB-02)        │  │
│   └────────┬────────┘  └────────┬─────────┘  │
│            │                    │             │
│            ▼                    ▼             │
│   ┌──────────────────────────────────────┐   │
│   │ Sub-Ledger Detail Entry              │   │
│   │ Bank | AR | AP | Inv | FA | CCDC    │   │
│   │ (UC-OB-03)                          │   │
│   └──────────────────┬───────────────────┘   │
│                      │                        │
│                      ▼                        │
│   ┌──────────────────────────────────────┐   │
│   │ ✓ Balance Check                      │   │
│   │ Tổng Dư Nợ = Tổng Dư Có  ?          │   │
│   │ (BR-OB-001)                          │   │
│   └──────────┬───────────┬───────────────┘   │
│         YES  │           │  NO               │
│              ▼           ▼                   │
│   ┌──────────────┐  ┌────────────┐           │
│   │ Save Batch   │  │ Show Error │           │
│   │ OB-2026-0001 │  │ Fix & Retry│           │
│   └──────┬───────┘  └────────────┘           │
│          │                                    │
│          ▼                                    │
│   ┌──────────────┐                            │
│   │ Approval     │ (if required)              │
│   │ Chief Acct   │                            │
│   │ reviews &    │                            │
│   │ signs        │                            │
│   └──────┬───────┘                            │
└──────────┼────────────────────────────────────┘
           │
           ▼
[First journal entry posted in period]
           │
           ▼
[Opening balance AUTO-LOCKED]
           │
           ▼
[Ready for normal accounting operations]
```

---

## WF-OB-02: Fiscal Year Rollover

```
[Year-end closing in progress]
      │
      ▼
[Close period 12/2026]
      │
      ▼
[Auto carry-forward balances]
   ┌─────────────────────────┐
   │ carryForwardBalances()  │
   │ Period 12 → Period 1    │
   │ Close → Open            │
   └─────────────┬───────────┘
                 │
                 ▼
[Create new fiscal year period(s)]
      │
      ▼
[Opening balances auto-populated in new period]
      │
      ▼
[Accountant reviews opening balances]
      │
      ▼
[Adjustments if needed (journal entry in new period)]
      │
      ▼
[Start new year accounting]
```

---

## WF-OB-03: TT200 → TT99 Regime Conversion

```
[Company migrating from TT200 to TT99 for 2026]
      │
      ▼
[Backup database (REQUIRED per BR-OB-008)]
      │
      ▼
[Load default conversion mapping]
      │
      ▼
[Review & adjust mapping]
   ┌─────────────────────────────────────────┐
   │ Direct:  111→111, 112→112, ...          │
   │ Split:   2281→22811 + 22812             │
   │ Merge:   441+466→4118                   │
   │ Manual:  User specifies target          │
   └──────────────────┬──────────────────────┘
                      │
                      ▼
[Run conversion simulation]
      │
      ▼
[Validate: Tổng TS cũ = Tổng TS mới]
   ┌───── YES ───┐     │     ┌── NO ───┐
   │             │     │     │         │
   ▼             │     │     ▼         │
[Confirm]        │     │  [Adjust]     │
   │             │     │   mapping     │
   ▼             │     │   & retry     │
[Execute         │     └───────────────┘
 conversion]
   │
   ▼
[Generate conversion audit report]
   │
   ▼
[New opening balance batch created]
   │
   ▼
[Accountant verifies, adjusts if needed]
   │
   ▼
[Approve & lock]
```

---

## WF-OB-04: Opening Balance Adjustment After Lock

```
[Chief Accountant identifies OB error after lock]
      │
      ▼
[Unlock opening balance (with reason)]
      │
      ▼
[System records audit: unlock reason]
      │
      ▼
[Make adjustment]
   ┌─────────────────────────────┐
   │ Option A: Direct edit       │
   │  (if no transactions yet)   │
   │                             │
   │ Option B: Correction JE     │
   │  (if transactions exist)    │
   └──────────────┬──────────────┘
                  │
                  ▼
[Re-lock opening balance]
      │
      ▼
[System records audit: re-lock]
```

---

## WF-OB-05: Audit Inspection

```
[Regulator / Auditor requests OB evidence]
      │
      ▼
[Chief Accountant opens OB audit trail]
      │
      ▼
[Filter by: period, account, date range]
      │
      ▼
[Export report + audit log]
      │
      ▼
[System generates PDF package:
  - Opening balance detail by account
  - Batch history with approval
  - Audit log with timestamps
  - Conversion report (if applicable)
  - Prior period closing balance comparison]
```
