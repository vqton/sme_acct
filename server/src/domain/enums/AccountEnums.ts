export enum AccountCategory {
  TaiSan = 1,
  NoPhaiTra = 2,
  VonChuSoHuu = 3,
  DoanhThu = 4,
  ChiPhi = 5,
  XacDinhKetQua = 6,
}

export enum AccountNature {
  DuNo = 1,
  DuCo = 2,
  LuongTinh = 3,
  KhongCoSoDu = 4,
}

export enum AccountType {
  TaiKhoanMe = 1,
  TaiKhoanCon = 2,
  TaiKhoanChiTiet = 3,
}

export enum AccountingRegime {
  TT99 = 1,
  TT133 = 2,
  TT58 = 3,
}

export enum JournalEntryType {
  ThuTien = 1,
  ChiTien = 2,
  ThuKhac = 3,
  ChiKhac = 4,
  ChuyenKhoan = 5,
  MuaHang = 6,
  BanHang = 7,
  KhauHao = 8,
  PhanBo = 9,
  Khac = 99,
}

export enum FiscalPeriodStatus {
  Open = 1,
  Closed = 2,
  Locked = 3,
}

export function getAccountCategoryLabel(c: AccountCategory): string {
  const labels: Record<AccountCategory, string> = {
    [AccountCategory.TaiSan]: 'Tài sản',
    [AccountCategory.NoPhaiTra]: 'Nợ phải trả',
    [AccountCategory.VonChuSoHuu]: 'Vốn chủ sở hữu',
    [AccountCategory.DoanhThu]: 'Doanh thu',
    [AccountCategory.ChiPhi]: 'Chi phí',
    [AccountCategory.XacDinhKetQua]: 'Xác định kết quả kinh doanh',
  };
  return labels[c];
}

export function getAccountNatureLabel(n: AccountNature): string {
  const labels: Record<AccountNature, string> = {
    [AccountNature.DuNo]: 'Dư Nợ',
    [AccountNature.DuCo]: 'Dư Có',
    [AccountNature.LuongTinh]: 'Lưỡng tính',
    [AccountNature.KhongCoSoDu]: 'Không có số dư',
  };
  return labels[n];
}

export function getJournalEntryTypeLabel(t: JournalEntryType): string {
  const labels: Record<JournalEntryType, string> = {
    [JournalEntryType.ThuTien]: 'Phiếu thu',
    [JournalEntryType.ChiTien]: 'Phiếu chi',
    [JournalEntryType.ThuKhac]: 'Thu khác',
    [JournalEntryType.ChiKhac]: 'Chi khác',
    [JournalEntryType.ChuyenKhoan]: 'Chuyển khoản',
    [JournalEntryType.MuaHang]: 'Hóa đơn mua hàng',
    [JournalEntryType.BanHang]: 'Hóa đơn bán hàng',
    [JournalEntryType.KhauHao]: 'Khấu hao TSCĐ',
    [JournalEntryType.PhanBo]: 'Phân bổ',
    [JournalEntryType.Khac]: 'Khác',
  };
  return labels[t];
}

export function getFiscalPeriodStatusLabel(s: FiscalPeriodStatus): string {
  const labels: Record<FiscalPeriodStatus, string> = {
    [FiscalPeriodStatus.Open]: 'Đang mở',
    [FiscalPeriodStatus.Closed]: 'Đã khóa sổ',
    [FiscalPeriodStatus.Locked]: 'Đã khóa',
  };
  return labels[s];
}

export const ACCOUNT_CATEGORY_NATURE: Record<AccountCategory, AccountNature> = {
  [AccountCategory.TaiSan]: AccountNature.DuNo,
  [AccountCategory.NoPhaiTra]: AccountNature.DuCo,
  [AccountCategory.VonChuSoHuu]: AccountNature.DuCo,
  [AccountCategory.DoanhThu]: AccountNature.DuCo,
  [AccountCategory.ChiPhi]: AccountNature.DuNo,
  [AccountCategory.XacDinhKetQua]: AccountNature.LuongTinh,
};

// ─── STANDARD_ACCOUNTS_TT99 (TT 99/2025/TT-BTC — Phụ lục II) ────────────────
// 71 level-1 + 101 level-2 + 10 level-3 + 2 level-4 = 184 accounts

