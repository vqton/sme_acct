# Opening Balance Module — PROD Readiness Summary

## Verdict: ❌ NOT PROD READY

### What Exists
- `Account.openingDebit` / `Account.openingCredit` fields
- `AccountBalance.openingDebit` / `AccountBalance.openingCredit`
- `FiscalPeriod.isOpeningBalancePeriod` flag
- `PeriodCloseService.carryForwardBalances()` — carries closing→opening between periods
- `calculateBalance()` consumes opening balance to compute closing balance

### 7 Critical Gaps
1. **No client UI** — zero screens for OB entry
2. **No balance validation** — Tổng Dư Nợ ≠ Tổng Dư Có goes undetected
3. **No sub-ledger detail** — can't enter bank/AR/AP/inventory/FA per detail
4. **No Excel import** — can't migrate from MISA/Fast/Bravo
5. **No OB lock** — can modify after transactions posted (audit risk)
6. **No TT99 conversion** — TT200→TT99 mapping unsupported (regulatory requirement from 01/01/2026)
7. **No audit trail** — who entered/changed, no provenance

### 12 Major Gaps
Multi-currency OB, OB reports, carry-forward automation, adjustment JE workflow, import template, prior period comparison, consolidated OB, TT133 support, off-balance-sheet accounts, batch account creation, approval workflow, digital signature (NĐ 23/2025/NĐ-CP)

### Market Comparison
MISA SME 2026 ✅ | Fast Online 2026 ✅ | Bravo 8 ✅ | SmeAccounting ❌ — missing all 10 standard OB categories

### Regulatory Non-Compliance
- TT 99/2025/TT-BTC Điều 4-5 (OB as prior period closing)
- TT 99/2025/TT-BTC Điều 30 (conversion accounting policy change)
- Luật Kế toán Điều 13 (OB integrity)
- NĐ 23/2025/NĐ-CP (digital signature)

### Effort: 8 weeks / 79 story points across 8 phases

### Documentation Set (saved to `docs/brd/`)

| File | Description |
|------|-------------|
| `42-ob-module-brd.md` | Full BRD with PROD readiness analysis, schema, requirements |
| `43-ob-use-cases.md` | 10 use cases with happy/alternative/exception paths |
| `44-ob-business-rules.md` | 20 business rules with severity and enforcement |
| `45-ob-workflows.md` | 5 workflows (onboarding, rollover, conversion, adjustment, audit) |
| `46-ob-data-flows.md` | 7 data flows (manual, import, conversion, carry-forward, lock, detail, mapping) |
| `47-ob-templates.md` | Excel templates + UI mockups (6 screens) |
| `48-ob-user-journeys.md` | 5 user journeys (new company, migration, rollover, audit, multi-currency) |
| `49-ob-ui-specs.md` | Detailed UI specs with responsive behavior and accessibility |
| `50-ob-implementation-roadmap.md` | 8-phase implementation plan with dependency graph |
| `51-ob-summary.md` | This file — executive summary |
