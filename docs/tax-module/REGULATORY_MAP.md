# Regulatory Map — Tax Module Compliance Matrix

## 1. Active Regulations Status (As of July 2026)

| Regulation | Status | Effective | Supersedes | Relevance |
|-----------|--------|-----------|------------|-----------|
| Luật GTGT 48/2024/QH15 | **Active** | 01/07/2025 | Luật GTGT 13/2008 | VAT foundation |
| Luật TNDN 67/2025/QH15 | **Active** | 2025 | Luật TNDN 14/2008 | CIT foundation |
| Luật Quản lý thuế 108/2025/QH15 | **From 01/07/2026** | 01/07/2026 | Luật 38/2019 | Tax admin, APA |
| Luật TNCN 109/2025/QH15 | **From 01/07/2026** | 01/07/2026 | Luật TNCN 04/2007 | PIT reform |
| Luật 09/2026/QH16 | **Active** | 24/04/2026 (01/01/2026 for tax) | Amend 4 laws | Threshold changes |
| NĐ 181/2025/NĐ-CP | **Active** | 01/07/2025 | NĐ 209/2013 | VAT guidance |
| NĐ 320/2025/NĐ-CP | **Active** | 15/12/2025 | — | CIT guidance |
| NĐ 174/2025/NĐ-CP | **Active** | 2025 | — | VAT 8% reduction |
| NĐ 144/2026/NĐ-CP | **Active** | 05/05/2026 | Amends NĐ 181 | VAT amendments |
| NĐ 70/2025/NĐ-CP | **Active** | 2025 | — | E-invoice mandate |
| NĐ 117/2025/NĐ-CP | **Active** | 2025 | — | Platform withholding |
| TT 99/2025/TT-BTC | **Active** | 01/01/2026 | TT 200/2014 | **Accounting regime** |
| TT 69/2025/TT-BTC | **Active** | 01/07/2025 | — | VAT detailed |
| TT 20/2026/TT-BTC | **Active** | 12/03/2026 | TT 103 (partially) | CIT guidance |
| TT 80/2026/TT-BTC | **Active** | 2026 | — | Tax forms |
| TT 152/2025/TT-BTC | **Active** | 01/01/2026 | — | Household accounting |
| TT 78/2025/TT-BTC | **Active** | 2025 | — | E-receipts |
| TT 50/2026/TT-BTC | **Active** | 2026 | — | Business tax groups |
| TT 58/2026/TT-BTC | **Active** | 2026 | — | PIT business groups |
| NĐ 168/2025/NĐ-CP | **Active** | 2025 | — | Enterprise registration |
| NĐ 23/2025/NĐ-CP | **Active** | 2025 | — | Digital signature |
| NĐ 69/2024/NĐ-CP | **Active** | 2024 | — | e-ID, VNeID |
| NĐ 254/2026/NĐ-CP | **Active** | 2026 | — | E-invoice (amended) |

## 2. Superseded Regulations (No Longer Applicable)

| Regulation | Superseded By | Effective Date of Replacement |
|-----------|--------------|------|
| TT 200/2014/TT-BTC (Accounting) | TT 99/2025/TT-BTC | 01/01/2026 |
| TT 133/2016/TT-BTC (SME Accounting) | TT 99/2025/TT-BTC (optional election) | 01/01/2026 |
| TT 132/2018/TT-BTC (Micro) | TT 99/2025 (optional for micro) | 01/01/2026 |
| NĐ 209/2013/NĐ-CP (VAT guidance) | NĐ 181/2025/NĐ-CP | 01/07/2025 |
| NĐ 49/2022/NĐ-CP (VAT amendment) | NĐ 181/2025/NĐ-CP | 01/07/2025 |
| TT 103/2014/TT-BTC (Foreign contractor tax) | TT 20/2026 + TT 69/2025 | 12/03/2026 |
| Luật Quản lý thuế 38/2019 | Luật 108/2025/QH15 | 01/07/2026 |
| TT 219/2013/TT-BTC (VAT guidance) | TT 69/2025/TT-BTC | 01/07/2025 |
| NĐ 134/2016/NĐ-CP (Export VAT) | NĐ 181/2025 (replaced in part) | 01/07/2025 |
| TIN system (10-digit) | PIN system (12-digit) | 01/07/2025 |

## 3. Regulatory Change Impact Analysis

### 3.1 High-Impact Changes (Tax Module Must Handle)

| Change | Impact | Module Area |
|--------|--------|-------------|
| TT 99 replaces TT200 — new CoA | Chart of accounts restructured | Accounting integration |
| VAT threshold: 5M non-cash (down from 20M) | More invoices need bank proof | VAT engine |
| No quarterly CIT return (payment only) | Workflow simplified, payment focus | CIT engine |
| PIT threshold: 500M (up from 200M/100M) | Fewer BHs subject | PIT engine |
| PIN replaces TIN (from July 2025) | Employee ID changed | PIT, Company |
| E-invoice mandatory for POS | Real-time data push | eInvoice integration |
| Corporate e-ID required | New auth method | Integration |
| Platform withholding mandatory | New tax collection mechanism | PIT engine |
| IFRS convergence (2030 mandatory for listed/FDI) | Dual reporting capability | Reporting |
| Global minimum tax (Pillar 2) | Top-up tax computation | CIT engine |

### 3.2 Medium-Impact Changes

| Change | Impact |
|--------|--------|
| Interest expense 30% EBITDA cap | CIT adjustment |
| Loss carryforward unchanged (5 years) | CIT engine stable |
| License tax unchanged | Low |
| TTĐB input deduction (1383) | New account + workflow |
| Foreign currency rate: avg buy-sell (TT99) | Exchange rate engine |
| TTĐB rate increase schedule pushed to 2027 | Rate table update |
| Export VAT refund conditions clarified | Documentation workflow |
| SCT rate changes (09/2026) | Rate table update |

## 4. Penalty Schedule (For Compliance Warnings)

| Violation | Penalty | Basis |
|-----------|---------|-------|
| Late filing (≤ 30 days) | 2-5M VND | Luật Quản lý thuế |
| Late filing (31-60 days) | 5-8M VND | Luật Quản lý thuế |
| Late filing (> 60 days) | 8-15M VND | Luật Quản lý thuế |
| Late payment | 0.03%/day on overdue amount | Luật Quản lý thuế |
| Underpayment (provisional < 80% actual) | Interest on shortfall | Luật TNDN |
| Incorrect declaration (self-disclosed) | Reduced penalty | Luật Quản lý thuế |
| Incorrect declaration (audited) | 20% of underpaid tax | Luật Quản lý thuế |
| Tax evasion | 1-3x tax evaded + criminal | Luật Quản lý thuế |
| E-invoice violation | 5-20M VND | NĐ 70/2025 |
| No corporate e-ID | Unable to file | NĐ 69/2024 |
