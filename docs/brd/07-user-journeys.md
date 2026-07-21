# User Journeys — User Management Module

**Version:** 2.0
**Date:** 2026-07-21
**Author:** BA Lead + Chief Accountant (20+ yrs)
**Status:** Draft

---

## Journey J-01: New Accountant Onboarding

**Persona:** Nguyễn Văn A — Newly hired General Accountant (Kế toán tổng hợp), 28 years old, graduated 3 years ago, first job at SME company.
**Company:** Công ty TNHH Sản xuất ABC (ABC Manufacturing Co., Ltd) — 50 employees, 1 subsidiary.
**Goal:** Get access to accounting system, learn the workflow, start processing daily entries.

```
DAY 1 — HIRED
--------------
08:00 — Nhận quyết định tuyển dụng / Receives hiring decision from HR
08:30 — Trưởng phòng Nhân sự thông báo cho Quản trị hệ thống
        / HR Manager notifies System Admin (Hoàng Văn E)
        Email: "Tuyển dụng mới: Nguyễn Văn A, Kế toán tổng hợp,
               bắt đầu 01/08/2026"

08:45 — Hoàng Văn E (IT Admin) mở trang Quản lý Người dùng
        / IT Admin opens User Management page

Hệ thống: Hiển thị form T-01 — User Registration Form
Admin nhập:
  - Họ tên: Nguyễn Văn A
  - Username: nguyenva
  - Email: nguyenvana@abcmfg.vn
  - Vai trò: Kế toán tổng hợp (ke-toan-tong-hop)
  - Công ty: Công ty TNHH Sản xuất ABC
  - Yêu cầu 2FA: Có

08:50 — Admin gửi / submits form

Hệ thống:
  - Kiểm tra unique username/email (PASS)
  - Tạo user: id=crypto.randomUUID(), isActive=true
  - Hash mật khẩu tạm: bcrypt(MatKhauTam@2026, 10)
  - Tạo bản ghi trong user_companies: {userId, companyId, role: "ke-toan-tong-hop", isActive:true}
  - Ghi audit: USER_CREATED_BY_ADMIN
  - Trả về thông tin user + mật khẩu tạm

09:00 — Admin chuyển tiếp thông tin cho Nguyễn Văn A
        / Admin forwards credentials to Nguyen Van A

EMAIL NỘI BỘ GỬI TỚI nguyenvana@abcmfg.vn:
  Chủ đề: [SME Accounting] Tài khoản đã được tạo / Account Created
  Nội dung:
    Chào anh/chị Nguyễn Văn A,
    Tài khoản SME Accounting đã được tạo.
    - URL: https://acct.abcmfg.vn/login
    - Tên đăng nhập: nguyenva
    - Mật khẩu tạm thời: MatKhauTam@2026
    Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu tiên.
    Yêu cầu thiết lập xác thực hai yếu tố (2FA).

DAY 1 — FIRST LOGIN
-----------
09:30 — Nguyễn Văn A mở URL đăng nhập / opens login URL
  Bước 1: Nhập username + mật khẩu tạm
  Hệ thống: Xác thực thành công (không có 2FA, chưa có mã dự phòng)
            Token JWT được tạo

  Bước 2: (TBD — hiện tại chưa có Force Password Change)
          Nguyễn chủ động đổi mật khẩu qua /api/auth/change-password
          Mật khẩu mới: NguyenVanA@2026 (thỏa mãn policy: 16 ký tự,
          uppercase, lowercase, digit, special)

  Hệ thống:
    - bcrypt.hashSync(newPassword, 10)
    - Lưu hash cũ vào password_history
    - Thu hồi tất cả refresh tokens
    - Ghi audit: PASSWORD_CHANGED

  Bước 3: Thiết lập 2FA — Truy cập /api/auth/2fa/setup
  Hệ thống:
    - Tạo TOTP secret (OTPAuth, SHA1, 30s period)
    - Tạo 10 mã dự phòng (crypto.randomBytes(4).hex.toUpperCase)
    - Trả về secret + backup codes

  Nguyễn: Mở Google Authenticator, quét QR (hoặc nhập thủ công secret)
  Xác nhận: Nhập mã 6 số từ ứng dung, gọi /api/auth/2fa/verify

  Hệ thống:
    - TOTP.validate({token, window:1}) -> delta !== null
    - twoFactorEnabled = true
    - Ghi audit: TWO_FACTOR_ENABLED

  Nguyễn: Lưu 10 mã dự phòng vào ví mật khẩu / saves backup codes

WEEK 1 — LEARNING
-----------
- Nguyễn khám phá hệ thống, tạo bút toán đầu tay / creates first journal entry
- Nhận thấy quyền truy cập còn hạn chế (chỉ company:read, company:create)
- Gửi yêu cầu bổ sung quyền cho Kế toán trưởng
- Kế toán trưởng (Trần Thị B) xem xét và điều chỉnh phân quyền

MONTH 1 — FULL PRODUCTIVITY
-----------
- Nguyễn có thể xem, tạo, sửa bút toán
- Không thể phê duyệt (chỉ Kế toán trưởng mới có transaction:approve)
- Có thể xuất báo cáo (report:read)
- Đang làm việc hiệu quả
```

