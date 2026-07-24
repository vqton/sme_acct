# PROD Readiness Assessment — Current Tax Capability

**Date**: 23/07/2026 | **Reviewer**: BA Lead + Chief Accountant (20+ years)

## Verdict: ❌ NOT PROD READY — Critical Gaps Found

Current system **cannot operate in production** for Vietnamese SME tax compliance. Tax module absent entirely. Below: detailed gap analysis, risk assessment, implementation roadmap.

---

## 1. Gap Analysis

### 1.1 What Exists (Accounting Module Only)
| Feature | Status | Notes |
|---------|--------|-------|
| Chart of Accounts | ✅ TT99 compatible | CoA seeded per `STANDARD_ACCOUNTS_TT99` including tax accounts (3331, 3334, etc.) |
| Journal Entry | ✅ Basic | Can record tax-related entries manually |
| General Ledger | ✅ Basic | Supports ledger queries |
| Fiscal Period | ✅ Basic | Month/quarter/year periods |
| Audit Trail | ✅ Basic | Audit log repository exists |
| Basic Account CRUD | ✅ Full | Accounts controller with search/filter |

### 1.2 What's Missing (Critical)
| Feature | Priority | Impact |
|---------|----------|--------|
| **Tax Engine** — VAT/CIT/PIT calculation | P0 | ⛔ Cannot compute tax automatically |
| **VAT Input/Output Management** | P0 | ⛔ Cannot track deductible vs non-deductible |
| **Tax Declaration Generation** | P0 | ⛔ Cannot generate 01/GTGT, 03/TNDN, etc. |
| **XML Generation + GDT Schema** | P0 | ⛔ Cannot submit to eTax |
| **Digital Signature Integration** | P0 | ⛔ Cannot sign declarations |
| **eTax Portal Integration** | P0 | ⛔ Cannot submit electronically |
| **eInvoice Integration** | P0 | ⛔ Cannot sync input/output invoices |
| **Tax Period Lifecycle** | P1 | Cannot lock/finalize periods |
| **Non-Deductible Tracking** | P1 | Cannot mark expenses as non-deductible |
| **Loss Carryforward** | P1 | Cannot track/apply losses |
| **CIT Provisional Calculation** | P1 | Cannot estimate quarterly CIT |
| **PIT Progressive Table** | P1 | Cannot compute employee PIT |
| **Tax Reports** | P1 | Cannot generate tax reports |
| **Tax Dashboard** | P2 | Cannot show tax position |
| **Deadline Alerts** | P2 | Risk of late filing penalties |
| **Payment Integration** | P2 | Cannot pay tax from system |
| **Corporate e-ID** | P2 | Required per NĐ 69/2024 |
| **Tax Holiday/Incentive** | P2 | Cannot apply incentives |

### 1.3 Market Comparison

| Feature | SME Acct (Current) | MISA AMIS | FAST | BRAVO |
|---------|-------------------|-----------|------|-------|
| VAT input/output | ❌ | ✅ Auto | ✅ Auto | ✅ Auto |
| VAT return 01/GTGT | ❌ | ✅ XML | ✅ XML | ✅ XML |
| CIT provisional | ❌ | ✅ Auto | ✅ Auto | ✅ Auto |
| CIT finalization | ❌ | ✅ 03/TNDN | ✅ 03/TNDN | ✅ 03/TNDN |
| PIT declaration | ❌ | ✅ 05/QTT | ✅ | ✅ |
| eTax submission | ❌ | ✅ mTax | ✅ | ✅ |
| eInvoice sync | ❌ | ✅ 100+ banks | ✅ | ✅ |
| Digital signature | ❌ | ✅ Token/HSM | ✅ Token/HSM | ✅ |
| TT99 ready | Partial (CoA) | ✅ Full | ✅ Full | ✅ Full |
| IFRS readiness | ❌ | ✅ | Partial | Partial |

---

## 2. Risk Assessment

### 2.1 Regulatory Compliance Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Late filing penalties (0.03%/day) | **HIGH** — manual only | Financial + reputation | Implement tax calendar + alert system |
| Incorrect VAT return | **HIGH** — no engine | Penalty 20% underpaid | Build VAT engine first |
| Missed new TT99 accounts | **HIGH** — CoA only partially | Financial statement wrong | Complete CoA migration |
| PIN not enforced | **MED** — system still uses TIN | Rejected declarations | Add PIN field, migrate TIN→PIN |
| Non-cash condition checks | **HIGH** — no tracking | Wrong deduction | Implement payment method tracking |
| E-invoice not synced | **HIGH** — no integration | Manual re-entry, errors | eInvoice API integration |

