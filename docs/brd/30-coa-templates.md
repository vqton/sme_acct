# COA Module — Templates

**Version:** 1.1
**Date:** 2026-07-23

---

## TEM-01: Account Management Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Danh mục Tài khoản Kế toán                              [+ Add]   │
├─────────────────────────────────────────────────────────────────────┤
│  [🔍 Search...                                  ▼ Filters    ]     │
├─────────────────────────────────────────────────────────────────────┤
│  Regime: [TT 99/2025 ▼]  Status: [All ▼]  Category: [All ▼]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1 - Tài sản ngắn hạn                         [📂] [0₫]            │
│  ├── 11 - Tiền và tương đương tiền             [📂] [0₫]            │
│  │   ├── 111 - Tiền mặt                       [📂] [0₫]            │
│  │   │   ├── 1111 - Tiền Việt Nam             [📄] [0₫]            │
│  │   │   ├── 1112 - Ngoại tệ                  [📄] [0₫]            │
│  │   │   └── 1113 - Vàng bạc, đá quý          [📄] [0₫]            │
│  │   ├── 112 - Tiền gửi không kỳ hạn          [📂] [0₫]            │
│  │   │   ├── 1121 - Tiền Việt Nam             [📄] [0₫]            │
│  │   │   └── 1122 - Ngoại tệ                  [📄] [0₫]            │
│  │   └── 113 - Tiền đang chuyển               [📄] [0₫]            │
│  ├── 12 - Đầu tư tài chính ngắn hạn            [📂] [0₫]            │
│  ...                                                                 │
│                                                                     │
│  Summary: 85 accounts (71 system + 14 custom)                       │
│  Total Debit: 0₫  |  Total Credit: 0₫                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TEM-02: Account Detail Form

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✏ Edit Account: 1111 - Tiền Việt Nam                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Account Number:   [1111           ]  ⚠ Auto-format: 4 digits     │
│  Name (VN):        [Tiền Việt Nam                                 ]│
│  Name (EN):        [Cash in VND                                   ]│
│  Parent Account:   [111 - Tiền mặt                         [▼]   ]│
│  Category:         [Tài sản (mặc định từ parent)                  ]│
│  Nature:           [Dư Nợ (mặc định từ category)                  ]│
│  Type:             [Tài khoản chi tiết (auto)                      ]│
│  ───────────────────────────────────────────────────────────────── │
│  ☑ Active          ☐ System Account (read-only)                    │
│  ☑ Allow Transactions                                              │
│  ───────────────────────────────────────────────────────────────── │
│  Description:      [Tài khoản này dùng để hạch toán tiền mặt VNĐ  ]│
│                    [tại quỹ của doanh nghiệp                       ]│
│  ───────────────────────────────────────────────────────────────── │
│  Created: 23/07/2026 08:00    By: admin@company                    │
│  Updated: 23/07/2026 10:30    By: admin@company                    │
│                                                                     │
│  [Cancel]  [Save]                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TEM-03: Account Deactivation Confirmation

