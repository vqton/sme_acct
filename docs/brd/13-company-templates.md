# Templates — Company Module

> Vietnamese SME Accounting System
> Law references: Luật Doanh nghiệp 2020, NĐ 168/2025/NĐ-CP, TT 99/2025/TT-BTC, NĐ 69/2024/NĐ-CP, Luật Kế toán 88/2015

---

## TP-01: Company Registration Form (Phiếu đăng ký thông tin doanh nghiệp)

```
====================================================================
             PHIẾU ĐĂNG KÝ THÔNG TIN DOANH NGHIỆP
             (Company Registration Form)
====================================================================

--- THÔNG TIN DOANH NGHIỆP (ENTERPRISE INFORMATION) ---

Tên doanh nghiệp bằng tiếng Việt:  _________________________________
(Enterprise name in Vietnamese)                (tối đa 400 ký tự)

Tên doanh nghiệp bằng tiếng Anh:   _________________________________
(Enterprise name in English)                   (tối đa 400 ký tự, không bắt buộc)

Tên viết tắt:                      _________________________________
(Abbreviated name)                             (tối đa 100 ký tự, không bắt buộc)

Tên cũ (nếu có):                   _________________________________
(Former name)                                  (không bắt buộc)

Mã số doanh nghiệp:                 ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(Enterprise code)                    10 chữ số, theo NĐ 168/2025/NĐ-CP

Mã số thuế:                         ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ - ___ ___ ___
(Tax code)                           10 chữ số hoặc 13 chữ số (MST + mã chi nhánh)

Loại hình doanh nghiệp:             [Dropdown ▼]
(Company type)                        ○ Công ty TNHH một thành viên (LLC-1member)
                                      ○ Công ty TNHH hai thành viên trở lên (LLC-2members)
                                      ○ Công ty cổ phần (JSC)
                                      ○ Công ty hợp danh (Partnership)
                                      ○ Doanh nghiệp tư nhân (Sole proprietorship)
                                      ○ Doanh nghiệp có vốn đầu tư nước ngoài (FDI)
                                      ○ Hợp tác xã (Cooperative)
                                      ○ Hộ kinh doanh (Household business)

Ngày thành lập:                      ___/___/________
(Date of establishment)              (DD/MM/YYYY)

Ngày bắt đầu hoạt động:              ___/___/________
(Date of operation commencement)     (DD/MM/YYYY, không bắt buộc)

--- VỐN ĐIỀU LỆ (CHARTER CAPITAL) ---

Vốn điều lệ:                        _________________ VND
(Charter capital)                    (số dương, tối đa 18 số nguyên + 2 số thập phân)

Vốn đã góp:                         _________________ VND
(Paid-in capital)                    (≤ Vốn điều lệ, không bắt buộc)

--- THÔNG TIN LIÊN HỆ (CONTACT INFORMATION) ---

Địa chỉ trụ sở chính:               _________________________________
(Head office address)                              (tối đa 500 ký tự)

Tỉnh/Thành phố:                     [Dropdown: 63 tỉnh/thành]
(Province/City)

Quận/Huyện:                         [Dropdown: theo tỉnh/thành]
(District)

Phường/Xã:                          [Dropdown: theo quận/huyện]
(Ward/Commune)

Số điện thoại:                      ___________________
(Phone)                              (tối đa 20 ký tự, số hợp lệ)

Email:                              ___________________
(Email)                              (tối đa 256 ký tự, định dạng email hợp lệ)

Website:                            ___________________
(Website)                            (không bắt buộc, tối đa 200 ký tự)

--- NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT (LEGAL REPRESENTATIVE) ---

Họ và tên:                          _________________________________
(Full name)                          (tối đa 200 ký tự)

Số CCCD/CMND/Hộ chiếu:              ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(ID/Passport number)                 12 số (CCCD) hoặc 9 số (CMND) hoặc số hộ chiếu

Ngày cấp:                           ___/___/________
(Issue date)                         (DD/MM/YYYY)

Nơi cấp:                            _________________________________
(Issue place)                        (tối đa 200 ký tự)

Chức vụ:                            _________________________________
(Position)                           (tối đa 200 ký tự)

Số VNeID:                           ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(VNeID number)                       12 chữ số, theo NĐ 69/2024/NĐ-CP

Số chứng thư số:                    _________________________________
(Digital certificate serial)         (không bắt buộc)

--- BẢNG KÊ THÀNH VIÊN GÓP VỐN (CAPITAL CONTRIBUTORS TABLE) ---

STT | Loại thành viên       | Họ và tên/Tên tổ chức | Số CMND/CCCD/MST   | Vốn góp (VND) | Tỷ lệ (%) | Ngày góp vốn | Ghi chú
----|-----------------------|----------------------|--------------------|---------------|-----------|-------------|--------
 1  | [Cá nhân / Tổ chức]   |                      |                    |               |           |  __/__/____  |
 2  | [Cá nhân / Tổ chức]   |                      |                    |               |           |  __/__/____  |
 3  | [Cá nhân / Tổ chức]   |                      |                    |               |           |  __/__/____  |
 4  | [Cá nhân / Tổ chức]   |                      |                    |               |           |  __/__/____  |
 5  | [Cá nhân / Tổ chức]   |                      |                    |               |           |  __/__/____  |
----|-----------------------|----------------------|--------------------|---------------|-----------|-------------|--------
    |                       |                      | Tổng cộng (Total): |               |   100.00% |             |

--- XÁC NHẬN (CONFIRMATION) ---

Người lập phiếu:    ___________________   Ngày: ___/___/________
Kế toán trưởng:     ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-01 | Enterprise code | Required, must match `^\d{10}$` | "Mã số doanh nghiệp phải gồm 10 chữ số" | "Enterprise code must be 10 digits" |
| VP-02 | Tax code | Required, must match `^\d{10}(-\d{3})?$`, checksum digit valid | "Mã số thuế không đúng định dạng (10 hoặc 13 chữ số)" | "Tax code format invalid (10 or 13 digits)" |
| VP-03 | Tax code | Unique across all companies (case-insensitive index) | "Mã số thuế đã tồn tại trong hệ thống" | "Tax code already exists in the system" |
| VP-04 | Enterprise name (VN) | Required, max 400 chars, must use Vietnamese alphabet + F/J/Z/W/digits/.,-+ | "Tên doanh nghiệp không được để trống" | "Enterprise name is required" |
| VP-05 | Enterprise name (VN) | Prohibited terms check against blocklist | "Tên doanh nghiệp chứa từ ngữ bị cấm" | "Enterprise name contains prohibited terms" |
| VP-06 | Company type | Required, must be valid enum value | "Vui lòng chọn loại hình doanh nghiệp" | "Please select a company type" |
| VP-07 | Date of establishment | Required, must be <= current date (can be in future except for new registrations) | "Ngày thành lập không hợp lệ" | "Invalid date of establishment" |
| VP-08 | Charter capital | Required, must be >= 0 | "Vốn điều lệ phải là số dương" | "Charter capital must be a positive number" |
| VP-09 | Paid-in capital | Must be <= charter capital | "Vốn đã góp không được vượt quá vốn điều lệ" | "Paid-in capital cannot exceed charter capital" |
| VP-10 | Email | If provided, must be valid email format | "Email không đúng định dạng" | "Invalid email format" |
| VP-11 | VNeID number | If provided, must be 12 digits | "Số VNeID phải gồm 12 chữ số" | "VNeID number must be 12 digits" |
| VP-12 | Capital contributors | Total ratio must equal 100% (±0.01 tolerance) | "Tổng tỷ lệ góp vốn phải bằng 100%" | "Total ownership ratio must equal 100%" |
| VP-13 | Capital contributors | DNTN must have exactly 1 contributor | "Doanh nghiệp tư nhân chỉ có một chủ sở hữu" | "Sole proprietorship must have exactly 1 owner" |
| VP-14 | Capital contributors | CTCP must have >= 3 shareholders | "Công ty cổ phần phải có ít nhất 3 cổ đông" | "JSC must have at least 3 shareholders" |
| VP-15 | Capital contributors | LLC-2members must have >= 2 members | "Công ty TNHH 2 thành viên phải có ít nhất 2 thành viên" | "LLC-2members must have at least 2 members" |

### Field Data Types

| Field | Type | Max Length | Default | Required |
|-------|------|-----------|---------|----------|
| EnterpriseCode | string | 10 | — | Yes |
| TaxCode | string | 15 | — | Yes |
| NameVietnamese | string | 400 | — | Yes |
| NameEnglish | string | 400 | null | No |
| AbbreviatedName | string | 100 | null | No |
| FormerName | string | 400 | null | No |
| CompanyType | enum | — | — | Yes |
| DateOfEstablishment | date | — | — | Yes |
| DateOfOperationCommencement | date | — | null | No |
| CharterCapital | decimal(18,2) | — | 0 | Yes |
| PaidInCapital | decimal(18,2) | — | null | No |
| HeadOfficeAddress | string | 500 | — | Yes |
| ProvinceId | string | 10 | — | Yes |
| DistrictId | string | 10 | — | Yes |
| WardId | string | 10 | null | No |
| Phone | string | 20 | null | No |
| Email | string | 256 | null | No |
| Website | string | 200 | null | No |
| LegalRepFullName | string | 200 | — | Yes |
| LegalRepIdNumber | string | 15 | — | Yes |
| LegalRepVNeID | string | 12 | null | No |
| Contributors | table | — | — | Conditional |

### Help Text

- **Enterprise code**: "Mã số doanh nghiệp do Sở Kế hoạch và Đầu tư cấp khi đăng ký thành lập. Gồm 10 chữ số." / "Enterprise code issued by DPI upon registration. 10 digits."
- **Tax code**: "Mã số thuế do Tổng cục Thuế cấp. Định dạng: 10 chữ số (doanh nghiệp) hoặc 13 chữ số (chi nhánh)." / "Tax code issued by General Department of Taxation. Format: 10 digits (company) or 13 digits (branch)."
- **Company type**: "Chọn loại hình doanh nghiệp theo Giấy chứng nhận đăng ký doanh nghiệp. Luật DN 2020 quy định 5 loại hình chính." / "Select company type per Business Registration Certificate. Law DN 2020 defines 5 main types."
- **Charter capital**: "Vốn điều lệ là số vốn do các thành viên/cổ đông cam kết góp, ghi trong Điều lệ công ty. Đơn vị: VND." / "Charter capital is the capital members/shareholders commit to contribute, recorded in the Company Charter. Unit: VND."
- **VNeID**: "Số định danh điện tử cấp cho tổ chức/cá nhân theo NĐ 69/2024/NĐ-CP. Bắt buộc để thực hiện giao dịch thuế điện tử từ 01/07/2025." / "Digital identity number per Decree 69/2024/ND-CP. Required for tax e-transactions from 01/07/2025."

---

## TP-02: Company Info Change Declaration (Thông báo thay đổi nội dung đăng ký doanh nghiệp)

```
====================================================================
   THÔNG BÁO THAY ĐỔI NỘI DUNG ĐĂNG KÝ DOANH NGHIỆP
   (Notification of Changes to Enterprise Registration Content)
   Theo NĐ 168/2025/NĐ-CP — Mẫu đăng ký qua Cổng TTQG về ĐKDN
