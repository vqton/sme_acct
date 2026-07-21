# Department / Cost Center Management in Vietnamese ERP Software

Research date: 2026-07-21
Scope: MISA SME.NET / AMIS, Fast Accounting, Bravo ERP

---

## 1. MISA (SME.NET & AMIS Kế toán)

### Department Structure

- **Hierarchical tree** with 5 levels: `Tổng công ty/Công ty → Chi nhánh → Văn phòng/Trung tâm → Phòng ban → Phân xưởng → Nhóm/Tổ/Đội`
- Declared via **Danh mục → Cơ cấu tổ chức** (shared across HR, Accounting, and other apps)
- One root `Tổng công ty/Công ty` per database, auto-created
- Branches can be marked as independent or dependent (`chi nhánh độc lập / phụ thuộc`)
- Tax declaration can be per-branch (GTGT, TNCN, TTĐB)

### Linking to Chart of Accounts

- **Direct linkage**: Salary cost accounts (`TK chi phí lương`) can be set per department
  - TK 622 for production dept, TK 641 for sales, TK 6421 for admin
- Priority: per-department setting → fallback to formula on timesheet
- CCDC (tools) cost auto-allocation per department
- TSCĐ (fixed assets) tracked to department level
- General entries can tag department via `Đơn vị` field on vouchers

### Cost Allocation

- **CCDC amortization**: auto-distribute to departments by preset ratio
- **Salary cost**: auto-post based on employee's department → TK setup
- **Overhead allocation**: supported in costing module (`Giá thành`)
- **Transfer CCDC** between departments supported
- Budget module (`Ngân sách`) allows department-level budget planning vs actual

### Reporting by Department

- P&L by department possible via report filtering on `Đơn vị` dimension
- **Báo cáo quản trị**: revenue/cost/profit filterable by department
- Financial reports (BCTC) can be consolidated per branch
- Budget vs actual reports at department level

### User Integration

- Employees belong to a department (Nhân viên → Đơn vị)
- User permissions follow org structure
- Login scope can restrict to department data

### Sub-departments

- **Yes**. Tree supports 5 levels nesting.
- Example: Công ty → VP Miền Bắc → Phòng Kinh doanh → Tổ Bán hàng

### Independent Bank Accounts / Tax Codes

- Branches can have separate tax declarations (GTGT riêng)
- Independent-accounting branches (`hạch toán độc lập`) get separate books
- Bank accounts tracked per entity, but not natively per department

### Key Sources

- Helpsme.misa.vn: Khai báo cơ cấu tổ chức, Thiết lập TK hạch toán lương theo đơn vị
- helpact.misa.vn: Thiết lập tài khoản hạch toán lương theo đơn vị
- sme.misa.vn: CCDC feature page (quản lý theo phòng ban, điều chuyển CCDC)

---

## 2. Fast Accounting (Fast Financial)

### Department Structure

- **Two-level classification**: `Đơn vị kinh doanh` (business unit) + `Bộ phận hạch toán` (accounting department)
- Declared in `Phân hệ quản trị phí` (cost management subsystem)
- Departments organized as a tree (parent-child via account/group hierarchy)
- **Custom fields**: `Mã_px` (production unit) and `Mã_sp` (product) can be added to voucher screens for cost tracking

### Linking to Chart of Accounts

- Costs tracked via **sub-accounts** of expense TKs (`tiểu khoản`) or via separate `khoản mục phí` (cost item categories)
- Cost items grouped by parent accounts or category tree
- No hardcoded link between dept and TK — instead use the `Bộ phận hạch toán` field on each voucher

### Cost Allocation

- **Strong** cost management subsystem (`Phân hệ quản trị phí`)
- Supports budget vs actual at department level
- Cost reports by: business unit, accounting department, account, cost item, period
- Multi-period comparison, multi-unit comparison
- Overhead allocation: general costs, depreciation, materials, CCDC, salary + insurance
- **Famous for deep cost/production accounting** (giá thành) — the product's core differentiator

### Budgeting by Department

- Budget can be declared per business unit, accounting department, account, and cost item
- Reports compare actual vs budget
- Annual budget declaration with period breakdown

### Reporting by Department

- Cost reports: detail and summary by department/unit
- Multi-period cost comparison
- Multi-unit comparison
- Can link vouchers to cost items for flexible reporting
- **P&L by department** supported via Fast Financial (the higher-tier product)
- Base Fast Accounting has cost reports but less built-in P&L-by-dept than Fast Financial

### User Integration

- Users assigned to departments via admin module
- Access control per function, per user
- Audit trails per user

### Sub-departments

- **Yes**, via tree structure of cost item groups or sub-accounts
- But less formal nesting than MISA's org structure levels

### Independent Bank Accounts / Tax Codes

- Not natively supported at department level (handled by multi-company setup instead)
- Fast supports multi-entity (multi `pháp nhân`) through separate databases

### Key Sources