```
┌─────────────────────────────────────────────────────────────────────┐
│  🚫 Deactivate Account: 1111 - Tiền Việt Nam                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ⚠ Current Balance: 15,000,000₫ (Dư Nợ)                            │
│  ⚠ Posted transactions this period: 23                              │
│                                                                     │
│  Deactivating this account will:                                     │
│  • Block all future transactions                                    │
│  • Historical transactions remain unchanged                         │
│  • Account hidden from active account selectors                     │
│                                                                     │
│  Reason: [Chuyển sang sử dụng tài khoản mới                 [▼]  ]│
│  ─ or enter custom: [__________________________________]            │
│  Effective Date: [2026-08-01                    ]                   │
│  Transfer Balance To: [1121 - Tiền gửi VNĐ               [▼]     ]│
│                                                                     │
│  ☐ I confirm that I have reviewed the impact of deactivation        │
│                                                                     │
│  [Cancel]  [Deactivate]                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TEM-04: COA Import Format (CSV)

```
account_number,name,name_english,category,nature,parent_number,description
1111,Tiền Việt Nam,Cash in VND,TaiSan,DuNo,111,Tiền mặt tại quỹ
1112,Ngoại tệ,Foreign Currency,TaiSan,DuNo,111,,
1121,Tiền gửi VNĐ,Bank Deposit VND,TaiSan,DuNo,112,,
1122,Tiền gửi ngoại tệ,Bank Deposit FCY,TaiSan,DuNo,112,,
```

### Column Rules:
- `account_number`: Required, unique per file
- `name`: Required, max 255 chars
- `category`: Required, must match enum values (TaiSan, NoPhaiTra, VonChuSoHuu, DoanhThu, ChiPhi, XacDinhKetQua)
- `nature`: Required, must match enum (DuNo, DuCo, LuongTinh, KhongCoSoDu)
- `parent_number`: Optional, must reference existing `account_number` in DB or file
- `description`: Optional

---

## TEM-05: Audit Log Entry — COA Change

| Field | Value |
|---|---|
| id | 1042 |
| user_id | 5 |
| action | ACCOUNT_UPDATED |
| resource | account |
| resource_id | 42 |
| detail | `{"before":{"name":"Tiền gửi ngân hàng"},"after":{"name":"Tiền gửi không kỳ hạn"},"reason":"TT 99 rename"}` |
| ip_address | 192.168.1.100 |
| created_at | 2026-07-23T10:30:00.000Z |

---

## TEM-06: Trial Balance Report (Excerpt)

```
SmeAccounting Công ty TNHH ABC
BẢNG CÂN ĐỐI TÀI KHOẢN (TRIAL BALANCE)
Kỳ: Tháng 07/2026

TK       Tên                      SD ĐK Nợ   SD ĐK Có   PS Nợ     PS Có     SD CK Nợ   SD CK Có
───      ─────────────────────    ────────   ────────   ────────   ────────   ────────   ────────
111      Tiền mặt                  50,000,0   0          20,000,0   15,000,0   55,000,0   0
1111     - Tiền VNĐ                 50,000,0   0          20,000,0   15,000,0   55,000,0   0
112      Tiền gửi không kỳ hạn     200,000,   0          50,000,0   30,000,0   220,000,   0
1121     - Tiền VNĐ                 180,000,   0          40,000,0   25,000,0   195,000,   0
1122     - Ngoại tệ                 20,000,0   0          10,000,0   5,000,00   25,000,0   0
...
───      ─────────────────────    ────────   ────────   ────────   ────────   ────────   ────────
TỔNG                               ...        ...        ...        ...        ...        ...

✅ Cân đối: Tổng Nợ = Tổng Có
```

---

## TEM-07: Regime Migration Report

```
══════════════════════════════════════════════════════════════
  REGIME MIGRATION REPORT
  From: TT 133/2016 → To: TT 99/2025
  Company: Công ty TNHH ABC (ID: 1)
  Date: 2026-07-23
══════════════════════════════════════════════════════════════

ACCOUNTS TO ADD (5):
  ├── 215 - Tài sản sinh học (new in TT 99)
  ├── 332 - Phải trả cổ tức, lợi nhuận (new in TT 99)
  ├── 82112 - Thuế bổ sung GMT (new in TT 99)
  └── ...

ACCOUNTS TO RENAME (4):
  ├── 112: "Tiền gửi ngân hàng" → "Tiền gửi không kỳ hạn"
  ├── 155: "Thành phẩm" → "Sản phẩm"
  ├── 242: "Chi phí trả trước" → "Chi phí chờ phân bổ"
  └── 158: "Hàng hóa kho bảo thuế" → "Nguyên liệu, vật tư tại kho bảo thuế"

ACCOUNTS TO DEACTIVATE (2):
  ├── 611 - Mua hàng (removed from TT 99) — balance: 0₫ ✅
  └── 631 - Giá thành sản xuất (removed from TT 99) — balance: 0₫ ✅

UNMAPPED ACCOUNTS WITH BALANCE (0): ✅

══════════════════════════════════════════════════════════════
  STATUS: READY FOR MIGRATION
══════════════════════════════════════════════════════════════
```
