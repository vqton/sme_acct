# UI Specification — Tax Module

## 1. Main Menu Structure

```
THUẾ (TAX)                            [New parent menu]
├── Tổng quan Thuế                    → Tax Dashboard
├── Khai báo Thuế (Tax Declaration)
│   ├── Thuế GTGT (VAT)
│   │   ├── Tờ khai 01/GTGT
│   │   ├── Bảng kê hóa đơn đầu ra
│   │   ├── Bảng kê hóa đơn đầu vào
│   │   └── Yêu cầu hoàn thuế
│   ├── Thuế TNDN (CIT)
│   │   ├── Ước tính tạm nộp quý
│   │   ├── Quyết toán năm (03/TNDN)
│   │   ├── Phụ lục chuyển lỗ (03-2A/TNDN)
│   │   └── Ưu đãi thuế
│   ├── Thuế TNCN (PIT)
│   │   ├── Khai báo tháng/quý
│   │   ├── Quyết toán năm (05/QTT-TNCN)
│   │   ├── Đăng ký người phụ thuộc
│   │   └── Chứng từ khấu trừ điện tử
│   └── Thuế khác
│       ├── Thuế môn bài
│       ├── Thuế TTĐB
│       ├── Thuế tài nguyên
│       └── Thuế bảo vệ môi trường
├── Hóa đơn điện tử (e-Invoice)
│   ├── Hóa đơn đầu vào
│   ├── Hóa đơn đầu ra
│   └── Đối chiếu với CQT
├── Nộp thuế (Tax Payment)
│   ├── Lệnh nộp tiền
│   ├── Tra cứu nộp thuế
│   └── Đối chiếu số dư
├── Báo cáo Thuế (Tax Reports)
│   ├── Báo cáo tình hình sử dụng hóa đơn
│   ├── Sổ thuế GTGT
│   ├── Sổ thuế TNDN
│   ├── Tổng hợp nghĩa vụ thuế
│   └── Phân tích thuế
├── Lịch Thuế (Tax Calendar)           → Period calendar + alerts
└── Danh mục (Tax Setup)
    ├── Thiết lập thuế
    ├── Phương pháp tính thuế
    ├── Biểu thuế suất
    ├── Nhóm ngành tính thuế (per TT50/2026)
    └── Chính sách ưu đãi
```

## 2. Key Screens

