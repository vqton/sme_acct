# COA Module — Implementation Roadmap

**Version:** 1.0
**Date:** 2026-07-23

---

## Phase 1: Foundation (P0 — Required for PROD)

**Goal:** Fix blocking gaps. Make COA functional and compliant.

| Step | Task | Files | Est. Effort |
|---|---|---|---|
| 1.1 | Replace STANDARD_ACCOUNTS with TT 99/2025 data | `AccountEnums.ts` | 4h |
| 1.2 | Add TT 133/2016 standard accounts | `AccountEnums.ts` | 2h |
| 1.3 | Add TT 58/2026 standard accounts | `AccountEnums.ts` | 1h |
| 1.4 | Define AccountingRegime enum (TT99=1, TT133=2, TT58=3) | `AccountEnums.ts` | 0.5h |
| 1.5 | Update company_settings to use AccountingRegime enum | `schema.ts` | 0.5h |
| 1.6 | Auto-seed accounts on company creation | `AccountingService.ts`, lifecycle hook | 3h |
| 1.7 | Add account hierarchy validation (parent exists, no circular) | `AccountingService.ts`, `Account.ts` | 2h |
| 1.8 | Block posting to non-leaf accounts | `AccountingService.ts` | 1h |
| 1.9 | Add audit logging for all COA mutations | `AccountingService.ts`, `AuditLogRepository.ts` | 2h |
| 1.10 | Add REST API endpoints for COA CRUD | `accountingController.ts` | 4h |
| 1.11 | Update tests | All test files | 4h |

**Total Phase 1:** ~24h (3 days)

---

## Phase 2: Usability (P1 — Required for full utility)

**Goal:** Make COA user-friendly with search, import/export, deactivation.

| Step | Task | Est. Effort |
|---|---|---|
| 2.1 | Regime-specific account number validation | 2h |
| 2.2 | Account deactivation workflow (with balance check, reason) | 3h |
| 2.3 | Account hierarchy tree UI (React component) | 6h |
| 2.4 | Account search with pagination and filters | 3h |
| 2.5 | COA export to Excel/CSV | 2h |
| 2.6 | COA import from Excel/CSV with validation | 4h |
| 2.7 | Account detail/edit form UI | 4h |
| 2.8 | Account deletion with transaction check | 1h |

**Total Phase 2:** ~25h (3-4 days)

---

## Phase 3: Advanced (P2 — Enhancement)

**Goal:** Add regime migration, advanced features.

| Step | Task | Est. Effort |
|---|---|---|
| 3.1 | Regime migration tool with mapping table | 8h |
| 3.2 | Parent balance roll-up calculation | 2h |
| 3.3 | Account usage analysis (which accounts have transactions) | 2h |
| 3.4 | Bulk account operations (activate/deactivate batch) | 3h |
| 3.5 | Integration with department analytic dimension | 4h |
| 3.6 | Account renumbering with transaction reference update | 4h |
| 3.7 | e-Invoice COA mapping | 6h |

**Total Phase 3:** ~29h (4 days)

---

## Dependency Graph

```
Phase 1
├── 1.1 → 1.2 → 1.3 (standard accounts data, parallel)
├── 1.4 → 1.5 (regime enum, parallel with 1.1-1.3)
├── 1.1 + 1.4 → 1.6 (seed by regime)
├── 1.7 (hierarchy validation, independent)
├── 1.6 + 1.7 → 1.8 (posting restriction)
├── 1.6 + 1.7 → 1.9 (audit logging)
│   └── 1.9 → 1.10 (REST API)
└── 1.6 → 1.11 (tests)

Phase 2 (after Phase 1 complete)
├── 2.1 (regime validation, after 1.4)
├── 2.2 (deactivation, after 1.8)
├── 2.3 → 2.4 → 2.5 → 2.6 → 2.7 (UI, sequential)
└── 2.8 (delete, after 1.10)

Phase 3 (after Phase 2 complete)
├── 3.1 (regime migration, after 2.1)
├── 3.2 → 3.3 (balance/usage, after 2.3)
├── 3.4 → 3.5 (bulk, after 2.2+2.7)
├── 3.6 (renumbering, after 2.7)
└── 3.7 (e-invoice, future)
```

## Current Code Structure

```
server/src/
├── domain/
│   ├── entities/
│   │   └── Account.ts              ← Account interface, createAccount()
│   ├── enums/
│   │   └── AccountEnums.ts          ← Enums + STANDARD_ACCOUNTS (NEEDS REPLACEMENT)
│   └── repositories/
│       ├── Repository.ts            ← Base CRUD interface
│       └── AccountRepository.ts     ← Account-specific queries
├── application/
│   └── AccountingService.ts         ← Business logic (seed, CRUD, ledger posting)
├── infrastructure/
│   └── database/
│       ├── schema.ts                ← DB tables (accounts, journal_entries, etc.)
│       ├── AccountRepository.ts     ← SQLite implementation
│       └── seed/
└── presentation/
    └── controllers/
        └── accountingController.ts  ← Express routes (PARTIAL)

client/src/
├── types/
│   └── index.ts                     ← Account type (client-side)
└── services/
    └── api.ts                       ← API calls (PARTIAL)
```

## Key Design Decisions for Implementation

1. **Multi-regime approach**: Use dictionary keyed by `AccountingRegime` for `STANDARD_ACCOUNTS`. Each regime has its own account list.

2. **Seed timing**: Call `seedStandardAccounts` in a lifecycle hook after company creation + settings insertion. Use the `accounting_regime` from settings.

3. **Hierarchy validation**: Implement as private methods in `AccountingService`: `validateParentExists()`, `validateNoCircular()` (traverse ancestors), `validateDepthLimit()`, `validateCategoryMatch()`.

4. **Audit trail**: Use existing `AuditLogRepository`. Action prefix: `ACCOUNT_`. Store before/after JSON in `detail` field.

5. **REST API**:
   - `GET /api/companies/:companyId/accounts` — list (tree or flat)
   - `GET /api/companies/:companyId/accounts/:id` — detail
   - `POST /api/companies/:companyId/accounts` — create
   - `PUT /api/companies/:companyId/accounts/:id` — update
   - `DELETE /api/companies/:companyId/accounts/:id` — delete
   - `POST /api/companies/:companyId/accounts/:id/deactivate` — deactivate
   - `POST /api/companies/:companyId/accounts/seed` — re-seed
   - `GET /api/companies/:companyId/accounts/export` — export
   - `POST /api/companies/:companyId/accounts/import` — import

6. **TT 99 account names (corrected)**:
   ```
   112 → "Tiền gửi không kỳ hạn" (NOT "Tiền gửi ngân hàng")
   155 → "Sản phẩm" (NOT "Thành phẩm")
   242 → "Chi phí chờ phân bổ" (NOT "Chi phí trả trước dài hạn")
   158 → "Nguyên liệu, vật tư tại kho bảo thuế" (NOT "Hàng hóa kho bảo thuế")
   ```