====================================================================

Mã số doanh nghiệp:  ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(Enterprise code)

Mã số thuế:          ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(Tax code)

Tên doanh nghiệp:    _________________________________________
(Enterprise name)

--- NỘI DUNG THAY ĐỔI (CHANGED CONTENT) ---

Loại nội dung thay đổi:   [Checkbox group — chọn ít nhất 1]
(Type of change)            [_] Tên doanh nghiệp (Enterprise name)
                            [_] Địa chỉ trụ sở chính (Head office address)
                            [_] Người đại diện theo pháp luật (Legal representative)
                            [_] Vốn điều lệ (Charter capital)
                            [_] Thành viên góp vốn/Cổ đông (Members/Shareholders)
                            [_] Ngành nghề kinh doanh (Business lines)
                            [_] Loại hình doanh nghiệp (Company type)
                            [_] Chi nhánh/Văn phòng đại diện (Branch/Rep office)
                            [_] Tạm ngừng kinh doanh (Suspension of operations)
                            [_] Giải thể (Dissolution)
                            [_] Khác (Other): ___________________

--- NỘI DUNG CŨ (OLD VALUE) --- NỘI DUNG MỚI (NEW VALUE) ---
[Field name]:  _________________     ->   ___________________
[Field name]:  _________________     ->   ___________________
[Field name]:  _________________     ->   ___________________

--- LÝ DO THAY ĐỔI (REASON FOR CHANGE) ---
(Lý do chi tiết, bắt buộc đối với thay đổi thông tin pháp lý)
_________________________________________________________________
_________________________________________________________________

--- NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT (LEGAL REPRESENTATIVE) ---

Họ và tên:      ___________________________________   Số VNeID: ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Số CCCD:        ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Chức vụ:        ___________________________________

--- XÁC NHẬN ĐĂNG KÝ (REGISTRATION CONFIRMATION) ---

Số Giấy xác nhận:     ___________________ (do hệ thống cấp)
Ngày đăng ký:         ___/___/________
Trạng thái:           [Chờ xử lý / Đã đăng ký / Từ chối]

Người lập phiếu:      ___________________   Ngày: ___/___/________
Kế toán trưởng:       ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-16 | Change type | At least one change type must be selected | "Vui lòng chọn ít nhất một nội dung thay đổi" | "Select at least one change type" |
| VP-17 | Old/New value | Must differ for at least one field | "Nội dung mới phải khác nội dung cũ" | "New value must differ from old value" |
| VP-18 | Reason | Required when changing identity fields (tax code, enterprise code, name, legal rep) | "Vui lòng nhập lý do thay đổi" | "Please enter reason for change" |
| VP-19 | Legal rep notification | Must notify within 10 days of change per NĐ 168/2025 Điều 35 | "Thay đổi thông tin đăng ký phải được thông báo trong vòng 10 ngày" | "Registration changes must be notified within 10 days" |
| VP-20 | Capital change | If charter capital changes, contributors table must be updated | "Thay đổi vốn điều lệ phải kèm bảng kê thành viên góp vốn cập nhật" | "Capital change requires updated contributor table" |

### Help Text

- **Change notification deadline**: "Theo NĐ 168/2025/NĐ-CP Điều 35, doanh nghiệp phải thông báo thay đổi nội dung đăng ký trong vòng 10 ngày kể từ ngày thay đổi." / "Per Decree 168/2025/ND-CP Article 35, changes must be notified within 10 days."
- **Old/New value**: "Nhập giá trị trước và sau khi thay đổi. Ít nhất một trường phải có thay đổi." / "Enter value before and after change. At least one field must differ."
- **Confirmation**: "Số Giấy xác nhận do hệ thống Cổng TTQG về ĐKDN cấp sau khi đăng ký thành công." / "Confirmation number issued by National Business Registration Portal after successful registration."

---

## TP-03: Company Settings Form (Phiếu thiết lập thông tin kế toán)