### 2.1 Tax Dashboard
```
┌────────────────────────────────────────────────────────┐
│  THUẾ > Tổng quan Thuế                   Năm 2026 │ Q2 │
├────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ VAT      │ │ CIT      │ │ PIT      │ │ License  │   │
│ │ Payable  │ │ Due      │ │ Payable  │ │ Tax      │   │
│ │ 12.5M    │ │ 45.2M    │ │ 8.1M     │ │ 3.0M     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ALERTS                                           │   │
│ │ ⚠️ VAT June deadline: 20/07/2026 (14 days left) │   │
│ │ ✅ CIT Q1 paid: 10.0M ✓                          │   │
│ │ ❌ PIT May: NOT FILED — OVERDUE by 3 days        │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Upcoming Deadlines           │ Last Updated      │   │
│ │ 20/07  VAT June return       │ 23/07 10:45       │   │
│ │ 30/07  Invoice usage Q2      │                    │   │
│ │ 31/10  CIT Q3 provisional    │                    │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Tax Cash Flow Forecast                           │   │
│ │ Jul: 15.2M │ Aug: 12.8M │ Sep: 14.1M │ ...      │   │
│ └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 2.2 VAT Return 01/GTGT
```
┌────────────────────────────────────────────────────────┐
│  THUẾ > Khai báo Thuế > GTGT > 01/GTGT    June 2026    │
├────────────────────────────────────────────────────────┤
│ Kỳ: [06/2026 ▼]  Phương pháp: [Khấu trừ ▼]           │
│                                                         │
│ [COMPUTE] [PREVIEW] [SIGN & SUBMIT] [EXPORT XML]      │
├────────────────────────────────────────────────────────┤
│ CHỈ TIÊU                         GIÁ TRỊ     THUẾ     │
│ ─────────────────────────────────────────────────────  │
│ THUẾ GTGT ĐẦU RA                                       │
│ [23] HHDV chịu thuế 0%        5,000,000       0       │
│ [24] HHDV chịu thuế 5%       12,000,000     600,000   │
│ [25] HHDV chịu thuế 10%      50,000,000   5,000,000   │
│ [26] HHDV chịu thuế 8%       30,000,000   2,400,000   │
│ Tổng đầu ra                    97,000,000   8,000,000 │
│ ─────────────────────────────────────────────────────  │
│ THUẾ GTGT ĐẦU VÀO                                       │
│ [33] HHDV mua vào (5%)        20,000,000   1,000,000   │
│ [34] HHDV mua vào (10%)       40,000,000   4,000,000   │
│ [35] HHDV mua vào (8%)       15,000,000   1,200,000   │
│ Tổng đầu vào                    75,000,000   6,200,000 │
│ ─────────────────────────────────────────────────────  │
│ [40] THUẾ GTGT PHẢI NỘP                   1,800,000   │
│ [41] THUẾ GTGT ĐỀ NGHỊ HOÀN                       0   │
│ [42] THUẾ GTGT ĐƯỢC KHẤU TRỪ KỲ SAU             0   │
├────────────────────────────────────────────────────────┤
│ ▶ Chi tiết đầu ra (5 invoices)                          │
│ ▶ Chi tiết đầu vào (12 invoices)                        │
│ ▶ Điều chỉnh (2 items flagged)                          │
└────────────────────────────────────────────────────────┘
```

### 2.3 CIT Finalization 03/TNDN
```
┌────────────────────────────────────────────────────────┐
│  THUẾ > Khai báo Thuế > TNDN > Quyết toán năm 2025     │
├────────────────────────────────────────────────────────┤
│ [AUTO-FILL FROM BCTC] [MANUAL ADJUST] [GENERATE]      │
├────────────────────────────────────────────────────────┤
│ 03-1A/TNDN — Kết quả SXKD                               │
│ A. Doanh thu                              500,000,000  │
│ B. Chi phí được trừ                      420,000,000   │
│ C. Thu nhập chịu thuế (A-B+CK)            80,000,000   │
│ Trong đó: Thu nhập miễn thuế                2,000,000  │
│                                          ────────────  │
│ D. Thu nhập tính thuế                     78,000,000   │
│ ─────────────────────────────────────────────────────  │
│ 03-2A/TNDN — Chuyển lỗ                                  │
│ Lỗ phát sinh năm 2022                    (15,000,000)  │
│ Lỗ đã chuyển đến năm 2024                 15,000,000   │
│ Lỗ còn được chuyển                                  0  │
│ ─────────────────────────────────────────────────────  │
│ THUẾ TNDN PHẢI NỘP:                   78,000,000×20%  │
│                                          = 15,600,000  │
│ Đã tạm nộp các quý:                      (12,000,000)  │
│ Số phải nộp thêm:                          3,600,000   │
│ Tiền chậm nộp (nếu có):                          0     │
├────────────────────────────────────────────────────────┤
│ ⚠️ Check: CIT provisional (12M) / Final (15.6M) = 76.9%│
│ ⚠️ Below 80% threshold — penalty risk                   │
└────────────────────────────────────────────────────────┘
```

### 2.4 Tax Calendar
```
┌────────────────────────────────────────────────────────┐
│  THUẾ > Lịch Thuế                       2026 │ July    │
├────────────────────────────────────────────────────────┤
│ MON    TUE     WED     THU     FRI     SAT    SUN       │
│                       1       2       3      4        │
│                        │                               │
│  5      6       7       8       9      10      11      │
│                               VAT Jun: Compute         │
│ 12     13      14      15      16      17      18      │
│                               VAT: Sign & Submit       │
│ 19    [20]     21      22      23      24      25      │
│       VAT Jun: DEADLINE │ Today                        │
│ 26     27      28      29      30      31              │
│                               Invoice usage Q2 due     │
│                                                         │
│ ALERTS:                                                 │
│ 🔴 VAT June DEADLINE: Tomorrow — Not yet filed         │
│ 🟡 Invoice usage Q2: 10 days remaining                 │
│ 🟢 PIT July: On track (25 days remaining)              │
└────────────────────────────────────────────────────────┘
```

### 2.5 eTax Submission Dialog
```
┌──────────────────────────────────────────────────────┐
│ NỘP TỜ KHAI THUẾ                                     │
├──────────────────────────────────────────────────────┤
│ Tờ khai: 01/GTGT — Tháng 06/2026                     │
│ Số thuế phải nộp: 1,800,000 VND                      │
│                                                       │
│ Bước 1: Kiểm tra XML         ✅ Valid                 │
│ Bước 2: Ký số               ⏳ Chọn chứng thư số...  │
│                                                       │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Số Serial: 0A1B2C3D...                           │  │
│ │ Nhà cung cấp: Viettel CA                         │  │
│ │ Hiệu lực: 01/01/2024 - 31/12/2026                │  │
│ │ [SIGN WITH THIS CERTIFICATE]                      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ Bước 3: Gửi lên CQT           [PENDING...]           │
│                                                       │
│ Kết quả:                                          ✅  │
│ Mã xác nhận: GDT-2026-0715-AB1234                    │
│ Thời gian: 23/07/2026 10:45:22                        │
│                                                       │
│ [CLOSE] [VIEW RECEIPT] [PAY TAX] [PRINT]             │
└──────────────────────────────────────────────────────┘
```

## 3. Tax Setup Screen

```
┌────────────────────────────────────────────────────────┐
│  THUẾ > Danh mục > Thiết lập Thuế                      │
├────────────────────────────────────────────────────────┤
│ Công ty: CÔNG TY TNHH ABC                              │
│                                                         │
│ PHƯƠNG PHÁP TÍNH THUẾ GTGT:  [Khấu trừ ▼]             │
│   → Locked for FY2026, can change next FY              │
│                                                         │
│ THUẾ SUẤT TNDN:                    [20% ▼]             │
│   → Auto: Revenue = 65 tỷ → rate = 20%                 │
│                                                         │
│ KỲ KHAI THUẾ GTGT:                [Tháng ▼]            │
│ → Companies with revenue > 50 tỷ must file monthly    │
│                                                         │
│ NGOẠI TỆ KẾ TOÁN:                   [VND ▼]            │
│                                                         │
│ TỶ GIÁ HẠCH TOÁN:                                      │
│   Ngân hàng: [Vietcombank ▼]                            │
│   Loại: [Tỷ giá mua bán CK trung bình ▼]  ← TT99 mới  │
│                                                         │
│ ƯU ĐÃI THUẾ:                                           │
│   Loại: [Khu công nghệ cao ▼]                           │
│   Thời hạn: 2024-2039                                   │
│   Thuế suất ưu đãi: 10%                                 │
│   Miễn thuế: 4 năm (2024-2027)                          │
│   Giảm 50%: 9 năm (2028-2036)                           │
│                                                         │
│ [SAVE]                                                  │
└────────────────────────────────────────────────────────┘
```

## 4. Mobile View (Responsive)

```
┌──────────────────────┐
│ THUẾ               │
│                      │
│ VAT: 12.5M ▲ 14%   │
│ CIT: 45.2M ▶       │
│ PIT: 8.1M  ▼ 2%    │
│ License: 3.0M       │
│                      │
│ ───────────────     │
│ 🔴 VAT Jun OVERDUE  │
│   20/07 → +3 days   │
│ ───────────────     │
│                      │
│ [SUBMIT NOW]        │
│                      │
│ Calendar │ Reports  │
└──────────────────────┘
```

## 5. Responsive & Accessible Design

- WCAG 2.1 AA compliance
- Screen reader support for tax forms
- Keyboard navigation for data entry
- Print-friendly BCTC format
- Export: PDF, Excel, XML
- Multi-monitor: declaration + reference docs side by side