**Technical touchpoints:**
- `POST /api/auth/register` (authController.ts:61-76)
- `POST /api/auth/change-password` (authController.ts:88-98)
- `POST /api/auth/2fa/setup`, `/2fa/verify` (authController.ts:175-192)
- `AuthService.register()` (AuthService.ts:122-161)
- `AuthService.changePassword()` (AuthService.ts:381-417)
- `AuthService.setupTwoFactor()`, `verifyAndEnableTwoFactor()` (AuthService.ts:550-610)

---

## Journey J-02: Chief Accountant Monthly Review

**Persona:** Trần Thị B — Chief Accountant (Kế toán trưởng), 48 years old, 15 years experience, CPA Vietnam (Chứng chỉ hành nghề kế toán).
**Company:** Công ty TNHH Sản xuất ABC — Monthly closing operations.
**Goal:** Verify accounting data integrity before monthly close.

```
STEP 1: LOGIN WITH 2FA
-----------
07:45 — Trần Thị B mở SME Accounting trên Chrome / Work PC
  Nhập username: tranb
  Nhập password: ********
  
Hệ thống:
  - RateLimiter.isAllowed(clientIp) -> true (first attempt)
  - userRepo.findByUsername('tranb') -> found
  - user.isActive -> true
  - user.lockoutUntil -> null (not locked)
  - bcrypt.compareSync(password, hash) -> true
  - twoFactorEnabled -> true
  
  [2FA REQUIRED]
  - Tạo JWT tempToken: 5 phút, purpose='2fa'
  - Trả về: { requires2FA: true, tempToken }

07:46 — Trần mở Google Authenticator trên điện thoại, nhập mã 6 số
  Gửi POST /api/auth/2fa/verify-login

Hệ thống:
  - jwt.verify(tempToken) -> hợp lệ
  - TOTP.validate({token: code, window:1}) -> delta=0 (đúng)
  - completeLogin():
    - companyRepo.findCompaniesForUser() -> 1 company (auto-select)
    - createAccessToken(userId, username, companyId) -> 15-min JWT
    - createRefreshToken(userId, companyId) -> 7-day token
  - Đăng nhập thành công. Redirect đến Dashboard.

STEP 2: REVIEW AUDIT LOG
-----------
08:00 — Trần mở trang Nhật ký hoạt động (Audit Log)
  Lọc: "Tháng 7/2026, tất cả người dùng"
  
Hệ thống: Truy vấn audit_logs WHERE created_at BETWEEN date1 AND date2

Trần kiểm tra:
  - Xác nhận không có đăng nhập bất thường từ IP lạ
  - Xác nhận tất cả người dùng đã kích hoạt 2FA
  - Xác nhận không có đổi mật khẩu không rõ lý do
  - Phát hiện: Người dùng "levanc" (Tax Accountant) đăng nhập lúc 02:00 AM
    → Đánh dấu để kiểm tra / Flags for review

STEP 3: CHECK USER PERMISSIONS
-----------
08:30 — Trần mở danh sách người dùng / User list
  Xem phân quyền hiện tại / View current role assignments
  Phát hiện: Nhân viên mới (Nguyễn Văn A) chưa có quyền report:read
  → Bổ sung quyền / Grants additional permission

Hệ thống:
  - AuthorizationService.assignRole('nguyenva', 'ke-toan-tong-hop')
  - Ghi audit: ROLE_ASSIGNED

STEP 4: REVIEW SoD CONFLICTS
-----------
09:00 — Trần chạy báo cáo Xung đột nhiệm vụ / SoD Conflict Report
  (Chức năng: chưa được implement trên UI)

Hiện tại (GAP):
  - SoDConflictMatrix.ts đã định nghĩa 3 loại xung đột
  - Nhưng chưa được tích hợp vào giao diện hoặc quy trình
  - Trần phải tự kiểm tra thủ công

STEP 5: MONTH-END APPROVAL
-----------
16:00 — Trần xem danh sách bút toán chờ phê duyệt
  (Chức năng approval workflow: chưa implement — GAP)
  
  Hiện tại, Trần phải kiểm tra thủ công từng bút toán qua báo cáo
  Không có dual-control enforcement (GAP — TT 99/2025 Điều 28)
```

