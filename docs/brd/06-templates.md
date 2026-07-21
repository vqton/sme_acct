# Templates — User Management Module

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft

---

## T-01: User Registration Form (Vietnamese Accounting Roles)

```
====================================================================
              FORM ĐĂNG KÝ NGƯỜI DÙNG — USER REGISTRATION FORM
              SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

I. THÔNG TIN CÔNG TY / COMPANY INFORMATION
--------------------------------------------------------------
Công ty / Company:        ____________________________________________
Mã số thuế / Tax Code:    ____________________________________________
Loại hình doanh nghiệp / Enterprise Type:
  [ ] Công ty TNHH / LLC           [ ] Công ty CP / JSC
  [ ] Doanh nghiệp tư nhân / Sole  [ ] Hợp tác xã / Cooperative
  [ ] Công ty hợp danh / Partnership
Vốn điều lệ / Charter Capital:     ____________ VND

II. THÔNG TIN NGƯỜI DÙNG / USER PERSONAL INFORMATION
--------------------------------------------------------------
Họ và tên / Full Name:            ____________________________________
Tên đăng nhập / Username:         ____________________________________
Email:                            ____________________________________
Số điện thoại / Phone:            ____________________________________
Số CCCD / Citizen ID:            ____________________________________
Mã số thuế cá nhân / Personal Tax ID: ________________________________

III. PHÂN QUYỀN / ROLE ASSIGNMENT
--------------------------------------------------------------
Vai trò chính / Primary Role:
  [ ] Quản trị hệ thống / System Admin        (he-thong)
  [ ] Giám đốc / Director                     (giam-doc)
  [ ] Kế toán trưởng / Chief Accountant       (ke-toan-truong)
  [ ] Kế toán tổng hợp / General Accountant   (ke-toan-tong-hop)
  [ ] Kế toán thuế / Tax Accountant           (ke-toan-thue)
  [ ] Kế toán công nợ / AP-AR Accountant      (ke-toan-cong-no)
  [ ] Kế toán kho / Inventory Accountant      (ke-toan-kho)
  [ ] Kế toán tiền lương / Payroll Accountant (ke-toan-tien-luong)
  [ ] Thủ quỹ / Cashier                       (thu-quy)
  [ ] Kế toán viên / Staff Accountant         (ke-toan-vien)
  [ ] Kiểm soát viên / Controller             (kiem-soat)

Công ty được phân quyền / Assigned Companies:
  [ ] Tất cả công ty / All companies
  [ ] Chọn công ty / Select companies: ________________________________

IV. CẤU HÌNH BẢO MẬT / SECURITY CONFIGURATION
--------------------------------------------------------------
Yêu cầu 2FA / Require MFA:        [ ] Có / Yes   [ ] Không / No
Yêu cầu đổi mật khẩu / Force Password Change:   [ ] Có / Yes   [ ] Không / No

V. KIỂM TRA XUNG ĐỘT NHIỆM VỤ / SOD CHECK (BR-07)
--------------------------------------------------------------
  [ ] Kiểm tra: Người tạo không được là người phê duyệt
      / Creator != Approver check
  [ ] Kiểm tra: Thủ quỹ không được đồng thời là kế toán viên
      / Cashier != Accounting check
  [ ] Kiểm tra: Quản trị hệ thống không được giữ vai trò kế toán
      / Admin != Accounting role check

====================================================================
Người tạo / Created by: __________________   Ngày / Date: ____________
Kế toán trưởng duyệt / Chief Accountant: ____   Ngày / Date: ____________
====================================================================
```

**Note:** Current implementation does NOT have the enterprise type, charter capital, citizen ID, personal tax ID, SoD check fields. These are regulatory gaps.

---

## T-02: User Audit Log Report

