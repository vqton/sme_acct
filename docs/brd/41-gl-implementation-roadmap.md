# GL Module — Implementation Roadmap (Updated)

**Version:** 2.0
**Date:** 2026-07-24

---

## Executive Summary

**V1 roadmap (2026-07-23) assumed nothing was built.** After codebase audit, ~80% of V1 Phase 1 is already complete. This V2 roadmap reflects actual current state and focuses only on remaining work.

### What Changed
- Phase 1 Foundation: 13 tasks → 4 remaining (B03-DN, B09-DN, closing workflow UI, export)
- Phase 2+ reordered: Sub-ledger integration now Phase 3 (depends on sub-ledger modules existing)
- New Phase: Compliance & Regulatory (TT 133, TT 58, e-signature)
- Total effort revised: ~20 weeks → ~14 weeks remaining

---

## Phase 1: Remaining Core (P0 — CRITICAL)

**Effort:** 3-4 weeks
**Dependencies:** None (everything in Phase 1 depends on existing code)

| Task | Description | Effort | Notes |
|------|-------------|--------|-------|
| 1.1 | **B03-DN (Cash Flow Statement)** — indirect method from B01+B02 data | 4 days | TT 99 Phụ lục 4 template; indirect method uses balance sheet changes + income statement |
| 1.2 | **B09-DN (Notes to Financial Statements)** — configurable note templates | 3 days | TT 99 requires 24+ note items (accounting policies, inventory method, depreciation method, etc.) |
| 1.3 | **Period-end closing workflow UI** — checklist with verification steps | 4 days | closeFiscalPeriod exists; needs UI with checklist, balance verify, rollback |
| 1.4 | **GL Export (PDF/Excel)** — ledger, trial balance, BCTC export | 3 days | Export current table views to printable formats |

**Phase 1 Total:** ~3 weeks remaining

### Already Complete (Phase 1 items from V1 that are DONE)
- ✅ 1.1 Client UI — Journal Entry List
- ✅ 1.2 Client UI — Journal Entry Create/Edit
- ✅ 1.3 Client UI — General Ledger View
- ✅ 1.4 Client UI — Trial Balance
- ✅ 1.5 Client UI — Fiscal Period Management
- ✅ 1.6 Financial Statements Engine (B01-DN + B02-DN)
- ✅ 1.7 B01-DN Report Template
- ✅ 1.8 B02-DN Report Template

---

## Phase 2: Multi-Currency & Cost Centers (P1)

**Effort:** 3-4 weeks
**Dependencies:** Phase 1 complete

| Task | Description | Effort |
|------|-------------|--------|
| 2.1 | **Multi-currency JE (UI + API)** — currency selector, rate input, dual-amount display | 3 days |
| 2.2 | **Exchange rate management** — rate entry, history, auto-fill from SBV | 2 days |
| 2.3 | **FX revaluation engine** — scan FC monetary accounts, compute unrealized gain/loss | 3 days |
| 2.4 | **FX adjustment auto-posting** — Dr/Cr 413 + 515/635 | 2 days |
| 2.5 | **Department/cost center reporting** — filter trial balance, ledger by dimension | 3 days |
| 2.6 | **Department income statement** — P&L by department | 3 days |
| 2.7 | **Cost allocation engine** — proportional and step-down allocation | 4 days |

**Phase 2 Total:** ~3 weeks

---

## Phase 3: Sub-Ledger Integration (P0 — Required for Full PROD)

**Effort:** 5-6 weeks
**Dependencies:** Cash, Bank, AR, AP, Inventory, FA, Payroll modules must exist first

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 3.1 | **GL posting API** — accept sub-ledger transactions, create+post JE | 2 days | Phase 1 |
| 3.2 | **Cash sub-ledger → GL** | 2 days | 3.1, Cash module |
| 3.3 | **Bank sub-ledger → GL** | 2 days | 3.1, Bank module |
| 3.4 | **AR sub-ledger → GL** | 2 days | 3.1, AR module |
| 3.5 | **AP sub-ledger → GL** | 2 days | 3.1, AP module |
| 3.6 | **Inventory → GL** | 2 days | 3.1, Inventory module |
| 3.7 | **FA Depreciation → GL** | 2 days | 3.1, FA module |
| 3.8 | **Payroll → GL** | 2 days | 3.1, Payroll module |
| 3.9 | **Integration testing — all sub-ledgers** | 3 days | 3.2-3.8 |

**Phase 3 Total:** ~5 weeks

---

## Phase 4: Automation & Budget (P1-P2)

**Effort:** 3-4 weeks
**Dependencies:** Phase 1 complete

| Task | Description | Effort |
|------|-------------|--------|
| 4.1 | **Recurring entry templates (UI + API)** | 4 days |
| 4.2 | **Scheduler for auto-generation** (cron-based, runs daily) | 3 days |
| 4.3 | **Budget entry (UI + API)** | 3 days |
| 4.4 | **Budget control** (warning/block on posting) | 3 days |
| 4.5 | **Budget vs Actual report** | 3 days |
| 4.6 | **Batch JE import (Excel/CSV)** | 3 days |

**Phase 4 Total:** ~3 weeks

---

## Phase 5: Compliance & Advanced (P2)

**Effort:** 4-5 weeks
**Dependencies:** Phase 1, 2

| Task | Description | Effort |
|------|-------------|--------|
| 5.1 | **Audit trail UI** — searchable log of all GL actions | 2 days |
| 5.2 | **Digital signature integration (NĐ 23/2025/NĐ-CP)** | 5 days |
| 5.3 | **TT 133 BCTC templates** — simplified SME format | 3 days |
| 5.4 | **TT 58 micro-enterprise book support** — S1-DNSN to S4d-DNSN | 3 days |
| 5.5 | **VAT account analysis for tax declaration** | 3 days |
| 5.6 | **IFRS/VAS dual reporting mappings** | 5 days |
| 5.7 | **Intercompany transaction processing** | 4 days |
| 5.8 | **Consolidated GL (multi-company)** | 5 days |

**Phase 5 Total:** ~4 weeks

---

## Dependency Graph

```
Phase 1 (Remaining Core) — 3 weeks
  ├── 1.1 B03-DN
  ├── 1.2 B09-DN
  ├── 1.3 Closing workflow UI
  └── 1.4 Export (PDF/Excel)

Phase 2 (Multi-Currency) — 3 weeks
  └── Depends on Phase 1

Phase 3 (Sub-Ledger Integration) — 5 weeks
  └── Depends on sub-ledger modules + Phase 1

Phase 4 (Automation) — 3 weeks
  └── Depends on Phase 1

Phase 5 (Compliance) — 4 weeks
  └── Depends on Phase 1, 2
```

---

## Effort Summary

| Phase | Weeks | Tasks | Status |
|-------|-------|-------|--------|
| Phase 1: Remaining Core | 3 | 4 tasks | 🔜 START |
| Phase 2: Multi-Currency | 3 | 7 tasks | ⏳ Next |
| Phase 3: Sub-Ledger Integration | 5 | 9 tasks | ⏳ After sub-ledger modules |
| Phase 4: Automation & Budget | 3 | 6 tasks | ⏳ Later |
| Phase 5: Compliance | 4 | 8 tasks | ⏳ Later |
| **Total Remaining** | **~14 weeks** | **34 tasks** | |

**Critical Path:** Phase 1 → Phase 2. B03-DN + B09-DN first for full BCTC compliance.
**MVP for Full PROD:** Phase 1 complete + Phase 3 (at minimum cash/bank posting).
**Quick Wins (1-2 days):** Audit trail UI, JE batch import, GL export.
