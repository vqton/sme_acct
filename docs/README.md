# SmeAccounting Documentation

## BRD — Business Requirements Documents

| File | Content |
|---|---|
| `brd/01-user-management-brd.md` | Executive summary, PROD readiness verdict, regulatory index, gap analysis |
| `brd/02-use-cases.md` | 10 use cases: login, logout, refresh, change pw, CRUD user, tax perm, digital sig, audit trail |
| `brd/03-workflows.md` | 6 workflows + 2 processes: lifecycle, login security, e-tax, correction, session, departure |
| `brd/04-business-rules.md` | 25 business rules: security, RBAC, compliance, multi-tenancy, state machine |
| `brd/05-data-flows.md` | 8 data flow diagrams: auth, user creation, permission check, token refresh, VNeID, audit, correction, e-sign |
| `brd/06-templates.md` | 5 templates: user registration, audit log, tax permission, compliance checklist, role definition |
| `brd/07-user-journeys.md` | 4 user journeys: new accountant, chief accountant review, tax filing, legal rep VNeID |
| `brd/08-company-module-brd.md` | Company module BRD: exec summary, PROD verdict (NOT ready), regulatory index, gap analysis, target data model, roadmap |
| `brd/09-company-use-cases.md` | 15 use cases: create/update company, legal reps, business lines, branches, bank accounts, VNeID, status lifecycle, multi-company |
| `brd/10-company-workflows.md` | 8 workflows: registration, info change, status lifecycle, fiscal year, multi-company, legal rep change, VNeID, year-end lock |
| `brd/11-company-business-rules.md` | 35 business rules: identity, settings, lifecycle, security, operational — all referenced to Vietnamese law |
| `brd/12-company-data-flows.md` | 8 data flow diagrams: setup, tax verification, GL integration, tax integration, access control, VNeID, public disclosure, multi-company isolation |
| `brd/13-company-templates.md` | 8 templates: registration form, info change, settings, legal rep, business lines, branch, bank account, documents checklist |
| `brd/14-company-user-journeys.md` | 5 user journeys: chief accountant setup, admin update, freelance multi-company, suspension, VNeID registration |
| `brd/15-company-user-stories.md` | 30 user stories across 7 epics: core info, legal reps, business lines, settings, status lifecycle, multi-company, compliance |

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