```
====================================================================
          BÁO CÁO NHẬT KÝ HOẠT ĐỘNG — USER AUDIT LOG REPORT
          SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

Kỳ báo cáo / Report Period: ___/___/______  to  ___/___/______
Công ty / Company:            ____________________________________
Người dùng / User:            [All / Specific: __________________]

====================================================================
STT | THỜI GIAN         | NGƯỜI DÙNG        | HÀNH ĐỘNG              | CHI TIẾT                        | IP NGUỒN        | PHIÊN
----+-------------------+--------------------+------------------------+---------------------------------+------------------+-------
 1  | 21/07/2026 08:15 | nguyenva (KTT)    | USER_LOGIN             | User nguyenva logged in         | 192.168.1.100    | abc123
 2  | 21/07/2026 08:16 | nguyenva (KTT)    | PASSWORD_CHANGED       | Password changed                | 192.168.1.100    | abc123
 3  | 21/07/2026 09:00 | levanc (KT Thue)  | USER_LOGIN             | User levanc logged in           | 10.0.0.55        | def456
 4  | 21/07/2026 09:05 | levanc (KT Thue)  | TWO_FACTOR_ENABLED     | 2FA/TOTP enabled                | 10.0.0.55        | def456
 5  | 21/07/2026 09:30 | tranb (KT Truong) | TOKEN_REFRESHED        | Token refreshed                 | 203.0.113.50     | ghi789
 6  | 21/07/2026 10:00 | hoange (Admin)    | SESSION_REVOKED        | Session abc123 revoked          | 192.168.1.200    | jkl012
 7  | 21/07/2026 11:30 | nguyenva (KTT)    | DATA_CORRECTION        | Corrected journal entry JE-2026 | 192.168.1.100    | abc123
     |                   |                    |                        | -00123 (before/after saved)     |                  |
 8  | 21/07/2026 14:00 | System             | PASSWORD_RESET_REQUEST | Reset requested for levanc      | —                | —
     |                   |                    | _ED                    |                                  |                  |
----+-------------------+--------------------+------------------------+---------------------------------+------------------+-------

TỔNG SỐ BẢN GHI / TOTAL RECORDS: 8
NGƯỜI XEM BÁO CÁO / REPORT VIEWER: __________________
NGÀY XUẤT / EXPORT DATE: ___/___/_______

====================================================================
Ghi chú: Dữ liệu được lưu trữ tối thiểu 10 năm theo Luật Quản lý thuế.
Note: Data retained minimum 10 years per Tax Management Law.
====================================================================
```

**Current implementation:** Audit log captures events T-02 items 1-6 and 8. Item 7 (DATA_CORRECTION) is a gap — NOT implemented.

---

## T-03: Tax Declaration Permission Authorization Form

```
====================================================================
    GIẤY ỦY QUYỀN KHAI THUẾ — TAX DECLARATION AUTHORIZATION FORM
              (Theo NĐ 23/2025/NĐ-CP, NĐ 69/2024/NĐ-CP)
====================================================================

I. THÔNG TIN NGƯỜI ỦY QUYỀN / AUTHORIZER INFORMATION
--------------------------------------------------------------
Họ và tên / Full Name:       ______________________________________
Chức vụ / Position:          [ ] Kế toán trưởng / Chief Accountant
                              [ ] Giám đốc / Director
Số CCCD / Citizen ID:        ______________________________________
Chữ ký số / Digital Signature: [ ] Đã ký / Signed  [ ] Chưa ký / Unsigned

II. THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN / AUTHORIZED PERSON
--------------------------------------------------------------
Họ và tên / Full Name:       ______________________________________
Chức vụ / Position:          [ ] Kế toán thuế / Tax Accountant
                              [ ] Kế toán tổng hợp / General Accountant
Mã số thuế cá nhân / PTIN:   ______________________________________
VNeID Level:                 [ ] Level 1 [ ] Level 2 [ ] Level 3

III. PHẠM VI ỦY QUYỀN / AUTHORIZATION SCOPE
--------------------------------------------------------------
[ ] Khai thuế GTGT / VAT declaration (mẫu 01/GTGT)
[ ] Khai thuế TNDN / CIT declaration (mẫu 02/TNDN)
[ ] Khai thuế TNCN / PIT declaration (mẫu 03/TNCN)
[ ] Khai thuế môn bài / License tax (mẫu 04/MBAI)
[ ] Toàn bộ / All tax declarations

Kỳ tính thuế / Tax Period:   Từ / From: ___/______  Đến / To: ___/______

IV. THỜI HẠN / VALIDITY
--------------------------------------------------------------
Ngày bắt đầu / Start:  ___/___/______
Ngày kết thúc / End:    ___/___/______ (tối đa 12 tháng / max 12 months)
[ ] Không thời hạn / Indefinite (chỉ cho Kế toán trưởng / Chief Accountant only)

V. XÁC NHẬN / CONFIRMATION
--------------------------------------------------------------
Người ủy quyền (Ký số) / Authorizer (Digital Signature):
  __________________________   Ngày: ___/___/______

Người được ủy quyền (Xác nhận) / Authorized Person (Confirm):
  __________________________   Ngày: ___/___/______

Kế toán trưởng (Xác nhận) / Chief Accountant (Confirm):
  __________________________   Ngày: ___/___/______

====================================================================
Mã phiếu / Form ID: TAX-AUTH-2026-________
Trạng thái / Status: [ ] Có hiệu lực / Active  [ ] Đã thu hồi / Revoked
====================================================================
```