```
====================================================================
          PHIẾU THIẾT LẬP THÔNG TIN KẾ TOÁN
          (Company Accounting Settings Form)
====================================================================

Mã số thuế:   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Tên công ty:  _________________________________________

--- CÀI ĐẶT KỲ KẾ TOÁN (ACCOUNTING PERIOD SETTINGS) ---

Tháng bắt đầu năm tài chính:   [Dropdown: 1..12]   (mặc định: 1)
(Fiscal year start month)

Kỳ kế toán:                    [Dropdown]
(Accounting period)              ○ Tháng (Monthly)
                                 ○ Quý (Quarterly)
                                 ○ Năm (Yearly)
                                 ○ 6 tháng (Semi-annually)

--- CÀI ĐẶT TIỀN TỆ (CURRENCY SETTINGS) ---

Đơn vị tiền tệ:                [________]   (mặc định: VND)
(Currency code)

Số chữ số thập phân:           [Dropdown: 0..6]   (mặc định: 0, theo TT 99/2025)
(Decimal places)

Phương pháp làm tròn:           [Dropdown]
(Rounding method)                ○ Làm tròn 0.5 lên — Round half up
                                 ○ Làm tròn xuống — Round down
                                 ○ Làm tròn lên — Round up

Nguồn tỷ giá mặc định:          [Dropdown]
(Default exchange rate source)   ○ Ngân hàng Nhà nước (State Bank of Vietnam)
                                 ○ Ngân hàng thương mại (Commercial bank — buying rate)
                                 ○ Liên ngân hàng (Interbank rate)

--- CHẾ ĐỘ KẾ TOÁN (ACCOUNTING REGIME) ---

Chế độ kế toán áp dụng:        [Radio group]
(Accounting regime)              ○ Thông tư 99/2025/TT-BTC (TT99)
                                   — Chế độ kế toán doanh nghiệp (Enterprise accounting)
                                   — Áp dụng từ 01/01/2026, thay thế TT 200/2014
                                 ○ Thông tư 133/2016/TT-BTC (TT133)
                                   — Chế độ kế toán doanh nghiệp nhỏ và vừa (SME accounting)
                                   — Biểu mẫu đơn giản hơn, ít báo cáo hơn

--- PHƯƠNG PHÁP KẾ TOÁN (ACCOUNTING METHODS) ---

Phương pháp tính thuế GTGT:     [Dropdown]
(VAT calculation method)         ○ Phương pháp khấu trừ (Deduction method)
                                 ○ Phương pháp trực tiếp trên GTGT (Direct on value-add)
                                 ○ Phương pháp trực tiếp trên doanh thu (Direct on revenue)

Phương pháp tính thuế TNDN:     [Dropdown]
(CIT calculation method)         ○ Phương pháp khấu trừ (Deduction)
                                 ○ Phương pháp trực tiếp (Direct)

Phương pháp tính giá hàng tồn kho:  [Dropdown]
(Inventory valuation method)        ○ FIFO — Nhập trước xuất trước (FIFO)
                                    ○ Bình quân gia quyền (Weighted average)
                                    ○ Thực tế đích danh (Specific identification)
                                    ○ Nhập trước xuất sau (LIFO)

--- TÍNH NĂNG MỞ RỘNG (EXTENDED FEATURES) ---

Cho phép hạch toán đa tiền tệ:        [Yes / No]  (mặc định: No)
(Enable multi-currency)

Quản lý theo phòng ban:              [Yes / No]  (mặc định: Yes)
(Enable department management)

Theo dõi theo dự án/công trình:       [Yes / No]  (mặc định: No)
(Enable project tracking)

--- KỲ KẾ TOÁN KHÓA (CLOSED PERIODS) ---

Kỳ đã khóa gần nhất:                 [_________]   (kỳ, năm)
(Last closed period)
Từ kỳ: ___/____    Đến kỳ: ___/____   (tự động cập nhật khi khóa sổ)
(From period/year)  (To period/year)

Ngày lập phiếu:    ___/___/________
Kế toán trưởng:    ___________________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-21 | Fiscal year start month | Required, 1–12 | "Tháng bắt đầu năm tài chính phải từ 1 đến 12" | "Fiscal year start month must be 1–12" |
| VP-22 | Currency code | Required, 3 chars, must be ISO 4217 | "Mã tiền tệ phải là mã ISO 4217 hợp lệ" | "Currency code must be valid ISO 4217" |
| VP-23 | Decimal places | Required, 0–6. Default 0 per TT 99/2025 (VND is non-decimal). | "Số chữ số thập phân phải từ 0 đến 6" | "Decimal places must be 0–6" |
| VP-24 | Decimal places | Cannot be changed after first period close (BR-CS-03 modified) | "Không thể thay đổi số chữ số thập phân sau khi đã khóa kỳ kế toán đầu tiên" | "Decimal places cannot be changed after first period close" |
| VP-25 | Accounting regime | Required. Selection affects chart of accounts, report templates, rounding rules. | "Vui lòng chọn chế độ kế toán áp dụng" | "Please select an accounting regime" |
| VP-26 | Accounting regime | Cannot be changed if any transactions exist | "Chế độ kế toán không thể thay đổi sau khi đã có giao dịch phát sinh" | "Accounting regime cannot be changed after transactions exist" |
| VP-27 | Tax calculation method | Required | "Vui lòng chọn phương pháp tính thuế" | "Please select tax calculation method" |
| VP-28 | Inventory method | Cannot be changed mid-fiscal-year (BR-CS-05) | "Không thể thay đổi phương pháp tính giá hàng tồn kho giữa năm tài chính" | "Inventory method cannot be changed mid-fiscal-year" |
| VP-29 | Multi-currency | If Yes: requires at least 1 foreign currency + exchange rate source | "Đa tiền tệ yêu cầu cấu hình thêm: nguồn tỷ giá, tần suất cập nhật" | "Multi-currency requires additional configuration: exchange rate source, update frequency" |

### Field Data Types

| Field | Type | Max | Default | Required |
|-------|------|-----|---------|----------|
| FiscalYearStartMonth | int | 1–12 | 1 | Yes |
| FiscalPeriodType | enum | — | Monthly | Yes |
| CurrencyCode | string | 3 | "VND" | Yes |
| DecimalPlaces | int | 0–6 | 0 | Yes |
| RoundingMethod | enum | — | RoundHalfUp | Yes |
| DefaultExchangeRateSource | enum | — | StateBank | No |
| AccountingRegime | enum | — | — | Yes |
| TaxCalculationMethod | enum | — | — | Yes |
| InventoryMethod | enum | — | — | Yes |
| TaxMethod | enum | — | — | Yes |
| EnableMultiCurrency | bool | — | false | Yes |
| EnableDepartmentManagement | bool | — | true | Yes |
| EnableProjectTracking | bool | — | false | Yes |
| LastClosedPeriod | string | — | null | No |

### Help Text

- **Decimal places**: "Theo TT 99/2025/TT-BTC Điều 8, VND là đơn vị tiền tệ không có số lẻ (nguyên tệ). Số thập phân mặc định = 0. Đối với ngoại tệ, có thể đặt 2–4 số thập phân." / "Per Circular 99 Article 8, VND is a non-decimal currency. Default decimal places = 0. Foreign currencies may use 2–4 decimals."
- **Accounting regime**: "Lựa chọn chế độ kế toán quyết định hệ thống tài khoản, biểu mẫu báo cáo tài chính và quy tắc làm tròn. TT99 áp dụng cho doanh nghiệp niêm yết/lớn. TT133 cho doanh nghiệp nhỏ và vừa (đáp ứng điều kiện của Thông tư). Không thể thay đổi sau khi phát sinh giao dịch." / "Accounting regime choice determines chart of accounts, report templates, rounding rules. TT99 for listed/large enterprises. TT133 for SMEs meeting Circular conditions. Irreversible after transactions exist."
- **Inventory method**: "Phương pháp tính giá hàng tồn kho phải được áp dụng nhất quán trong năm tài chính (VAS 02). Không thể thay đổi giữa năm." / "Inventory method must be consistent within fiscal year (VAS 02). Cannot change mid-year."
- **Multi-currency**: "Khi kích hoạt đa tiền tệ, cần cấu hình ít nhất một ngoại tệ, nguồn tỷ giá và tần suất cập nhật tỷ giá." / "When enabling multi-currency, configure at least one foreign currency, exchange rate source, and update frequency."

---

## TP-04: Legal Representative Declaration (Tờ khai người đại diện theo pháp luật)

```
====================================================================
   TỜ KHAI NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT
   (Legal Representative Declaration)
   Theo Luật Doanh nghiệp 2020 Điều 12, 13
