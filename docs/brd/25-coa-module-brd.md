# BRD: Chart of Accounts (Hệ thống Tài khoản Kế toán) Module — SmeAccounting

**Version:** 1.0
**Date:** 2026-07-23
**Author:** BA Lead + Chief Accountant (40+ yrs combined)
**Status:** V0 — NOT PROD Ready

---

## 1. Executive Summary

Chart of Accounts (COA) module is the structural backbone of any accounting system. It defines the account classification hierarchy — assets, liabilities, equity, revenue, expenses — that every journal entry, ledger posting, trial balance, and financial statement relies upon. In Vietnam, COA is regulated by the Ministry of Finance through three concurrent regimes: **TT 99/2025/TT-BTC** (enterprises, effective 01/01/2026), **TT 133/2016/TT-BTC** (SMEs, still active), and **TT 58/2026/TT-BTC** (micro-enterprises, effective 01/07/2026).

**Verdict: NOT PROD-READY — CRITICAL GAPS**

The current implementation provides a solid foundational data model (Account entity, AccountRepository, AccountingService, SQLite schema) but contains **5 blocking gaps** and **12 major gaps** that prevent production deployment for Vietnamese SME accounting.

---

## 2. Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Account entity (interface) | ✅ EXISTS | Full fields incl. balances, hierarchy, type |
| AccountEnums (categories, natures, types) | ✅ EXISTS | 6 categories, 4 natures, 3 types |
| STANDARD_ACCOUNTS seed data | ⚠️ EXISTS (OUTDATED) | Based on TT 200/2014, NOT TT 99/2025 |
| AccountRepository interface | ✅ EXISTS | 11 query methods + CRUD |
| SQLiteAccountRepository | ✅ EXISTS | Lazy-init prepared statements, full impl |
| AccountingService | ✅ EXISTS | CRUD, seeding, ledger posting, trial balance |
| DB schema (accounts table) | ✅ EXISTS | Normalized schema with balances |
| Journal entry integration | ✅ EXISTS | Debit/credit posting, period validation |
| Ledger posting | ✅ EXISTS | Running balances, account balance calc |
| COA seeder automation | ❌ MISSING | seedStandardAccounts never called on company creation |
| Multi-regime support | ❌ MISSING | accounting_regime field exists but unused |
| Account hierarchy validation | ❌ MISSING | No parent-child integrity checks |
| TT 99/2025 compliance | ❌ MISSING | Wrong account names, missing accounts, stale accounts |
| Account number format validation | ❌ MISSING | No regime-specific format rules |
| Regime migration path | ❌ MISSING | Cannot migrate TT 200 → TT 99 data |
| Department/cost center integration | ❌ MISSING | department_id on JEL lines not used |
| Account deactivation rules | ❌ MISSING | No transaction prevention on inactive accounts |
| REST API endpoints | ⚠️ PARTIAL | accountingController exists, COA-specific routes limited |
| Client UI | ❌ MISSING | No account management UI |

---

## 3. PROD Readiness Verdict

**NOT PROD-READY.** Five blocking gaps and twelve major gaps prevent deployment.

### 3.1 Critical (Blocking) Gaps

| # | Gap | Regulatory Reference | Impact |
|---|---|---|---|
| BG-C01 | STANDARD_ACCOUNTS based on TT 200/2014 (outdated) | TT 99/2025/TT-BTC Phụ lục II (thay thế TT 200 từ 01/01/2026) | All seeded accounts use wrong names, missing 13 new accounts, include 5 removed accounts. Financial statements from seeded COA are non-compliant |
| BG-C02 | No multi-regime COA support | TT 133/2016/TT-BTC (SME), TT 58/2026/TT-BTC (siêu nhỏ) | Companies using TT 133 (SME default) get TT 200 schema — wrong account set, wrong names |
| BG-C03 | seedStandardAccounts never triggered on company creation | Accounting data integrity | Companies have zero accounts on creation. No accounts = no journal entries = system non-functional |
| BG-C04 | No account hierarchy validation | General accounting principle | Circular parent references, orphan children, excessive depth allowed. Violates fundamental accounting structure rules |
| BG-C05 | accounting_regime field unused, no enum definition | TT 99 Điều 9, 11 | System stores regime choice but never reads it. No validation that COA matches chosen regime |