**Regulatory basis:** NĐ 23/2025/NĐ-CP (e-signature), NĐ 69/2024/NĐ-CP (VNeID). **NOT implemented.**

---

## T-04: Regulatory Compliance Checklist (Quarterly)

```
====================================================================
  BẢNG KIỂM TRA TUÂN THỦ PHÁP LÝ — REGULATORY COMPLIANCE CHECKLIST
  (Định kỳ hàng quý / Quarterly — Quý/Q ___/2026)
====================================================================

Công ty / Company: __________________________________________________
Ngày kiểm tra / Check Date: ___/___/______
Người kiểm tra / Checked by: ________________________________________

====================================================================
I. KIỂM TRA HỆ THỐNG PHẦN MỀM / SOFTWARE SYSTEM CHECKS
====================================================================
STT | Nội dung / Item                              | Đạt | Không | Ghi chú
    |                                               | Yes | đạt  | Notes
----+-----------------------------------------------+-----+------+--------
 1  | Audit trail captures all data corrections     | [_] | [_]  |
    | (TT 99/2025 Điều 28)                          |     |      |
 2  | No silent modification without trace          | [_] | [_]  |
    | (TT 99/2025 Điều 28)                          |     |      |
 3  | Alert/warning system for data manipulation    | [_] | [_]  |
    | (TT 99/2025 Điều 28)                          |     |      |
 4  | E-invoice connection active (NĐ 254/2026)     | [_] | [_]  |
 5  | Digital signature module operational          | [_] | [_]  |
    | (NĐ 23/2025/NĐ-CP)                            |     |      |
 6  | VNeID integration operational (NĐ 69/2024)    | [_] | [_]  |
 7  | Dữ liệu được sao lưu hàng ngày / Daily backup| [_] | [_]  |

====================================================================
II. KIỂM TRA PHÂN QUYỀN NGƯỜI DÙNG / USER PERMISSION CHECKS
====================================================================
 8  | Phân nhiệm rõ ràng / Segregation of duties    | [_] | [_]  |
    | enforced (TT 103/2005)                         |     |      |
 9  | Creator ≠ Approver enforced                    | [_] | [_]  |
10  | Cashier ≠ Accounting role enforced             | [_] | [_]  |
11  | System admin không giữ vai trò kế toán         | [_] | [_]  |
    | / not in accounting role                       |     |      |
12  | All users have ≥1 role assigned                | [_] | [_]  |
13  | No expired/unused accounts active              | [_] | [_]  |

====================================================================
III. KIỂM TRA BẢO MẬT / SECURITY CHECKS
====================================================================
14  | Tất cả user có 2FA đã kích hoạt               | [_] | [_]  |
    | / 2FA enabled for all users                    |     |      |
15  | No password reuse violations detected           | [_] | [_]  |
16  | No accounts currently locked                   | [_] | [_]  |
17  | Session idle timeout configured                 | [_] | [_]  |
18  | IP whitelist active (if applicable)             | [_] | [_]  |

====================================================================
IV. KIỂM TRA LƯU TRỮ / DATA RETENTION CHECKS
====================================================================
19  | Chứng từ kế toán ≥5 năm / Vouchers ≥5 yr       | [_] | [_]  |
20  | Tờ khai thuế ≥10 năm / Tax returns ≥10 yr      | [_] | [_]  |
21  | Hóa đơn điện tử ≥10 năm / E-invoices ≥10 yr    | [_] | [_]  |
22  | Audit logs accessible and intact                | [_] | [_]  |

====================================================================
KẾT LUẬN / CONCLUSION:
  [ ] Đạt yêu cầu / Compliant
  [ ] Không đạt yêu cầu — cần khắc phục / Non-compliant — requires action

Kế toán trưởng (Ký) / Chief Accountant (Sign): ______________________
Ngày / Date: ___/___/______
====================================================================
```