- fast.com.vn: Phân hệ quản trị phí
- help.faonline.vn: Tổng quan bài toán giá thành
- accgroup.vn: Hướng dẫn sử dụng Fast (Mã_px, Mã_sp configuration)

---

## 3. Bravo ERP

### Department Structure

- **Full organization tree** as part of ERP structure
- Bravo is a full ERP with 12+ modules covering all departments
- Org structure defined centrally, used across all modules (Sales, Inventory, Production, HR, Accounting)
- Departments, branches, production units, warehouses all part of the master data
- **Highly customizable** — tree depth and node types adjustable to each enterprise

### Linking to Chart of Accounts

- **Flexible** — Bravo allows custom dimensions per transaction
- Costs can be tagged to: department, project, cost center, product line
- Accounts follow VAS standards; sub-accounts used for department-level breakdown
- Custom field mapping on all voucher screens
- No hard "dept → TK" constraint; analytical dimensions are separate

### Cost Allocation

- **Full cost accounting**: production costing, overhead allocation, by-product costing
- Department-level cost tracking via analytical dimensions
- Budget control integrated into purchase/expense workflow
- Cost allocation by: BOM, labor hours, machine hours, arbitrary % splits
- Strong for manufacturing enterprises with complex costing needs

### Budgeting by Department

- Bravo has a dedicated **budget management** module
- Budget per department, per cost center, per project
- Budget vs actual comparison in real-time dashboards
- Workflow approval enforces budget limits

### Reporting by Department

- **P&L by department**: native BI Dashboard for multi-dimensional analysis
- Report builder: customizable reports filtered by department, project, branch
- Consolidation: parent + subsidiary financial consolidation
- Bravo 10 ERP includes BI Dashboard with real-time KPIs
- **Strongest** among the three for multi-dimensional reporting

### User Integration

- Users belong to departments, with role-based access (`phân quyền đa cấp`)
- Permission system granular to individual vouchers and functions
- Workflow routing by department hierarchy
- Mobile app for department-level task management

### Sub-departments

- **Yes**, unlimited depth via open tree structure
- Each node can have independent cost tracking
- Workflow management per department

### Independent Bank Accounts / Tax Codes

- **Multi-entity** support: companies, branches, subsidiaries
- Separate tax codes per legal entity
- Consolidation across entities
- Bank accounts managed per entity

### Key Sources

- bravo.com.vn: Giới thiệu chung, Phân hệ cơ bản
- amis.misa.vn/245543/bravo-erp: Bravo ERP overview
- lacviet.vn/phan-mem-ke-toan: comparison table
- 1office.vn/phan-mem-bravo: features review

---

## Comparison Matrix

| Feature | MISA | Fast | Bravo |
|---|---|---|---|
| **Dept hierarchy depth** | 5 levels (tree) | 2 levels (unit + department) | Unlimited (tree) |
| **Link to COA** | Direct (TK lương theo phòng ban) | Via sub-accounts or cost items | Analytical dimensions |
| **Cost allocation** | CCDC/salary auto, overhead in costing | Strong cost mgmt module | Full production costing |
| **Budget by dept** | Yes (Ngân sách module) | Yes (per unit/dept) | Yes (dedicated module) |
| **P&L by dept** | Via report filtering | Via Fast Financial only | Native (BI Dashboard) |
| **Sub-departments** | Yes (5 levels) | Limited (tree via groups) | Yes (unlimited) |
| **User→Dept integration** | Native (employee→unit) | Admin assignment | Native (role-based) |
| **Bank/tax per dept** | Branch-level only | Not per dept | Entity-level only |
| **Customizability** | Moderate | High (custom fields) | Highest (full customization) |
| **Target user** | SME (all types) | SME (manufacturing/trading) | Mid-market & enterprise |

---

## Key Takeaways for SME Accounting System Design

1. **Hierarchy**: All three support multi-level org structure. MISA's 5-level tree is a good reference. Needs: Company → Branch → Department → Sub-department → Team.

2. **Chart of Accounts linkage**: MISA's direct `department → TK chi phí` mapping is simplest and most intuitive for Vietnamese accountants. Fast uses sub-accounts. Bravo uses analytical dimensions.

3. **Cost allocation**: Auto-allocation of salary by department is table stakes. CCDC/production overhead allocation is expected. Need flexible % split rules.

4. **Budgeting**: Department-level budget with actual vs planned comparison. This is a required feature across all three.

5. **P&L by department**: Critical for management accounting. Can be achieved via filtering (MISA), dedicated module (Fast Financial), or native multi-dimensional reporting (Bravo).

6. **User-department binding**: Employee→Department is foundational. Role-based access scoped by department expected.

7. **No software supports independent bank accounts/tax codes at department level** — only at branch/legal entity level. This is consistent with Vietnamese regulations.

8. **Vietnamese regulatory compliance**: All three support TT 200, TT 133, and the new TT 99/2025/TT-BTC. Department tagging must work within the standard VAS account framework.
