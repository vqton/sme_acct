# SmeAccounting Documentation

## BRD — Business Requirements Documents

### Completed Modules

| File | Content |
|---|---|
| `brd/01-user-management-brd.md` | User mgmt: PROD verdict, regulatory index, gap analysis |
| `brd/02-use-cases.md` | 10 use cases: login, logout, refresh, change pw, CRUD user, tax perm, digital sig, audit trail |
| `brd/03-workflows.md` | 6 workflows + 2 processes: lifecycle, login security, e-tax, correction, session, departure |
| `brd/04-business-rules.md` | 25 business rules: security, RBAC, compliance, multi-tenancy, state machine |
| `brd/05-data-flows.md` | 8 data flow diagrams: auth, user creation, permission check, token refresh, VNeID, audit, correction, e-sign |
| `brd/06-templates.md` | 5 templates: user registration, audit log, tax permission, compliance checklist, role definition |
| `brd/07-user-journeys.md` | 4 user journeys: new accountant, chief accountant review, tax filing, legal rep VNeID |
| `brd/08-company-module-brd.md` | Company module BRD: PROD verdict (NOT ready), regulatory index, gap analysis, roadmap |
| `brd/09-company-use-cases.md` | 15 use cases: create/update company, legal reps, business lines, branches, bank accounts, VNeID, lifecycle |
| `brd/10-company-workflows.md` | 8 workflows: registration, info change, status lifecycle, fiscal year, multi-company |
| `brd/11-company-business-rules.md` | 35 business rules: identity, settings, lifecycle, security, operational |
| `brd/12-company-data-flows.md` | 8 data flow diagrams: setup, tax verification, GL integration, VNeID |
| `brd/13-company-templates.md` | 8 templates: registration, info change, settings, legal rep, branches, bank |
| `brd/14-company-user-journeys.md` | 5 user journeys: chief accountant setup, freelance, suspension, VNeID |
| `brd/15-company-user-stories.md` | 30 user stories across 7 epics |
| `brd/25-coa-module-brd.md` | COA BRD: PROD verdict (NOT ready), 5 blocking + 12 major gaps, multi-regime spec |
| `brd/26-coa-use-cases.md` | COA use cases |
| `brd/27-coa-business-rules.md` | COA business rules |
| `brd/28-coa-data-flows.md` | COA data flows |
| `brd/29-coa-workflows.md` | COA workflows |
| `brd/30-coa-templates.md` | COA templates |
| `brd/31-coa-user-journeys.md` | COA user journeys |
| `brd/32-coa-implementation-roadmap.md` | COA 3-phase roadmap (P0: 3d, P1: 4d, P2: 4d) |

### GL Module (Sổ Cái / Tổng Hợp) — New

| File | Content |
|---|---|
| `brd/33-gl-module-brd.md` | GL BRD: PROD verdict (NOT ready), 8 critical + 15 major gaps, regulatory index, target schema |
| `brd/34-gl-use-cases.md` | 10 use cases: JE create/post/reverse, GL view, trial balance, BCTC, period close, recurring, multi-currency, budget |
| `brd/35-gl-workflows.md` | 6 workflows: monthly close cycle, JE lifecycle, year-end close, correction, sub-ledger posting, balance calculation |
| `brd/36-gl-business-rules.md` | 23 business rules: double-entry, immutability, period lock, FX, approval, audit trail |
| `brd/37-gl-data-flows.md` | 6 data flows: JE creation→posting, trial balance, B01-DN mapping, sub-ledger integration, period close, multi-currency |
| `brd/38-gl-templates.md` | 7 templates: JE form, GL report, trial balance, B01-DN, closing checklist, recurring entry, budget entry |
| `brd/39-gl-user-journeys.md` | 5 user journeys: accountant monthly close, chief accountant year-end, multi-currency correction, manager budget review, auditor GL review |
| `brd/40-gl-ui-specs.md` | 6 UI specs: JE list, JE detail, GL view, trial balance, BCTC viewer, period close dashboard |
| `brd/41-gl-implementation-roadmap.md` | GL 5-phase roadmap (Foundation: 5wk, Integration: 5wk, Multi-Currency: 3wk, Recurring: 3wk, Compliance: 4wk) |

## ADR — Architecture Decision Records

| File | Content |
|---|---|
| `adr/0001-vneid-integration-requirement.md` | VNeID integration per NĐ 69/2024/NĐ-CP |
| `adr/0002-digital-signature-module.md` | Digital signature module per NĐ 23/2025/NĐ-CP |

## Domain — Ubiquitous Language

| File | Content |
|---|---|
| `domain/user-management-terms.md` | Vietnamese-English glossary of user management terms |
| `../UBIQUITOUS_LANGUAGE.md` | Company domain glossary: 136 terms, 8 tables, state machine, relationships, flagged ambiguities |
