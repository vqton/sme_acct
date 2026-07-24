# UI Specs — Opening Balance Module (Số Dư Đầu Kỳ)

**Version:** 1.0 | **Date:** 2026-07-24

---

## UI-OB-01: Main Opening Balance Dashboard

### Route
`/opening-balance`

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "Nhập số dư ban đầu"   [Công ty ▼] [Kỳ ▼] [T.T thái ▼]  │
├──────────────────────────────────────────────────────────────────┤
│ Toolbar: [+ Thêm] [Tải mẫu Excel] [Nhập Excel] [Xuất] [In]      │
├──────────────────────────────────────────────────────────────────┤
│ Data Table (full width):                                         │
│ ┌────┬─────────┬────────────┬──────────┬──────────┬──────┬─────┐ │
│ │ #  │ Số phiếu│ Ngày       │ Tổng Nợ  │ Tổng Có  │  PL  │ TT  │ │
│ ├────┼─────────┼────────────┼──────────┼──────────┼──────┼─────┤ │
│ │ 1  │OB-00001 │01/01/2026  │3,100,000 │3,100,000 │ ✅   │🔒   │ │
│ │ 2  │OB-00002 │01/02/2026  │2,500,000 │2,500,000 │ ⚠️   │📝   │ │
│ └────┴─────────┴────────────┴──────────┴──────────┴──────┴─────┘ │
│ Pagination: [<] 1 2 3 ... 10 [>]  Tổng: 10 phiếu                  │
└──────────────────────────────────────────────────────────────────┘
```

### States
- **Empty:** "Chưa có số dư đầu kỳ. Nhấn [+ Thêm] để nhập số dư đầu kỳ."
- **Loading:** Skeleton table (4 shimmer rows)
- **Error:** Toast "Không thể tải danh sách. Vui lòng thử lại."

### Interactions
- Click row → navigate to detail screen
- Filter by company, period, status
- Search by batch number

---

## UI-OB-02: Opening Balance Entry Screen

### Route
`/opening-balance/new` | `/opening-balance/:id/edit`

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "Phiếu số dư đầu kỳ"   [Lưu] [Hủy]                      │
├──────────────────────────────────────────────────────────────────┤
│ Info bar:                                                        │
│ Công ty: [ABC Co.] (readonly)                                    │
│ Kỳ:      [01/2026 ▼]                                            │
│ Ngày:    [01/01/2026 ██]                                        │
│ Mô tả:   [Nhập số dư đầu năm 2026                          ██]  │
├──────────────────────────────────────────────────────────────────┤
│ Tabs:                                                            │
│ [Số dư TK] [Ngân hàng] [Công nợ] [Tồn kho] [TSCĐ] [CCDC] [CP]  │
├──────────────────────────────────────────────────────────────────┤
│ Active Tab: "Số dư TK"                                           │
│ ┌──────┬──────────────┬──────────┬──────────┬─────────┬────────┐│
│ │ TK   │ Tên TK       │ Dư Nợ    │ Dư Có    │ GT      │ Chi  ││
│ │      │              │          │          │         │ tiết ││
│ ├──────┼──────────────┼──────────┼──────────┼─────────┼────────┤│
│ │ 1111 │ TM VND       │500,000,00│0         │         │       ││
│ │ 1121 │ TGNH VCB     │1,500,000 │0         │         │📎 1   ││
│ │ 131  │ PT KH        │600,000,00│0         │         │📎 3   ││
│ │ 152  │ NVL          │50,000,000│0         │         │📎 2   ││
│ │ 331  │ PT NCC       │0         │400,000,00│         │📎 2   ││
│ │ 421  │ LN CPP       │0         │2,700,000 │         │       ││
│ ├──────┼──────────────┼──────────┼──────────┼─────────┼────────┤│
│ │      │ Tổng         │3,100,000 │3,100,000 │✅ Cân   │       ││
│ └──────┴──────────────┴──────────┴──────────┴─────────┴────────┘│
│ Status bar: "✅ Đã cân bằng. Chênh lệch: 0"                     │
└──────────────────────────────────────────────────────────────────┘
```

### Interactions
- Inline editing: click debit/credit cell → editable number input
- Tab navigation: each sub-ledger tab shows pre-filtered accounts
- Chip indicator (📎): shows count of detail entries, click to expand
- Status bar updates in real-time as user types
- On save: validates all tabs before commit

---

## UI-OB-03: TT99 Conversion Wizard

### Route
`/opening-balance/convert-tt99`