====================================================================

Mã số doanh nghiệp:   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Tên doanh nghiệp:     _________________________________________

--- THÔNG TIN CÁ NHÂN (PERSONAL INFORMATION) ---

Họ và tên:            _________________________________________  (bắt buộc)
(Full name)                                                    (tối đa 200 ký tự)

Số CCCD/Hộ chiếu:     ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(ID/Passport number)   9 số (CMND) / 12 số (CCCD) / số hộ chiếu

Ngày cấp:             ___/___/________
(Issue date)           (DD/MM/YYYY)

Nơi cấp:              _________________________________________
(Issue place)          (tối đa 200 ký tự)

Ngày còn hiệu lực:     ___/___/________   (không bắt buộc — chỉ với hộ chiếu)
(Expiry date)

--- SỐ ĐỊNH DANH CÁ NHÂN (NATIONAL DIGITAL IDENTITY) ---

Số VNeID:             ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(VNeID number)         12 chữ số, theo NĐ 69/2024/NĐ-CP

Trạng thái VNeID:     [Chưa đăng ký / Đã đăng ký / Đã xác thực / Thu hồi]
(VNeID status)

Ngày xác thực VNeID:  ___/___/________
(VNeID verification date)

--- THÔNG TIN CHỨC VỤ (POSITION INFORMATION) ---

Chức vụ tại doanh nghiệp:  ___________________________________
(Position in enterprise)    (tối đa 200 ký tự, ví dụ: Chủ tịch HĐQT, Giám đốc)

Số điện thoại:             ___________________
(Phone)

Email:                     ___________________
(Email)

--- LOẠI ĐẠI DIỆN (REPRESENTATION TYPE) ---

[Radio]  ◉ Đại diện theo pháp luật chính (Primary legal representative)
         ○ Đại diện theo pháp luật (Legal representative — secondary)

--- PHẠM VI ĐẠI DIỆN (SCOPE OF AUTHORITY) ---

Phạm vi đại diện:          [Radio]
(Authorization scope)        ○ Đại diện toàn bộ (Full representation — unlimited)
                             ○ Đại diện có giới hạn (Limited representation)

Nếu có giới hạn, mô tả chi tiết:
(If limited, describe scope):
_________________________________________________________________
_________________________________________________________________

--- CHỨNG THƯ SỐ (DIGITAL CERTIFICATE) — KHÔNG BẮT BUỘC ---

Số serial chứng thư số:     __________________________________
(Digital certificate serial)

Nhà cung cấp:              __________________________________
(Certificate provider)       (VD: VIETTEL CA, VNPT CA, BKAV CA, etc.)

Ngày hết hạn:              ___/___/________
(Certificate expiry date)

--- THỜI HẠN BỔ NHIỆM (APPOINTMENT PERIOD) ---

Ngày bắt đầu:              ___/___/________
(Start date)

Ngày kết thúc:             ___/___/________   (không bắt buộc)
(End date)

--- XÁC NHẬN (CONFIRMATION) ---

Người được bổ nhiệm:   ___________________   Ngày: ___/___/________
(Ký xác nhận)

Chủ tịch HĐQT/Giám đốc: ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-30 | Full name | Required, max 200 chars | "Họ và tên không được để trống" | "Full name is required" |
| VP-31 | ID/Passport number | Required. CCCD: 12 digits. CMND: 9 digits. Passport: alphanumeric. | "Số CCCD/CMND/Hộ chiếu không đúng định dạng" | "Invalid ID/Passport number format" |
| VP-32 | Issue date | Required, must be <= today | "Ngày cấp không hợp lệ" | "Invalid issue date" |
| VP-33 | VNeID number | Required per NĐ 69/2024. Must be 12 digits. | "Số VNeID phải gồm 12 chữ số" | "VNeID number must be 12 digits" |
| VP-34 | Position | Required, max 200 chars | "Vui lòng nhập chức vụ" | "Please enter position" |
| VP-35 | At least one primary rep | Company must have exactly 1 primary legal rep at all times | "Công ty phải có ít nhất một người đại diện theo pháp luật chính" | "Company must have at least one primary legal representative" |
| VP-36 | Cannot remove last active rep | Block removal of last active legal representative | "Không thể xóa người đại diện duy nhất. Vui lòng thêm người đại diện khác trước." | "Cannot remove the only legal representative. Add another first." |
| VP-37 | Eligibility | Rep must not be disqualified per Luật DN 2020 Điều 17 | "Người này không đủ điều kiện làm đại diện theo pháp luật (Điều 17 Luật DN 2020)" | "This person is not eligible as legal representative per Law DN 2020 Article 17" |
| VP-38 | Certificate expiry | If digital cert provided, expiry must be in the future | "Chứng thư số đã hết hạn" | "Digital certificate has expired" |
| VP-39 | Certificate expiry alert | Alert when within 30 days of expiry | "Chứng thư số sắp hết hạn (còn %d ngày)" | "Digital certificate expiring soon (%d days remaining)" |

### Field Data Types

| Field | Type | Max Length | Required |
|-------|------|-----------|----------|
| FullName | string | 200 | Yes |
| IdNumber | string | 15 | Yes |
| IssueDate | date | — | Yes |
| IssuePlace | string | 200 | Yes |
| IdExpiryDate | date | — | No |
| VNeIDNumber | string | 12 | Yes |
| VNeIDStatus | enum | — | Yes |
| VNeIDVerifiedAt | datetime | — | No |
| Position | string | 200 | Yes |
| Phone | string | 20 | Yes |
| Email | string | 256 | No |
| IsPrimary | bool | — | Yes |
| AuthorizationScope | enum | — | Yes |
| ScopeDescription | string | 1000 | No |
| DigitalCertSerial | string | 100 | No |
| DigitalCertProvider | string | 100 | No |
| DigitalCertExpiry | date | — | No |
| StartDate | date | — | Yes |
| EndDate | date | — | No |

### Help Text

- **VNeID**: "Số định danh điện tử theo NĐ 69/2024/NĐ-CP. Bắt buộc từ 01/07/2025 để thực hiện giao dịch thuế điện tử. Phải được xác thực qua ứng dụng VNeID hoặc API Tổng cục Thuế." / "Digital identity number per Decree 69/2024. Mandatory from 01/07/2025 for tax e-transactions. Must be verified via VNeID app or Tax Department API."
- **Primary rep**: "Công ty phải có ít nhất một người đại diện theo pháp luật chính. Chỉ có một người đại diện chính tại một thời điểm (Luật DN 2020 Điều 12)." / "Company must have exactly one primary legal representative at any time (Law DN 2020 Article 12)."
- **Authorization scope**: "Phạm vi đại diện có thể được giới hạn theo Điều lệ công ty hoặc Nghị quyết HĐTV/HĐQT." / "Authority can be limited per Company Charter or Resolution of Members Council/Board."
- **Digital certificate**: "Chứng thư số dùng để ký số hóa đơn điện tử, tờ khai thuế, báo cáo tài chính. Phải do tổ chức cung cấp dịch vụ chứng thực chữ ký số hợp pháp cấp." / "Digital certificate for signing e-invoices, tax declarations, financial reports. Must be issued by a certified CA."

