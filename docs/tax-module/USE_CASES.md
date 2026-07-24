# Use Cases — Tax Module

## UC-01: Monthly VAT Return (khấu trừ) — Happy Path

**Actor**: Tax Accountant
**Precondition**: All transactions for period posted; e-invoices synced

**Flow**:
1. User opens VAT screen → selects period (month)
2. System loads all output invoices from accounting — grouped by VAT rate
3. System loads all input invoices — filtered by 5M non-cash condition
4. System auto-calculates:
   - Total output VAT (lines [23]-[32])
   - Total input deductible (lines [33]-[43])
   - Net VAT payable/refund
5. User reviews line items — drill-down to source invoices
6. User adjusts any non-deductible input items (mark reason)
7. System updates calculation
8. User clicks "Generate Declaration" → 01/GTGT generated
9. System validates XML against GDT schema
10. User signs with digital signature (Token/HSM)
11. System submits to eTax portal
12. System receives GDT confirmation code
13. Status updated to "Submitted"
14. User generates payment order if tax payable > 0

**Postcondition**: VAT return filed; payment order queued

---

## UC-02: VAT with Non-Deductible Input — Alternative Path

**Actor**: Tax Accountant
**Trigger**: Input invoice fails 5M non-cash condition

**Flow**:
1. System identifies invoice ≥ 5M VND paid in cash
2. System marks as "Non-deductible — cash payment"
3. Invoice excluded from deductible input
4. Notification shown: "Invoice INV123 of 6,500,000 excluded — no bank transfer"
5. User can override if special case (per NĐ 181 Điều 26 khoản 2):
   - Electricity/water bill
   - Emergency purchase
   - Purchase from individual without bank account
6. Override logged to audit trail with justification
7. Calculation updated

---

## UC-03: VAT Refund Request — Exception Path

**Actor**: Tax Accountant
**Trigger**: Accumulated input VAT > output VAT for 12 consecutive months

**Flow**:
1. Dashboard shows eligible refund: 350,000,000 VND (≥ 300M threshold)
2. User initiates refund request
3. System generates:
   - Refund application form
   - Supporting document list
   - Input invoice summary
4. User verifies export documents (if export VAT refund)
5. System submits XML to GDT
6. GDT may request additional documents:
   - Customs declaration (for exports)
   - Bank statement showing foreign currency receipt
7. User uploads requested documents
8. GDT processes refund (15-40 days)
9. Status updated: "Refund approved" / "Refund rejected"

**Postcondition**: Refund status tracked; accounting entry for refund recorded

---

## UC-04: CIT Provisional (Quarterly) — Happy Path

**Actor**: Tax Accountant
**Precondition**: Quarter-end posted

**Flow**:
1. User opens CIT → "Quarterly Estimate"
2. System computes:
   - Revenue (from P&L)
   - Deductible expenses
   - Estimated taxable income
   - Estimated CIT (rate 15%/17%/20%)
   - Less: estimated tax from Q1-Q3 (if applicable)
3. System flags non-deductible items (marked as "CP không hợp lý")
4. User reviews and adjusts
5. System generates payment amount
6. User authorizes bank payment via eTax
7. System records payment against period

**Note**: No return filing required per Luật TNDN 2025

---

## UC-05: CIT Annual Finalization (03/TNDN) — Happy Path

**Actor**: Tax Accountant
**Precondition**: Fiscal year closed; BCTC finalized

**Flow**:
1. User opens "Annual CIT Finalization"
2. System loads:
   - P&L data → 03-1A/TNDN
   - Prior-year loss carryforward → 03-2A/TNDN
   - CIT incentives applied
3. System auto-fills:
   - Revenue [A1]
   - Expenses [A2-A6]
   - Taxable income [B1-B14]
   - Loss carryforward [C1-C5]
   - CIT payable [D1-D6]
4. User manually enters:
   - [B2] Non-taxable income
   - [B9] Interest expense limitation
   - [C2] Previously registered loss amounts
   - [G] Adjustment reason (if applicable)
5. System validates: CIT provisional ≥ 80% of final
6. If underpayment > 20% → penalty warning
7. User generates XML → signs → submits
8. System calculates difference (paid vs. actual):
   - Overpaid → request offset
   - Underpaid → payment + interest

---

## UC-06: PIT Monthly Declaration — Happy Path

