---
tags:
  - coa
  - brd
  - accounting
  - module
aliases:
  - COA Module
  - Chart of Accounts
---

# COA Module BRD Analysis

**Verdict: NOT PROD-READY**

## Critical Findings

| # | Gap | Severity |
|---|---|---|
| 1 | STANDARD_ACCOUNTS based on TT 200/2014 (outdated, replaced by TT 99/2025 since 01/01/2026) | BLOCKER |
| 2 | No multi-regime COA support (TT 133 for SME, TT 58 for siêu nhỏ) | BLOCKER |
| 3 | seedStandardAccounts never triggered on company creation — companies have zero accounts | BLOCKER |
| 4 | No account hierarchy validation (circular parents, missing parents) | BLOCKER |
| 5 | accounting_regime field unused, no enum definition | BLOCKER |

## What Exists (Good Foundation)

- Account entity with full fields (id, companyId, accountNumber, name, category, nature, type, parentId, balances)
- AccountEnums: 6 categories, 4 natures, 3 types, STANDARD_ACCOUNTS (but TT 200)
- AccountRepository: 11 query methods + CRUD with lazy-init prepared statements
- AccountingService: CRUD, seeding, ledger posting, trial balance
- DB schema: accounts, journal_entries, journal_entry_lines, ledger_entries, account_balances, fiscal_periods
- Tests: entity test, repo test, service test

## Key Differences: TT 99 vs Current (TT 200) COA

- **New accounts needed**: TK 215, TK 332, TK 82112, TK 229
- **Removed accounts to delete**: TK 611, TK 631, TK 161, TK 441
- **Renamed**: 112→"Tiền gửi không kỳ hạn", 155→"Sản phẩm", 242→"Chi phí chờ phân bổ", 158→"Nguyên liệu, vật tư tại kho bảo thuế"
- **Level-1 count**: 76 (TT 200) → 71 (TT 99)
- **New level-2** (under TK 128): 1281, 1282, 1283, 1288; **New level-3** (under TK 8211): 82111, 82112

## Recommended Phasing

- **Phase 1** (P0, ~3 days): Fix standard accounts, multi-regime, auto-seed, hierarchy validation, audit logging, REST API
- **Phase 2** (P1, ~4 days): UI, search, import/export, deactivation workflow
- **Phase 3** (P2, ~4 days): Regime migration, parent balance rollup, department integration

## Docs Written

- `docs/brd/25-coa-module-brd.md` — Full BRD
- `docs/brd/26-coa-use-cases.md` — 10 use cases (happy/alt/exception paths)
- `docs/brd/27-coa-business-rules.md` — 12 business rules
- `docs/brd/28-coa-data-flows.md` — 6 data flow diagrams
- `docs/brd/29-coa-workflows.md` — 5 workflow diagrams
- `docs/brd/30-coa-templates.md` — 7 templates (UI, import, reports)
- `docs/brd/31-coa-user-journeys.md` — 5 user journeys
- `docs/brd/32-coa-implementation-roadmap.md` — Phasing, dependencies, file list

## References

- TT 99/2025/TT-BTC hiệu lực 01/01/2026 (thay thế TT 200/2014)
- TT 133/2016/TT-BTC vẫn hiệu lực song song cho SME
- TT 58/2026/TT-BTC cho DN siêu nhỏ hiệu lực 01/07/2026
- TT 53/2006/TT-BTC hướng dẫn kế toán quản trị (analytic dimensions)
- Luật Kế toán 88/2015/QH13 (sửa đổi 2024, 2025)
- NĐ 80/2021/NĐ-CP tiêu chí SME
