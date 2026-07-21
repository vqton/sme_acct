# User Journeys: Departments (Phòng ban) Module

## UJ-D01: Kế toán trưởng sets up department structure

**Role:** Kế toán trưởng (Chief Accountant) — 15+ years experience
**Goal:** Configure company's department hierarchy for management accounting
**Precondition:** Company module fully set up, `enableDepartmentManagement = true`

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Cơ cấu tổ chức → Phòng ban | Shows empty tree with "Tạo phòng ban đầu tiên" prompt | ✅ |
| 2 | Clicks "+ Thêm phòng ban" | Shows create form | ✅ |
| 3 | Enters code `VP`, name "Văn phòng Công ty", type "SupportCenter", no parent | Saves as root node | ✅ |
| 4 | Adds `KD` "Khối Kinh doanh" type "ProfitCenter", parent "Văn phòng Công ty" | Saves as child | ✅ |
| 5 | Adds `BH` "Bộ phận Bán hàng" type "ProfitCenter", parent "Khối Kinh doanh" | Saves as grandchild | ✅ |
| 6 | Adds `MKT` "Bộ phận Marketing" type "CostCenter", parent "Khối Kinh doanh" | Saves as grandchild | ✅ |
| 7 | Adds `SX` "Khối Sản xuất" type "CostCenter", parent "Văn phòng Công ty" | Saves as child | ✅ |
| 8 | Realizes wrong hierarchy: drags "Khối Sản xuất" under "Khối Kinh doanh" | Reparents with auto path update | ✅ |
| 9 | Checks tree: all nodes display correct path, depth, type icons | Tree renders correctly | 🟢 |

**Success metrics:** 12 departments created, 3 levels deep, in < 10 min

---

## UJ-D02: Admin assigns users to departments

**Role:** Quản trị viên (Admin)
**Goal:** Assign all 38 employees to correct departments
**Precondition:** Departments created (UJ-D01), all user accounts active

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens department "Bộ phận Bán hàng" → "Thành viên" tab | Shows empty member list | ✅ |
| 2 | Clicks "+ Thêm thành viên", selects "Trần Văn X", job "Trưởng phòng KD", check "Primary" | User assigned as member + department head | ✅ |
| 3 | Adds "Lê Thị Y", job "Nhân viên KD", primary | Second member | ✅ |
| 4 | Attempts to remove "Trần Văn X" without assigning new head | BLOCKED: "Trưởng phòng must be assigned. Please assign a new head first." | ✅ |
| 5 | Changes "Trần Văn X" head flag to off, assigns "Lê Thị Y" as new head | Head updated, X remains member | ✅ |
| 6 | Adds X to a second department "Bộ phận Marketing" | X now has 2 departments, 1 primary (Marketing) | ✅ |

**Success metrics:** 38 users assigned to 12 departments, each with 1 primary, in < 20 min

---

## UJ-D03: Kế toán trưởng sets up cost allocation

**Role:** Kế toán trưởng
**Goal:** Configure fair distribution of shared costs (VP, IT, HR) to operating departments
**Precondition:** Departments have active transactions, period not yet closed

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Quản lý chi phí → Phân bổ chi phí | Shows empty rules list | ✅ |
| 2 | Clicks "+ Quy tắc", enters VP chung, from "Văn phòng Công ty", to "All", method "Step Down", basis "Headcount", 25% | Rule saved (sequence 1) | ✅ |
| 3 | Adds rule for IT: from "IT", to "All", "Direct", "Revenue", 10% | Rule saved (sequence 2) | ✅ |
| 4 | Adds rule for HR: from "Nhân sự", to "All", "Reciprocal", "Headcount", 15% | Rule saved (sequence 3) | ✅ |
| 5 | Clicks Preview → shows estimated allocation amounts | Preview: Văn phòng 50M, IT 30M, HR 20M allocated | ✅ |
| 6 | Notices IT allocation too high → edits rule %, changes 10% → 8% | Rule updated | ✅ |
| 7 | Clicks "▶ Chạy phân bổ" | Allocation executes: Direct → StepDown → Reciprocal | ✅ |
| 8 | Reviews generated journal entries | All entries balanced (debit = credit) | ✅ |
| 9 | Checks P&L by department → allocated costs appear correctly | Costs distributed as expected | 🟢 |

**Success metrics:** 3 rules, 1 allocation run, all balanced, verified on P&L report in < 30 min

---

## UJ-D04: Kế toán tổng hợp posts transaction with department

