# Implementation Roadmap — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## Phase 0: Foundation (Week 1) — P0

| Task | Description | Artifacts | Dependencies |
|------|-------------|-----------|-------------|
| OB-0.1 | Create DB schema for opening_balance_headers, lines, conversion_mappings, audit_log | SQL migration | DB connection |
| OB-0.2 | Create domain entities: OpeningBalanceHeader, OpeningBalanceLine, ConversionMapping | TypeScript interfaces + factories | OB-0.1 |
| OB-0.3 | Create repository interfaces: OpeningBalanceRepository, ConversionMappingRepository | TypeScript interfaces | OB-0.2 |
| OB-0.4 | Create SQLite implementations of all OB repositories | SQLite repos with prepared statements | OB-0.3 |
| OB-0.5 | Create OpeningBalanceService: create, get, validate, lock/unlock, approve | Service class | OB-0.4 |
| OB-0.6 | Write unit tests for domain entities + service | Tests | OB-0.5 |
| OB-0.7 | Create REST endpoints: POST/GET/PUT opening balance | Express controller + routes | OB-0.5 |

**Verification:** `npm test` passes, Postman collection works for OB CRUD

---

## Phase 1: Core UI + Manual Entry (Week 2) — P0

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-1.1 | Create OB dashboard page with batch list table | OB-0.7 |
| OB-1.2 | Create OB entry screen with inline-editable grid | OB-1.1 |
| OB-1.3 | Implement real-time balance validation (debit = credit) | OB-1.2 |
| OB-1.4 | Create OB detail view with lock status | OB-1.2 |
| OB-1.5 | Wire up API calls to backend | OB-1.2, OB-0.7 |
| OB-1.6 | Write E2E test: create OB → validate → save → verify | OB-1.5 |

**Verification:** Accountant can manually enter opening balances, system validates balance equality

---

## Phase 2: Sub-Ledger Details (Week 3) — P0

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-2.1 | Bank detail tab: per-bank-account balance entry | OB-1.5 |
| OB-2.2 | AR detail tab: per-customer balance entry | OB-1.5 |
| OB-2.3 | AP detail tab: per-supplier balance entry | OB-1.5 |
| OB-2.4 | Inventory detail tab: per-item quantity + price | OB-1.5 |
| OB-2.5 | FA detail tab: per-asset cost + depreciation | OB-1.5 |
| OB-2.6 | CCDC + prepaid detail tabs | OB-1.5 |
| OB-2.7 | Sub-ledger → GL balance validation (sum = total) | OB-2.1–2.6 |

**Verification:** All 6 sub-ledger categories work with balance validation

---

## Phase 3: Excel Import (Week 4) — P0

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-3.1 | Excel template generator (xlsx download) | OB-0.5 |
| OB-3.2 | Excel parser: validate, preview, error reporting | OB-0.5 |
| OB-3.3 | Batch import: parse → validate → preview → confirm → insert | OB-3.2 |
| OB-3.4 | Import sub-ledger details from Excel (multiple sheets) | OB-3.3, OB-2.x |
| OB-3.5 | Error handling: partial success with detailed error report | OB-3.3 |
| OB-3.6 | Import performance optimization for 10K+ rows | OB-3.3 |

**Verification:** Import 10K rows in <30s, error report accurate

---

## Phase 4: TT99 Conversion (Week 5) — P0

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-4.1 | Default TT200→TT99 mapping table (per TT99 Appendix 1) | None (data) |
| OB-4.2 | Conversion mapping CRUD UI: view, edit mapping | OB-0.7 |
| OB-4.3 | Conversion engine: direct, split, merge, manual | OB-0.5 |
| OB-4.4 | Conversion simulation: preview before commit | OB-4.3 |
| OB-4.5 | Conversion execution: backup → convert → verify → audit | OB-4.4 |
| OB-4.6 | Conversion audit report (PDF) generator | OB-4.5 |
| OB-4.7 | E2E test: TT200 → TT99 full conversion flow | OB-4.6 |

**Verification:** Full TT200→TT99 conversion roundtrip with audit report

---

## Phase 5: Lock, Approval, Carry-Forward (Week 6) — P0/P1

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-5.1 | Auto-lock on first period transaction | OB-0.5 |
| OB-5.2 | Manual lock/unlock with reason (Chief Accountant) | OB-0.5 |
| OB-5.3 | Approval workflow: submit → review → approve/reject | OB-1.5 |
| OB-5.4 | Carry-forward from closing → opening (period rollover) | OB-0.5 |
| OB-5.5 | Carry-forward verification report | OB-5.4 |
| OB-5.6 | Integration with PeriodCloseService | OB-5.4 |

**Verification:** Lock prevents modification, approval required, carry-forward works end-to-end

---

## Phase 6: Multi-Currency + Reports (Week 7) — P1

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-6.1 | Multi-currency OB entry: foreign amount + rate → VND | OB-1.5 |
| OB-6.2 | Exchange rate lookup/auto-fill | OB-6.1 |
| OB-6.3 | OB by account report (Sổ chi tiết số dư đầu kỳ) | OB-1.5 |
| OB-6.4 | OB vs prior period closing comparison report | OB-5.5 |
| OB-6.5 | Export reports to Excel + PDF | OB-6.3, OB-6.4 |

---

## Phase 7: Audit Trail + Digital Signature (Week 8) — P1/P2

| Task | Description | Dependencies |
|------|-------------|-------------|
| OB-7.1 | Audit log viewer UI | OB-0.5 |
| OB-7.2 | Audit log filter, search, export | OB-7.1 |
| OB-7.3 | Digital signature integration per NĐ 23/2025/NĐ-CP | OB-5.3 |
| OB-7.4 | Signature verification on OB approval | OB-7.3 |
| OB-7.5 | Performance testing: 100K+ OB lines | All prior phases |

---

## Dependency Graph

```
Phase 0 (Foundation)
    │
    ▼
Phase 1 (Core UI) ──────────▶ Phase 3 (Excel Import)
    │                               │
    ▼                               │
Phase 2 (Sub-Ledger) ──────────────┤
    │                               │
    ▼                               ▼
Phase 4 (TT99 Conversion) ◀────────┘
    │
    ▼
Phase 5 (Lock/Approval/Carry-Forward)
    │
    ▼
Phase 6 (Multi-Currency + Reports)
    │
    ▼
Phase 7 (Audit + Digital Signature)
```

---

## Success Criteria

After all 8 phases:

- [ ] Accountant can enter opening balances manually
- [ ] Accountant can import from Excel with validation
- [ ] Opening balances have 10 sub-ledger categories per MISA/Fast/Bravo standard
- [ ] TT200→TT99 conversion works with audit report
- [ ] Opening balance auto-locks after first transaction
- [ ] Chief Accountant approval workflow works
- [ ] Multi-currency opening balances supported
- [ ] Opening balance reports available (detail + comparison)
- [ ] Full audit trail recorded
- [ ] Digital signature integration ready
- [ ] All tests pass
- [ ] Performance: 10K lines import <30s

## Effort Estimate

| Phase | Story Points | Duration |
|-------|-------------|----------|
| Phase 0: Foundation | 13 | 1 week |
| Phase 1: Core UI | 8 | 1 week |
| Phase 2: Sub-Ledger | 13 | 1 week |
| Phase 3: Excel Import | 8 | 1 week |
| Phase 4: TT99 Conversion | 13 | 1 week |
| Phase 5: Lock/Approval | 8 | 1 week |
| Phase 6: Multi-currency + Reports | 8 | 1 week |
| Phase 7: Audit + E-Signature | 8 | 1 week |
| **Total** | **79** | **8 weeks** |