**Note:** Most items (1-6, 8-10, 17-18, 22) are NOT compliant in the current implementation.

---

## T-05: User Role Definition Template (11 Vietnamese Roles)

```
====================================================================
   BẢNG ĐỊNH NGHĨA VAI TRÒ — ROLE DEFINITION MATRIX
   SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

Công ty / Company: __________________________________________________
Ngày cập nhật / Updated: ___/___/______

====================================================================
MÃ ROLE | TÊN TIẾNG VIỆT          | TÊN TIẾNG ANH           | HỆ THỐNG? | GHÉP NHIỀU?
ID      | Vietnamese Name          | English Name            | System?   | Multiple?
--------+--------------------------+-------------------------+-----------+--------------
he-thong| Quản trị hệ thống        | System Admin            | Có / Yes  | Không / No
giam-doc| Giám đốc                 | Director                | Không/No  | Có / Yes
ke-toan-| Kế toán trưởng            | Chief Accountant        | Không/No  | Không/No*
truong  |                          |                         |           |
ke-toan-| Kế toán tổng hợp         | General Accountant      | Không/No  | Có / Yes
tong-hop|                          |                         |           |
ke-toan-| Kế toán thuế             | Tax Accountant          | Không/No  | Có / Yes
thue    |                          |                         |           |
ke-toan-| Kế toán công nợ          | AP/AR Accountant        | Không/No  | Có / Yes
cong-no |                          |                         |           |
ke-toan-| Kế toán kho              | Inventory Accountant    | Không/No  | Có / Yes
kho     |                          |                         |           |
ke-toan-| Kế toán tiền lương       | Payroll Accountant      | Không/No  | Có / Yes
tien-   |                          |                         |           |
luong   |                          |                         |           |
thu-quy | Thủ quỹ                  | Cashier                 | Không/No  | Không/No**
ke-toan-| Kế toán viên             | Staff Accountant        | Không/No  | Có / Yes
vien    |                          |                         |           |
kiem-   | Kiểm soát viên           | Controller              | Không/No  | Không/No
soat    |                          |                         |           |

====================================================================
QUYỀN MẶC ĐỊNH THEO VAI TRÒ / DEFAULT PERMISSIONS PER ROLE
====================================================================
MÃ ROLE | company | company | company | user  | report | trans  | settings| audit
ID      | :read   | :create | :update | :read | :read  | :approve| :manage | :view
--------+---------+---------+---------+-------+--------+---------+---------+-------
he-thong|   X     |   X     |   X     |   X   |   X    |   X     |   X     |   X
giam-doc|   X     |   X     |   X     |   X   |   X    |   X     |   X     |   X
ke-toan-|   X     |   X     |   X     |   X   |   X    |   X     |   X     |   X
truong  |         |         |         |       |        |         |         |
ke-toan-|   X     |   X     |   X     |   X   |   X    |         |         |
tong-hop|         |         |         |       |        |         |         |
ke-toan-|   X     |         |         |       |   X    |         |         |
thue    |         |         |         |       |        |         |         |
ke-toan-|   X     |         |         |       |        |         |         |
cong-no |         |         |         |       |        |         |         |
ke-toan-|   X     |         |         |       |        |         |         |
kho     |         |         |         |       |        |         |         |
ke-toan-|   X     |         |         |       |   X    |         |         |
tien-   |         |         |         |       |        |         |         |
luong   |         |         |         |       |        |         |         |
thu-quy |   X     |         |         |       |        |         |         |
ke-toan-|   X     |   X     |         |       |        |         |         |
vien    |         |         |         |       |        |         |         |
kiem-   |   X     |         |         |       |   X    |         |         |   X
soat    |         |         |         |       |        |         |         |

====================================================================
* Kế toán trưởng là chức danh pháp lý, không thể kiêm nhiệm kế toán khác
  / Chief Accountant is a legal title, cannot hold other accounting roles
** Thủ quỹ không được đồng thời ghi sổ kế toán (BR-07.2)
  / Cashier cannot also record accounting entries (BR-07.2)
====================================================================
```

**Reference:** `domain/entities/Role.ts:26-115` for exact implementation.

---

## T-06: Login Page UI Mockup