### 2.2 Operational Risks
| Risk | Description |
|------|-------------|
| User trust | Accountants won't trust manual tax computation |
| Competitive disadvantage | Losing to MISA/FAST/BRAVO |
| Market positioning | Cannot claim "accounting software" without tax module |
| Audit failure | No audit trail for tax adjustments |

---

## 3. Minimum Viable Product (MVP) Definition

### Phase 1 (Weeks 1-4) — Core Tax Foundation
```
Must have to go to PROD:
  □ Tax Engine: VAT calculation (khấu trừ method)
  □ VAT Input/Output management with non-cash tracking
  □ 01/GTGT generation (XML + PDF)
  □ eTax submission (sign + send)
  □ Tax period lifecycle (open → lock → finalize)
  □ Digital signature integration (Token/HSM)
```

### Phase 2 (Weeks 5-8) — CIT + PIT
```
  □ CIT provisional quarterly estimate
  □ CIT annual finalization 03/TNDN
  □ Loss carryforward engine
  □ PIT monthly/quarterly computation
  □ PIT annual finalization 05/QTT-TNCN
  □ Progressive tax table
```

### Phase 3 (Weeks 9-12) — Integration + Completeness
```
  □ eInvoice input sync (top 3 providers)
  □ eTax payment gateway
  □ Tax dashboard
  □ Deadline calendar + alerts
  □ Other taxes (license, SCT, resource, environmental)
  □ Invoice usage report
  □ Corporate e-ID integration
```

---

## 4. Key Implementation Points

### 4.1 Architecture Decisions
```
1. New module: TaxModule (paralleling existing AccountingModule)
2. 3 new services: TaxEngineService, TaxDeclarationService, TaxIntegrationService
3. DB tables: tax_periods, tax_declarations, tax_line_items, tax_input_invoices, tax_output_invoices
4. New domain entities: TaxPeriod, TaxDeclaration, TaxLineItem, InputInvoice, OutputInvoice
5. Integration layer: separate module for external API calls
```

### 4.2 Dependencies
```
Current AccountingModule → TaxModule:
  - Journal entries → VAT calculation
  - P&L data → CIT calculation
  - Payroll data → PIT calculation
  - Account balances → Tax reports
  
New dependencies needed:
  - eTax API client
  - eInvoice API client
  - Digital signature SDK (PKCS#11)
  - XML schema validator
  - Bank payment gateway
```

### 4.3 Database Changes
```sql
-- New tables needed:
tax_periods          -- extends current fiscal_periods with tax-specific fields
tax_declarations     -- one per filing (original + amendments)
tax_line_items       -- line items within declaration
tax_input_invoices   -- tracked input VAT invoices with conditions
tax_output_invoices  -- tracked output VAT invoices by rate
tax_adjustments      -- manual adjustments with reasons
tax_loss_carryforward -- CIT loss tracking
tax_incentives       -- company-specific tax incentives
tax_payments         -- payment records linked to declarations
```

---

## 5. Critical Path

```
Week 1: Tax domain model + DB schema + repositories
Week 2: VAT engine (khấu trừ) + 01/GTGT generation
Week 3: eTax XML + digital signature + submission
Week 4: Tax period lifecycle + dashboard
     → [GATE: VAT PROD READY]
Week 5: CIT engine + 03/TNDN
Week 6: Loss carryforward + CIT incentives
Week 7: PIT engine + progressive table + 05/QTT
Week 8: PIT deduction certificates + report
     → [GATE: FULL TAX PROD READY]
Week 9-12: Integrations + polish + testing
```

---

## 6. Conclusion

**Cannot operate in production.** Current system lacks entire tax compliance capability — equivalent to a calculator with no arithmetic logic. Minimum 4 weeks of intensive development needed for VAT-only MVP.

Without tax module, system is an **accounting bookkeeper** not a **full accounting system**. Competitors (MISA, FAST, BRAVO) have mature tax modules. Market will reject system as incomplete.

**Recommendation**: Implement Phase 1 immediately, target PROD release with VAT-only in 4 weeks, then iterative CIT/PIT/integrations.