### 3.2 Major Gaps

| # | Gap | Severity |
|---|---|---|
| MG-C01 | No parent account balance roll-up validation | High |
| MG-C02 | No `allow_transactions` enforcement on non-leaf accounts | High |
| MG-C03 | No account deactivation with transaction history check | High |
| MG-C04 | No account number regex validation per regime (TT 99/TT 133) | High |
| MG-C05 | No RESTful CRUD API for accounts | High |
| MG-C06 | No client UI for account management | High |
| MG-C07 | No account import/export (Excel/CSV) | Medium |
| MG-C08 | No account search with pagination | Medium |
| MG-C09 | No COA regime migration tool (TT 200 → TT 99 → TT 133) | High |
| MG-C10 | No audit log for account creation/modification/deletion | High |
| MG-C11 | No account usage tracking (which accounts have transactions) | Medium |
| MG-C12 | No integration with department analytic dimension | Medium |

---

## 4. Regulatory Framework

### 4.1 Applicable Regulations

| Regulation | Effective | Scope | COA relevance |
|---|---|---|---|
| **TT 99/2025/TT-BTC** (Chế độ kế toán DN) | 01/01/2026 | All enterprises (replaces TT 200/2014) | **Primary COA**: 71 level-1 accounts, new TK 215/332/82112, renamed accounts |
| **TT 133/2016/TT-BTC** (Chế độ kế toán SME) | 01/01/2017 | SMEs (still active, parallel to TT 99) | **SME COA**: Simplified, ~50 level-1 accounts, TK 642 replaces 641+642 |
| **TT 58/2026/TT-BTC** (Chế độ kế toán DN siêu nhỏ) | 01/07/2026 | Micro-enterprises | **Micro COA**: Minimal ~20 accounts, cash-based |
| **TT 53/2006/TT-BTC** (Kế toán quản trị) | 2006—nay | All enterprises | Allows analytic dimensions (department, project) on accounts |
| **Luật Kế toán 88/2015/QH13** (sửa đổi 2024, 2025) | 01/01/2017 | All accounting units | Defines accounting records integrity, prohibits data tampering |

### 4.2 TT 99/2025 Key COA Changes vs TT 200/2014

| Change Type | Detail |
|---|---|
| **New accounts** | TK 215 (Tài sản sinh học), TK 332 (Phải trả cổ tức, lợi nhuận), TK 82112 (Thuế bổ sung GMT), TK 229 (Dự phòng tổn thất tài sản — thay 159) |
| **Renamed accounts** | TK 112: "Tiền gửi NH" → "Tiền gửi không kỳ hạn"; TK 155: "Thành phẩm" → "Sản phẩm"; TK 242: "Chi phí trả trước" → "Chi phí chờ phân bổ"; TK 158: "Hàng hóa kho bảo thuế" → "Nguyên liệu, vật tư tại kho bảo thuế" |
| **Removed accounts** | TK 161 (Chi phí trả trước), TK 441 (Nguồn vốn đầu tư XDCB), TK 611 (Mua hàng), TK 631 (Giá thành SX); TK 461/466 (nguồn kinh phí SN) |
| **New level-3 accounts** | 1281 (Tiền gửi có kỳ hạn), 1282 (Trái phiếu), 1283 (Cho vay), 1288 (Các khoản đầu tư khác) |
| **Level-1 count** | Reduced from 76 (TT 200) to **71** |
| **Enterprise autonomy** | DN tự sửa/bổ sung tài khoản từ cấp 2 trở xuống, không cần xin phép BTC (Điều 11) |

### 4.3 TT 133/2016 COA Differences