```
====================================================================
                    ĐĂNG NHẬP — SME ACCOUNTING
                    LOGIN — SME Accounting System
====================================================================

                              [LOGO]

                    Hệ thống Kế toán Doanh nghiệp SME
                    SME Enterprise Accounting System

    ┌──────────────────────────────────────────────────────┐
    │                     ĐĂNG NHẬP / LOGIN                │
    │                                                      │
    │  Tên đăng nhập / Username                            │
    │  ┌──────────────────────────────────────────────────┐│
    │  │ [_____________________________]                  ││
    │  └──────────────────────────────────────────────────┘│
    │                                                      │
    │  Mật khẩu / Password                                 │
    │  ┌──────────────────────────────────────────────────┐│
    │  │ [_____________________________]  [👁]             ││
    │  └──────────────────────────────────────────────────┘│
    │                                                      │
    │  ┌──────────────────────────────────────────────────┐│
    │  │               [ĐĂNG NHẬP / LOGIN]                 ││
    │  └──────────────────────────────────────────────────┘│
    │                                                      │
    │  Quên mật khẩu? / Forgot Password?                   │
    │                                                      │
    │  ─────────────────────────────────────────────────── │
    │                                                      │
    │  Chưa có tài khoản? / No account? [Đăng ký / Register]│
    └──────────────────────────────────────────────────────┘

                    © 2026 SME Accounting
                    Phiên bản / Version 0.1.0

====================================================================

--- AFTER LOGIN (with 2FA) ---
    ┌──────────────────────────────────────────────────────┐
    │              XÁC THỰC HAI YẾU TỐ / 2FA              │
    │                                                      │
    │  Nhập mã từ ứng dụng xác thực / Enter code from      │
    │  authenticator app                                   │
    │                                                      │
    │  ┌──────────────────────────────────────────────────┐│
    │  │ [_____] [_____] [_____] [_____] [_____] [_____]  ││
    │  └──────────────────────────────────────────────────┘│
    │                                                      │
    │  ┌──────────────────────────────────────────────────┐│
    │  │               [XÁC NHẬN / VERIFY]                 ││
    │  └──────────────────────────────────────────────────┘│
    │                                                      │
    │  Sử dụng mã dự phòng? / Use backup code?             │
    └──────────────────────────────────────────────────────┘

--- ERROR STATE ---
    ┌──────────────────────────────────────────────────────┐
    │  [⚠] Tên đăng nhập hoặc mật khẩu không đúng          │
    │      Invalid username or password                    │
    │      (Còn 3 lần thử / 3 attempts remaining)         │
    └──────────────────────────────────────────────────────┘

--- LOCKOUT STATE ---
    ┌──────────────────────────────────────────────────────┐
    │  [🔒] Tài khoản bị khóa do nhập sai quá nhiều lần    │
    │      Account locked due to too many failed attempts  │
    │      Thử lại sau / Retry after: 27 phút / minutes    │
    └──────────────────────────────────────────────────────┘
```

**Implementation:** Login via `POST /api/auth/login` (authController.ts:31-59), rate limiter (rateLimiter.ts), 2FA verification via `POST /2fa/verify-login` (authController.ts:194-202).

---

## T-07: User Profile / Account Settings Page

```
====================================================================
           THÔNG TIN TÀI KHOẢN — ACCOUNT SETTINGS
           SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

[THÔNG TIN CÁ NHÂN / PERSONAL INFO]        [Thay đổi / Change]
────────────────────────────────────────────────────────────────────
Họ và tên / Full Name:     Nguyễn Văn A
Email:                     nguyenvana@company.vn
Tên đăng nhập / Username:  nguyenva           (không thể thay đổi)
Số điện thoại / Phone:     +84 912 345 678

Công ty hiện tại / Current Company: Công ty TNHH ABC
Vai trò / Role:                        Kế toán tổng hợp (ke-toan-tong-hop)

[BẢO MẬT / SECURITY]                  [Thay đổi / Change]
────────────────────────────────────────────────────────────────────
Mật khẩu / Password:        ************                 [Đổi mật khẩu]
Trạng thái 2FA / 2FA Status:
  [✓] Đã kích hoạt / Enabled         [Vô hiệu hóa / Disable]
  Phương thức: TOTP (Google Auth/Microsoft Auth)
  Mã dự phòng còn lại: 8 / 10        [Xem mã / View codes]

[PHIÊN ĐĂNG NHẬP / ACTIVE SESSIONS]   [Xem tất cả / View all]
────────────────────────────────────────────────────────────────────
Thiết bị / Device        | IP         | Đăng nhập / Login | Hoạt động / Last
─────────────────────────+------------+-------------------+-----------------
Chrome trên Windows      | 192.168.1.100| 21/07 08:15     | 21/07 14:30
Firefox trên macOS       | 10.0.0.55   | 21/07 09:00     | 21/07 11:00
[Safari trên iPhone]     | 203.0.113.50| 20/07 16:00     | 20/07 17:30

[NHẬT KÝ HOẠT ĐỘNG / ACTIVITY LOG]    [Xem tất cả / View all]
────────────────────────────────────────────────────────────────────
21/07 14:30 — Đăng nhập / Login
21/07 11:00 — Đổi mật khẩu / Password changed
21/07 09:30 — Xác thực 2FA / 2FA verified
21/07 09:00 — Đăng nhập / Login
```