**Gaps highlighted in this journey:**
1. No audit trail for data corrections (TT 99/2025 Điều 28)
2. SoD conflicts not visible in UI (BR-07)
3. No approval workflow for journal entries (BR-06)
4. Suspicious login (02:00 AM) — no geo/IP alert system

---

## Journey J-03: Tax Accountant Filing VAT Return

**Persona:** Lê Văn C — Tax Accountant (Kế toán thuế), 35 years old, 5 years experience, certified tax agent.
**Company:** Công ty TNHH Sản xuất ABC — Monthly VAT declaration.
**Goal:** Prepare and file VAT return for July 2026 before 20th deadline.

```
STEP 1: LOGIN
-----------
08:00 — Lê Văn C đăng nhập (như J-02, 2FA enabled)
  POST /api/auth/login, POST /api/auth/2fa/verify-login

STEP 2: ACCESS TAX MODULE
-----------
08:05 — Lê mở module Thuế / Tax module
  Hệ thống: Kiểm tra permission qua requirePermission() middleware
    - Lê có role 'ke-toan-thue' (Tax Accountant)
    - Role permissions: [company:read, report:read]
    - Tax module yêu cầu thêm 'tax:declare' (chưa định nghĩa trong PERMISSIONS)

  [GAP - UC-11]: Tax declaration permission chưa được implement
  Lê có thể xem báo cáo nhưng không thể kê khai thuế qua hệ thống
  → Phải sử dụng phần mềm khác để khai thuế (eTax hoặc HTKK)

STEP 3: PREPARE VAT DATA (via manual export)
-----------
08:30 — Lê xuất báo cáo từ SME Accounting
  Hệ thống: Export dữ liệu (report:read) cho phép

STEP 4: DIGITAL SIGNING (GAP — UC-12)
-----------
09:00 — Lê chuẩn bị tờ khai VAT (mẫu 01/GTGT)
  [GAP]: Hệ thống không hỗ trợ ký số (NĐ 23/2025/NĐ-CP)
  
  Lê phải:
  1. Mở eSigner (phần mềm của Tổng cục Thuế)
  2. Tải file XML tờ khai từ hệ thống khác
  3. Ký số bằng USB token / remote HSM
  4. Nộp qua cổng thuế điện tử

  Nếu hệ thống có tích hợp digital signature:
  - Gọi eSigner API từ SME Accounting
  - Ký số tự động
  - Nộp qua Tax Authority API
  - Lưu biên nhận nộp thuế

STEP 5: VNeID VERIFICATION (GAP — UC-13)
-----------
  [GAP - NĐ 69/2024]: Giao dịch thuế điện tử yêu cầu VNeID Level ≥2
  Lê chưa có VNeID tích hợp → không thể thực hiện giao dịch thuế
  điện tử qua hệ thống (BLOCKER)

CURRENT REALITY:
  Lê sử dụng song song SME Accounting (ghi sổ) + eTax/HTKK (khai thuế)
  Đây là workflow tay đôi, tốn thời gian, nhiều sai sót
```

**Critical blockers for this journey:**
1. VNeID integration NOT implemented (NĐ 69/2024) — BLOCKER
2. Digital signature NOT implemented (NĐ 23/2025) — BLOCKER
3. Tax declaration permission NOT implemented (UC-11)
4. Tax authority API NOT implemented

---

## Journey J-04: Legal Representative VNeID Setup