---

## TP-05: Business Line Registration (Đăng ký ngành nghề kinh doanh)

```
====================================================================
        ĐĂNG KÝ NGÀNH NGHỀ KINH DOANH
        (Business Line Registration)
        Theo Hệ thống ngành kinh tế Việt Nam (VSIC 2018)
====================================================================

Mã số doanh nghiệp:   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Tên doanh nghiệp:     _________________________________________

--- DANH SÁCH NGÀNH NGHỀ KINH DOANH (BUSINESS LINE LIST) ---

Mã VSIC:              ___ ___ ___ ___ ___ ___ ___   [Tìm kiếm ▼]
(VSIC code)            (cấp 4–6, theo VSIC 2018)

Tên ngành VSIC:       ___________________________________________________________
(VSIC name)            (tự động điền khi chọn mã, tối đa 500 ký tự)

Ngành nghề kinh doanh chính:   [☐]   Đánh dấu nếu là ngành nghề chính
(Is primary business)                      (chỉ được chọn 1 ngành chính)

Ngày đăng ký:                   ___/___/________
(Registration date)

Ngày kết thúc:                  ___/___/________   (không bắt buộc)
(End date)

Ngành nghề có điều kiện:        [Có / Không]
(Conditional business line)

Giấy phép con/Chứng chỉ:        ___________________   (số giấy phép, nếu có)
(Sub-license/Certificate)

Ghi chú:                        ___________________________________________________
(Note)

------------------------------------------------------------------------------
                     BẢNG KÊ NGÀNH NGHỀ (Multiple entries)
------------------------------------------------------------------------------
STT | Mã VSIC | Tên ngành VSIC              | Chính | Có ĐK? | Số GP con | Ngày ĐK
----|---------|-----------------------------|-------|--------|-----------|--------
 1  | 62010   | Lập trình máy vi tính       |  [X]  |  Không |           | DD/MM/YYYY
 2  | 62020   | Tư vấn máy vi tính          |  [_]  |  Không |           | DD/MM/YYYY
 3  | 62090   | Hoạt động dịch vụ CNTT khác |  [_]  |  Không |           | DD/MM/YYYY
 4  | 46900   | Bán buôn tổng hợp           |  [_]  |  Không |           | DD/MM/YYYY
 5  |         |                             |  [_]  |        |           | DD/MM/YYYY
----|---------|-----------------------------|-------|--------|-----------|--------

--- XÁC NHẬN (CONFIRMATION) ---

Người lập phiếu:    ___________________   Ngày: ___/___/________
Kế toán trưởng:     ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-40 | VSIC code | Required, must be valid VSIC 2018 code | "Mã VSIC không hợp lệ hoặc không tồn tại trong hệ thống phân ngành VSIC 2018" | "Invalid VSIC code — does not exist in VSIC 2018 classification" |
| VP-41 | VSIC name | Auto-populated from VSIC code. Read-only after selection. | "Tên ngành nghề được tự động điền từ mã VSIC" | "Business line name is auto-populated from VSIC code" |
| VP-42 | Primary business | Exactly one business line must be marked as primary | "Phải chọn đúng một ngành nghề kinh doanh chính" | "Exactly one primary business line must be selected" |
| VP-43 | Registration date | Required, must be >= company establishment date | "Ngày đăng ký không được trước ngày thành lập doanh nghiệp" | "Registration date cannot be before company establishment date" |
| VP-44 | End date | If provided, must be >= registration date | "Ngày kết thúc phải sau hoặc bằng ngày đăng ký" | "End date must be on or after registration date" |
| VP-45 | Conditional line | If Yes, sub-license number is required | "Ngành nghề có điều kiện phải có số giấy phép con/chứng chỉ" | "Conditional business line requires sub-license/certificate number" |
| VP-46 | Duplicate VSIC | No duplicate VSIC codes for same company | "Mã VSIC này đã được đăng ký cho doanh nghiệp" | "This VSIC code is already registered for this company" |

### Field Data Types

| Field | Type | Max Length | Required |
|-------|------|-----------|----------|
| VsicCode | string | 10 | Yes |
| VsicLevel | int | — | Yes (auto) |
| VsicName | string | 500 | Yes (auto) |
| IsPrimary | bool | — | Yes |
| RegistrationDate | date | — | Yes |
| EndDate | date | — | No |
| IsConditional | bool | — | Yes |
| SubLicenseNumber | string | 100 | Conditional |
| Note | string | 500 | No |

### Help Text

- **VSIC code**: "Mã ngành kinh tế Việt Nam (VSIC 2018) do Tổng cục Thống kê ban hành. Chọn mã cấp 4 (4 số) là tối thiểu. Có thể chọn cấp 5 hoặc 6 để chi tiết hơn. Gõ để tìm kiếm." / "Vietnam Standard Industrial Classification (VSIC 2018). Minimum level 4 (4 digits). Levels 5–6 for greater detail. Type to search."
- **Primary business**: "Ngành nghề kinh doanh chính là ngành tạo ra doanh thu lớn nhất hoặc được doanh nghiệp xác định là chính khi đăng ký. Chỉ chọn một." / "Primary business is the line generating highest revenue or designated as main at registration. Select exactly one."
- **Conditional business line**: "Ngành nghề có điều kiện là ngành nghề yêu cầu phải có giấy phép con/chứng chỉ hành nghề theo quy định pháp luật." / "Conditional business lines require sub-licenses or practice certificates per law."

---

## TP-06: Branch/Representative Office Form (Đơn đăng ký chi nhánh/văn phòng đại diện)

```
====================================================================
    ĐƠN ĐĂNG KÝ CHI NHÁNH / VĂN PHÒNG ĐẠI DIỆN / ĐỊA ĐIỂM KINH DOANH
    (Branch / Representative Office / Business Location Registration)
    Theo Luật Doanh nghiệp 2020 Điều 43-45
====================================================================

Mã số doanh nghiệp (công ty mẹ):   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(Tax code of parent company)

Tên công ty mẹ:                    _________________________________________
(Parent company name)

--- THÔNG TIN ĐƠN VỊ TRỰC THUỘC (DEPENDENT UNIT INFORMATION) ---

Loại hình:         [Radio]
(Type)               ◉ Chi nhánh (Branch — có doanh thu, hạch toán riêng)
                     ○ Văn phòng đại diện (Representative Office — không doanh thu)
                     ○ Địa điểm kinh doanh (Business Location — phụ thuộc chi nhánh)

Tên đơn vị:        _________________________________________________________
(Unit name)                                          (tối đa 400 ký tự)

Tên viết tắt:      _________________________________
(Abbreviated name)                                   (không bắt buộc)

--- ĐỊA CHỈ (ADDRESS) ---

Địa chỉ:           _________________________________________________________
(Address)                                          (tối đa 500 ký tự)

Tỉnh/Thành phố:    [Dropdown]
(Province/City)

Quận/Huyện:        [Dropdown]
(District)

Phường/Xã:         [Dropdown]
(Ward/Commune)

--- THÔNG TIN LIÊN HỆ (CONTACT) ---

