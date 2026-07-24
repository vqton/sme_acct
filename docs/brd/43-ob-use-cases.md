# Use Cases — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## UC-OB-01: Manual Opening Balance Entry

**Actor:** Accountant (Kế toán)
**Precondition:** Company created, COA seeded, fiscal period open
**Trigger:** First time entering data for new company or new fiscal year

### Happy Path
1. Accountant navigates to Nghiệp vụ → Nhập số dư ban đầu
2. System shows grid of accounts with opening_debit/opening_credit columns
3. Accountant enters debit/credit amount for each balance account
4. System validates: Tổng Dư Nợ = Tổng Dư Có after each entry
5. Accountant clicks Lưu (Save)
6. System saves to opening_balance_headers + lines
7. System updates accounts.opening_debit/credit
8. System generates batch number OB-YYYY-NNNNN
9. System records audit log: "Opening balance batch OB-2026-00001 created"

### Alternative Paths
- **A1: Invalid account** — Account is parent (TK Mẹ), not leaf → system warns, blocks entry
- **A2: Out of balance** — Total debit ≠ total credit → system blocks save, shows diff amount
- **A3: Negative balance** — User enters negative → system warns, allows but highlights

### Exception Paths
- **E1: Period closed** — Selected period is closed → system blocks entry
- **E2: OB already entered** — Opening balance batch exists and locked → system shows message, redirects to view

---

## UC-OB-02: Excel Import Opening Balance

**Actor:** Accountant
**Precondition:** Company created, COA seeded

### Happy Path
1. Accountant clicks Nhập từ Excel (Import from Excel)
2. System prompts to download template file
3. Accountant downloads mẫu nhập số dư đầu kỳ.xlsx
4. Accountant fills data in template (account_number, debit, credit, notes)
5. Accountant uploads completed file
6. System validates each row:
   - account_number exists and is leaf account
   - debit ≥ 0, credit ≥ 0
   - no negative values
7. System shows preview: total rows, total debit, total credit, difference
8. System highlights invalid rows with error messages
9. Accountant confirms import
10. System imports data, creates opening balance batch
11. System shows success summary: "Đã nhập 45/48 dòng thành công. 3 dòng lỗi."

### Alternative Paths
- **A1: Wrong format** — File format incorrect → system shows detailed error
- **A2: Partial success** — Some rows invalid → system imports valid rows, shows error list
- **A3: No data** — File empty → system warns

### Exception Paths
- **E1: Wrong file type** — Upload .pdf/.docx → system rejects, prompts .xlsx/.xls
- **E2: Column mismatch** — Header row doesn't match template → system shows expected columns

---

## UC-OB-03: Sub-Ledger Detail Entry

**Actor:** Accountant
**Precondition:** Master data exists (customers, suppliers, bank accounts, inventory items, FA)

### Happy Path — Bank Details (TK 112)
1. Accountant navigates to Số dư ngân hàng tab
2. System shows list of bank accounts already created
3. For each bank account: enter opening balance (VND + foreign currency)
4. System auto-calculates: tổng số dư ngân hàng = tổng số dư TK 112
5. System validates: tổng số dư chi tiết = số dư tổng hợp TK 112

### Happy Path — AR Details (TK 131)
1. Accountant navigates to Công nợ khách hàng tab
2. System shows list of customers
3. For each customer: enter receivable balance
4. System auto-totals and validates against TK 131

### Happy Path — Inventory (TK 152, 156)
1. Accountant navigates to Tồn kho tab
2. System shows list of inventory items by warehouse
3. For each item: enter quantity + unit price → auto-calculates amount
4. System validates: tổng tồn kho chi tiết = tổng số dư TK 152/156

### Exception Paths
- **E1: Missing master data** — Customer/bank/item not created → system prompts to create first

---

## UC-OB-04: TT200 → TT99 Conversion

**Actor:** Accountant / Chief Accountant (Kế toán trưởng)
**Precondition:** Company used TT200 regime in 2025, needs conversion for 2026

### Happy Path
1. Chief Accountant navigates to Chuyển đổi số dư TT200 → TT99
2. System shows default conversion mapping (per TT99 Appendix 1)
3. System lists accounts:
   - Direct mapping (e.g., TK 111 → TK 111)
   - Split mapping (e.g., TK 2281 → TK 22811 + TK 22812)
   - Merged mapping (e.g., TK 441 + TK 466 → TK 4118)
   - Manual (requires user to specify)