**Persona:** Phạm Văn D — Director (Giám đốc) and Legal Representative (Người đại diện theo pháp luật) of Công ty TNHH Sản xuất ABC, 52 years old.
**Goal:** Register as legal representative, set up VNeID Level 2, authorize e-invoice usage.

```
STEP 1: COMPANY REGISTRATION
-----------
Phạm Văn D là Giám đốc kiêm Người đại diện theo pháp luật
  Công ty đã đăng ký trong hệ thống SME Accounting
  Vai trò: giam-doc (Director)
  Quyền: company:read, company:create, company:update, company:delete,
         user:read, report:read, transaction:approve, settings:manage, audit:view

  [GAP]: Company entity THIẾU các trường:
    - legal_representative_name (họ tên người đại diện)
    - legal_representative_id (số CCCD)
    - legal_representative_position (chức vụ)
    - vneid_level (cấp độ VNeID)
    - charter_capital (vốn điều lệ)
    - enterprise_type (loại hình doanh nghiệp)
    - business_lines (ngành nghề kinh doanh kèm VSIC code)

STEP 2: VNeID VERIFICATION (GAP — NĐ 69/2024)
-----------
  [REQUIRED - Not Implemented]
  Quy trình yêu cầu:
  1. Phạm Văn D quét mã QR từ ứng dụng VNeID trên điện thoại
  2. Hệ thống SME Accounting gọi API VNeID quốc gia
  3. Xác thực: số CCCD, họ tên, ngày sinh, ảnh khuôn mặt
  4. VNeID trả về: {verified: true, level: 2, thongTinCongDan}
  5. Hệ thống lưu:
     - user.vneid_level = 2
     - user.vneid_verified_at = now()
     - company.legal_representative_vneid = verified

STEP 3: BIOMETRIC FOR E-INVOICE (GAP — Công văn 3078/CT-NVT)
-----------
  [REQUIRED - Not Implemented]
  15/05/2026: Công văn 3078/CT-NVT yêu cầu xác thực sinh trắc học
  cho người đại diện pháp luật khi đăng ký/thay đổi sử dụng hóa đơn

  1. Phạm Văn D chụp ảnh khuôn mặt qua camera
  2. Hệ thống so khớp với ảnh từ VNeID / CCCD gắn chip
  3. Xác thực thành công → được phép đăng ký hóa đơn điện tử

STEP 4: DIGITAL SIGNATURE CERTIFICATE (GAP — NĐ 23/2025)
-----------
  Phạm Văn D cần cài đặt chứng thư số / digital certificate
  - Mua từ nhà cung cấp dịch vụ chứng thực chữ ký số (CA)
  - Cài đặt USB token hoặc remote HSM
  - Đăng ký với hệ thống SME Accounting
  - Chứng thư số được dùng để ký:
    - Tờ khai thuế / Tax declarations
    - Hóa đơn điện tử / E-invoices
    - Báo cáo tài chính / Financial statements
```

**Regulatory basis:** NĐ 69/2024 Điều 9-12, NĐ 23/2025 Điều 8-15, Công văn 3078/CT-NVT ngày 15/05/2026.

---

## Journey J-05: System Admin User Management

**Persona:** Hoàng Văn E — System Administrator (Quản trị hệ thống), 30 years old, IT background, manages SME Accounting for ABC Manufacturing.
**Company:** Công ty TNHH Sản xuất ABC (and its subsidiary).
**Goal:** Manage all user accounts, roles, permissions across the company.