Mã số thuế:        ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ - ___ ___ ___
(Tax code)          13 chữ số (MST công ty mẹ + 3 số hậu tố)
                     (chi nhánh bắt buộc, VPĐD/ĐĐKD không bắt buộc)

Số điện thoại:     ___________________
(Phone)

Email:             ___________________
(Email)

--- NGƯỜI ĐỨNG ĐẦU (HEAD OF UNIT) ---

Họ và tên:         _________________________________________
(Full name)

Số CCCD:           ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(ID number)

Chức vụ:           _________________________________________
(Position)                   (ví dụ: Giám đốc chi nhánh, Trưởng VPĐD)

Số điện thoại:     ___________________
(Phone)

--- THỜI GIAN & TRẠNG THÁI (PERIOD & STATUS) ---

Ngày thành lập:    ___/___/________
(Date of establishment)

Ngày đóng cửa:     ___/___/________   (không bắt buộc)
(Date closed)

Trạng thái:        [Dropdown]
(Status)             ○ Đang hoạt động (Active)
                     ○ Tạm ngừng hoạt động (Suspended)
                     ○ Đã đóng cửa (Closed)

Ghi chú:           ________________________________________________________
(Note)

Ngày lập phiếu:    ___/___/________
Người lập:         ___________________
Kế toán trưởng:    ___________________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-47 | Unit name | Required, max 400 chars | "Tên đơn vị trực thuộc không được để trống" | "Unit name is required" |
| VP-48 | Type | Required | "Vui lòng chọn loại hình đơn vị trực thuộc" | "Please select unit type" |
| VP-49 | Tax code (branch) | If Chi nhánh, tax code required. Format: MST-parent + `-\d{3}` | "Mã số thuế chi nhánh phải theo định dạng MST mẹ + 3 số hậu tố" | "Branch tax code must follow parent MST + 3-digit suffix format" |
| VP-50 | Tax code (branch) | First 10 digits must match parent company tax code | "Mã số thuế chi nhánh phải khớp 10 số đầu với mã số thuế công ty mẹ" | "Branch tax code first 10 digits must match parent company" |
| VP-51 | Establishment date | Required, must be >= parent company establishment date | "Ngày thành lập đơn vị không được trước ngày thành lập công ty mẹ" | "Establishment date cannot be before parent company establishment date" |
| VP-52 | Phone | Required | "Vui lòng nhập số điện thoại" | "Please enter phone number" |
| VP-53 | Head of unit | Required | "Vui lòng nhập thông tin người đứng đầu" | "Please enter head of unit information" |
| VP-54 | VPĐD cannot have tax code | VPĐD không có mã số thuế riêng | "Văn phòng đại diện không có mã số thuế riêng" | "Representative office does not have its own tax code" |

### Field Data Types

| Field | Type | Max Length | Required |
|-------|------|-----------|----------|
| BranchType | enum | — | Yes |
| Name | string | 400 | Yes |
| AbbreviatedName | string | 100 | No |
| Address | string | 500 | Yes |
| ProvinceId | string | 10 | Yes |
| DistrictId | string | 10 | Yes |
| WardId | string | 10 | No |
| TaxCode | string | 15 | Conditional |
| Phone | string | 20 | Yes |
| Email | string | 256 | No |
| HeadName | string | 200 | Yes |
| HeadIdNumber | string | 15 | Yes |
| HeadPosition | string | 200 | No |
| HeadPhone | string | 20 | Yes |
| EstablishmentDate | date | — | Yes |
| ClosedDate | date | — | No |
| Status | enum | — | Yes |

### Help Text

- **Branch type**: "Chi nhánh: có hoạt động sản xuất kinh doanh, có doanh thu, phải đăng ký MST riêng. VPĐD: chỉ liên lạc, xúc tiến thương mại, không doanh thu, không MST. ĐĐKD: phụ thuộc chi nhánh." / "Branch: revenue-generating, requires own tax code. Rep office: liaison only, no revenue, no tax code. Business location: subordinate to branch."
- **Tax code**: "Mã số thuế chi nhánh gồm 13 chữ số: 10 số MST công ty mẹ + dấu gạch ngang + 3 số hậu tố do cơ quan thuế cấp." / "Branch tax code: 13 digits = 10-digit parent MST + hyphen + 3-digit suffix issued by tax authority."

---

## TP-07: Company Bank Account Form (Đăng ký tài khoản ngân hàng)

```
====================================================================
       ĐĂNG KÝ TÀI KHOẢN NGÂN HÀNG DOANH NGHIỆP
       (Company Bank Account Registration)
====================================================================

Mã số thuế:   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Tên công ty:  _________________________________________

--- THÔNG TIN TÀI KHOẢN (ACCOUNT INFORMATION) ---

Tên ngân hàng:           ________________________________________________
(Bank name)                                  (tối đa 200 ký tự)

Chi nhánh:              ________________________________________________
(Branch)                                     (tối đa 200 ký tự, không bắt buộc)

Số tài khoản:           ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
(Account number)                              (tối đa 50 ký tự)

Tên chủ tài khoản:      ________________________________________________
(Account holder name)                         (tối đa 200 ký tự)

Loại tiền tệ:           [________]   (mặc định: VND)
(Currency code)

--- XÁC NHẬN TÀI KHOẢN (ACCOUNT VERIFICATION) ---

Tài khoản thanh toán chính:  [☐]   (Đánh dấu nếu là TK nộp thuế chính)
(Is primary payment account)

Trạng thái xác thực:      [Đã xác thực / Chờ xác thực / Chưa xác thực]
(Verification status)

Ngày xác thực:            ___/___/________
(Verification date)

--- THÔNG TIN QUỐC TẾ (INTERNATIONAL INFO) — KHÔNG BẮT BUỘC ---

Mã SWIFT/BIC:             __________________
(SWIFT/BIC code)                             (tối đa 20 ký tự)

IBAN:                     __________________
(IBAN)                                        (nếu có, thường dùng cho TK ngoại tệ)

--- THÔNG TIN BỔ SUNG (ADDITIONAL INFO) ---

Ngày mở tài khoản:        ___/___/________
(Date account opened)

Trạng thái:               [Đang hoạt động / Đã đóng / Tạm khóa]
(Status)

Ghi chú:                  _________________________________________________
(Note)

--- XÁC NHẬN (CONFIRMATION) ---

Người lập phiếu:    ___________________   Ngày: ___/___/________
Kế toán trưởng:     ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-55 | Bank name | Required, max 200 chars | "Tên ngân hàng không được để trống" | "Bank name is required" |
| VP-56 | Account number | Required, max 50 chars, must be alphanumeric/numbers | "Số tài khoản không được để trống" | "Account number is required" |
| VP-57 | Account holder name | Required, max 200 chars | "Tên chủ tài khoản không được để trống" | "Account holder name is required" |
| VP-58 | Currency code | Required, 3 chars ISO 4217. Default VND. | "Vui lòng chọn loại tiền tệ" | "Please select currency" |
| VP-59 | Primary account | Exactly one account must be marked as primary for tax payment | "Phải chọn đúng một tài khoản thanh toán chính để nộp thuế" | "Exactly one primary tax payment account required" |
| VP-60 | Primary account | Cannot unmark primary account without setting another as primary | "Không thể bỏ chọn tài khoản chính nếu chưa có tài khoản khác thay thế" | "Cannot unmark primary without designating a replacement" |
| VP-61 | SWIFT | If provided, must be 8 or 11 chars (letters only) | "Mã SWIFT phải gồm 8 hoặc 11 ký tự chữ cái" | "SWIFT code must be 8 or 11 alphabetic characters" |
| VP-62 | Active company check | Active company must have >= 1 active bank account (BR-OP-04) | "Công ty đang hoạt động phải có ít nhất một tài khoản ngân hàng" | "Active company must have at least one bank account" |
| VP-63 | Account number uniqueness | No duplicate account numbers for the same company | "Số tài khoản này đã được đăng ký" | "This account number is already registered" |

### Field Data Types

| Field | Type | Max Length | Required |
|-------|------|-----------|----------|
| BankName | string | 200 | Yes |
| Branch | string | 200 | No |
| AccountNumber | string | 50 | Yes |
| AccountHolderName | string | 200 | Yes |
| CurrencyCode | string | 3 | Yes (default VND) |
| IsPrimaryTaxPayment | bool | — | Yes |
| VerificationStatus | enum | — | Yes |
| VerificationDate | date | — | No |
| SwiftCode | string | 20 | No |
| Iban | string | 50 | No |
| OpenedDate | date | — | No |
| Status | enum | — | Yes |
| Note | string | 500 | No |

### Help Text

- **Primary account**: "Tài khoản thanh toán chính là tài khoản đăng ký với cơ quan thuế để nộp thuế điện tử. Mỗi doanh nghiệp chỉ có một tài khoản chính." / "Primary payment account is registered with tax authority for electronic tax payment. Each company has exactly one."
- **SWIFT/BIC**: "Mã SWIFT dùng cho giao dịch quốc tế. 8 hoặc 11 ký tự chữ cái. Chỉ cần cho tài khoản ngoại tệ." / "SWIFT code for international transfers. 8 or 11 alphabetic characters. Only needed for foreign currency accounts."
- **Verification**: "Trạng thái xác thực thể hiện tài khoản đã được xác nhận với ngân hàng hay chưa. Chỉ tài khoản đã xác thực mới được dùng để nộp thuế." / "Verification status shows whether the account has been confirmed with the bank. Only verified accounts can be used for tax payment."

---

## TP-08: Company Documents Checklist (Danh mục hồ sơ doanh nghiệp)

```
====================================================================
              DANH MỤC HỒ SƠ DOANH NGHIỆP
              (Company Documents Checklist)
              Kiểm tra đầy đủ hồ sơ pháp lý