**Implementation:** Profile data from `users` table via `AuthService` + `UserRepository`. Sessions from `refresh_tokens` via `listActiveSessions()`. Audit log via `audit_logs` table.

---

## T-08: Session Management Dashboard Page

```
====================================================================
      QUẢN LÝ PHIÊN ĐĂNG NHẬP — SESSION MANAGEMENT
      SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

Người dùng / User: Nguyễn Văn A (nguyenva)
Công ty / Company: Công ty TNHH ABC

[ TẤT CẢ PHIÊN / ALL SESSIONS ]          [ Thu hồi tất cả / Revoke All ]

====================================================================
  | Thiết bị / Device             | Địa chỉ IP   | Đăng nhập      | Hoạt động     | Trạng thái   |
  |                               |              |                | gần nhất      |              |
--+-------------------------------+---------------+----------------+---------------+--------------+
1 | Chrome 120 / Windows 11       | 192.168.1.100| 21/07 08:15    | 21/07 14:30   | Đang hoạt    |
  |                               |              |                |               | động Active  |
--+-------------------------------+---------------+----------------+---------------+--------------+
2 | Firefox 128 / macOS 14        | 10.0.0.55    | 21/07 09:00    | 21/07 11:00   | Đang hoạt    |
  |                               |              |                |               | động Active  |
--+-------------------------------+---------------+----------------+---------------+--------------+
3 | Safari 17 / iOS 18            | 203.0.113.50 | 20/07 16:00    | 20/07 17:30   | Đang hoạt    |
  |                               |              |                |               | động Active  |
--+-------------------------------+---------------+----------------+---------------+--------------+
4 | Chrome 119 / Android 14       | 198.51.100.20 | 19/07 08:00    | 19/07 08:30   | Đã thu hồi   |
  |                               |              |                |               | Revoked      |
--+-------------------------------+---------------+----------------+---------------+--------------+

[ THU HỒI PHIÊN / REVOKE SESSION ]
  Xác nhận thu hồi phiên đăng nhập trên [Chrome / Windows]?
  / Confirm revoke session on [Chrome / Windows]?
  
  [Hủy / Cancel]         [Xác nhận thu hồi / Confirm Revoke]

[ THU HỒI TẤT CẢ / REVOKE ALL ]
  Bạn sẽ bị đăng xuất khỏi tất cả thiết bị. Tiếp tục?
  / You will be logged out from all devices. Continue?
  
  [Hủy / Cancel]         [Xác nhận / Confirm]
```

**Implementation:** `listActiveSessions()` at `AuthService.ts:431-441`, `revokeSession()` at `AuthService.ts:443-459`, `revokeAllSessions()` at `AuthService.ts:419-429`.

---

## T-09: 2FA Setup Page (Secret, Backup Codes, Verify)