- Single TK 642 "Chi phí quản lý kinh doanh" replaces TT 200's TK 641 (bán hàng) + TK 642 (QLDN)
- No separate TK 161, TK 611, TK 631 (same as TT 99)
- Simplified structure: ~50 level-1 accounts vs TT 99's 71
- No TK 229 (dự phòng tổn thất tài sản)
- No TK 215 (tài sản sinh học)

### 4.4 COA Structure by Regime

| Attribute | TT 99/2025 | TT 133/2016 | TT 58/2026 |
|---|---|---|---|
| Level-1 accounts | 71 | ~50 | ~20 |
| Max account depth | 4 levels | 3 levels | 2 levels |
| Account number format | 1-4 digits per level | 1-3 digits per level | 1-2 digits per level |
| Enterprise autonomy | Full (level 2+) | Limited | None |
| IFRS alignment | High | Low | None |

---

## 5. Domain Terminology (Ubiquitous Language)

| Term (VN) | Term (EN) | Definition |
|---|---|---|
| **Tài khoản kế toán** | Account | A classification unit in the COA, identified by a numeric code |
| **Hệ thống tài khoản** | Chart of Accounts | The complete classification of all accounts used by an enterprise |
| **Tài khoản cấp 1** | Level-1 (Control) Account | The top-level account category (e.g., TK 111 — Tiền mặt) |
| **Tài khoản cấp 2/3/4** | Sub-account | Account at detail level, hierarchically under a parent |
| **Tài khoản tổng hợp** | Control Account | Account that has sub-accounts (parent account) |
| **Tài khoản chi tiết** | Detail Account | Account with no children, used for transaction posting |
| **Tài khoản mẹ** | Parent Account | Account that has at least one child |
| **Tài khoản con** | Child Account | Account belonging to a parent |
| **Số dư Nợ** | Debit Balance | Natural balance for asset and expense accounts |
| **Số dư Có** | Credit Balance | Natural balance for liability, equity, revenue accounts |
| **Tính chất (Nợ/Có/Lưỡng tính)** | Account Nature | Whether account normally carries debit, credit, dual, or no balance |
| **Loại tài khoản** | Account Category | Classification: Asset/Liability/Equity/Revenue/Expense/P&L |
| **Chế độ kế toán** | Accounting Regime | Regulatory framework (TT 99 / TT 133 / TT 58) |
| **Quy chế hạch toán nội bộ** | Internal Accounting Policy | Enterprise-specific accounting policies per TT 99 Điều 9 |

---

## 6. Functional Requirements

### 6.1 Core COA Management

| FR# | Requirement | Priority | Regime |
|---|---|---|---|
| FR-01 | System shall seed standard accounts per selected regime on company creation | P0 | All |
| FR-02 | System shall support 3 COA regimes: TT 99, TT 133, TT 58 | P0 | All |
| FR-03 | System shall allow adding custom sub-accounts (level 2+) per TT 99 Điều 11 | P1 | TT 99 |
| FR-04 | System shall enforce account hierarchy integrity (no circular, valid parent) | P0 | All |
| FR-05 | System shall prevent posting to parent (control) accounts | P0 | All |
| FR-06 | System shall allow deactivating accounts with transaction history check | P1 | All |
| FR-07 | System shall display account balances in hierarchy tree | P1 | All |
| FR-08 | System shall support account search by number and name | P0 | All |
| FR-09 | System shall export COA to Excel/CSV | P2 | All |
| FR-10 | System shall import COA from Excel/CSV with validation | P2 | All |

### 6.2 Multi-Regime

| FR# | Requirement | Priority |
|---|---|---|
| FR-11 | System shall allow company to select regime on creation | P0 |
| FR-12 | System shall provide regime-specific standard account list | P0 |
| FR-13 | System shall validate account numbers per regime format rules | P1 |
| FR-14 | System shall support regime migration (with data integrity validation) | P2 |

### 6.3 Compliance & Audit