====================================================================

Mã số thuế:   ___ ___ ___ ___ ___ ___ ___ ___ ___ ___
Tên công ty:  _________________________________________

Trạng thái tổng thể:  [Đầy đủ / Thiếu / Không áp dụng]

--- A. GIẤY TỜ PHÁP LÝ BẮT BUỘC (MANDATORY LEGAL DOCUMENTS) ---

STT | Loại giấy tờ                              | Yêu cầu | Trạng thái   | Số/Ghi chú         | Ngày hết hạn
----|-------------------------------------------|---------|-------------|--------------------|-------------
 1  | Giấy chứng nhận đăng ký doanh nghiệp      | Bắt buộc| [___/___/__]| Số: _____________  | ___/___/____
    | (Business Registration Certificate)        |         | Tải lên     |                    |
    | Luật DN 2020 Điều 29                      |         |             |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 2  | Giấy chứng nhận đăng ký thuế              | Bắt buộc| [___/___/__]| Số: _____________  | Không có
    | (Tax Registration Certificate)             |         | Tải lên     | (trùng MST)        |
    | Luật QLT 38/2019 Điều 30                  |         |             |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 3  | Giấy chứng nhận đã đăng ký mẫu dấu       | Bắt buộc| [___/___/__]| Số: _____________  | ___/___/____
    | (Company Seal Registration Certificate)    |         | Tải lên     |                    |
    | Luật DN 2020 Điều 43                      |         |             |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 4  | Xác nhận tài khoản ngân hàng              | Bắt buộc| [___/___/__]| Ngân hàng: ______  | Không có
    | (Bank Account Confirmation)                |         | Tải lên     | STK: ___________   |
    | Phục vụ nộp thuế điện tử                  |         |             |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 5  | Xác nhận đăng ký VNeID                    | Bắt buộc| [___/___/__]| Mã VNeID: _______  | ___/___/____
    | (VNeID Registration Confirmation)          |         | Tải lên     |                    |
    | NĐ 69/2024/NĐ-CP Điều 8                   |         |             |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 6  | Đăng ký bảo hiểm xã hội                   | Bắt buộc| [___/___/__]| Số: _____________  | Không có
    | (Social Insurance Registration)            |         | Tải lên     |                    |
    | Luật BHXH 2014                            |         |             |                    |

--- B. GIẤY TỜ THEO NGÀNH NGHỀ (INDUSTRY-SPECIFIC PERMITS) ---

STT | Loại giấy tờ                              | Yêu cầu | Trạng thái   | Số/Ghi chú         | Ngày hết hạn
----|-------------------------------------------|---------|-------------|--------------------|-------------
 7  | Giấy phép môi trường (Environmental License)| Có/Không| [___/___/__]| Số: _____________  | ___/___/____
    | (nếu ngành nghề có tác động môi trường)    |         | Tải lên     |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 8  | Giấy phép con ngành nghề có điều kiện     | Có/Không| [___/___/__]| Số: _____________  | ___/___/____
    | (Conditional business sub-license)         |         | Tải lên     |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
 9  | Chứng chỉ hành nghề (Practice Certificate) | Có/Không| [___/___/__]| Số: _____________  | ___/___/____
    | (nếu yêu cầu theo ngành)                  |         | Tải lên     |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------
10  | Giấy phép PCCC (Fire Safety Permit)        | Có/Không| [___/___/__]| Số: _____________  | ___/___/____
    | (nếu yêu cầu theo quy mô/ngành)           |         | Tải lên     |                    |
----|-------------------------------------------|---------|-------------|--------------------|-------------

--- C. GIẤY TỜ KHÁC (OTHER DOCUMENTS) — TUỲ CHỌN ---

STT | Loại giấy tờ                              | Trạng thái   | Ghi chú
----|-------------------------------------------|-------------|--------------------
11  | Điều lệ công ty (Company Charter)          | [__/__/__]  | Đã được tất cả TV/Ký
    |                                           | Tải lên     | 
12  | Biên bản góp vốn (Capital Contribution Minutes)| [__/__/__]| 
    |                                           | Tải lên     | 
13  | Hợp đồng thuê trụ sở (Office Lease)       | [__/__/__]  | 
    |                                           | Tải lên     | 
14  | Quyết định bổ nhiệm KTT (Chief Accountant Appt)| [__/__/__]| 
    |                                           | Tải lên     | 

--- TỔNG HỢP (SUMMARY) ---

Tổng số giấy tờ đã tải lên:  ___/___  (bắt buộc: ___/6, theo ngành: ___, khác: ___)
Số giấy tờ sắp hết hạn:      ___  (cảnh báo nếu <= 30 ngày)
Số giấy tờ đã hết hạn:       ___  (cần gia hạn gấp)

Người kiểm tra:    ___________________   Ngày: ___/___/________
Kế toán trưởng:    ___________________   Ngày: ___/___/________

