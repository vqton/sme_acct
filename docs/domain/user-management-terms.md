# Ubiquitous Language — User Management

---

## Core Terms

| Term (EN) | Term (VN) | Definition | Source |
|---|---|---|---|
| User | Người dùng | Person who accesses the accounting system. Has identity, roles, permissions | Domain |
| Chief Accountant | Kế toán trưởng | Head of accounting. Must have Approve permission. Legally responsible per Luật Kế toán 88/2015 QH13 Điều 54-55 | Regulatory |
| Accountant | Kế toán viên | Staff performing day-to-day accounting operations | Regulatory |
| Legal Representative | Người đại diện pháp luật | Person who legally represents the company. Must authorize tax transactions via VNeID | NĐ 69/2024/NĐ-CP |
| Role | Vai trò | Named set of permissions. Can be hierarchical (parent-child) | Domain |
| Permission | Quyền | Granular access right: View, Create, Edit, Delete, Print, Export, Approve | Domain |
| Feature | Chức năng | System function/module organized hierarchically | Domain |
| Organization Unit | Đơn vị / Phòng ban | Organizational structure unit. Hierarchical tree | Domain |
| Audit Trail | Lưu vết / Nhật ký | Log of all data modifications preserving original values | TT 99/2025/TT-BTC |
| Digital Signature | Chữ ký số | Electronic signature using certificate from CA provider | NĐ 23/2025/NĐ-CP |
| VNeID | VNeID | National Digital Identity platform by Ministry of Public Security | NĐ 69/2024/NĐ-CP |
| eTax | Thuế điện tử | Electronic tax declaration and payment system | TT 19/2021/TT-BTC |
| e-Invoice | Hóa đơn điện tử | Electronic invoice with tax authority code | NĐ 254/2026/NĐ-CP |
| Refresh Token | Mã làm mới | Long-lived token for obtaining new access tokens | Domain |
| MFA | Xác thực 2 lớp | Two-factor authentication for enhanced security | Domain |
| Lockout | Khóa tài khoản | Account temporarily disabled due to failed login attempts | Domain |

## Accounting Roles (Vietnamese Context)

| VN Name | EN Name | Permissions |
|---|---|---|
| Kế toán trưởng | Chief Accountant | View, Create, Edit, Print, Export, **Approve** (cannot self-approve own entries) |
| Kế toán tổng hợp | General Accountant | View, Create, Edit, Delete, Print, Export |
| Kế toán thuế | Tax Accountant | View, Create, Edit, Print, Export (tax related features only) |
| Kế toán công nợ | AP/AR Accountant | View, Create, Edit, Print (receivables/payables only) |
| Kế toán kho | Inventory Accountant | View, Create, Edit, Print (inventory features only) |
| Kế toán tiền lương | Payroll Accountant | View, Create, Edit, Print (payroll features only) |
| Thủ quỹ | Cashier | View, Create (cash management only — cannot edit/delete approved) |
| Kế toán viên | Staff Accountant | View, Create, Edit (basic data entry — no approve, no delete) |
| Quản trị hệ thống | System Admin | Full access (technical administration — not an accounting role) |
