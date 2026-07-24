# Tax Engine Specification

**Version**: 1.0 | **Date**: 23/07/2026

## 1. Architecture

```
┌─────────────────────────────────────────────────┐
│                  Tax Engine                      │
├─────────────────────────────────────────────────┤
│  TaxPeriodManager  │  TaxCalculator              │
│  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │ Period       │  │  │ VATEngine            │  │
│  │ Definition   │  │  │ CITEngine            │  │
│  │ Lock/Unlock  │  │  │ PITEngine            │  │
│  │ Rollover     │  │  │ OtherTaxEngine       │  │
│  └──────────────┘  │  └──────────────────────┘  │
├─────────────────────────────────────────────────┤
│  TaxDeclarationGenerator  │  TaxIntegration      │
│  ┌──────────────────────┐ │  ┌────────────────┐  │
│  │ XMLBuilder           │ │  │ eTax Connector │  │
│  │ PDFGenerator         │ │  │ eInvoice Sync  │  │
│  │ HTKK Export          │ │  │ BHXH Sync      │  │
│  └──────────────────────┘ │  └────────────────┘  │
├─────────────────────────────────────────────────┤
│  Domain Layer (interfaces)                        │
└─────────────────────────────────────────────────┘
```

## 2. Core Domain Model

### 2.1 TaxPeriod
```
TaxPeriod {
  id: string
  companyId: string
  type: 'monthly' | 'quarterly' | 'yearly'
  year: number
  month?: number
  quarter?: number
  startDate: Date
  endDate: Date
  status: 'open' | 'locked' | 'finalized' | 'amended'
  vatMethod: 'khau_tru' | 'truc_tiep' | 'truc_tiep_gtgt'
  citRate: number
  isPillar2Applicable: boolean
}
```

### 2.2 TaxDeclaration
```
TaxDeclaration {
  id: string
  companyId: string
  taxPeriodId: string
  taxType: 'vat' | 'cit' | 'pit' | 'license' | 'sct' | 'resource' | 'env'
  formType: '01/GTGT' | '03/TNDN' | '05/QTT-TNCN' | '01/MBAI' | ...
  status: 'draft' | 'computed' | 'reviewed' | 'submitted' | 'adjusted'
  submissionMethod: 'xml' | 'htkk' | 'manual'
  xmlContent?: string
  submittedAt?: Date
  adjustmentNumber: number
  originalId?: string  // for adjusted returns
}
```

### 2.3 TaxLineItem
```
TaxLineItem {
  id: string
  taxDeclarationId: string
  lineCode: string       // e.g., "[23]" for VAT output
  label: string
  amount: number        // VND
  source: 'auto' | 'manual' | 'override'
  sourceTransactionIds: string[]
  notes?: string
}
```

## 3. VAT Engine

### 3.1 VAT Deduction Method (Phương pháp khấu trừ)

```
VAT Payable = VAT Output - VAT Input Deductible

Where:
  VAT Output = ∑(Sales by rate × rate)
    - Rate 0%: export goods/services
    - Rate 5%: essential goods (water, fertilizer, medicine, education)
    - Rate 8%: reduced rate per NĐ 174/2025/NĐ-CP (temporary)
    - Rate 10%: standard

  VAT Input Deductible = ∑(Purchase invoices meeting conditions)
    Conditions per NĐ 181/2025 Điều 26:
      - Valid e-invoice with GDT code
      - Invoice ≥ 5M VND: non-cash payment proof
      - Goods/services used for taxable activities
      - Declared within 6 months of issue date
      - Transport document (for goods)
```

### 3.2 VAT Direct Method (Phương pháp trực tiếp)

**On revenue (trên doanh thu):**
```
VAT Payable = Revenue × deemed rate (per industry)
  - Industry groups defined per GDT (e.g., 1% trading, 5% services)
```

**On value-add (trên GTGT):**
```
VAT Payable = (Sales price - Purchase price) × 10%
  (for gold, silver, precious stone trading only)
```

### 3.3 VAT Computation Flow

```
1. Collect output invoices for period
   → Group by VAT rate (0%/5%/8%/10%)
   → Sum taxable amount and VAT amount per rate
   → Map to 01/GTGT lines [23]-[32]

2. Collect input invoices for period
   → Filter by deduction conditions
   → Separate fully deductible vs partially deductible
   → Map to 01/GTGT lines [33]-[43]

3. Calculate
   → VAT payable = ∑Output - ∑Input
   → If negative → VAT refund/credit carried forward

4. Adjustments
   → Prior-period adjustments (toi thieu 6 thang)
   → Export VAT refund conditions
```

### 3.4 VAT Threshold Rules (2026)