**Actor**: Payroll Accountant
**Precondition**: Monthly payroll processed

**Flow**:
1. System loads payroll data
2. System calculates per employee:
   - Gross income
   - Mandatory deductions (SI/HI/UI)
   - Family deductions
   - Taxable income
   - PIT per progressive table
3. System aggregates for company
4. User reviews summary by employee
5. User generates declaration
6. System submits via eTax
7. Payment order generated if applicable

---

## UC-07: Electronic Deduction Certificate Management

**Actor**: Payroll Accountant
**Regulation**: NĐ 70/2025/NĐ-CP

**Flow**:
1. Employee requests deduction certificate
2. System generates electronic certificate
3. System creates XML + PDF
4. Certificate digitally signed
5. Sent to employee via email/VNeID
6. Sent to GDT portal automatically
7. Status: "Issued" with GDT confirmation code

---

## UC-08: Tax Period Lock/Unlock — Administrative

**Actor**: Chief Accountant

**Flow**:
1. Tax period auto-closes 30 days after end
2. User can request unlock (with reason)
3. System requires manager approval (2FA)
4. Audit log: who unlocked, when, why
5. All entries in unlocked period flagged as "Post-period adjustment"

---

## UC-09: Adjust/Amend Filed Return

**Actor**: Tax Accountant
**Trigger**: Error discovered in filed return

**Flow**:
1. User opens previously filed return
2. Selects "Adjustment" → creates new version
3. Amended copy created with original reference
4. Increase in tax:
   - Calculate difference + 0.03%/day late interest
   - Generate additional payment
5. Decrease in tax:
   - Offset against current period
   - Or request refund
6. Re-submit amended XML to GDT
7. GDT returns new confirmation code

---

## UC-10: Tax Dashboard — Executive View

**Actor**: CFO / Chief Accountant

**Flow**:
1. Dashboard shows:
   - Current tax position (all taxes)
   - Upcoming deadlines (next 30/60/90 days)
   - Late items (red alerts)
   - Tax cash outflow forecast
   - VAT payable/refund status
   - CIT provisional vs. actual tracking
2. Click on any item → drill-down report
3. Export to Excel/PDF

---

## UC-11: eTax Integration — Submit XML

**Actor**: System (automated)

**Flow**:
1. Declaration XML generated per GDT schema
2. System connects to eTax API (thuedientu.gdt.gov.vn)
3. Mutual TLS authentication (client cert)
4. XML payload sent
5. GDT validates schema
6. Success → receive confirmation code + timestamp
7. Failure → parse error code → display user message
8. Retry logic: 3 attempts with exponential backoff

---

## UC-12: eInvoice Sync — Input Invoices

**Actor**: System (automated)

**Flow**:
1. System connects to eInvoice provider API
2. Fetches input invoices for period
3. Matches by MST (tax code) + invoice number
4. Auto-categorizes:
   - Deductible (non-cash ≥ 5M)
   - Non-deductible (cash)
   - Waiting payment proof
5. Creates purchase journal entry draft
6. Accountant reviews and confirms

---

## UC-13: Multi-Tax Return in One Period

**Actor**: Tax Accountant
**Trigger**: Month-end with multiple tax obligations

**Flow**:
1. System detects all tax types due for period
2. Batch computation: VAT + PIT simultaneously
3. Each return generated independently
4. Payment consolidated per tax type
5. Submission order: VAT → PIT → Others
6. Single dashboard showing all statuses

---

## UC-14: Tax Holiday/Incentive Management

**Actor**: Tax Accountant

**Flow**:
1. System tracks incentive periods per company
2. Applicable incentives:
   - New enterprise: tax exemption 3 years (NĐ 20/2026)
   - High-tech zone: CIT 10% for 15 years
   - SME: 15% CIT rate
   - Export processing zone: VAT 0%
3. System auto-applies to computation
4. Reports show tax saved per incentive
5. Expiry warnings 6 months before

---

## UC-15: Global Minimum Tax (Pillar 2) — Preparation

**Actor**: CFO / Tax Manager
**Complexity**: HIGH

**Flow**:
1. System flags if parent company revenue ≥ 750M EUR
2. Computes effective tax rate per country
3. If ETR < 15% → computes top-up tax
4. Generates GloBE information return
5. Current status: **Not yet effective in VN law** (monitoring)
6. System maintains readiness framework
