# Dept Module BRD Analysis

**Date:** 2026-07-21
**Status:** GREENFIELD — zero code exists

## PROD Readiness: NOT IMPLEMENTED

Dept module (Công nợ - AP/AR) does not exist in codebase. Only role `ke-toan-cong-no` defined in `Role.ts`.

## Scope

- **AR (Công nợ phải thu)** — TK 131: Customers, sales invoices, receipts, aging, bad debt
- **AP (Công nợ phải trả)** — TK 331: Suppliers, purchase invoices, payments, aging

## BRD Docs Created

| Doc | File |
|-----|------|
| BRD Overview | `docs/brd/17-dept-module-brd.md` |
| Use Cases (12) | `docs/brd/18-dept-use-cases.md` |
| Workflows (8) | `docs/brd/19-dept-workflows.md` |
| Business Rules (7) | `docs/brd/20-dept-business-rules.md` |
| Data Flows (8) | `docs/brd/21-dept-data-flows.md` |
| Templates (10) | `docs/brd/22-dept-templates.md` |
| User Journeys (6) | `docs/brd/23-dept-user-journeys.md` |

## Regulatory Foundation

| Law | Applicability |
|-----|---------------|
| TT 99/2025/TT-BTC | TK 131/331, sổ chi tiết |
| VAS 18 + TT 48/2019/TT-BTC | Bad debt provision |
| VAS 10 | Foreign currency AR/AP |
| Luật Kế toán 88/2015 Điều 41 | 5-year retention |

## Implementation Priority

Phase 1: Customer/Vendor master + Invoice recording
Phase 2: Payment processing + allocation
Phase 3: Aging reports + reconciliation
Phase 4: Bad debt + automation
