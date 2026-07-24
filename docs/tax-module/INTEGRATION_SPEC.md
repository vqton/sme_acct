# Integration Specification — Tax Module

## 1. eTax Integration (thuedientu.gdt.gov.vn)

### 1.1 Connection
- Protocol: HTTPS mutual TLS
- Auth: Digital certificate (Token/HSM) from licensed CA (VNPT, Viettel, BKAV, etc.)
- API Base: `https://thuedientu.gdt.gov.vn/api/v2/`
- Format: XML + SOAP envelope (legacy) / RESTful JSON (newer)

### 1.2 Declarations
| Form Type | XML Schema | Endpoint |
|-----------|-----------|----------|
| 01/GTGT | `01_GTGT.xsd` | `/declaration/vat` |
| 03/TNDN | `03_TNDN.xsd` | `/declaration/cit` |
| 05/QTT-TNCN | `05_QTT_TNCN.xsd` | `/declaration/pit` |
| 01/MBAI | `01_MBAI.xsd` | `/declaration/license` |
| Invoice usage | `BCTH_SDHD.xsd` | `/declaration/invoice-usage` |
| 01/CNKD | `01_CNKD.xsd` | `/declaration/business-household` |

### 1.3 API Operations
```
submitDeclaration(xml: string, certId: string, taxCode: string)
  → { confirmationCode, submissionId, timestamp }
  
checkStatus(submissionId: string)
  → { status: 'pending' | 'accepted' | 'rejected', message, errorCode }
  
getConfirmation(submissionId: string)
  → { confirmationXml, pdfReceipt }
  
requestRefund(refundData: RefundRequest)
  → { refundId, status }
  
queryTaxDebt(taxCode: string, taxType: string)
  → { totalDebt, overdueAmount, breakdown }
  
makePayment(paymentData: TaxPayment)
  → { paymentId, bankTransactionId, receiptUrl }
```

### 1.4 XML Generation Rules
- UTF-8 encoded
- Schema version per GDT latest (currently TT80)
- Digital signature: XML-DSig enveloped
- Namespace: `http://www.gdt.gov.vn/schemas/`
- Company info: from company registration data
- Period info: from tax period definition
- Line items: from computation engine

## 2. eInvoice Integration

### 2.1 Supported Providers (Phase 1)
- MISA mTax / M-Invoice
- Viettel (VAS)
- VNPT (Einvoice)
- Fast e-Invoice
- WeTax
- BKAV eCA
- Others via standard API

### 2.2 Input Invoice Sync
```
Source: eInvoice provider API (or GDT portal sync)
Frequency: Daily (automated) or On-demand

Data:
  - Invoice number, series, date
  - Seller tax code, name
  - Buyer tax code, name
  - Line items: description, quantity, unit price
  - VAT rate, VAT amount
  - Total amount (incl/excl VAT)
  - Payment status
  - GDT confirmation code

Flow:
  1. Fetch invoices from provider
  2. Match to existing purchase orders (if available)
  3. Check deduction conditions:
     - Valid GDT code
     - Non-cash payment (if ≥ 5M)
     - Within 6-month deadline
  4. Create draft journal entry
  5. Flag for accountant review
```

### 2.3 Output Invoice Verification
```
For each sales invoice:
  1. After issuance, verify with GDT portal:
     - Tax code valid
     - Invoice status: "Đã phát hành"
  2. If error → notify accountant
  3. Link invoice to tax return output line
```

## 3. e-Social Insurance Integration (baohiemxahoi.gov.vn)

### 3.1 Data Sync
```
Bidirectional:
  - Employee list sync (from company → BHXH)
  - Contribution rates (BHXH/HIV/UIF) → PIT engine
  - Payment confirmation → accounting

Frequency: Monthly (before payroll)
```

## 4. Customs Integration (customs.gov.vn) — Phase 2

### 4.1 Import Data
```
For VAT input on imports:
  - Customs declaration number
  - Import duty paid
  - VAT on imports paid
  - Method: auto-fetch from customs system
  
For CIT:
  - Export revenue verification (0% VAT rate)
  - Supporting docs for export VAT refund
```

## 5. Bank Integration

### 5.1 Tax Payment
```
Channel: Direct bank API (or VCB/TCB/BIDV/Agribank gateways)
  - Generate payment order
  - NSNN (State Budget) account
  - Content: tax code + tax type + period
  - Receive confirmation → auto-update tax ledger
```

## 6. National Public Service Portal (dichvucong.gov.vn)

### 6.1 Corporate e-ID Integration
```
Per NĐ 69/2024/NĐ-CP:
  - All companies must use corporate e-ID for admin procedures
  - Integration for tax registration updates
  - Digital signature verification
```

## 7. VNeID Integration

### 7.1 Personal Identity
```
For PIT:
  - Employee PIN (personal identification number, replaces TIN since July 2025)
  - Verify dependent identity
  - Auto-fill personal info from national database
```

## 8. Accounting Module Integration (Internal)

### 8.1 Data Sources
```
From Accounting → Tax Engine:
  - Sales transactions (doanh thu)
  - Purchase transactions (mua hàng)
  - Payroll data (lương)
  - Asset transactions (TSCĐ)
  - Currency exchange differences
  - Prior-period adjustments
  
From Tax Engine → Accounting:
  - Tax provision journal entries
  - Tax payment entries
  - Tax refund entries
  - Penalty/interest entries
  - Adjustment entries
```

### 8.2 Chart of Accounts Mapping (TT99)
```
Tax-related accounts:
  1331  — VAT input (deductible goods)
  1332  — VAT input (deductible services)
  1383  — TTĐB input (new in TT99)
  243   — Deferred tax asset
  347   — Deferred tax liability
  3331  — VAT payable (33311 output, 33312 import)
  3332  — SCT payable
  3333  — Import duty payable
  3334  — CIT payable
  3335  — PIT payable
  3336  — License tax
  3337  — Environmental tax
  3338  — Resource tax
  3339  — Other taxes
  8211  — CIT expense current (82111, 82112 sub-accounts)
  8212  — CIT expense deferred
```

## 9. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Digital signature | PKCS#11 (Token) / REST (HSM) |
| API authentication | mTLS + OAuth2 |
| Audit logging | Immutable DB log |
| Role-based access | Tax Admin, Tax Viewer, Tax Approver |
| Data encryption | At rest (AES-256) + In transit (TLS 1.3) |
| Session timeout | 15 min idle |
| MFA | Required for submission and amendment |
| IP whitelisting | For API connections to GDT |
