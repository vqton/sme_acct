# COA Module — User Journeys

**Version:** 1.0
**Date:** 2026-07-23

---

## UJ-01: Chief Accountant Sets Up New Company COA

**Persona:** Nguyễn Thị Lan — Chief Accountant, 15 yrs experience, MISA SME user

### Journey

1. **Login** to SmeAccounting as admin
2. **Create company**: enters company info (name, tax code, address)
3. **Select regime**: chooses "TT 99/2025/TT-BTC — Chế độ kế toán doanh nghiệp"
4. **System seeds 71 standard accounts** automatically
5. **Verifies COA**: opens account tree, sees 71 level-1 accounts with correct names (111, 112, 131...)
6. **Checks TT 99 compliance**: confirms TK 215 (Tài sản sinh học), TK 332 (Phải trả cổ tức) present
7. **Confirms removed accounts**: TK 611, TK 631 NOT present ✅
8. **Adds custom sub-accounts**: creates 11211 (Vietcombank), 11212 (Techcombank) under 1121
9. **Result**: company ready for opening balance entry

**Pain points avoided:**
- ❌ No need to worry about TT 200 obsolete accounts
- ❌ No manual COA creation (saves 2-3 hours)
- ✅ System enforces correct structure per law

---

## UJ-02: Accountant Creates Custom Cost Account

**Persona:** Trần Văn Hùng — Accountant, 3 yrs experience

### Journey

1. Opens **Account Management** screen
2. Searches "642" — sees TK 642 (Chi phí QLDN) with children 6421–6428
3. Clicks **[+ Add Account]** under TK 6427 (Chi phí dịch vụ mua ngoài)
4. Enters:
   - Number: **64271** (auto-suggests based on parent)
   - Name: **Chi phí tư vấn pháp lý**
   - System auto-fills: category=ChiPhí, nature=DưNợ, type=ChiTiết
5. Clicks **Save**
6. New account appears in tree under 6427
7. Can now use 64271 in journal entries

**Key experience:**
- Auto-inference of category/nature from parent reduces errors
- Number format validation prevents invalid account codes
- Instant tree update

---

## UJ-03: Company Migrates from TT 133 → TT 99

**Persona:** Phạm Thị Hoa — Chief Accountant at growing SME

### Context: Company grew beyond SME threshold (revenue > 200 tỷ), needs TT 99 COA

### Journey

1. **Year-end**: closes all fiscal periods for current year
2. Opens **Settings → Accounting Regime**
3. Selects target: **TT 99/2025/TT-BTC**
4. System generates **Migration Report**:
   - 5 accounts to add (TK 215, 332, 82112...)
   - 3 accounts to rename (112, 155, 242)
   - 2 accounts to deactivate (611, 631 — zero balance ✅)
   - **0 unmapped with balance** ✅
5. Reviews report — confirms accuracy
6. Clicks **[Execute Migration]**
7. System runs migration in transaction:
   - Adds new accounts
   - Renames existing
   - Deactivates removed accounts
   - Updates regime setting
8. **Opens COA**: sees TK 215, updated TK 112 name = "Tiền gửi không kỳ hạn"
9. **Creates new period** under TT 99 regime
10. **Notifies tax office** per TT 99 Điều 31

**Outcome:** Seamless migration, no data loss, full compliance

---

## UJ-04: Import COA from Excel (Legacy Data Migration)

**Persona:** Lê Hoàng — IT Accountant migrating from old Excel-based system

### Journey

1. Exports existing COA from old system to CSV
2. Adjusts column headers to match import format
3. Opens SmeAccounting → Account Management → **[Import]**
4. Uploads CSV file
5. System validates 85 rows:
   - ✅ 82 rows valid
   - ❌ 3 errors: 2 duplicate numbers, 1 invalid category
6. Shows error report with row numbers and details
7. Fixes errors in CSV, re-uploads
8. All 85 rows valid → preview shows accounts to create
9. Confirms import
10. 85 accounts created in COA tree
11. **Result**: Complete COA migrated in 5 minutes vs 2 hours manual entry

---

## UJ-05: Auditor Reviews COA Changes

**Persona:** Văn phòng Kiểm toán — External Auditor

### Journey

1. Requests COA change audit log from system admin
2. Receives export: 47 COA mutations since last audit
3. Reviews:
   - 12 accounts created (all non-system, correct format)
   - 3 accounts renamed (valid reasons documented)
   - 1 account deactivated (zero balance, approved)
   - 31 system seed accounts (regime change)
4. **Checks audit trail integrity**: timestamps sequential, no gaps, no deleted entries ✅
5. **Verifies no silent modifications**: audit log shows before/after for every change ✅
6. **Signs off**: COA change control compliant with TT 99 Điều 28

**Outcome:** Clean audit, no regulatory findings