```
DAILY TASKS / CÔNG VIỆC HÀNG NGÀY
-----------
08:00 — Hoàng đăng nhập với role 'he-thong'
  Quyền: ALL_PERMISSIONS (full access)
  Có thể quản lý tất cả công ty trong hệ thống

TASK 1: CREATE NEW USER (UC-10 gap — admin create not implemented)
-----------
  Hiện tại: Chỉ có self-registration qua POST /api/auth/register
  Hoàng phải tạo user thủ công qua register endpoint, sau đó assign
  role qua AuthorizationService.assignRole()

  [GAP]: Không có endpoint POST /api/admin/users
  Hoàng không thể:
  - Chọn công ty cho user mới
  - Gán nhiều vai trò cùng lúc
  - Thiết lập cấu hình bảo mật (2FA required, v.v.)
  - Kiểm tra SoD conflicts khi tạo

TASK 2: MANAGE SESSIONS
-----------
09:00 — Nhân viên cũ nghỉ việc, Hoàng cần thu hồi quyền truy cập
  Hoàng vào danh sách user, tìm user cần vô hiệu hóa
  
  Hành động:
  1. userRepo.save({...user, isActive: false}) — vô hiệu hóa tài khoản
  2. refreshTokenRepo.revokeAllForUser(userId) — thu hồi mọi phiên
  3. Ghi audit: SESSIONS_REVOKED

  Kết quả: Nhân viên cũ không thể đăng nhập (AccountDisabledError)
  Mọi refresh token đã bị thu hồi — không thể refresh

TASK 3: REVIEW & REVOKE EXPIRED SESSIONS
-----------
10:00 — Hoàng kiểm tra phiên đăng nhập cũ
  Query: refresh_tokens WHERE expires_at < now()
  Hành động: Xóa hoặc archive các token hết hạn
  
  [GAP]: Chưa có cron job tự động cleanup

TASK 4: SECURITY AUDIT
-----------
14:00 — Hoàng kiểm tra nhật ký bảo mật
  Query audit_logs:
  - Phát hiện 3 lần đăng nhập thất bại từ IP nước ngoài
  - [GAP]: Không có IP whitelist/geo-restriction
  - [GAP]: Không có cảnh báo tự động cho đăng nhập bất thường

  Hoàng phải:
  1. Xác nhận các user bị ảnh hưởng
  2. Reset mật khẩu cho user có nguy cơ
  3. Thu hồi tất cả phiên của user đó
  4. Báo cáo cho Kế toán trưởng

TASK 5: ROLE AUDIT (SoD CHECK)
-----------
15:00 — Hoàng kiểm tra phân quyền hiện tại
  [GAP]:
  - SoDConflictMatrix đã định nghĩa 3 conflict types
  - Nhưng chưa có UI để hiển thị hoặc check
  - Hoàng phải tự kiểm tra thủ công qua database
  
  Phát hiện:
  - User 'thuquy' có cả role 'thu-quy' (Cashier) và 'ke-toan-vien' (Staff Accountant)
  - → SoD conflict: Cashier cannot record accounting entries (BR-07.2)
  - Hoàng phải yêu cầu Kế toán trưởng quyết định và fix thủ công
```

**Admin-specific gaps:**
1. No `POST /api/admin/users` endpoint for admin user creation
2. No SoD conflict UI
3. No auto-cleanup cron for expired sessions/records
4. No automated security alert system

---

## Journey J-06: Company Admin Setting Up New Company

**Persona:** Nguyễn Thị F — Office Manager / Admin (Quản lý văn phòng), 42 years old, manages administrative setup for new subsidiary.
**Company:** Công ty TNHH Sản xuất ABC establishing a new subsidiary: Công ty TNHH Thương mại XYZ.
**Goal:** Set up the new company in SME Accounting, assign users, configure settings.

