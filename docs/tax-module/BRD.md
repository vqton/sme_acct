# BRD: Tax Module — Hệ thống Thuế SME Accounting

**Version**: 1.0 | **Date**: 23/07/2026 | **Status**: Draft
**Author**: BA Lead + Chief Accountant (20+ years)

## 1. Executive Summary

Build dedicated Tax Module for Vietnamese SME accounting system. Current app missing tax engine — tax handled manually via journal entries. Must automate VAT, CIT, PIT, and other tax compliance end-to-end per 2025-2026 regulations.

## 2. Regulatory Basis (All Active)

### 2.1 Core Tax Laws
| Law | Code | Effective | Key Content |
|-----|------|-----------|-------------|
| Luật Thuế GTGT | 48/2024/QH15 | 01/07/2025 | VAT law, rates 0%/5%/10%, deduction method |
| Luật Thuế TNDN | 67/2025/QH15 | 2025 | CIT law, rates 15%/17%/20%/25-50% |
| Luật Quản lý thuế | 108/2025/QH15 | 01/07/2026 | Tax admin, e-invoice, digital transformation |
| Luật TNCN | 109/2025/QH15 | 01/07/2026 | PIT law, progressive rates |
| Luật sửa 4 luật thuế | 09/2026/QH16 | 24/04/2026 | Amend PIT/VAT/CIT/SCT, revenue thresholds |

### 2.2 Implementing Decrees & Circulars
| Document | Effective | Scope |
|----------|-----------|-------|
| NĐ 181/2025/NĐ-CP | 01/07/2025 | VAT guidance (threshold 5M VND for non-cash) |
| NĐ 320/2025/NĐ-CP | 15/12/2025 | CIT guidance |
| NĐ 174/2025/NĐ-CP | 2025 | VAT reduction 8% |
| NĐ 144/2026/NĐ-CP | 05/05/2026 | Amends NĐ 181 VAT |
| NĐ 70/2025/NĐ-CP | 2025 | E-invoice mandate, POS-connected |
| NĐ 117/2025/NĐ-CP | 2025 | Platform withholding tax |
| NĐ 20/2026/NĐ-CP | 2026 | CIT incentives |
| TT 99/2025/TT-BTC | 01/01/2026 | **Accounting regime** — replaces TT200 |
| TT 69/2025/TT-BTC | 01/07/2025 | VAT detailed guidance |
| TT 20/2026/TT-BTC | 12/03/2026 | CIT guidance (applies from 2025 tax year) |
| TT 80/2026/TT-BTC | 2026 | Tax declaration forms |
| TT 152/2025/TT-BTC | 01/01/2026 | Accounting for business households |
| TT 78/2025/TT-BTC | 2025 | Electronic receipts |

## 3. Business Problem

### 3.1 Current State
- No tax module — tax transactions recorded manually in accounting
- No automatic VAT input/output tracking
- No CIT provisional calculation
- No PIT calculation
- No eTax/eInvoice integration
- No tax period management
- No tax report generation (01/GTGT, 03/TNDN, 05/QTT-TNCN)

### 3.2 Pain Points
- Accountants manually compute VAT deduction
- Tax returns typed into HTKK separately
- High error rate in CIT provisional estimates
- Late filing penalties (0.03%/day on late payment per Luật Quản lý thuế)
- Audit trail missing for tax adjustments

## 4. Scope

### 4.1 In Scope
- **VAT Module**: Declaration method (khấu trừ) + Direct method (trực tiếp)
  - VAT input tracking with deduction conditions (5M non-cash threshold)
  - VAT output tracking by rate (0%/5%/8%/10%)
  - VAT return 01/GTGT generation + XML
  - VAT refund management
- **CIT Module**: 
  - CIT provisional quarterly estimation
  - CIT annual finalization 03/TNDN
  - Tax-loss carryforward (5 years)
  - Deductible/non-deductible expense tracking
  - CIT incentive management
  - Global minimum tax (Pillar 2) readiness
- **PIT Module**:
  - Monthly/quarterly PIT declaration
  - Annual PIT finalization 05/QTT-TNCN
  - Progressive tax table
  - Dependent person tracking
  - Electronic deduction certificate (NĐ 70/2025)
- **Other Taxes**:
  - License tax (môn bài)
  - Special consumption tax (TTĐB)
  - Resource tax (tài nguyên)
  - Environmental tax (BVMT)
  - Property tax (optional)
- **Tax Period Engine**: Monthly/quarterly/yearly cycles
- **eTax Integration**: XML generation → GDT portal
- **eInvoice Integration**: Input invoice sync, output invoice verification
- **Tax Reports**: All standard templates per TT80
- **Tax Dashboard**: Real-time tax position, deadlines, alerts

### 4.2 Out of Scope (v1)
- Transfer pricing documentation (Phase 2)
- Cross-border tax (Phase 2)  
- Customs valuation engine
- Blockchain-based tax reporting

## 5. Stakeholders

| Role | Interest |
|------|----------|
| Chief Accountant | Accurate tax computation, on-time filing |
| Tax Accountant | Daily tax operations, reconciliation |
| CFO | Tax position, cash flow, risk |
| External Auditor | Tax provision audit trail |
| Tax Authority (GDT) | XML standard compliance |
| CEO | Penalty avoidance, tax optimization |

## 6. Success Criteria

1. Auto-generate 01/GTGT from posted transactions — zero manual entry
2. Auto-calculate CIT provisional — accuracy within 95% of final
3. Reduce tax filing time by 80% (from 8h to 1.5h per period)
4. Zero late-filing penalties
5. Full audit trail for every tax adjustment
6. XML output passes GDT validation

## 7. Key Regulatory Requirements

### 7.1 VAT Deduction Conditions (NĐ 181 Điều 26)
- Invoice ≥ 5M VND: must have non-cash payment proof
- Input invoice: 6-month deadline for declaration
- Output invoice: time of goods transfer/service completion
- Transport document required for goods

### 7.2 CIT Rates (Luật TNDN 2025 Điều 10)
| Revenue | Rate |
|---------|------|
| ≤ 3 tỷ | 15% |
| > 3 tỷ - 50 tỷ | 17% |
| > 50 tỷ (standard) | 20% |
| Special industries | 25-50% |

### 7.3 Tax Filing Deadlines
| Return | Frequency | Deadline |
|--------|-----------|----------|
| VAT (monthly) | Monthly | Day 20 of next month |
| VAT (quarterly) | Quarterly | Day 30 of next quarter |
| CIT provisional | Quarterly | Day 30 of next quarter (payment only, no return) |
| CIT finalization | Yearly | Day 90 after FY end |
| PIT (monthly) | Monthly | Day 20 of next month |
| PIT finalization | Yearly | Day 90 after FY end |
| License tax | Yearly | Day 30 January |
| Invoice usage | Quarterly | Day 30 of next quarter |

## 8. Assumptions & Constraints

- Accounting entries must be posted before tax computation
- VAT method (khấu trừ/trực tiếp) chosen at company setup, locked per fiscal year
- Tax periods align with accounting periods
- XML format per GDT specification (latest: TT80)
- E-invoice provider already selected by client
- Company registered for eTax (thuedientu.gdt.gov.vn)
- Digital signature (Token/HSM) available