```
====================================================================
    THIẾT LẬP XÁC THỰC HAI YẾU TỐ — TWO-FACTOR AUTH SETUP
    SME Accounting — Hệ thống Kế toán Doanh nghiệp SME
====================================================================

[ BƯỚC 1: QUÉT MÃ QR / SCAN QR CODE ]
────────────────────────────────────────────────────────────────────
  Sử dụng ứng dụng xác thực (Google Authenticator, Microsoft
  Authenticator, Authy) để quét mã QR bên dưới:
  / Use an authenticator app to scan the QR code below:

              ┌─────────────────────────┐
              │    ██ ▄▄▄▄▄▄ ▄█▄ ▄▄▄▄  │
              │    ▄▄▄ █ ▄ █▄▄▄█ █▄█   │
              │    ▄▄▄▄▄▄ ████ ▄ ▄▄▄▄▄  │
              │     ▄▄▄ ▄█▄▄█ █▄▄▄█▄▄   │
              │    ───[QR CODE]────     │
              └─────────────────────────┘

  Hoặc nhập mã bí mật / Or enter secret key manually:
  
  Mã bí mật / Secret Key:  JBSW Y3DP EBIW AZTG CQ2T AAAAA BBBB CCCC

[ BƯỚC 2: NHẬP MÃ XÁC THỰC / ENTER VERIFICATION CODE ]
────────────────────────────────────────────────────────────────────
  Nhập mã 6 số từ ứng dụng xác thực để xác nhận:
  / Enter the 6-digit code from your authenticator app to confirm:
  
  ┌──────────────────────────────────────────────────────┐
  │  [_____] [_____] [_____] [_____] [_____] [_____]    │
  └──────────────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────────────┐
  │              [XÁC NHẬN & KÍCH HOẠT / VERIFY &       │
  │                      ENABLE]                         │
  └──────────────────────────────────────────────────────┘

[ BƯỚC 3: LƯU MÃ DỰ PHÒNG / SAVE BACKUP CODES ]
────────────────────────────────────────────────────────────────────
  ⚠ LƯU CÁC MÃ SAU ĐÂY Ở NƠI AN TOÀN!
    / SAVE THE FOLLOWING CODES IN A SAFE PLACE!
    
  Các mã này chỉ hiển thị MỘT LẦN. Nếu mất thiết bị xác thực,
  bạn cần các mã này để đăng nhập.
  / These codes are shown ONCE only. If you lose your authenticator
  device, you will need these codes to log in.
  
  ┌──────────────────────────────────────────────────────┐
  │  ┌────────────────────────────────────────────────┐  │
  │  │  ABCD1234    EFGH5678    IJKL9012    MNOP3456  │  │
  │  │  QRST7890    UVWX1234    YZAB5678    CDEF9012  │  │
  │  │  GHIJ3456    KLMN7890                          │  │
  │  └────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────┘

  [ ] Tôi đã lưu các mã dự phòng ở nơi an toàn
      / I have saved the backup codes in a safe place

  ┌──────────────────────────────────────────────────────┐
  │              [HOÀN TẤT / COMPLETE]                   │
  └──────────────────────────────────────────────────────┘

[ TRẠNG THÁI SAU KHI HOÀN TẤT / POST-SETUP STATUS ]
────────────────────────────────────────────────────────────────────
  [✓] Xác thực hai yếu tố đã được kích hoạt
      2FA has been enabled
  [✓] 10 mã dự phòng đã được tạo
      10 backup codes generated (8 còn lại / remaining)
  [ ] Đã kiểm tra đăng nhập với 2FA
      Tested login with 2FA
```

**Implementation:** `setupTwoFactor()` at `AuthService.ts:550-583`, `verifyAndEnableTwoFactor()` at `AuthService.ts:585-610`, backup codes at `AuthService.ts:565-580`. Uses `otpauth` library for TOTP generation with SHA1, 6 digits, 30-second period.

---

## Template Cross-Reference

| Template | UC Reference | BR Reference | Implementation Status |
|---|---|---|---|
| T-01 User Registration Form | UC-06, UC-10 | BR-01, BR-02, BR-07 | Partial (missing fields) |
| T-02 Audit Log Report | UC-05, UC-13 | BR-03, BR-08 | Partial (auth events only) |
| T-03 Tax Declaration Auth Form | UC-11 | BR-03 | Not implemented |
| T-04 Compliance Checklist | All | BR-03, BR-08 | Not compliant |
| T-05 Role Definition Matrix | UC-10 | BR-02 | Implemented |
| T-06 Login Page | UC-01, UC-08 | BR-01 | Implemented |
| T-07 Account Settings | UC-04, UC-08 | BR-01 | Implemented |
| T-08 Session Management | UC-05 | BR-01 | Implemented |
| T-09 2FA Setup Page | UC-08 | BR-01 | Implemented |