| Condition | Rule |
|-----------|------|
| Revenue ≥ 500M/year | Must use deduction method (khấu trừ) |
| Revenue < 500M/year | Can choose direct method |
| Invoice ≥ 5M | Must have non-cash payment |
| Input declaration | Within 6 months from invoice date |
| VAT refund threshold | ≥ 300M after 12 months or 4 quarters |

## 4. CIT Engine

### 4.1 CIT Computation

```
CIT Payable = (Taxable Income - Loss Carryforward - S&T Fund) × CIT Rate - Foreign Tax Credit

Where:
  Taxable Income = Revenue - Deductible Expenses + Other Income
  
  Deductible Expenses (TT 20/2026/TT-BTC):
    - Actual expenses with valid invoices
    - Non-cash payment for ≥ 5M transactions
    - Expenses related to production/business
    - Depreciation per prescribed rates
    - Labor costs (salary, bonus, insurance)
  
  Non-Deductible Expenses:
    - Fines, penalties
    - Donations not to approved organizations  
    - Provisions exceeding prescribed limits
    - Interest expense exceeding 30% EBITDA (per transfer pricing rules)
    - Expenses without proper documentation
```

### 4.2 CIT Rate Determination

```
if revenue <= 3_000_000_000:
    rate = 15%
elif revenue <= 50_000_000_000:
    rate = 17%
else:
    rate = 20%
    
# Special cases
if industry == 'oil_gas':
    rate = 25% to 50%
elif has_incentive:
    rate = incentive_rate (10%, 15%, 17% depending on zone/sector)
elif pillar2_applicable:
    rate = max(rate, 15%)  // Global minimum tax
```

### 4.3 CIT Provisional (Quarterly)

```
Per Luật TNDN 2025: No quarterly return required.
Only PAYMENT based on estimate.

Quarterly Payment = Estimated CIT for year × 25%
  - Must pay ≥ 80% of actual annual CIT by year-end
  - Penalty if underpaid > 20%
```

### 4.4 Loss Carryforward

```
Carryforward period: max 5 consecutive years
Carryforward order: earliest loss first
Cannot carry back
Tracking per year:
  - Loss_2025 → can offset against 2026-2030 profits
  - Loss_2026 → can offset against 2027-2031 profits
```

## 5. PIT Engine

### 5.1 PIT for Employees (via company)

```
Monthly PIT = Progressive rate on Taxable Income

Taxable Income = Gross Salary - Mandatory Insurance - Family Deductions
  - Insurance: 8% Social Insurance + 1.5% Health + 1% Unemployment
  - Family deduction: 11M/month for taxpayer + 4.4M/dependent
  - Maximum rate: 35% (for income > 80M/month)
```

### 5.2 PIT for Business Households

```
Per Luật 109/2025/QH15:
  - Revenue threshold: 500M/year (up from 200M)
  - Presumptive tax abolished
  - Platform withholding mandatory (NĐ 117/2025)
```

## 6. Other Tax Engines

### 6.1 License Tax (Thuế môn bài)

```
if revenue > 500M/year OR charter_capital > 10B:
    fee = 3_000_000 VND
elif revenue > 300M/year:
    fee = 2_000_000 VND
elif revenue > 100M/year:
    fee = 1_000_000 VND
else:
    fee = 0 (exempt)
    
Deadline: 30 Jan annually
Branch: 50% of main rate
```

### 6.2 Special Consumption Tax (TTĐB)

```
Applies to: tobacco, alcohol, beer, cars, aircraft, yachts, gambling
Rates: 10% to 150% depending on product
IMPORT CHANGE (TT99): TK 1383 — TTĐB input deductible for imported goods
```

### 6.3 Environmental Tax (BVMT)

```
Applies to: petrol, coal, lubricant, pesticide, herbicide
Fixed rates per unit (e.g., petrol: 4,000 VND/liter)
```

## 7. Tax Calendar Engine

```
Schedule:
  Monthly: VAT, PIT
  Quarterly: VAT (if eligible), CIT provisional
  Yearly: CIT finalization, PIT finalization, BCTC, License tax
  
Smart Alerts:
  - 7 days before deadline
  - 1 day before deadline
  - Missed deadline escalation
  - Payment due reminders
  
Lock Logic:
  - Period auto-locks after 30 days from end
  - Manual unlock requires manager approval
  - Amended return creates new version
```

## 8. Adjustment & Amendment Rules

```
Original Return → Amendment:
  - Filed within 60 days: replace original
  - After 60 days: create separate amended return
  - VAT: within 6 months can adjust on next return
  - CIT: must file separate amended return
  
  Increase in tax payable:
    → Pay difference + late payment interest (0.03%/day)
  Decrease in tax payable:
    → Offset against future liability or request refund
```