### Layout (Step 2 — Mapping Review)
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "Chuyển đổi số dư TT200 → TT99"                        │
│ Step: [✅1. Backup] [▶2. Mapping] [3. Simulation] [4. Confirm]  │
├──────────────────────────────────────────────────────────────────┤
│ Mapping Table:                                                   │
│ ┌───────┬───────┬─────────┬───────────┬───────────┬────────────┐│
│ │ TT200 │ TT99  │ Loại    │ Số dư cũ   │ Số dư mới │ Ghi chú    ││
│ ├───────┼───────┼─────────┼───────────┼───────────┼────────────┤│
│ │ 111   │ 111   │ Trực    │ 500M      │ 500M      │            ││
│ │ 112   │ 112   │ Trực    │ 2B        │ 2B        │            ││
│ │ 2281  │ 22811 │ Tách    │ 2B        │ 1.2B      │ 60%       ││
│ │ 2281  │ 22812 │ Tách    │ 2B        │ 800M      │ 40%       ││
│ │ 441   │ 4118  │ Gộp     │ 500M      │ 800M      │ +466      ││
│ │ 466   │ 4118  │ Gộp     │ 300M      │ 800M      │ +441      ││
│ └───────┴───────┴─────────┴───────────┴───────────┴────────────┘│
│                                                                  │
│ [⚙ Mặc định] [✏ Sửa mapping] [▶ Chạy mô phỏng]                │
└──────────────────────────────────────────────────────────────────┘
```

---

## UI-OB-04: Sub-Ledger Detail Drawer

### Trigger
Click 📎 icon on account row in entry screen

### Layout (Slide-in drawer from right, 50% width)
```
┌────────────────────────────────────────────┐
│  ✕ Chi tiết số dư — TK 1121 (TGNH VCB)   │
├────────────────────────────────────────────┤
│  ┌────┬──────────────┬──────────┬────────┐ │
│  │ #  │ Ngân hàng    │ Số TK    │ Số dư  │ │
│  ├────┼──────────────┼──────────┼────────┤ │
│  │ 1  │ Vietcombank  │ 12345678│ 1.2B   │ │
│  │ 2  │ Techcombank  │ 87654321│ 800M   │ │
│  ├────┼──────────────┼──────────┼────────┤ │
│  │    │ Tổng         │          │ 2.0B   │ │
│  │    │ TK 1121      │          │ 2.0B   │ │
│  │    │ Chênh lệch   │          │ 0 ✅   │ │
│  └────┴──────────────┴──────────┴────────┘ │
│  [+ Thêm dòng]                             │
├────────────────────────────────────────────┤
│  [Đóng]  [Lưu]                             │
└────────────────────────────────────────────┘
```

---

## UI-OB-05: Approval Screen

### Route
`/opening-balance/approvals`

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "Duyệt số dư đầu kỳ"                                    │
├──────────────────────────────────────────────────────────────────┤
│ Pending approvals:                                                │
│ ┌────┬──────────┬────────────┬─────────┬─────────┬─────────────┐│
│ │ #  │ Số phiếu│ Công ty    │ Kỳ      │ Người   │ Trạng thái  ││
│ │    │          │            │         │ nhập    │             ││
│ ├────┼──────────┼────────────┼─────────┼─────────┼─────────────┤│
│ │ 1  │OB-00002  │ ABC Co.    │ 02/2026 │ Ng.A    │ ⏳ Chờ duyệt││
│ └────┴──────────┴────────────┴─────────┴─────────┴─────────────┘│
│                                                                  │
│ Click row → detail view with approve/reject buttons               │
└──────────────────────────────────────────────────────────────────┘
```

---

## UI-OB-06: Lock Confirmation Dialog

### Trigger
Click lock button or auto-trigger on first transaction

```
┌─────────────────────────────────────────────────┐
│  🔒 Xác nhận khóa số dư đầu kỳ                  │
│                                                 │
│  Sau khi khóa:                                  │
│  • Không thể sửa/xóa số dư đầu kỳ              │
│  • Chỉ Kế toán trưởng mới mở khóa được         │
│  • Audit trail ghi lại thời điểm khóa           │
│                                                 │
│  Lý do khóa (bắt buộc):                         │
│  [██████████████████████████████]               │
│                                                 │
│  [Hủy]  [Xác nhận khóa]                         │
└─────────────────────────────────────────────────┘
```

---

## UI-OB-07: Excel Import Dialog

### Trigger
Click "Nhập từ Excel" button

```
┌─────────────────────────────────────────────────┐
│  📂 Nhập số dư từ Excel                         │
│                                                 │
│  Bước 1: Tải file mẫu                           │
│  [Tải mẫu nhập số dư đầu kỳ.xlsx]              │
│                                                 │
│  Bước 2: Chọn file đã điền                      │
│  [📎 Chọn file]  [hoặc kéo thả file vào đây]    │
│                                                 │
│  File: mau_sodudauky_dadien.xlsx ✅             │
│  45 dòng hợp lệ / 3 dòng lỗi                    │
│                                                 │
│  Lỗi:                                           │
│  • Dòng 12: TK "9999" không tồn tại            │
│  • Dòng 23: Số dư Nợ = -500,000 (âm)           │
│  • Dòng 34: TK "112" là TK mẹ, không nhập      │
│                                                 │
│  [Quay lại]  [Nhập 45 dòng hợp lệ]             │
└─────────────────────────────────────────────────┘
```

---

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| ≥1200px | Full table, all columns visible |
| 768-1199px | Hide Ghi chú column, collapse actions |
| <768px | Card layout (1 row = 1 card), horizontal scroll for table |

## Accessibility

- All inputs have proper labels (aria-label)
- Color not sole indicator — use icons + text (✅, ⚠️, ❌)
- Keyboard navigation: Tab through cells, Enter to edit, Escape to cancel
- Screen reader: announce row count, total balance, validation status