export const STANDARD_ACCOUNTS_TT99: Array<{ number: string; name: string; category: AccountCategory; parent?: string }> = [
  // ── Tài sản (33 level-1) ──────────────────────────────────────────────────
  { number: '111', name: 'Tiền mặt', category: AccountCategory.TaiSan },
  { number: '112', name: 'Tiền gửi không kỳ hạn', category: AccountCategory.TaiSan },
  { number: '113', name: 'Tiền đang chuyển', category: AccountCategory.TaiSan },
  { number: '121', name: 'Chứng khoán kinh doanh', category: AccountCategory.TaiSan },
  { number: '128', name: 'Đầu tư nắm giữ đến ngày đáo hạn', category: AccountCategory.TaiSan },
  { number: '131', name: 'Phải thu của khách hàng', category: AccountCategory.TaiSan },
  { number: '133', name: 'Thuế GTGT được khấu trừ', category: AccountCategory.TaiSan },
  { number: '136', name: 'Phải thu nội bộ', category: AccountCategory.TaiSan },
  { number: '138', name: 'Phải thu khác', category: AccountCategory.TaiSan },
  { number: '141', name: 'Tạm ứng', category: AccountCategory.TaiSan },
  { number: '151', name: 'Hàng mua đang đi đường', category: AccountCategory.TaiSan },
  { number: '152', name: 'Nguyên liệu, vật liệu', category: AccountCategory.TaiSan },
  { number: '153', name: 'Công cụ, dụng cụ', category: AccountCategory.TaiSan },
  { number: '154', name: 'Chi phí sản xuất, kinh doanh dở dang', category: AccountCategory.TaiSan },
  { number: '155', name: 'Sản phẩm', category: AccountCategory.TaiSan },
  { number: '156', name: 'Hàng hóa', category: AccountCategory.TaiSan },
  { number: '157', name: 'Hàng gửi bán', category: AccountCategory.TaiSan },
  { number: '158', name: 'Nguyên liệu, vật tư tại kho bảo thuế', category: AccountCategory.TaiSan },
  { number: '171', name: 'Giao dịch mua, bán lại trái phiếu chính phủ', category: AccountCategory.TaiSan },
  { number: '211', name: 'Tài sản cố định hữu hình', category: AccountCategory.TaiSan },
  { number: '212', name: 'Tài sản cố định thuê tài chính', category: AccountCategory.TaiSan },
  { number: '213', name: 'Tài sản cố định vô hình', category: AccountCategory.TaiSan },
  { number: '214', name: 'Hao mòn tài sản cố định', category: AccountCategory.TaiSan },
  { number: '215', name: 'Tài sản sinh học', category: AccountCategory.TaiSan },
  { number: '217', name: 'Bất động sản đầu tư', category: AccountCategory.TaiSan },
  { number: '221', name: 'Đầu tư vào công ty con', category: AccountCategory.TaiSan },
  { number: '222', name: 'Đầu tư vào công ty liên doanh, liên kết', category: AccountCategory.TaiSan },
  { number: '228', name: 'Đầu tư khác', category: AccountCategory.TaiSan },
  { number: '229', name: 'Dự phòng tổn thất tài sản', category: AccountCategory.TaiSan },
  { number: '241', name: 'Xây dựng cơ bản dở dang', category: AccountCategory.TaiSan },
  { number: '242', name: 'Chi phí chờ phân bổ', category: AccountCategory.TaiSan },
  { number: '243', name: 'Tài sản thuế thu nhập hoãn lại', category: AccountCategory.TaiSan },
  { number: '244', name: 'Ký quỹ, ký cược', category: AccountCategory.TaiSan },

  // ── Nợ phải trả (16 level-1) ──────────────────────────────────────────────
  { number: '331', name: 'Phải trả cho người bán', category: AccountCategory.NoPhaiTra },
  { number: '332', name: 'Phải trả cổ tức, lợi nhuận', category: AccountCategory.NoPhaiTra },
  { number: '333', name: 'Thuế và các khoản phải nộp Nhà nước', category: AccountCategory.NoPhaiTra },
  { number: '334', name: 'Phải trả người lao động', category: AccountCategory.NoPhaiTra },
  { number: '335', name: 'Chi phí phải trả', category: AccountCategory.NoPhaiTra },
  { number: '336', name: 'Phải trả nội bộ', category: AccountCategory.NoPhaiTra },
  { number: '337', name: 'Thanh toán theo tiến độ hợp đồng xây dựng', category: AccountCategory.NoPhaiTra },
  { number: '338', name: 'Phải trả, phải nộp khác', category: AccountCategory.NoPhaiTra },
  { number: '341', name: 'Vay và nợ thuê tài chính', category: AccountCategory.NoPhaiTra },
  { number: '343', name: 'Trái phiếu phát hành', category: AccountCategory.NoPhaiTra },
  { number: '344', name: 'Nhận ký quỹ, ký cược dài hạn', category: AccountCategory.NoPhaiTra },
  { number: '347', name: 'Thuế thu nhập hoãn lại phải trả', category: AccountCategory.NoPhaiTra },
  { number: '352', name: 'Dự phòng phải trả', category: AccountCategory.NoPhaiTra },
  { number: '353', name: 'Quỹ khen thưởng, phúc lợi', category: AccountCategory.NoPhaiTra },
  { number: '356', name: 'Quỹ phát triển khoa học và công nghệ', category: AccountCategory.NoPhaiTra },
  { number: '357', name: 'Quỹ bình ổn giá', category: AccountCategory.NoPhaiTra },

  // ── Vốn chủ sở hữu (7 level-1) ────────────────────────────────────────────
  { number: '411', name: 'Vốn góp của chủ sở hữu', category: AccountCategory.VonChuSoHuu },
  { number: '412', name: 'Chênh lệch đánh giá lại tài sản', category: AccountCategory.VonChuSoHuu },
  { number: '413', name: 'Chênh lệch tỷ giá hối đoái', category: AccountCategory.VonChuSoHuu },
  { number: '414', name: 'Quỹ đầu tư phát triển', category: AccountCategory.VonChuSoHuu },
  { number: '418', name: 'Các quỹ khác thuộc vốn chủ sở hữu', category: AccountCategory.VonChuSoHuu },
  { number: '419', name: 'Cổ phiếu quỹ', category: AccountCategory.VonChuSoHuu },
  { number: '421', name: 'Lợi nhuận sau thuế chưa phân phối', category: AccountCategory.VonChuSoHuu },

  // ── Doanh thu (3 level-1) ──────────────────────────────────────────────────
  { number: '511', name: 'Doanh thu bán hàng và cung cấp dịch vụ', category: AccountCategory.DoanhThu },
  { number: '515', name: 'Doanh thu hoạt động tài chính', category: AccountCategory.DoanhThu },
  { number: '521', name: 'Các khoản giảm trừ doanh thu', category: AccountCategory.DoanhThu },

  // ── Chi phí (11 level-1) ───────────────────────────────────────────────────
  { number: '621', name: 'Chi phí nguyên liệu, vật liệu trực tiếp', category: AccountCategory.ChiPhi },
  { number: '622', name: 'Chi phí nhân công trực tiếp', category: AccountCategory.ChiPhi },
  { number: '623', name: 'Chi phí sử dụng máy thi công', category: AccountCategory.ChiPhi },
  { number: '627', name: 'Chi phí sản xuất chung', category: AccountCategory.ChiPhi },
  { number: '632', name: 'Giá vốn hàng bán', category: AccountCategory.ChiPhi },
  { number: '635', name: 'Chi phí tài chính', category: AccountCategory.ChiPhi },
  { number: '641', name: 'Chi phí bán hàng', category: AccountCategory.ChiPhi },
  { number: '642', name: 'Chi phí quản lý doanh nghiệp', category: AccountCategory.ChiPhi },
  { number: '711', name: 'Thu nhập khác', category: AccountCategory.ChiPhi },
  { number: '811', name: 'Chi phí khác', category: AccountCategory.ChiPhi },
  { number: '821', name: 'Chi phí thuế thu nhập doanh nghiệp', category: AccountCategory.ChiPhi },

  // ── Xác định kết quả kinh doanh (1 level-1) ────────────────────────────────
  { number: '911', name: 'Xác định kết quả kinh doanh', category: AccountCategory.XacDinhKetQua },

  // ── Level-2 (101 accounts, 4 digits) ───────────────────────────────────────
  // 128
  { number: '1281', name: 'Tiền gửi có kỳ hạn', category: AccountCategory.TaiSan, parent: '128' },
  { number: '1282', name: 'Trái phiếu', category: AccountCategory.TaiSan, parent: '128' },
  { number: '1283', name: 'Cho vay', category: AccountCategory.TaiSan, parent: '128' },
  { number: '1288', name: 'Các khoản đầu tư khác nắm giữ đến ngày đáo hạn', category: AccountCategory.TaiSan, parent: '128' },
  // 133
  { number: '1331', name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', category: AccountCategory.TaiSan, parent: '133' },
  { number: '1332', name: 'Thuế GTGT được khấu trừ của tài sản cố định', category: AccountCategory.TaiSan, parent: '133' },
  // 136
  { number: '1361', name: 'Vốn kinh doanh ở đơn vị trực thuộc', category: AccountCategory.TaiSan, parent: '136' },
  { number: '1362', name: 'Phải thu nội bộ về chênh lệch tỷ giá', category: AccountCategory.TaiSan, parent: '136' },
  { number: '1363', name: 'Phải thu nội bộ về chi phí đi vay được vốn hoá', category: AccountCategory.TaiSan, parent: '136' },
  { number: '1368', name: 'Phải thu nội bộ khác', category: AccountCategory.TaiSan, parent: '136' },
  // 138
  { number: '1381', name: 'Tài sản thiếu chờ xử lý', category: AccountCategory.TaiSan, parent: '138' },
  { number: '1383', name: 'Thuế tiêu thụ đặc biệt của hàng nhập khẩu', category: AccountCategory.TaiSan, parent: '138' },
  { number: '1388', name: 'Phải thu khác', category: AccountCategory.TaiSan, parent: '138' },
  // 141
  { number: '1411', name: 'Tạm ứng cho nhân viên', category: AccountCategory.TaiSan, parent: '141' },
  { number: '1412', name: 'Tạm ứng khác', category: AccountCategory.TaiSan, parent: '141' },
  // 152
  { number: '1521', name: 'Nguyên liệu chính', category: AccountCategory.TaiSan, parent: '152' },
  { number: '1522', name: 'Nguyên liệu phụ', category: AccountCategory.TaiSan, parent: '152' },
  { number: '1523', name: 'Nhiên liệu', category: AccountCategory.TaiSan, parent: '152' },
  // 153
  { number: '1531', name: 'Công cụ, dụng cụ', category: AccountCategory.TaiSan, parent: '153' },
  { number: '1532', name: 'Bao bì luân chuyển', category: AccountCategory.TaiSan, parent: '153' },
  { number: '1533', name: 'Đồ dùng cho thuê', category: AccountCategory.TaiSan, parent: '153' },
  // 155
  { number: '1551', name: 'Sản phẩm', category: AccountCategory.TaiSan, parent: '155' },
  { number: '1552', name: 'Sản phẩm dở dang', category: AccountCategory.TaiSan, parent: '155' },
  { number: '1557', name: 'Thành phẩm bất động sản', category: AccountCategory.TaiSan, parent: '155' },
  // 156
  { number: '1561', name: 'Hàng hóa', category: AccountCategory.TaiSan, parent: '156' },
  { number: '1562', name: 'Hàng hóa bất động sản', category: AccountCategory.TaiSan, parent: '156' },
  { number: '1563', name: 'Kho bảo thuế', category: AccountCategory.TaiSan, parent: '156' },
  { number: '1564', name: 'Hàng hóa khác', category: AccountCategory.TaiSan, parent: '156' },
  // 157
  { number: '1571', name: 'Hàng gửi bán', category: AccountCategory.TaiSan, parent: '157' },
  { number: '1572', name: 'Hàng gửi bán bất động sản', category: AccountCategory.TaiSan, parent: '157' },
  // 158
  { number: '1581', name: 'Nguyên liệu, vật tư tại kho bảo thuế', category: AccountCategory.TaiSan, parent: '158' },
  { number: '1582', name: 'Hàng hóa tại kho bảo thuế', category: AccountCategory.TaiSan, parent: '158' },
  // 211
  { number: '2111', name: 'Nhà cửa, vật kiến trúc', category: AccountCategory.TaiSan, parent: '211' },
  { number: '2112', name: 'Máy móc, thiết bị', category: AccountCategory.TaiSan, parent: '211' },
  { number: '2113', name: 'Phương tiện vận tải, truyền dẫn', category: AccountCategory.TaiSan, parent: '211' },
  // 213
  { number: '2131', name: 'Quyền sử dụng đất', category: AccountCategory.TaiSan, parent: '213' },
  { number: '2132', name: 'Quyền phát hành', category: AccountCategory.TaiSan, parent: '213' },
  { number: '2133', name: 'Bản quyền, bằng sáng chế', category: AccountCategory.TaiSan, parent: '213' },
  // 214
  { number: '2141', name: 'Hao mòn TSCĐ hữu hình', category: AccountCategory.TaiSan, parent: '214' },
  { number: '2142', name: 'Hao mòn TSCĐ thuê tài chính', category: AccountCategory.TaiSan, parent: '214' },
  { number: '2143', name: 'Hao mòn TSCĐ vô hình', category: AccountCategory.TaiSan, parent: '214' },
  // 215
  { number: '2151', name: 'Tài sản sinh học dài hạn cho sản phẩm định kỳ', category: AccountCategory.TaiSan, parent: '215' },
  { number: '2152', name: 'Tài sản sinh học dài hạn cho sản phẩm một lần', category: AccountCategory.TaiSan, parent: '215' },
  { number: '2153', name: 'Tài sản sinh học ngắn hạn', category: AccountCategory.TaiSan, parent: '215' },
  // 228
  { number: '2281', name: 'Đầu tư góp vốn vào đơn vị khác', category: AccountCategory.TaiSan, parent: '228' },
  { number: '2288', name: 'Đầu tư khác', category: AccountCategory.TaiSan, parent: '228' },
  // 229
  { number: '2291', name: 'Dự phòng giảm giá chứng khoán kinh doanh', category: AccountCategory.TaiSan, parent: '229' },
  { number: '2292', name: 'Dự phòng tổn thất đầu tư nắm giữ đến ngày đáo hạn', category: AccountCategory.TaiSan, parent: '229' },
  { number: '2293', name: 'Dự phòng tổn thất đầu tư vào công ty con', category: AccountCategory.TaiSan, parent: '229' },
  // 241
  { number: '2411', name: 'Xây dựng cơ bản', category: AccountCategory.TaiSan, parent: '241' },
  { number: '2412', name: 'Thiết bị', category: AccountCategory.TaiSan, parent: '241' },
  { number: '2413', name: 'Chi phí xây dựng cơ bản dở dang', category: AccountCategory.TaiSan, parent: '241' },
  { number: '2414', name: 'Chi phí đầu tư xây dựng', category: AccountCategory.TaiSan, parent: '241' },
  // 333
  { number: '3331', name: 'Thuế GTGT đầu ra', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3332', name: 'Thuế tiêu thụ đặc biệt', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3333', name: 'Thuế xuất, nhập khẩu', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3334', name: 'Thuế thu nhập doanh nghiệp', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3335', name: 'Thuế thu nhập cá nhân', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3336', name: 'Thuế tài nguyên', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3337', name: 'Thuế nhà, đất', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3338', name: 'Thuế bảo vệ môi trường', category: AccountCategory.NoPhaiTra, parent: '333' },
  { number: '3339', name: 'Phí, lệ phí và các khoản phải nộp khác', category: AccountCategory.NoPhaiTra, parent: '333' },
  // 336
  { number: '3361', name: 'Phải trả nội bộ về vốn kinh doanh', category: AccountCategory.NoPhaiTra, parent: '336' },
  { number: '3362', name: 'Phải trả nội bộ về chênh lệch tỷ giá', category: AccountCategory.NoPhaiTra, parent: '336' },
  { number: '3363', name: 'Phải trả nội bộ về chi phí đi vay vốn hoá', category: AccountCategory.NoPhaiTra, parent: '336' },
  { number: '3368', name: 'Phải trả nội bộ khác', category: AccountCategory.NoPhaiTra, parent: '336' },
  // 338
  { number: '3381', name: 'Tài sản thừa chờ giải quyết', category: AccountCategory.NoPhaiTra, parent: '338' },
  { number: '3382', name: 'Kinh phí công đoàn', category: AccountCategory.NoPhaiTra, parent: '338' },
  { number: '3383', name: 'Bảo hiểm xã hội', category: AccountCategory.NoPhaiTra, parent: '338' },
  { number: '3384', name: 'Bảo hiểm y tế', category: AccountCategory.NoPhaiTra, parent: '338' },
  // 341
  { number: '3411', name: 'Vay vốn', category: AccountCategory.NoPhaiTra, parent: '341' },
  { number: '3412', name: 'Nợ thuê tài chính', category: AccountCategory.NoPhaiTra, parent: '341' },
  // 352
  { number: '3521', name: 'Dự phòng bảo hành sản phẩm', category: AccountCategory.NoPhaiTra, parent: '352' },
  { number: '3522', name: 'Dự phòng tái cơ cấu', category: AccountCategory.NoPhaiTra, parent: '352' },
  { number: '3523', name: 'Dự phòng hợp đồng có rủi ro lớn', category: AccountCategory.NoPhaiTra, parent: '352' },
  { number: '3525', name: 'Dự phòng phải trả khác', category: AccountCategory.NoPhaiTra, parent: '352' },
  // 353
  { number: '3531', name: 'Quỹ khen thưởng', category: AccountCategory.NoPhaiTra, parent: '353' },
  { number: '3532', name: 'Quỹ phúc lợi', category: AccountCategory.NoPhaiTra, parent: '353' },
  { number: '3533', name: 'Quỹ khen thưởng, phúc lợi đã hình thành TSCĐ', category: AccountCategory.NoPhaiTra, parent: '353' },
  { number: '3534', name: 'Quỹ thưởng ban quản lý', category: AccountCategory.NoPhaiTra, parent: '353' },
  // 356
  { number: '3561', name: 'Quỹ phát triển khoa học và công nghệ', category: AccountCategory.NoPhaiTra, parent: '356' },
  { number: '3562', name: 'Quỹ phát triển khoa học và công nghệ đã hình thành TSCĐ', category: AccountCategory.NoPhaiTra, parent: '356' },
  // 411
  { number: '4111', name: 'Vốn góp của chủ sở hữu', category: AccountCategory.VonChuSoHuu, parent: '411' },
  { number: '4112', name: 'Thặng dư vốn cổ phần', category: AccountCategory.VonChuSoHuu, parent: '411' },
  { number: '4113', name: 'Vốn góp của nhà nước', category: AccountCategory.VonChuSoHuu, parent: '411' },
  { number: '4118', name: 'Vốn khác', category: AccountCategory.VonChuSoHuu, parent: '411' },
  // 421
  { number: '4211', name: 'Lợi nhuận sau thuế chưa phân phối năm trước', category: AccountCategory.VonChuSoHuu, parent: '421' },
  { number: '4212', name: 'Lợi nhuận sau thuế chưa phân phối năm nay', category: AccountCategory.VonChuSoHuu, parent: '421' },
  // 511
  { number: '5111', name: 'Doanh thu bán hàng hóa', category: AccountCategory.DoanhThu, parent: '511' },
  { number: '5112', name: 'Doanh thu bán thành phẩm', category: AccountCategory.DoanhThu, parent: '511' },
  { number: '5113', name: 'Doanh thu cung cấp dịch vụ', category: AccountCategory.DoanhThu, parent: '511' },
  { number: '5118', name: 'Doanh thu khác', category: AccountCategory.DoanhThu, parent: '511' },
  // 521
  { number: '5211', name: 'Chiết khấu thương mại', category: AccountCategory.DoanhThu, parent: '521' },
  { number: '5212', name: 'Hàng bán bị trả lại', category: AccountCategory.DoanhThu, parent: '521' },
  { number: '5213', name: 'Giảm giá hàng bán', category: AccountCategory.DoanhThu, parent: '521' },
  // 623
  { number: '6231', name: 'Chi phí nhân công', category: AccountCategory.ChiPhi, parent: '623' },
  { number: '6232', name: 'Chi phí vật liệu', category: AccountCategory.ChiPhi, parent: '623' },
  // 627
  { number: '6271', name: 'Chi phí nhân viên phân xưởng', category: AccountCategory.ChiPhi, parent: '627' },
  { number: '6272', name: 'Chi phí vật liệu', category: AccountCategory.ChiPhi, parent: '627' },
  // 821
  { number: '8211', name: 'Chi phí thuế TNDN hiện hành', category: AccountCategory.ChiPhi, parent: '821' },
  { number: '8212', name: 'Chi phí thuế TNDN hoãn lại', category: AccountCategory.ChiPhi, parent: '821' },

  // ── Level-3 (10 accounts, 5 digits) ────────────────────────────────────────
  { number: '21511', name: 'Tài sản sinh học dài hạn cho sản phẩm định kỳ đã trưởng thành', category: AccountCategory.TaiSan, parent: '2151' },
  { number: '21512', name: 'Tài sản sinh học dài hạn cho sản phẩm định kỳ chưa trưởng thành', category: AccountCategory.TaiSan, parent: '2151' },
  { number: '33311', name: 'Thuế GTGT đầu ra của hàng hóa, dịch vụ', category: AccountCategory.NoPhaiTra, parent: '3331' },
  { number: '33312', name: 'Thuế GTGT đầu ra khác', category: AccountCategory.NoPhaiTra, parent: '3331' },
  { number: '33381', name: 'Thuế bảo vệ môi trường của hàng hóa', category: AccountCategory.NoPhaiTra, parent: '3338' },
  { number: '33382', name: 'Thuế bảo vệ môi trường của dịch vụ', category: AccountCategory.NoPhaiTra, parent: '3338' },
  { number: '41111', name: 'Vốn góp của chủ sở hữu trong nước', category: AccountCategory.VonChuSoHuu, parent: '4111' },
  { number: '41112', name: 'Vốn góp của chủ sở hữu nước ngoài', category: AccountCategory.VonChuSoHuu, parent: '4111' },
  { number: '82111', name: 'Chi phí thuế TNDN hiện hành', category: AccountCategory.ChiPhi, parent: '8211' },
  { number: '82112', name: 'Chi phí thuế TNDN hoãn lại', category: AccountCategory.ChiPhi, parent: '8211' },

  // ── Level-4 (2 accounts, 6 digits) ─────────────────────────────────────────
  { number: '215121', name: 'Tài sản sinh học dài hạn - đã đến độ tuổi thành thục', category: AccountCategory.TaiSan, parent: '21512' },
  { number: '215122', name: 'Tài sản sinh học dài hạn - chưa đến độ tuổi thành thục', category: AccountCategory.TaiSan, parent: '21512' },
];

// ─── STANDARD_ACCOUNTS_TT133 (TT 133/2016/TT-BTC — simplified) ──────────────
// ~50 level-1 accounts

export const STANDARD_ACCOUNTS_TT133: Array<{ number: string; name: string; category: AccountCategory; parent?: string }> = [
  { number: '111', name: 'Tiền mặt', category: AccountCategory.TaiSan },
  { number: '112', name: 'Tiền gửi ngân hàng', category: AccountCategory.TaiSan },
  { number: '113', name: 'Tiền đang chuyển', category: AccountCategory.TaiSan },
  { number: '128', name: 'Đầu tư nắm giữ đến ngày đáo hạn', category: AccountCategory.TaiSan },
  { number: '131', name: 'Phải thu của khách hàng', category: AccountCategory.TaiSan },
  { number: '133', name: 'Thuế GTGT được khấu trừ', category: AccountCategory.TaiSan },
  { number: '136', name: 'Phải thu nội bộ', category: AccountCategory.TaiSan },
  { number: '138', name: 'Phải thu khác', category: AccountCategory.TaiSan },
  { number: '141', name: 'Tạm ứng', category: AccountCategory.TaiSan },
  { number: '151', name: 'Hàng mua đang đi đường', category: AccountCategory.TaiSan },
  { number: '152', name: 'Nguyên liệu, vật liệu', category: AccountCategory.TaiSan },
  { number: '153', name: 'Công cụ, dụng cụ', category: AccountCategory.TaiSan },
  { number: '154', name: 'Chi phí SXKD dở dang', category: AccountCategory.TaiSan },
  { number: '155', name: 'Thành phẩm', category: AccountCategory.TaiSan },
  { number: '156', name: 'Hàng hóa', category: AccountCategory.TaiSan },
  { number: '157', name: 'Hàng gửi bán', category: AccountCategory.TaiSan },
  { number: '211', name: 'TSCĐ hữu hình', category: AccountCategory.TaiSan },
  { number: '214', name: 'Hao mòn TSCĐ', category: AccountCategory.TaiSan },
  { number: '221', name: 'Đầu tư vào công ty con', category: AccountCategory.TaiSan },
  { number: '241', name: 'XDCB dở dang', category: AccountCategory.TaiSan },
  { number: '311', name: 'Vay ngắn hạn', category: AccountCategory.NoPhaiTra },
  { number: '331', name: 'Phải trả người bán', category: AccountCategory.NoPhaiTra },
  { number: '333', name: 'Thuế và các khoản phải nộp', category: AccountCategory.NoPhaiTra },
  { number: '334', name: 'Phải trả người lao động', category: AccountCategory.NoPhaiTra },
  { number: '335', name: 'Chi phí phải trả', category: AccountCategory.NoPhaiTra },
  { number: '336', name: 'Phải trả nội bộ', category: AccountCategory.NoPhaiTra },
  { number: '337', name: 'Thanh toán theo tiến độ HĐXD', category: AccountCategory.NoPhaiTra },
  { number: '338', name: 'Phải trả, phải nộp khác', category: AccountCategory.NoPhaiTra },
  { number: '341', name: 'Vay dài hạn', category: AccountCategory.NoPhaiTra },
  { number: '344', name: 'Nhận ký quỹ, ký cược dài hạn', category: AccountCategory.NoPhaiTra },
  { number: '353', name: 'Quỹ khen thưởng, phúc lợi', category: AccountCategory.NoPhaiTra },
  { number: '411', name: 'Vốn đầu tư của chủ sở hữu', category: AccountCategory.VonChuSoHuu },
  { number: '412', name: 'Chênh lệch đánh giá lại tài sản', category: AccountCategory.VonChuSoHuu },
  { number: '413', name: 'Chênh lệch tỷ giá hối đoái', category: AccountCategory.VonChuSoHuu },
  { number: '414', name: 'Quỹ đầu tư phát triển', category: AccountCategory.VonChuSoHuu },
  { number: '418', name: 'Các quỹ khác thuộc VCSH', category: AccountCategory.VonChuSoHuu },
  { number: '419', name: 'Cổ phiếu quỹ', category: AccountCategory.VonChuSoHuu },
  { number: '421', name: 'Lợi nhuận chưa phân phối', category: AccountCategory.VonChuSoHuu },
  { number: '511', name: 'Doanh thu bán hàng và cung cấp dịch vụ', category: AccountCategory.DoanhThu },
  { number: '515', name: 'Doanh thu hoạt động tài chính', category: AccountCategory.DoanhThu },
  { number: '521', name: 'Các khoản giảm trừ doanh thu', category: AccountCategory.DoanhThu },
  { number: '621', name: 'Chi phí nguyên liệu, vật liệu trực tiếp', category: AccountCategory.ChiPhi },
  { number: '627', name: 'Chi phí sản xuất chung', category: AccountCategory.ChiPhi },
  { number: '632', name: 'Giá vốn hàng bán', category: AccountCategory.ChiPhi },
  { number: '641', name: 'Chi phí bán hàng', category: AccountCategory.ChiPhi },
  { number: '642', name: 'Chi phí quản lý doanh nghiệp', category: AccountCategory.ChiPhi },
  { number: '711', name: 'Thu nhập khác', category: AccountCategory.ChiPhi },
  { number: '811', name: 'Chi phí khác', category: AccountCategory.ChiPhi },
  { number: '821', name: 'Chi phí thuế thu nhập doanh nghiệp', category: AccountCategory.ChiPhi },
  { number: '911', name: 'Xác định kết quả kinh doanh', category: AccountCategory.XacDinhKetQua },
];

// ─── STANDARD_ACCOUNTS (backward compat) ─────────────────────────────────────
export const STANDARD_ACCOUNTS = STANDARD_ACCOUNTS_TT99;
