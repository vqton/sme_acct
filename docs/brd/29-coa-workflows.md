# COA Module — Workflows

**Version:** 1.0
**Date:** 2026-07-23

---

## WF-01: Company Setup — COA Initialization

```
┌──────────────────────────────────────────────────────────────────┐
│                     COMPANY SETUP                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Admin creates company                                            │
│       │                                                          │
│       ▼                                                          │
│  Select: company info, fiscal year start, currency               │
│       │                                                          │
│       ▼                                                          │
│  Select accounting regime:                                        │
│    ┌────────────────────────────────────────────────┐            │
│    │ [1] TT 99/2025 — Doanh nghiệp (all sizes)     │            │
│    │ [2] TT 133/2016 — DN nhỏ và vừa (SME default) │            │
│    │ [3] TT 58/2026 — DN siêu nhỏ / hộ KD          │            │
│    └────────────────────────────────────────────────┘            │
│       │                                                          │
│       ▼                                                          │
│  System seeds standard accounts (71 / 50 / 20)                   │
│       │                                                          │
│       ▼                                                          │
│  System creates opening fiscal period                             │
│       │                                                          │
│       ▼                                                          │
│  Company ready for accounting operations                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-02: Daily Operation — Account Query

```
┌──────────────────────────────────────────────────────────────────┐
│                  ACCOUNT MANAGEMENT                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User opens Account Management screen                             │
│       │                                                          │
│       ▼                                                          │
│  System loads account tree (hierarchical)                        │
│       │                                                          │
│       ▼                                                          │
│  User can:                                                        │
│    ├── Search/Filter accounts                                    │
│    ├── Expand/collapse tree                                      │
│    ├── View account details + balance                            │
│    ├── Create new account [+ Add Account]                        │
│    ├── Edit existing account [✏ Edit]                            │
│    ├── Deactivate account [🚫 Deactivate]                        │
│    ├── Export COA [📤 Export]                                    │
│    └── Import COA [📥 Import]                                    │
│                                                                  │
│  Each action → system validates per business rules →             │
│  → audit log → UI refresh                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-03: Add New Account

```
┌──────────────────────────────────────────────────────────────────┐
│                  ADD ACCOUNT                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User clicks [+ Add Account]                                      │
│       │                                                          │
│       ▼                                                          │
│  System shows form:                                               │
│    ├── Account Number * (auto-validates format per regime)       │
│    ├── Name (Vietnamese) *                                       │
│    ├── Name (English)                                            │
│    ├── Parent Account (tree selector, optional)                  │
│    │   └── If selected: category + nature auto-filled from parent│
│    ├── Category * (if no parent)                                 │
│    ├── Nature * (auto-filled from category)                      │
│    └── Description                                               │
│       │                                                          │
│       ▼                                                          │
│  Real-time validation:                                            │
│    ├── Number format OK?                                         │
│    ├── Number unique?                                            │
│    ├── Parent exists?                                            │
│    ├── Category match?                                           │
│    └── Depth limit OK?                                           │
│       │                                                          │
│       ▼                                                          │
│  [Save] clicked                                                  │
│       │                                                          │
│       ▼                                                          │
│  System creates account, logs audit                              │
│       │                                                          │
│       ▼                                                          │
│  Account appears in tree                                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-04: Deactivate Account with Balance

```
┌──────────────────────────────────────────────────────────────────┐
│                  DEACTIVATE ACCOUNT                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User selects account → [Deactivate]                              │
│       │                                                          │
│       ▼                                                          │
│  System checks:                                                   │
│    ├── is_system? → ❌ Blocked                                   │
│    ├── Has children? → ❌ Must delete children first              │
│    ├── Has transactions? → Check                                 │
│    │   ├── No transactions → ✅ Proceed                          │
│    │   └── Has transactions → ⚠️ Warn, require reason            │
│    ├── Balance zero? → Check                                     │
│    │   ├── Zero balance → ✅ Proceed                             │
│    │   └── Non-zero balance → ⚠️ Warn, require admin password    │
│       │                                                          │
│       ▼                                                          │
│  User enters: deactivation reason, effective date                 │
│       │                                                          │
│       ▼                                                          │
│  Admin override (if needed)                                       │
│       │                                                          │
│       ▼                                                          │
│  System sets is_active = false                                    │
│  Audit log: reason, user, timestamp                               │
│       │                                                          │
│       ▼                                                          │
│  Account grayed out in tree                                       │
│  Transactions blocked on account                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-05: Regime Migration (Year-End)

```
┌──────────────────────────────────────────────────────────────────┐
│                  REGIME MIGRATION                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Initiated by Chief Accountant (year-end only)                    │
│       │                                                          │
│       ▼                                                          │
│  Pre-checks:                                                      │
│    ├── All periods closed?                                        │
│    ├── Company eligible per NĐ 80/2021?                          │
│    ├── DB backup created?                                         │
│       │                                                          │
│       ▼                                                          │
│  System generates migration report:                               │
│    ├── Accounts to add (new in target regime)                    │
│    ├── Accounts to remove (not in target regime)                 │
│    ├── Accounts to rename                                        │
│    ├── Accounts with changed nature                              │
│    └── Unmapped accounts with balances (⚠️ manual)               │
│       │                                                          │
│       ▼                                                          │
│  User reviews + resolves unmapped accounts                        │
│       │                                                          │
│       ▼                                                          │
│  [Execute Migration]                                              │
│       │                                                          │
│       ▼                                                          │
│  In transaction:                                                  │
│    ├── Add new accounts                                          │
│    ├── Update renamed accounts                                   │
│    ├── Mark removed accounts as inactive                         │
│    ├── Update accounting_regime setting                          │
│    └── Audit log full report                                     │
│       │                                                          │
│       ▼                                                          │
│  Notification: tax authority if required (TT 99 Điều 31)         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```
