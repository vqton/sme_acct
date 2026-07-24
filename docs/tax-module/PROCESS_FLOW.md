# Tax Module — Processes, Dataflows & Workflows

## 1. End-to-End Tax Cycle (Monthly)

```
┌────────────────────────────────────────────────────────────────┐
│                        DAILY OPERATIONS                         │
├────────────────────────────────────────────────────────────────┤
│  Sales Invoice → Auto-record output VAT (33311)               │
│  Purchase Invoice → Auto-record input VAT (1331/1332)          │
│  Payment ≥ 5M → Flag non-cash condition                       │
│  Manual adjustment → Allow tax override with audit trail       │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     PERIOD CLOSING (EOM/EOQ)                     │
├────────────────────────────────────────────────────────────────┤
│  1. Generate invoice usage report (Báo cáo tình hình SD HĐ)    │
│  2. Reconcile input invoices with GDT portal                   │
│  3. Reconcile output invoices with issued e-invoices           │
│  4. Flag unmatched items → manual review                       │
│  5. Lock period for further posting                            │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    TAX COMPUTATION                                │
├────────────────────────────────────────────────────────────────┤
│  VAT: Auto-compute output - input = payable/refund              │
│  CIT: Auto-compute estimated quarterly                         │
│  PIT: Auto-compute per employee + aggregate                     │
│  Other: License/SCT/Resource/Environmental                      │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     REVIEW & ADJUST                               │
├────────────────────────────────────────────────────────────────┤
│  Chief Accountant reviews line items                            │
│  Adjust non-deductible items with justification                 │
│  Verify loss carryforward amounts                               │
│  Check CIT incentive eligibility                                │
│  Approve release                                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                  DECLARATION GENERATION                           │
├────────────────────────────────────────────────────────────────┤
│  Generate XML per GDT schema (TT80)                             │
│  Generate PDF for company records                               │
│  Generate supporting schedules                                  │
│  Digital signature applied                                      │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   SUBMISSION                                      │
├────────────────────────────────────────────────────────────────┤
│  Submit to eTax via API                                         │
│  Receive GDT confirmation                                       │
│  If fail → parse error → correct → resubmit                     │
│  If payment due → generate payment order                        │
│  Link to bank gateway for payment                               │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    RECONCILIATION                                 │
├────────────────────────────────────────────────────────────────┤
│  Match paid amounts with GDT records                            │
│  Track refund requests                                          │
│  VAT reconciliation with BCTC                                   │
│  CIT provisional vs final reconciliation                        │
│  Archive period                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Accounting  │────▶│   Tax Engine    │────▶│  Declaration     │
│  Module      │     │   (Calculation) │     │  Generator       │
│              │     │                 │     │                  │
│  - Sales     │     │  VATEngine      │     │  XML Builder     │
│  - Purchases │     │  CITEngine      │     │  PDF Builder     │
│  - Payroll   │     │  PITEngine      │     │  Supporting Docs │
│  - GL        │     │  OtherTaxEngine │     │                  │
└──────┬───────┘     └────────┬────────┘     └────────┬─────────┘
       │                      │                       │
       │              ┌───────▼────────┐              │
       │              │  Tax Rules     │              │
       │              │  Repository    │              │
       │              │                │              │
       │              │  - Rate tables │              │
       │              │  - Thresholds  │              │
       │              │  - Deadlines   │              │
       │              │  - Incentives  │              │
       │              └────────────────┘              │
       │                                             │
       │              ┌──────────────────┐           │
       │              │   Integration    │◀──────────┘
       │              │   Layer          │
       │              │                  │
       │              │  eTax API        │◀──▶ GDT Portal
       │              │  eInvoice API    │◀──▶ eInvoice Provider
       │              │  Bank Gateway    │◀──▶ Bank
       │              │  BHXH Portal     │◀──▶ Social Insurance
       │              │  Customs Portal  │◀──▶ Customs
       │              └──────────────────┘
```

## 3. VAT Dataflow Detail