====================================================================
```

### Validation Rules

| # | Field | Rule | Error Message (VN) | Error Message (EN) |
|---|-------|------|--------------------|--------------------|
| VP-64 | Doc #1 (Business Reg Cert) | Always required. Upload or reference number. | "Giấy chứng nhận đăng ký doanh nghiệp là bắt buộc" | "Business Registration Certificate is mandatory" |
| VP-65 | Doc #2 (Tax Reg Cert) | Always required | "Giấy chứng nhận đăng ký thuế là bắt buộc" | "Tax Registration Certificate is mandatory" |
| VP-66 | Doc #3 (Seal Registration) | Always required | "Đăng ký mẫu dấu là bắt buộc" | "Seal registration is mandatory" |
| VP-67 | Doc #4 (Bank Account Confirmation) | Always required | "Xác nhận tài khoản ngân hàng là bắt buộc" | "Bank account confirmation is mandatory" |
| VP-68 | Doc #5 (VNeID) | Always required from 01/07/2025 | "Đăng ký VNeID là bắt buộc theo NĐ 69/2024/NĐ-CP" | "VNeID registration is mandatory per Decree 69/2024" |
| VP-69 | Doc #6 (Social Insurance) | Required if company has employees | "Đăng ký BHXH là bắt buộc nếu có người lao động" | "Social insurance registration required if employees exist" |
| VP-70 | Doc #7 (Environmental) | Conditional: required if business line has environmental impact | "Giấy phép môi trường là bắt buộc theo Luật BVMT 2020" | "Environmental license required per Law on Environmental Protection 2020" |
| VP-71 | Expiry alert | Display warning when <= 30 days before expiry date | "Giấy tờ '%s' sắp hết hạn (còn %d ngày)" | "Document '%s' expires soon (%d days remaining)" |
| VP-72 | Expiry blocking | Block tax filing if business registration cert is expired > 30 days | "Giấy chứng nhận đăng ký doanh nghiệp đã hết hạn trên 30 ngày. Vui lòng gia hạn." | "Business registration certificate expired > 30 days. Please renew." |

### Field Data Types

| Field | Type | Max Length | Required |
|-------|------|-----------|----------|
| DocumentType | enum | — | Yes |
| DocumentNumber | string | 100 | Yes |
| IssuedBy | string | 200 | No |
| DateIssued | date | — | Yes |
| DateExpiry | date | — | Conditional |
| FileUrl | string | 1000 | No |
| FileSize | long | 10MB | No |
| ContentType | string | 100 | No |
| UploadedAt | datetime | — | No |
| Notes | string | 500 | No |
| IsRequired | bool | — | Yes |
| IsConditional | bool | — | Yes |

### Help Text

- **Document upload**: "Tải lên bản scan màu, định dạng PDF/JPG/PNG, dung lượng tối đa 10MB mỗi file." / "Upload color scan, PDF/JPG/PNG format, max 10MB per file."
- **Expiry tracking**: "Hệ thống tự động cảnh báo khi giấy tờ sắp hết hạn (trong vòng 30 ngày). Giấy tờ hết hạn trên 30 ngày sẽ chặn giao dịch thuế." / "System auto-alerts when documents are due to expire within 30 days. Documents expired > 30 days block tax transactions."
- **VNeID requirement**: "Từ 01/07/2025, theo NĐ 69/2024/NĐ-CP, tất cả doanh nghiệp phải đăng ký VNeID để thực hiện giao dịch thuế điện tử. Xác nhận VNeID bắt buộc phải tải lên." / "From 01/07/2025 per Decree 69/2024, all companies must register VNeID for tax e-transactions. Upload VNeID confirmation."
- **Environmental license**: "Giấy phép môi trường theo Luật Bảo vệ môi trường 2020. Chỉ yêu cầu nếu ngành nghề kinh doanh có phát sinh chất thải, nước thải, khí thải." / "Environmental license per Law on Environmental Protection 2020. Required only if business generates waste, wastewater, or emissions."
- **Seal registration**: "Mẫu dấu doanh nghiệp phải đăng ký với Sở KHĐT theo Luật DN 2020 Điều 43. Trước khi sử dụng dấu, doanh nghiệp phải thông báo mẫu dấu với cơ quan đăng ký kinh doanh." / "Company seal must be registered with DPI per Law DN 2020 Article 43. Before using seal, company must notify the seal sample to business registration authority."

---

## Field Type Reference

| Type | Description | Examples |
|------|-------------|---------|
| string | Free-text alphanumeric input | "Công ty TNHH ABC" |
| enum | Fixed dropdown selection from defined list | CompanyType, AccountingRegime |
| bool | Checkbox or Yes/No toggle | IsPrimary, EnableMultiCurrency |
| date | Date picker (DD/MM/YYYY format in VN, ISO 8601 in API) | 20/07/2026 |
| datetime | Date + time picker | 20/07/2026 14:30:00 |
| decimal(18,2) | Numeric with 2 decimal places | 1000000000.00 |
| table | Repeatable row set | Contributors list, Business lines list |
| file | File upload (PDF/JPG/PNG, max 10MB) | business_reg_cert.pdf |

## General Validation Rules

| # | Rule | Scope | Message |
|---|------|-------|---------|
| GR-01 | All date fields must be valid calendar dates | All templates | "Ngày không hợp lệ" / "Invalid date" |
| GR-02 | All monetary fields must be non-negative | TP-01, TP-07 | "Giá trị không được âm" / "Value cannot be negative" |
| GR-03 | Phone numbers must contain only digits, +, -, and spaces | TP-01, TP-04, TP-06 | "Số điện thoại không hợp lệ" / "Invalid phone number" |
| GR-04 | Email fields must pass RFC 5322 basic validation | All templates | "Email không đúng định dạng" / "Invalid email format" |
| GR-05 | Required fields marked (bắt buộc) must not be empty | All templates | "Trường '%s' là bắt buộc" / "Field '%s' is required" |
| GR-06 | String fields must not exceed their max length | All templates | "Trường '%s' không được vượt quá %d ký tự" / "Field '%s' cannot exceed %d characters" |
| GR-07 | All changes to company data recorded in audit log | TP-01 through TP-08 | System-enforced — no user-facing error |
| GR-08 | Correction reason required for identity field changes | TP-02 | "Lý do thay đổi là bắt buộc đối với thông tin pháp lý" / "Reason is mandatory for identity field changes" |

---

## Law Reference Summary

| # | Law | Key Articles | Relevant Templates |
|---|-----|-------------|-------------------|
| 01 | Luật Doanh nghiệp 2020 | Điều 12-13 (legal rep), Điều 17 (eligibility), Điều 29 (enterprise code), Điều 37-38 (company name), Điều 43-45 (seal, branches), Điều 46-74 (capital), Điều 206-210 (lifecycle) | TP-01, TP-02, TP-04, TP-06, TP-08 |
| 02 | NĐ 168/2025/NĐ-CP | Điều 28 (internal control), Điều 35 (info change notification), Điều 41 (VNeID for tax) | TP-01, TP-02, TP-04, TP-08 |
| 03 | TT 99/2025/TT-BTC | Điều 5 (fiscal year), Điều 6 (currency), Điều 8 (rounding), Điều 10 (departments), Điều 12 (tax method), Điều 25 (inventory), Điều 28-29 (record keeping) | TP-03, TP-07 |
| 04 | NĐ 69/2024/NĐ-CP | Điều 8 (VNeID registration), Điều 14 (tax e-transactions) | TP-04, TP-05, TP-08 |
| 05 | Luật Kế toán 88/2015 | Điều 7 (documentation), Điều 11 (currency), Điều 12 (fiscal period), Điều 41 (retention) | TP-03, TP-08 |
| 06 | Luật Quản lý thuế 38/2019 | Điều 30 (tax code), Điều 42 (tax method) | TP-01, TP-03, TP-06, TP-07 |
| 07 | TT 133/2016/TT-BTC | SME accounting regime (alternative to TT99) | TP-03 |
| 08 | VAS 01 — General Standard | Going concern, consistency, decimal precision | TP-03 |
| 09 | VAS 02 — Inventory | FIFO, weighted average, specific identification, LIFO | TP-03 |