| FR# | Requirement | Priority |
|---|---|---|
| FR-15 | All COA changes must be audit-logged (who, what, when) | P0 |
| FR-16 | Account deletion must be blocked if transactions exist | P0 |
| FR-17 | Account number must be unique per company | P0 |
| FR-18 | System accounts (is_system) cannot be deleted or deactivated | P0 |
| FR-19 | Account renumbering must preserve historical transaction references | P2 |

---

## 7. Non-Functional Requirements

| NFR# | Requirement | Target |
|---|---|---|
| NFR-01 | COA load time for 500-account tree | < 1 second |
| NFR-02 | Account search response | < 500 ms |
| NFR-03 | Support concurrent multi-company access | Yes |
| NFR-04 | Offline-capable (SQLite local) | Yes |
| NFR-05 | Audit trail immutability (append-only) | Yes |

---

## 8. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TT 99/TT 133 regulatory ambiguity for borderline-SME companies | Medium | High | Allow company to choose; provide guidance based on NĐ 80/2021 criteria |
| Data migration from existing TT 200 COA | Medium | High | Build regime migration tool with validation before migration path |
| User error: deleting active accounts with balances | Medium | High | Block deletion; only deactivate with confirmation |
| Performance: 50K+ account hierarchies | Low | Medium | Use closure table or path enumeration for efficient tree queries |

---

## 9. Regulatory Compliance Matrix

| Legal Requirement | Current Status | Target | Gap |
|---|---|---|---|
| Standard COA per TT 99 Phụ lục II | ❌ (TT 200) | ✅ | BG-C01 |
| Multi-regime COA selection | ❌ | ✅ | BG-C02 |
| Account hierarchy validation | ❌ | ✅ | BG-C04 |
| Transaction-blocked accounts | ❌ | ✅ | MG-C02 |
| Audit trail for COA changes | ❌ | ✅ | MG-C10 |
| Enterprise autonomy (level 2+) | ❌ | ✅ | P1 feature |
| Regime migration | ❌ | ✅ | P2 feature |
| e-Invoice COA mapping | ❌ | ✅ | Future |

---

## 10. Recommendations

### Phase 1 (P0 — Required for PROD)
1. Replace STANDARD_ACCOUNTS with TT 99/2025 data (Phụ lục II)
2. Add TT 133/2016 standard accounts
3. Implement accounting_regime enum and validation
4. Auto-seed accounts on company creation
5. Add account hierarchy validation (parent exists, no circular)
6. Block posting to non-leaf accounts
7. Add audit logging for all COA mutations
8. Add REST API endpoints for COA CRUD

### Phase 2 (P1 — Required for full utility)
9. Regime-specific account number validation
10. Account deactivation workflow
11. Account hierarchy tree UI
12. COA import/export

### Phase 3 (P2 — Enhancement)
13. Regime migration tool
14. Account usage analysis
15. Bulk account operations
16. Integration with department analytic dimension

---

## 11. References

- TT 99/2025/TT-BTC: https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Thong-tu-99-2025-TT-BTC-huong-dan-Che-do-ke-toan-doanh-nghiep-565484.aspx
- TT 133/2016/TT-BTC: https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Thong-tu-133-2016-TT-BTC-huong-dan-che-do-ke-toan-doanh-nghiep-nho-va-vua-284997.aspx
- TT 58/2026/TT-BTC: Chế độ kế toán DN siêu nhỏ (hiệu lực 01/07/2026)
- TT 53/2006/TT-BTC: Hướng dẫn kế toán quản trị
- Luật Kế toán 88/2015/QH13 (sửa đổi bởi Luật 56/2024, Luật 108/2025)
- Nghị định 80/2021/NĐ-CP: Tiêu chí xác định DN nhỏ và vừa
- Nghị định 174/2016/NĐ-CP: Hướng dẫn Luật Kế toán
- KPMG Vietnam — Key changes TT 99: https://kpmg.com/vn
- EY Vietnam — Circular 99 analysis: https://ey.com/en_vn
- Kế toán Thiên Ưng — Danh mục TK TT 99: https://ketoanthienung.net
- Kế toán Lê Ánh — Hệ thống TK TT 99: https://ketoanleanh.edu.vn