```
INPUT STREAM:
  Purchase Invoice (Accounting)
    → Split: deductible goods (1331) vs non-deductible (1332)
    → Check amount: < 5M (always deductible) vs ≥ 5M (needs bank proof)
    → Check declaration deadline: within 6 months
    → Valid input → add to VAT Input Pool for period
    → Invalid → flag for manual review

OUTPUT STREAM:
  Sales Invoice (Accounting)
    → Identify VAT rate (0%/5%/8%/10%)
    → Split: taxable amount vs VAT amount
    → Add to VAT Output Pool for period
    → Check: export (0% rate) needs customs docs

CALCULATION:
  Input Pool (deductible) - Output Pool (by rate)
  → if result > 0: VAT Payable
  → if result < 0: VAT Refund/Carryforward
  → Check refund threshold: ≥ 300M after 12 months
```

## 4. CIT Dataflow Detail

```
P&L DATA → Tax Adjustment Engine:
  Revenue [A1]                     → from P&L (Doanh thu bán hàng)
  (-) Expenses [A2-A6]             → from P&L (Tổng chi phí)
  (+) Tax adjustments              → from manual mark-up
  
  Non-deductible expenses:
    - Fines, penalties             → add back [A6]
    - Excess provisions            → add back [A5]
    - Non-business donations       → add back [A4]
    - Personal expenses            → add back [A3]
    - Interest > 30% EBITDA        → add back [B9]
  
  = Taxable Income [B14]
  (-) Loss carryforward [C]        → max 5 years, earliest first
  (-) S&T Fund [D2]                → if applicable
  = Net Taxable Income
  
  × CIT Rate (15%/17%/20%)
  = CIT Payable [D6]
  
  (-) Foreign Tax Credit [D7]      → if applicable
  (-) Provisional Paid [D8]        → from quarterly payments
  = CIT Due/Refund [D10]
```

## 5. PIT Dataflow Detail

```
Per Employee:
  Gross Salary [A1]
  (-) Mandatory Insurance:
      - Social Insurance 8% [A2]
      - Health Insurance 1.5% [A3]  
      - Unemployment Insurance 1% [A4]
  (-) Family Deduction:
      - Taxpayer: 11,000,000/month [A5]
      - Dependents: 4,400,000/dependent/month [A6]
  (-) Voluntary Pension Fund (if any) [A7]
  = Taxable Income [A8]
  
  Apply Progressive Table:
    0 - 5M:      5%
    5M - 10M:    10%
    10M - 18M:   15%
    18M - 32M:   20%
    32M - 52M:   25%
    52M - 80M:   30%
    > 80M:       35%
  
  = PIT per Employee
  
Company Total:
  ∑(PIT per Employee) - Non-resident PIT = Total PIT Payable
```

## 6. Tax Calendar Workflow

```
START
  │
  ├── Monthly (Day 1-5): 
  │     Collect e-invoices from previous month
  │     Reconcile with GDT portal
  │
  ├── Monthly (Day 6-15):
  │     Compute VAT
  │     Compute PIT
  │     Generate declarations
  │     Review cycle
  │
  ├── Monthly (Day 16-20):
  │     Sign declarations
  │     Submit to eTax
  │     Pay tax (if any)
  │     Deadline: Day 20
  │
  ├── Quarterly (Day 1-15 after quarter):
  │     CIT provisional estimate
  │     Pay CIT (no return)
  │     Invoice usage report
  │     Deadline: Day 30
  │
  └── Yearly (Day 1-90 after FY):
        Inventory count
        Annual BCTC preparation
        CIT finalization (03/TNDN)
        PIT finalization (05/QTT-TNCN)
        Tax finalization submission
        Deadline: Day 90
```

## 7. Audit Trail Requirements

Every tax operation logged:
- user, timestamp, action
- Before/after values
- Reason for adjustment
- Supporting document references
- Approval chain (if override/exception)
- Source transaction IDs

## 8. Error Handling & Recovery

| Error | Detection | Recovery |
|-------|-----------|----------|
| GDT connection timeout | HTTP timeout | Retry 3x, fallback to manual export |
| XML validation error | Schema check | Highlight exact line + expected value |
| Payment gateway failure | API error | Queue payment, retry every 30 min |
| Signature token unavailable | Service error | Queue for signing, notify user |
| Duplicate submission | GDT error code | Check status, link to existing |
| Rate limit exceeded | HTTP 429 | Backoff, auto-retry after 60s |