4. Accountant reviews each mapping, adjusts if needed
5. System runs conversion simulation — shows old balance → new balance
6. Accountant verifies: Tổng tài sản cũ = Tổng tài sản mới
7. Accountant confirms conversion
8. System runs conversion, creates conversion audit report
9. System creates new opening balance batch with source = 'tt99_conversion'

### Alternative Paths
- **A1: Mapping mismatch** — Account not found in default mapping → system flags for manual mapping
- **A2: Balance lost** — Total assets before ≠ after conversion → system warns, blocks

### Exception Paths
- **E1: No prior data** — No TT200 data found → system informs user, prompts manual entry
- **E2: Data backup failed** — System cannot create backup → blocks conversion

---

## UC-OB-05: Opening Balance Lock

**Actor:** System (automatic) / Chief Accountant (manual)
**Precondition:** Opening balance entered, first period transaction posted

### Happy Path (Auto)
1. Accountant posts first journal entry in period
2. System checks: opening balance locked? No → system auto-locks
3. System sets is_locked = 1, locked_at = now, locked_by = system
4. System records audit log: "Opening balance auto-locked after first transaction"
5. System prevents any further modification to opening balance

### Alternative Paths
- **A1: Manual unlock** — Chief Accountant can unlock with reason (ghi chú)
- **A2: Approval required** — unlock requires dual approval

### Exception Paths
- **E1: Unlock after closure** — Period already closed → cannot unlock

---

## UC-OB-06: Opening Balance Report

**Actor:** Accountant, Chief Accountant, Auditor
**Precondition:** Opening balance data exists

### Happy Path
1. User navigates to Báo cáo → Số dư đầu kỳ
2. User selects period (quý/tháng/năm)
3. User selects account range or all accounts
4. User selects detail level: tổng hợp or chi tiết
5. System generates report:
   - Cột 1: Số hiệu TK
   - Cột 2: Tên TK
   - Cột 3: Số dư Nợ đầu kỳ
   - Cột 4: Số dư Có đầu kỳ
   - Cột 5: Ghi chú
6. User exports to Excel/PDF

---

## UC-OB-07: TT99 Account Mapping Maintenance

**Actor:** Chief Accountant / System Admin
**Precondition:** Conversion mapping table exists

### Happy Path
1. User navigates to Thiết lập → Mapping TK TT200 → TT99
2. System shows list of all account mappings
3. User edits mapping: change target account, conversion type, split ratio
4. System validates: no circular mapping, target account exists
5. User saves
6. System records audit log

---

## UC-OB-08: Opening Balance Audit Trail

**Actor:** Chief Accountant, Auditor, Tax Inspector
**Precondition:** Opening balance activities recorded

### Happy Path
1. User navigates to Kiểm tra → Nhật ký số dư đầu kỳ
2. System shows chronological log: action, user, timestamp, details
3. User filters by date, user, action type
4. User clicks detail to see before/after values (JSON diff)
5. User exports audit log

---

## UC-OB-09: Multi-Currency Opening Balance

**Actor:** Accountant
**Precondition:** Multi-currency enabled in company settings

### Happy Path
1. Accountant enters opening balance for foreign currency account (e.g., TK 1122 USD)
2. System shows additional columns: Ngoại tệ, Tỷ giá
3. Accountant enters: Số dư Ngoại tệ (USD 10,000) + Tỷ giá (25,500)
4. System auto-calculates: Số dư VND = 10,000 × 25,500 = 255,000,000
5. System saves both original currency amount and VND equivalent

### Alternative Paths
- **A1: Exchange rate lookup** — System can auto-fill rate from rate table
- **A2: Multiple currencies** — Same account can have balances in multiple currencies

---

## UC-OB-10: Opening Balance Approval

**Actor:** Chief Accountant (Kế toán trưởng)
**Precondition:** Accountant has entered opening balance, submitted for approval

### Happy Path
1. Chief Accountant sees pending approval notification
2. Opens opening balance batch
3. Reviews: total debit = total credit, account balances reasonable
4. Compares with prior period closing balance
5. Approves (Ký duyệt) — optionally with digital signature
6. System locks opening balance, records approval in audit trail

### Alternative Paths
- **A1: Reject** — Chief Accountant rejects with reason → returns to Accountant for revision
- **A2: Digital signature** — NĐ 23/2025/NĐ-CP compliant signing via Token/HSM