```
STEP 1: CREATE COMPANY
-----------
09:00 — Nguyễn Thị F đăng nhập (role: giam-doc hoặc he-thong)
  Mở module Công ty / Company module
  POST /api/companies với dữ liệu:
  {
    name: "Công ty TNHH Thương mại XYZ",
    nameVietnamese: "Công ty TNHH Thương mại XYZ",
    taxCode: "0123456789",
    enterpriseCode: "0123456789",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    phone: "028 3822 1234",
    email: "info@xyztrading.vn"
  }

Hệ thống:
  - requirePermission('company:create') -> PASS (giam-doc có quyền)
  - CompanyUseCases.create(data):
    - Kiểm tra taxCode unique (findByTaxCode)
    - Tạo company: id=crypto.randomUUID(), status=Active
    - Lưu vào companies table
  - Trả về HTTP 201

  [GAP]: Company entity thiếu:
    - company_type (loại hình DN: TNHH/CP/DNTN/HD)
    - charter_capital (vốn điều lệ)
    - legal_representative (người đại diện PL)
    - business_lines (ngành nghề VSIC)

STEP 2: CONFIGURE COMPANY SETTINGS
-----------
09:15 — Nguyễn Thị F cấu hình Công ty XYZ
  CompanySettings auto-created với mặc định:
  - fiscal_year_start_month: 1 (tháng 1)
  - currency_code: 'VND'
  - decimal_places: 2 (GAP — TT 99/2025 yêu cầu 0 cho VND!)
  - accounting_regime: 1 (TT 99/2025)
  - tax_calculation_method: 1 (khấu trừ)
  - rounding_method: 1 (làm tròn số học)

  [GAP]: decimal_places=2 là sai theo TT 99/2025
  Yêu cầu: decimal_places=0 cho VND

STEP 3: ASSIGN USERS TO COMPANY
-----------
09:30 — Nguyễn Thị F phân công người dùng cho Công ty XYZ
  Chọn user từ danh sách hiện có
  Mỗi user được gán:
  - userId
  - companyId
  - role (vai trò trong công ty mới)
  - isActive: true

  Hệ thống: UserCompanyRepository.create() cho mỗi user

  Nguyễn Văn A (General Accountant) được gán cho cả 2 công ty
  Trần Thị B (Chief Accountant) chỉ gán cho công ty ABC (chính)
  Lê Văn C (Tax Accountant) gán cho cả 2 công ty

STEP 4: TEST COMPANY SWITCHING
-----------
10:00 — Nguyễn Thị F kiểm tra chức năng chuyển đổi công ty
  Đăng nhập bằng tài khoản Lê Văn C:
  
  POST /api/auth/login -> trả về:
  {
    token: null,
    refreshToken: "<7-day-token>",
    user: {id, username, fullName},
    companies: [
      {id: "abc-company", name: "Công ty ABC", role: "ke-toan-thue"},
      {id: "xyz-company", name: "Công ty XYZ", role: "ke-toan-thue"}
    ]
  }

  Lê chọn công ty XYZ:
  POST /api/auth/select-company với { refreshToken, companyId: "xyz-company" }
  
  Hệ thống:
  - SHA-256 hash refresh token
  - Tìm trong refresh_tokens
  - Kiểm tra UserCompany membership (isActive=true)
  - Revoke old refresh token
  - Tạo JWT mới với companyId="xyz-company"
  - Tạo refresh token mới với companyId="xyz-company"

  Kết quả: Lê Văn C làm việc trong ngữ cảnh Công ty XYZ
  Mọi truy vấn đều scope theo companyId trong JWT

STEP 5: COMPLIANCE CHECKLIST
-----------
11:00 — Nguyễn Thị F chạy bảng kiểm tra tuân thủ cho công ty mới
  [GAP]: Chưa có Compliance Checklist module (T-04)
  Phải tự kiểm tra thủ công các yêu cầu:
  - [ ] Công ty đã có VNeID đăng ký? (NĐ 69/2024)
  - [ ] Người đại diện PL đã xác thực sinh trắc? (CV 3078)
  - [ ] Chứng thư số đã được cài đặt? (NĐ 23/2025)
  - [ ] Kết nối hóa đơn điện tử? (NĐ 254/2026)
  - [ ] Audit trail đã được kích hoạt? (TT 99/2025)
```

**New company setup gaps:**
1. Company entity missing legal fields (type, charter capital, legal rep, VSIC)
2. `decimal_places` default = 2 (should be 0 for VND per TT 99/2025)
3. No compliance checklist module
4. VNeID integration not available

---

## Journey Summary

| Journey | Persona | Role | Key Gaps Identified |
|---|---|---|---|
| J-01 | Nguyễn Văn A | General Accountant | No force password change on first login |
| J-02 | Trần Thị B | Chief Accountant | No audit trail for corrections, no SoD UI, no approval workflow |
| J-03 | Lê Văn C | Tax Accountant | VNeID blocker, digital signature blocker, no tax declaration permission |
| J-04 | Phạm Văn D | Director / Legal Rep | VNeID not integrated, biometric not available, missing legal fields |
| J-05 | Hoàng Văn E | System Admin | No admin create user endpoint, no auto-cleanup, no security alerts |
| J-06 | Nguyễn Thị F | Office Manager | Company entity incomplete, decimal_places wrong, no compliance checklist |

**Cross-cutting gaps across all journeys:**
1. VNeID integration (NĐ 69/2024) — affects J-03, J-04, J-06
2. Digital signature (NĐ 23/2025) — affects J-03, J-04
3. Audit trail for data corrections (TT 99/2025 Điều 28) — affects J-02
4. Company entity missing fields — affects J-04, J-06
5. SoD conflict enforcement — affects J-02, J-05
6. Approval workflow — affects J-02
