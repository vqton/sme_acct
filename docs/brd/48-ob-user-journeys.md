# User Journeys — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## UJ-OB-01: New Company Onboarding (Kế toán mới)

**Persona:** Trần Thị B — Kế toán viên, 3 năm kinh nghiệm, mới chuyển sang dùng SmeAccounting

**Scenario:** Công ty TNHH ABC mới thành lập, cần nhập số dư vốn góp ban đầu 3 tỷ đồng

**Journey:**

1. B đăng nhập vào SmeAccounting, thấy dashboard trống
2. B vào menu Nghiệp vụ → Nhập số dư ban đầu
3. System hiển thị danh sách TK theo TT99, tất cả số dư = 0
4. B nhập số dư cho các TK:
   - TK 1111 (Tiền mặt): Dư Nợ 500,000,000
   - TK 1121 (Vietcombank): Dư Nợ 2,000,000,000
   - TK 4111 (Vốn góp): Dư Có 2,500,000,000
5. System tự động kiểm tra: Tổng Nợ 2.5B = Tổng Có 2.5B ✅
6. B lưu phiếu, system tạo batch OB-2026-00001
7. B chuyển sang nhập số dư chi tiết ngân hàng: click vào 📎 của TK 1121
8. B nhập 2 tài khoản ngân hàng: Vietcombank 1.5B + Techcombank 500M
9. System tự động tổng hợp lên TK 1121 = 2B ✅
10. B hoàn tất, system tự động khóa số dư sau khi B nhập phiếu thu đầu tiên
11. B sẵn sàng hạch toán các nghiệp vụ phát sinh

**Pain Points (tránh):**
- Màn hình trống, không biết bắt đầu từ đâu → cần hướng dẫn (wizard)
- Quên kiểm tra tổng Nợ = tổng Có → system tự động kiểm tra
- Nhập sai tài khoản ngân hàng mà không biết → system kiểm tra số dư ngân hàng = số dư TK 112

---

## UJ-OB-02: Migration from Legacy (Kế toán chuyển đổi)

**Persona:** Lê Văn C — Kế toán trưởng, 15 năm kinh nghiệm, chuyển từ MISA SME sang SmeAccounting

**Scenario:** Công ty đã hạch toán trên MISA SME 2025 (TT200), cần chuyển sang SmeAccounting cho năm 2026 (TT99)

**Journey:**

1. C xuất số dư cuối năm 2025 từ MISA SME ra file Excel (6 loại số dư)
2. C tải mẫu Excel của SmeAccounting → đối chiếu cột → copy dữ liệu vào
3. C nhập file Excel vào SmeAccounting
4. System hiển thị preview: 120 dòng hợp lệ, 0 lỗi
5. C xác nhận import → system tạo batch OB-2026-00001
6. C kiểm tra lại số dư từng TK, đối chiếu với BC năm 2025
7. C nhập TT200→TT99 conversion mapping:
   - Đa số mapping trực tiếp (TK 111→111)
   - TK 2281 tách thành 22811 + 22812
   - TK 441+466 gộp vào 4118
8. C chạy mô phỏng conversion, kiểm tra Tổng TS không đổi
9. C xác nhận conversion, system tạo báo cáo chuyển đổi
10. C khóa số dư, bắt đầu hạch toán năm 2026

**Pain Points (tránh):**
- Excel export từ MISA có format khác → cần accept nhiều định dạng hoặc mapping cột
- Conversion mapping mặc định sai → cần cho phép chỉnh sửa mapping
- Không biết account nào chưa được mapping → system highlight

---

## UJ-OB-03: Year-End Rollover (Kế toán cuối năm)

**Persona:** Phạm Thị D — Kế toán tổng hợp, 7 năm kinh nghiệm

**Scenario:** Cuối năm 2026, cần chốt sổ và chuyển số dư sang năm 2027

**Journey:**

1. D hoàn tất hạch toán tháng 12/2026
2. D chạy period-end closing cho tháng 12
3. System kiểm tra: tất cả journal entries đã posted, tổng Nợ = tổng Có
4. System đóng kỳ 12/2026
5. System tự động carry-forward số dư cuối kỳ → đầu kỳ 01/2027
6. System tạo opening balance batch cho 01/2027 với source = 'carry_forward'
7. D kiểm tra số dư đầu năm 2027 có khớp với số dư cuối năm 2026 không
8. Nếu có chênh lệch (ví dụ: do điều chỉnh sau closing), D vào sửa bằng tay
9. D khóa số dư 2027
10. D bắt đầu hạch toán năm 2027

**Pain Points (tránh):**
- Carry-forward bỏ sót tài khoản → kiểm tra đầy đủ
- Không biết có chênh lệch → system báo cáo so sánh
- Carry-forward sai do period chưa closed → system block

---

## UJ-OB-04: Tax Audit Preparation (Kiểm toán / Thanh tra)

**Persona:** Nguyễn Văn E — Thanh tra thuế, Cục Thuế TP HCM

**Scenario:** Thanh tra thuế tại doanh nghiệp, yêu cầu kiểm tra số dư đầu kỳ

**Journey:**

1. E yêu cầu doanh nghiệp xuất trình số dư đầu kỳ năm 2026
2. Kế toán vào Báo cáo → Số dư đầu kỳ → chọn năm 2026
3. System hiển thị báo cáo số dư đầu kỳ chi tiết theo TK
4. E kiểm tra: số dư đầu kỳ có khớp với số dư cuối năm 2025 không
5. E yêu cầu audit trail → ai nhập, ai duyệt, khi nào
6. System xuất audit log: "Nguyễn Văn A nhập 01/01/2026, Trần Thị B duyệt 02/01/2026"
7. E kiểm tra conversion (nếu có) → system xuất báo cáo chuyển đổi TT200→TT99
8. E đối chiếu số dư với tờ khai thuế GTGT đầu kỳ → system hiển thị số dư TK 133, 3331
9. E xác nhận: số dư đầu kỳ hợp lệ ✅

**Pain Points (tránh):**
- Không xuất được audit trail → trách nhiệm pháp lý
- Không so sánh được với kỳ trước → nghi ngờ gian lận
- Không có báo cáo conversion → không biết số dư từ đâu ra

---

## UJ-OB-05: Multi-Currency Company (Kế toán ngoại tệ)

**Persona:** Trần Văn F — Kế toán trưởng, công ty xuất nhập khẩu

**Scenario:** Công ty có phát sinh ngoại tệ USD, EUR. Cần nhập số dư đầu kỳ cho TK ngoại tệ

**Journey:**

1. F vào Nhập số dư ban đầu
2. F chọn TK 1122 (TGNH USD)
3. System hiển thị thêm cột: Ngoại tệ, Tỷ giá
4. F nhập: Số dư USD = 50,000, Tỷ giá = 25,500
5. System auto tính: Số dư VND = 50,000 × 25,500 = 1,275,000,000
6. F nhập tiếp TK 131 (Phải thu KH) — có cả VND và USD
7. System yêu cầu nhập chi tiết theo từng khách hàng và loại tiền
8. F nhập xong → system kiểm tra tổng Nợ = tổng Có (cả VND và USD quy đổi)
9. F lưu, system lưu cả số gốc ngoại tệ và số VND quy đổi

**Pain Points (tránh):**
- Tỷ giá không chính xác → system có thể tra cứu tỷ giá từ NH
- Sai số quy đổi → system tự động tính, user chỉ nhập ngoại tệ
- Chênh lệch tỷ giá đầu kỳ → cần hướng dẫn xử lý
