# GL Module — Implementation Roadmap

**Version:** 1.0
**Date:** 2026-07-23

---

## Phase 1: Foundation (P0 — Required for PROD)

**Effort:** 4-6 weeks
**Dependencies:** COA module (accounts, seeding, hierarchy validation)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 1.1 | **Client UI — Journal Entry List** | 3 days | — |
| 1.2 | **Client UI — Journal Entry Create/Edit** | 5 days | 1.1 |
| 1.3 | **Client UI — General Ledger View** | 3 days | 1.2 |
| 1.4 | **Client UI — Trial Balance** | 2 days | 1.3 |
| 1.5 | **Client UI — Fiscal Period Management** | 2 days | — |
| 1.6 | **Financial Statements Engine** | 5 days | 1.4 |
| 1.7 | **B01-DN Report Template** | 2 days | 1.6 |
| 1.8 | **B02-DN Report Template** | 2 days | 1.6 |
| 1.9 | **B03-DN Report Template** | 3 days | 1.6 |
| 1.10 | **B09-DN Report Notes** | 2 days | 1.6 |
| 1.11 | **Period-End Closing Workflow** | 4 days | 1.5 |
| 1.12 | **Audit Trail UI** | 2 days | — |
| 1.13 | **GL Report Export (PDF/Excel)** | 3 days | 1.3, 1.4 |

**Phase 1 Total:** ~5 weeks

---

## Phase 2: Sub-ledger Integration (P0 — Required for PROD)

**Effort:** 4-6 weeks
**Dependencies:** Cash, Bank, AR, AP, Inventory, FA modules exist

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 2.1 | **GL API — journal entry creation endpoint** | 2 days | 1.2 |
| 2.2 | **Cash sub-ledger → GL auto-posting** | 3 days | 2.1, Cash module |
| 2.3 | **Bank sub-ledger → GL auto-posting** | 3 days | 2.1, Bank module |
| 2.4 | **AR sub-ledger → GL auto-posting** | 3 days | 2.1, AR module |
| 2.5 | **AP sub-ledger → GL auto-posting** | 3 days | 2.1, AP module |
| 2.6 | **Inventory → GL auto-posting** | 3 days | 2.1, Inventory module |
| 2.7 | **FA Depreciation → GL auto-posting** | 2 days | 2.1, FA module |
| 2.8 | **Payroll → GL auto-posting** | 3 days | 2.1, Payroll module |
| 2.9 | **Integration testing — all sub-ledgers** | 3 days | 2.2-2.8 |

**Phase 2 Total:** ~5 weeks

---

## Phase 3: Multi-Currency & Cost Centers (P1)

**Effort:** 3-4 weeks

| Task | Description | Effort |
|------|-------------|--------|
| 3.1 | **Multi-currency journal entry (UI + API)** | 3 days |
| 3.2 | **Exchange rate management** | 2 days |
| 3.3 | **FX revaluation engine** | 3 days |
| 3.4 | **Unrealized gain/loss auto-posting** | 2 days |
| 3.5 | **Realized FX on settlement** | 2 days |
| 3.6 | **Department/cost center reporting** | 3 days |
| 3.7 | **Department income statement** | 3 days |
| 3.8 | **Cost allocation engine** | 4 days |

**Phase 3 Total:** ~3 weeks

---

## Phase 4: Recurring Entries & Budget (P1-P2)

**Effort:** 3-4 weeks

| Task | Description | Effort |
|------|-------------|--------|
| 4.1 | **Recurring entry templates (UI + API)** | 4 days |
| 4.2 | **Scheduler for auto-generation** | 3 days |
| 4.3 | **Budget entry (UI + API)** | 3 days |
| 4.4 | **Budget control (warning/block on posting)** | 3 days |
| 4.5 | **Budget vs Actual report** | 3 days |
| 4.6 | **Batch import journal entries (Excel/CSV)** | 3 days |

**Phase 4 Total:** ~3 weeks

---

## Phase 5: Compliance & Advanced (P2)

**Effort:** 3-4 weeks

| Task | Description | Effort |
|------|-------------|--------|
| 5.1 | **Digital signature integration (NĐ 23/2025)** | 5 days |
| 5.2 | **TT 133 BCTC templates** | 3 days |
| 5.3 | **TT 58 simplified book support** | 3 days |
| 5.4 | **Intercompany transaction processing** | 4 days |
| 5.5 | **Consolidated GL (multi-company)** | 5 days |
| 5.6 | **IFRS/VAS dual reporting mappings** | 5 days |
| 5.7 | **VAT account analysis for tax declaration** | 3 days |

**Phase 5 Total:** ~4 weeks

---

## Dependency Graph

```
Phase 1 (Foundation)
  ├── 1.1 → 1.2 → 1.3 → 1.4 → 1.6 → 1.7, 1.8, 1.9, 1.10
  ├── 1.5 → 1.11
  └── 1.12, 1.13 (parallel)

Phase 2 (Integration)
  └── Depends on Phase 1 + sub-ledger modules

Phase 3 (Multi-Currency)
  └── Depends on Phase 1

Phase 4 (Recurring + Budget)
  └── Depends on Phase 1

Phase 5 (Compliance)
  └── Depends on Phase 1, 3
```

---

## Effort Summary

| Phase | Weeks | Tasks |
|-------|-------|-------|
| Phase 1: Foundation | 5 | 13 tasks |
| Phase 2: Integration | 5 | 9 tasks |
| Phase 3: Multi-Currency | 3 | 8 tasks |
| Phase 4: Recurring + Budget | 3 | 6 tasks |
| Phase 5: Compliance | 4 | 7 tasks |
| **Total** | **~20 weeks** | **43 tasks** |

**Critical Path:** Phase 1 → Phase 2. Sub-ledger integration cannot begin until GL API endpoints exist.
**Minimum Viable Product:** Phase 1 complete + at minimum cash/bank sub-ledger posting from Phase 2.