**Role:** Kế toán tổng hợp (General Accountant)
**Goal:** Record an office supply purchase for the Marketing department
**Precondition:** User assigned to both "Kế toán" (primary) and "Bộ phận Marketing"

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Sổ nhật ký → Thêm chứng từ | New journal entry form | ✅ |
| 2 | Enters debit TK 6427 (VPP), credit TK 1111 (Tiền mặt), 5,000,000₫ | Amount filled | ✅ |
| 3 | Sees "Phòng ban" field defaults to "Kế toán" (primary dept) | Correct default | ✅ |
| 4 | Changes department to "Bộ phận Marketing" | Department updated | ✅ |
| 5 | Submits | Budget check runs: Marketing VPP budget = 3M, already used 2M, new 5M = 7M > 3M | ✅ |
| 6 | Budget check result: **HARD BLOCKED** — "Ngân sách VPP vượt 133%. Giao dịch bị từ chối." | Transaction blocked | ✅ |
| 7 | Changes amount to 500,000₫, submits again | Budget check: now 2.5M < 3M — allowed | ✅ |
| 8 | Saves entry with department = "Bộ phận Marketing" | Transaction posted, department tracked | 🟢 |

**Success metrics:** Transaction blocked correctly by hard budget control; user adjusts and posts

---

## UJ-D05: Giám đốc reviews department P&L

**Role:** Giám đốc (Director/CFO)
**Goal:** Review departmental performance before board meeting
**Precondition:** Period closed, allocation executed, reports generated

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Báo cáo → KQKD theo phòng ban | P&L by department report | ✅ |
| 2 | Sets period T6/2026, comparison T5/2026 | Multi-column report renders | ✅ |
| 3 | Scans: "Kinh doanh" profit +5.2%, "Sản xuất" -12.3% | Identifies underperforming unit | ✅ |
| 4 | Clicks "Sản xuất" → drills down to cost details | Shows: Electricity cost up 40%, Labor cost up 15% | ✅ |
| 5 | Clicks electricity cost → sees individual utility invoices | Drill to voucher level | ✅ |
| 6 | Switches to "Ngân sách vs Thực tế" → Sản xuất → Electricity | Budget: 100M, Actual: 140M, Variance: +40% | ✅ |
| 7 | Exports report to Excel | Report downloaded | ✅ |
| 8 | Sends to board with notes: "Sản xuất vượt điện 40% — cần kiểm tra" | Report shows clear data | 🟢 |

**Success metrics:** Director navigates from summary → drill-down → root cause in < 5 min

---

## UJ-D06: CFO runs budget planning cycle

**Role:** Giám đốc tài chính (CFO)
**Goal:** Prepare FY2027 departmental budgets
**Precondition:** FY2026 actual data available, department structure current

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Ngân sách → Tạo ngân sách năm 2027 | Budget creation wizard | ✅ |
| 2 | Selects "Sao chép từ năm 2026" + "Điều chỉnh theo tỷ lệ" 110% | Auto-populates all departments/accounts with 2026 actual × 110% | ✅ |
| 3 | Reviews "Kinh doanh" budget: 2.4B → adjusted to 2.64B | Baseline set | ✅ |
| 4 | Manually adjusts "Sản xuất" electricity from 1.2B → 1.0B (efficiency target) | Override entered with audit trail | ✅ |
| 5 | Submits all budgets for approval | Status: Draft → Pending Approval | ✅ |
| 6 | As Kế toán trưởng, reviews and approves | Status: Approved | ✅ |
| 7 | Locks budgets for FY2027 | Status: Locked | ✅ |
| 8 | Returns to dashboard → Budget allocation shows 100% distributed | Complete | 🟢 |

**Success metrics:** 12 department budgets, 6 accounts each, created from template in 1 hour

---

## UJ-D07: Inter-department asset transfer

**Role:** Kế toán TSCĐ
**Goal:** Transfer a laptop from "Kế toán" to "Bộ phận Bán hàng"
**Precondition:** Both departments exist, laptop tracked as TSCĐ

| Step | Action | System Response | Satisfaction |
|------|--------|-----------------|:---:|
| 1 | Opens Điều chuyển nội bộ → Tạo điều chuyển | Transfer form | ✅ |
| 2 | Selects from: "Kế toán", to: "Bộ phận Bán hàng", item: Laptop Dell XPS | Form populated | ✅ |
| 3 | Enters quantity 1, value 25,000,000₫, reason "Chuyển giao nhân sự" | All fields filled | ✅ |
| 4 | Enters voucher ref "BBBG 12/2026" (Biên bản bàn giao) | Reference attached | ✅ |
| 5 | Submits | Transfer saved, asset department updated in fixed asset register, journal entry generated (asset dept change) | ✅ |
| 6 | Checks "Bộ phận Bán hàng" asset list → laptop appears | Transfer complete | 🟢 |

**Success metrics:** Asset transferred in < 5 min with proper audit trail

---

## Journey Coverage Matrix

| Journey | D01 CRUD | D02 User | D03 Alloc | D04 Budget | D05 P&L | D06 Transfer |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| UJ-D01 Kế toán trưởng setup | ✅ | | | | | |
| UJ-D02 Admin assigns users | | ✅ | | | | |
| UJ-D03 Cost allocation setup | | | ✅ | | | |
| UJ-D04 Post transaction | ✅ | ✅ | | ✅ | | |
| UJ-D05 Director reviews P&L | | | ✅ | | ✅ | |
| UJ-D06 CFO budget cycle | | | | ✅ | | |
| UJ-D07 Asset transfer | | | | | | ✅ |
