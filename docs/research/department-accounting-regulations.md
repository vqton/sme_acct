# Nghiên cứu quy định và thực tiễn Kế toán Phòng ban / Cost Center tại Việt Nam

> Tra cứu: 07/2026
> Nguồn: Thuvienphapluat, Công báo Chính phủ, MISA, Fast, Bravo, IFRS, KPMG, EY, tài liệu học thuật

---

## Mục lục

1. [Tổng quan khung pháp lý](#1-tổng-quan-khung-pháp-lý)
2. [Luật Kế toán 88/2015/QH13 — Đơn vị kế toán](#2-luật-kế-toán-882015qh13--đơn-vị-kế-toán)
3. [Thông tư 53/2006/TT-BTC — Kế toán quản trị doanh nghiệp](#3-thông-tư-532006tt-btc--kế-toán-quản-trị-doanh-nghiệp)
4. [Thông tư 99/2025/TT-BTC — Chế độ kế toán doanh nghiệp (thay thế TT 200/2014)](#4-thông-tư-992025tt-btc--chế-độ-kế-toán-doanh-nghiệp-thay-thế-tt-2002014)
5. [Thông tư 133/2016/TT-BTC — Chế độ kế toán SMEs](#5-thông-tư-1332016tt-btc--chế-độ-kế-toán-smes)
6. [IFRS 8 — Báo cáo bộ phận (Segment Reporting)](#6-ifrs-8--báo-cáo-bộ-phận-segment-reporting)
7. [Thực tiễn phần mềm Việt Nam (MISA, Fast, Bravo)](#7-thực-tiễn-phần-mềm-việt-nam-misa-fast-bravo)
8. [Quan điểm tư vấn quốc tế (KPMG, EY, Deloitte, PwC)](#8-quan-điểm-tư-vấn-quốc-tế-kpmg-ey-deloitte-pwc)
9. [Thuật ngữ then chốt và định nghĩa](#9-thuật-ngữ-then-chốt-và-định-nghĩa)
10. [Phương pháp phân bổ chi phí](#10-phương-pháp-phân-bổ-chi-phí)
11. [Kết luận cho thiết kế module](#11-kết-luận-cho-thiết-kế-module)

---

## 1. Tổng quan khung pháp lý

Kế toán quản trị theo phòng ban / bộ phận tại Việt Nam vận hành dưới khung pháp lý sau (xếp theo thứ bậc):

| Văn bản | Hiệu lực | Phạm vi | Liên quan đến phòng ban |
|---|---|---|---|
| **Luật Kế toán 88/2015/QH13** | 01/01/2017 | Toàn bộ đơn vị kế toán | Điều 3 (định nghĩa đơn vị kế toán), Điều 39 (kiểm soát nội bộ) |
| **Thông tư 53/2006/TT-BTC** | 2006—nay | Hướng dẫn KTQT | **Văn bản duy nhất định nghĩa** "trung tâm chi phí", "trung tâm trách nhiệm", cách tập hợp chi phí theo bộ phận |
| **Thông tư 99/2025/TT-BTC** | 01/01/2026 | Thay thế TT 200/2014 | Cho phép tự chủ mở TK cấp 2/3; yêu cầu Quy chế hạch toán kế toán & Quy chế quản trị nội bộ |
| **Thông tư 133/2016/TT-BTC** | 01/01/2017 | SMEs | Điều 9: quyền tổ chức kế toán tại đơn vị trực thuộc (đơn vị hạch toán phụ thuộc) |
| **Luật Doanh nghiệp** | Hiện hành | | Định nghĩa chi nhánh là đơn vị phụ thuộc, không có tư cách pháp nhân |

### 1.1. Kế toán quản trị phòng ban: bắt buộc hay tự nguyện?

**Kết luận quan trọng: Kế toán quản trị (bao gồm theo dõi phòng ban/bộ phận) về bản chất là TỰ NGUYỆN — thuộc quyền tự chủ của doanh nghiệp, không phải nghĩa vụ pháp lý bắt buộc.**

> Theo Thông tư 53/2006/TT-BTC: *"Kế toán quản trị là công việc của từng doanh nghiệp, Nhà nước chỉ hướng dẫn các nguyên tắc, cách thức tổ chức và các nội dung, phương pháp kế toán quản trị chủ yếu tạo điều kiện thuận lợi cho doanh nghiệp thực hiện."*

Tuy nhiên, kế toán quản trị trở thành **bắt buộc gián tiếp** ở các khía cạnh:

1. **Quy chế quản trị nội bộ** (Điều 3 TT 99/2025): Doanh nghiệp *có trách nhiệm* xây dựng quy chế quản trị nội bộ phân định rõ quyền, nghĩa vụ trách nhiệm các bộ phận.
2. **Đơn vị hạch toán phụ thuộc** (Điều 9 TT 133): Nếu doanh nghiệp có chi nhánh/văn phòng đại diện, phải tổ chức bộ máy kế toán và phân cấp hạch toán.
3. **Báo cáo thuế**: Phân bổ thuế TNDN cho chi nhánh khác tỉnh là bắt buộc.

---

## 2. Luật Kế toán 88/2015/QH13 — Đơn vị kế toán

### 2.1. Định nghĩa "đơn vị kế toán" (khoản 4 Điều 3)

> *"Đơn vị kế toán là cơ quan, tổ chức, đơn vị quy định tại các khoản 1, 2, 3, 4 và 5 Điều 2 của Luật này có lập báo cáo tài chính."*

Các đối tượng (Điều 2):
1. Cơ quan thu, chi NSNN các cấp
2. Cơ quan nhà nước, đơn vị sự nghiệp sử dụng NSNN
3. Tổ chức, đơn vị sự nghiệp không sử dụng NSNN
4. Doanh nghiệp VN; chi nhánh, VPĐD doanh nghiệp nước ngoài tại VN
5. Hợp tác xã, liên hiệp hợp tác xã

**Ý nghĩa với kế toán phòng ban:**
- **Phòng ban nội bộ KHÔNG phải** là "đơn vị kế toán" — không lập BCTC riêng
- **Chi nhánh (hạch toán phụ thuộc)** có thể là đơn vị kế toán nếu được phân cấp đến lợi nhuận sau thuế
- **Chi nhánh (hạch toán độc lập)** có tư cách pháp nhân — là đơn vị kế toán đầy đủ

### 2.2. Kiểm soát nội bộ (Điều 39)

> *"Đơn vị kế toán phải thiết lập hệ thống kiểm soát nội bộ... Các nghiệp vụ được phê duyệt đúng thẩm quyền và được ghi chép đầy đủ làm cơ sở cho việc lập và trình bày báo cáo tài chính trung thực, hợp lý."*

Kiểm soát nội bộ là cơ sở pháp lý để doanh nghiệp thiết lập phân quyền theo phòng ban, kiểm soát chi phí theo bộ phận.

### 2.3. Kế toán quản trị (khoản 3 Điều 4)

> *"Kế toán quản trị là việc thu thập, xử lý, phân tích và cung cấp thông tin kinh tế, tài chính theo yêu cầu quản trị và quyết định kinh tế, tài chính trong nội bộ đơn vị kế toán."*

---

## 3. Thông tư 53/2006/TT-BTC — Kế toán quản trị doanh nghiệp

**Đây là văn bản quan trọng nhất cho module Kế toán Phòng ban.** TT 53 hướng dẫn chi tiết việc tổ chức kế toán quản trị, định nghĩa các khái niệm nền tảng.

### 3.1. Định nghĩa "Trung tâm trách nhiệm"

> *"Trung tâm trách nhiệm: Là một bộ phận (phân xưởng, dây chuyền sản xuất; một phòng, ban; một công ty hoặc toàn bộ công ty) trong một tổ chức mà người quản lý của bộ phận đó có quyền điều hành và có trách nhiệm đối với số chi phí, thu nhập phát sinh hoặc số vốn đầu tư sử dụng vào hoạt động kinh doanh."*

### 3.2. Định nghĩa "Trung tâm chi phí"

> *"Trung tâm chi phí: Là trung tâm trách nhiệm mà người quản lý chỉ có quyền điều hành quản lý các chi phí phát sinh thuộc bộ phận mình quản lý. Trung tâm chi phí có thể là bộ phận (phân xưởng, đội, tổ,...) hoặc từng giai đoạn hoạt động (giai đoạn làm thô, giai đoạn cắt gọt, giai đoạn đánh bóng,…)."*

### 3.3. Phân loại trung tâm chi phí

- **Trung tâm chính**: Trung tâm mua hàng, trung tâm sản xuất (phân xưởng, bộ phận sản xuất)
- **Trung tâm phụ**: Trung tâm hành chính, quản trị, trung tâm kế toán, tài chính

### 3.4. Nguyên tắc tổ chức thông tin KTQT (khoản d, Mục I)

> *"Việc tổ chức hệ thống thông tin kế toán quản trị không bắt buộc phải tuân thủ đầy đủ các nguyên tắc kế toán và có thể được thực hiện theo những quy định nội bộ của doanh nghiệp... Doanh nghiệp được toàn quyền quyết định việc vận dụng các chứng từ kế toán, tổ chức hệ thống sổ kế toán, vận dụng và chi tiết hoá các tài khoản kế toán, thiết kế các mẫu báo cáo kế toán quản trị cần thiết."*

### 3.5. Mở tài khoản chi tiết (điểm 4.1, mục IV)

> *"Doanh nghiệp căn cứ vào hệ thống tài khoản kế toán do Bộ Tài chính ban hành... để chi tiết hoá theo các cấp (cấp 2, 3, 4) phù hợp với kế hoạch, dự toán đã lập và yêu cầu cung cấp thông tin của kế toán quản trị."*

### 3.6. Hình thức tổ chức bộ máy KTQT

- **Kết hợp**: KTTC và KTQT kết hợp từng phần hành (phổ biến với DN vừa & nhỏ)
- **Tách biệt**: Bộ phận KTQT riêng (DN lớn, tập đoàn)
- **Hỗn hợp**: Kết hợp cả hai

---

## 4. Thông tư 99/2025/TT-BTC — Chế độ kế toán doanh nghiệp (thay thế TT 200/2014)

**Hiệu lực: 01/01/2026** — thay đổi quan trọng nhất cho kế toán phòng ban.

### 4.1. Tự chủ hệ thống tài khoản (Điều 11)

- Doanh nghiệp được quyền sửa đổi, bổ sung tài khoản kế toán (tên, số hiệu, kết cấu, nội dung) miễn không làm sai lệch BCTC
- **Mở tài khoản cấp 2 và cấp 3 không cần sự chấp thuận của Bộ Tài chính** (khác với TT 200 trước đây)
- Tài khoản đặc thù: phải hướng dẫn chi tiết phương pháp hạch toán, phân loại và tổng hợp số liệu
- **Ý nghĩa**: Doanh nghiệp có thể tự do thiết kế mã tài khoản chi tiết theo phòng ban (vd: 6421_PB01, 6421_PB02) hoặc sử dụng mã phân tích riêng

### 4.2. Quy chế hạch toán kế toán (Điều 9, 11, 12, 18)

Doanh nghiệp *phải ban hành* Quy chế hạch toán kế toán khi:
- Thiết kế thêm/sửa đổi biểu mẫu chứng từ
- Sửa đổi/bổ sung tài khoản (tên, số hiệu, kết cấu)
- Thiết kế thêm/sửa đổi sổ kế toán
- Bổ sung chỉ tiêu BCTC

**Hệ quả**: Nếu doanh nghiệp thêm mã phòng ban vào hệ thống tài khoản hoặc sử dụng mã phân tích phòng ban khác với mẫu chuẩn, doanh nghiệp cần ban hành Quy chế hạch toán kế toán làm cơ sở pháp lý.

### 4.3. Quy chế quản trị nội bộ (Điều 3)

> *"DN có trách nhiệm tự xây dựng quy chế quản trị nội bộ (hoặc các tài liệu tương đương) và tổ chức kiểm soát nội bộ nhằm phân định rõ quyền, nghĩa vụ và trách nhiệm của các bộ phận và cá nhân có liên quan..."*

**Đây là cơ sở pháp lý trực tiếp cho module phòng ban**: Nghĩa vụ phân định trách nhiệm các bộ phận (phòng ban) có thể được hiện thực hoá qua tính năng kế toán phòng ban.

### 4.4. Tài khoản nội bộ

- **TK 136 — Phải thu nội bộ**: Phản ánh phải thu giữa trụ sở chính và chi nhánh hạch toán phụ thuộc
- **TK 336 — Phải trả nội bộ**: Phản ánh phải trả nội bộ giữa các đơn vị phụ thuộc
- **TK 511 — Doanh thu nội bộ** (chi tiết): Theo dõi doanh thu chuyển hàng nội bộ

### 4.5. Ghi nhận chi phí tại đơn vị hạch toán phụ thuộc

Theo hướng dẫn của MISA dựa trên TT 99, chi nhánh hạch toán phụ thuộc:
- **Cùng tỉnh**: Giao dịch nội bộ không ghi nhận doanh thu; chỉ ghi nhận khi bán ra ngoài
- **Khác tỉnh**: Trụ sở chính ghi nhận doanh thu khi xuất hàng; chi nhánh ghi nhận doanh thu khi bán
- Chi nhánh ghi nhận doanh thu, chi phí → kết chuyển về trụ sở chính (không xác định lãi/lỗ riêng trừ khi được phân cấp đến LNST)

---

## 5. Thông tư 133/2016/TT-BTC — Chế độ kế toán SMEs

### 5.1. Phạm vi

Áp dụng cho doanh nghiệp nhỏ và vừa (bao gồm siêu nhỏ) trừ: DNNN, công ty đại chúng, HTX.

### 5.2. Đơn vị hạch toán phụ thuộc (Điều 9)

> *"Doanh nghiệp có trách nhiệm tổ chức bộ máy kế toán và phân cấp hạch toán ở các đơn vị hạch toán phụ thuộc phù hợp với đặc điểm hoạt động, yêu cầu quản lý của mình và không trái với quy định của pháp luật."*

Doanh nghiệp có quyền quyết định:
- Vốn cấp cho đơn vị phụ thuộc ghi nhận là nợ phải trả hay VCSH
- Phân cấp đến LNST chưa phân phối hoặc chỉ đến doanh thu, chi phí

### 5.3. Hệ thống tài khoản SMEs

TT 133 có hệ thống tài khoản đơn giản hơn TT 200/TT 99 nhưng vẫn bao gồm các TK chính cho kế toán quản trị:
- TK 154 — CPSXKD dở dang (chi tiết theo phân xưởng, SP)
- TK 621, 622, 627 (đến 31/12/2019; sau gộp vào 154)
- TK 642 — Chi phí quản lý kinh doanh (thay cho 641+642 TT 200)
- TK 911 — Xác định KQKD

### 5.4. Lựa chọn áp dụng

SME có thể chọn áp dụng TT 200/2014 (nay là TT 99/2025) nhưng phải thông báo cơ quan thuế và thực hiện nhất quán.

---

## 6. IFRS 8 — Báo cáo bộ phận (Segment Reporting)

### 6.1. Phạm vi áp dụng

IFRS 8 bắt buộc áp dụng với **công ty đại chúng** (có chứng khoán niêm yết), không bắt buộc với SME Việt Nam.

### 6.2. Định nghĩa "Operating Segment" (đoạn 5-10)

> *"Một bộ phận hoạt động là một hợp phần của đơn vị: (a) tham gia vào hoạt động kinh doanh có thể tạo doanh thu và chi phí (bao gồm giao dịch nội bộ), (b) có kết quả hoạt động được người ra quyết định hoạt động (CODM) xem xét thường xuyên để phân bổ nguồn lực và đánh giá hiệu quả, (c) có thông tin tài chính riêng biệt."*

### 6.3. Ngưỡng báo cáo (đoạn 13)

Một bộ phận là **báo cáo được (reportable)** nếu đạt bất kỳ:
- Doanh thu ≥ 10% tổng doanh thu (nội bộ + ngoài)
- Lãi/lỗ tuyệt đối ≥ 10% tổng lãi hoặc tổng lỗ
- Tài sản ≥ 10% tổng tài sản

→ Nếu tổng DT ngoài của các bộ phận báo cáo < 75% tổng DT, phải xác định thêm bộ phận khác.

### 6.4. Thông tin công bố

- Cơ sở tổ chức (SP/dịch vụ, khu vực địa lý...)
- Doanh thu từ khách hàng ngoài và nội bộ
- Lãi/lỗ bộ phận
- Tài sản và nợ phải trả bộ phận (nếu được CODM xem xét)
- Giá trị phân bổ (trên cơ sở hợp lý)

### 6.5. Giá trị với kế toán phòng ban Việt Nam

IFRS 8 là chuẩn mực tham khảo cho các công ty niêm yết hoặc công ty có vốn FDI cần lập BCTC hợp nhất theo IFRS. Module kế toán phòng ban của SME Việt Nam không cần tuân thủ IFRS 8, nhưng các nguyên tắc như:
- Phân bổ doanh thu/chi phí hợp lý
- Tách biệt thông tin tài chính theo bộ phận
- Đối chiếu số liệu bộ phận với tổng thể

có thể được áp dụng linh hoạt.

---

## 7. Thực tiễn phần mềm Việt Nam (MISA, Fast, Bravo)

### 7.1. MISA AMIS Kế toán & MISA SME

**MISA là phần mềm kế toán phổ biến nhất cho SME Việt Nam**, với các tính năng liên quan phòng ban:

| Tính năng | Mô tả |
|---|---|
| **Khai báo cơ cấu tổ chức** | Cho phép khai báo chi nhánh, phòng ban, phân xưởng, nhóm/tổ/đội dạng cây phân cấp |
| **Mã đơn vị cấp tổ chức** | Mỗi phòng ban có mã riêng; cấp tổ chức: Văn phòng/Trung tâm → Phòng ban → Phân xưởng → Nhóm/Tổ/Đội |
| **Ghi tăng CCDC/TSCĐ theo phòng ban** | Bắt buộc chọn đơn vị cấp Phòng ban khi ghi tăng |
| **Lập kế hoạch chi tiền theo phòng ban** | Trên phân hệ Ngân sách, lập kế hoạch chi theo mục chi cho từng phòng ban |
| **Báo cáo Tình hình chi phí thực tế so với kế hoạch** | So sánh chi phí phòng ban thực tế vs dự toán |
| **Khoản mục chi phí** | Phân loại chi phí theo khoản mục kết hợp phòng ban |
| **Phân hệ Ngân sách** | Kiểm soát chi tiêu từng phòng ban, cho phép tùy chọn "Khi ghi nhận chi phí" hoặc "Khi thực chi bằng tiền" |

**Cơ chế phòng ban MISA**: Sử dụng mã đơn vị (organization unit) như một trường dữ liệu độc lập với tài khoản kế toán, gắn vào từng chứng từ. Phòng ban trong MISA không phải là segment của tài khoản mà là thuộc tính riêng.

### 7.2. Fast Accounting

**Fast phù hợp với DN lớn hơn MISA** (từ vừa đến tập đoàn), có các đặc điểm:

- Hỗ trợ nhiều dòng sản phẩm từ siêu nhỏ đến tập đoàn
- Báo cáo quản trị đa dạng hơn MISA, có thể tùy chỉnh sâu
- Cho phép thiết lập danh mục và mã hóa thông tin: khách hàng, chi phí, mã hàng, mã TSCĐ, **vụ việc**, **công trình**
- Cơ chế mã phân tích: Fast sử dụng các mã phân tích (analysis code) độc lập với hệ thống tài khoản, cho phép gán chi phí/doanh thu theo phòng ban, dự án, hợp đồng
- **Có phiên bản Fast Accounting Online** hỗ trợ hạch toán chi nhánh phụ thuộc theo TT 99/2025

### 7.3. Bravo ERP

**Bravo là giải pháp ERP cao cấp cho DN lớn và tập đoàn**, với 11 modules cơ bản:

| Module | Liên quan phòng ban |
|---|---|
| Quản lý Tài chính - Kế toán | Trung tâm của hệ thống |
| **Phân hệ Ngân sách** | Quản lý ngân sách theo phòng ban |
| **Phân hệ Giá thành** | Tập hợp chi phí theo bộ phận sản xuất |
| Báo cáo quản trị | **Chi tiết theo dự án, phòng ban, chi nhánh** |

**Điểm mạnh của Bravo**: Có thể tùy chỉnh theo yêu cầu đặc thù DN; lập báo cáo quản trị theo nhiều chiều: phòng ban + dự án + sản phẩm.

### 7.4. Mô hình phổ biến trên thị trường

Tổng hợp từ ba phần mềm, có hai mô hình kiến trúc chính cho kế toán phòng ban:

**Mô hình 1 — Segment trong tài khoản (Oracle/SAP)**
- Tài khoản kế toán là một segment trong cấu trúc mã tổng thể
- Ví dụ: `6421-01-02` = TK 6421 + Chi nhánh 01 + Phòng ban 02

**Mô hình 2 — Mã phân tích độc lập (MISA, Fast, Bravo)**
- Phòng ban là trường dữ liệu riêng, không phụ thuộc tài khoản
- Khi nhập chứng từ, chọn TK nợ/có + chọn mã phòng ban
- Báo cáo tổng hợp theo tài khoản, phòng ban, hoặc kết hợp

---

## 8. Quan điểm tư vấn quốc tế (KPMG, EY, Deloitte, PwC)

### 8.1. KPMG Việt Nam

KPMG cung cấp dịch vụ liên quan:
- **Quản trị hoạt động tài chính**: Bao gồm Hệ thống thông tin quản lý (MIS), Mô hình phân tích lợi nhuận đa chiều (MDP), Lập Kế hoạch - Ngân sách - Dự báo (PBF)
- **Hệ thống tài khoản kế toán (Chart of Accounts)**: Xây dựng COA phù hợp
- **Mô hình hoạt động mục tiêu cho F&A (FTOM)**
- **Dịch vụ SME**: KPMG hỗ trợ thiết lập và đăng ký hệ thống kế toán ban đầu, triển khai phần mềm kế toán

> Mô hình phân tích lợi nhuận đa chiều (MDP) của KPMG là framework cho phép phân tích P&L theo nhiều chiều (phòng ban, khu vực, kênh phân phối, sản phẩm).

### 8.2. EY Việt Nam

EY tập trung vào:
- Chuyển đổi chức năng F&A: Tự động hóa, AI, phân tích dữ liệu
- Phối hợp liên phòng ban: Tài chính ↔ Nhân sự, CNTT, Vận hành
- Lập kế hoạch kịch bản: Dự báo chi phí, doanh thu tích hợp đa chiều

### 8.3. Deloitte Việt Nam

Deloitte có dịch vụ kiểm toán chi phí hoạt động (CPBH + CPQLDN), bao gồm kiểm tra:
- Tính hợp lý và phân bổ chi phí cho các đối tượng chịu chi phí
- Chính sách, định mức chi phí cho từng bộ phận
- Kiểm soát nội bộ đối với chi phí hoạt động

### 8.4. PwC Việt Nam

PwC cung cấp dịch vụ tư vấn quản trị tài chính và kế toán cho cả DN trong nước và FDI, tập trung vào tối ưu hóa cấu trúc chi phí, thiết lập hệ thống quản lý hiệu quả theo bộ phận.

---

## 9. Thuật ngữ then chốt và định nghĩa

| Thuật ngữ | Định nghĩa | Cơ sở pháp lý |
|---|---|---|
| **Đơn vị kế toán** | Cơ quan, tổ chức, DN có lập BCTC (có tư cách pháp nhân hoặc chi nhánh được phân cấp đến LNST) | Luật KT 2015 Điều 3 |
| **Đơn vị hạch toán phụ thuộc** | Chi nhánh trực thuộc DN, không có tư cách pháp nhân, hạch toán phụ thuộc vào trụ sở chính | TT 133 Điều 9; TT 99/2025 |
| **Đơn vị hạch toán độc lập** | Chi nhánh/công ty con được phân cấp đến LNST, có BCTC riêng | TT 133 Điều 9 |
| **Phòng ban** | Đơn vị tổ chức nội bộ (phòng, ban, phân xưởng, tổ, đội). Không phải đơn vị kế toán. Là trung tâm chi phí (cost center) | TT 53/2006 |
| **Bộ phận** | Phạm vi rộng hơn phòng ban: có thể là bộ phận sản xuất, kinh doanh, hỗ trợ | TT 53/2006 |
| **Trung tâm chi phí** (*Cost Center*) | Bộ phận mà người quản lý chịu trách nhiệm về chi phí phát sinh | TT 53/2006 Mục I.4 |
| **Trung tâm trách nhiệm** (*Responsibility Center*) | Bộ phận có người quản lý chịu trách nhiệm về chi phí, thu nhập, hoặc vốn đầu tư | TT 53/2006 Mục I.4 |
| **Trung tâm lợi nhuận** (*Profit Center*) | Bộ phận chịu trách nhiệm cả doanh thu và chi phí → lợi nhuận | TT 53 (suy diễn) |
| **Trung tâm đầu tư** (*Investment Center*) | Bộ phận chịu trách nhiệm về lợi nhuận và vốn đầu tư | TT 53 (suy diễn) |
| **Mã phân tích** | Mã dùng trong KTQT để gán chi phí/doanh thu cho bộ phận, dự án, sản phẩm — độc lập với hệ thống TK | TT 53/2006; Thực tiễn |
| **Operating Segment** (IFRS 8) | Bộ phận của đơn vị có (a) hoạt động KD, (b) CODM xem xét kết quả, (c) thông tin TC riêng | IFRS 8 đoạn 5 |
| **Quy chế hạch toán kế toán** | Văn bản nội bộ làm cơ sở pháp lý khi DN sửa đổi chứng từ, TK, sổ, BCTC khác chuẩn | TT 99/2025 Điều 9, 11, 12, 18 |

---

## 10. Phương pháp phân bổ chi phí

### 10.1. Ba phương pháp phân bổ chi phí bộ phận phụ trợ

**1. Phương pháp trực tiếp (Direct Method)**

Chi phí bộ phận phụ trợ phân bổ thẳng đến bộ phận sản xuất, bỏ qua việc các bộ phận phụ trợ cung cấp dịch vụ lẫn nhau.

```
Bước 1: Tỷ lệ phân bổ = Chi phí bộ phận phụ trợ / Tổng cơ sở phân bổ
Bước 2: Phân bổ = Số cơ sở PB của BPSX × Tỷ lệ PB
```

- ✅ Đơn giản, dễ tính
- ❌ Không phản ánh dịch vụ nội bộ giữa các bộ phận phụ trợ

**2. Phương pháp bậc thang (Step-Down Method)**

Các bộ phận phụ trợ được sắp xếp theo thứ tự, bộ phận phục vụ nhiều nhất phân bổ trước; chi phí đã phân bổ không phân bổ ngược lại.

- ✅ Phản ánh một phần tương hỗ
- ❌ Thứ tự phân bổ mang tính chủ quan

**3. Phương pháp đối ứng (Reciprocal Method)**

Sử dụng hệ phương trình đại số để phân bổ chi phí qua lại giữa các bộ phận phụ trợ trước khi phân bổ cho bộ phận sản xuất.

- ✅ Chính xác nhất
- ❌ Phức tạp, cần giải hệ PT tuyến tính

### 10.2. Phương pháp phân bổ chi phí sản xuất chung

- **Phương pháp truyền thống**: Một tiêu thức phân bổ duy nhất (giờ công, giờ máy...)
- **Phương pháp theo bộ phận**: Mỗi bộ phận có tiêu thức phân bổ riêng
- **ABC (Activity-Based Costing)**: Phân bổ theo hoạt động, sử dụng cả tiêu thức sản lượng và phi sản lượng

### 10.3. Phân bổ chi phí kép (Dual Rates)

Tách chi phí thành định phí và biến phí, phân bổ riêng:
- **Định phí**: Phân bổ theo tỷ lệ cố định (diện tích, số nhân viên)
- **Biến phí**: Phân bổ theo mức sử dụng thực tế

### 10.4. Thực tiễn áp dụng tại Việt Nam

Đa số DN SME Việt Nam sử dụng **phương pháp trực tiếp** do đơn giản. DN lớn hơn sử dụng **bậc thang** hoặc **ABC**. Hệ thống ERP (Bravo, SAP, Oracle) hỗ trợ cả ba phương pháp qua module Cost Center Accounting.

---

## 11. Kết luận cho thiết kế module

### 11.1. Yêu cầu pháp lý tối thiểu

1. **Phòng ban không phải** là đơn vị kế toán — không yêu cầu BCTC riêng
2. **Kế toán quản trị phòng ban là tự nguyện**, hướng dẫn bởi TT 53/2006
3. **TT 99/2025** cho phép tự chủ mở TK cấp 2/3 — có thể thiết kế mã phòng ban
4. **Quy chế quản trị nội bộ** (Điều 3 TT 99) yêu cầu phân định trách nhiệm bộ phận
5. **Đơn vị hạch toán phụ thuộc** (chi nhánh) có yêu cầu kế toán riêng biệt

### 11.2. Khuyến nghị kiến trúc module

| Thành phần | Khuyến nghị |
|---|---|
| **Mô hình dữ liệu** | Chi nhánh / Phòng ban / Nhóm dạng cây (hierarchy) |
| **Phân loại phòng ban** | Trung tâm chính (SX, KD) ↔ Trung tâm phụ (HCNS, KT, IT) |
| **Mã phòng ban** | Mã phân tích độc lập (để linh hoạt và không làm phức tạp hệ thống TK) |
| **TK kế toán** | Dùng TK chuẩn TT 99/2025 (Phụ lục II) |
| **Báo cáo** | Theo chiều: Phòng ban + TK + Kỳ; So sánh thực tế vs dự toán |
| **Phân bổ chi phí** | Hỗ trợ Direct, Step-Down, Reciprocal |
| **Kiểm soát** | Ngân sách theo phòng ban; phân quyền duyệt chi |
| **Chi nhánh hạch toán phụ thuộc** | TK 136 (phải thu nội bộ), TK 336 (phải trả nội bộ) |
| **Quy chế** | Gợi ý/kiểm tra việc ban hành Quy chế hạch toán nếu sử dụng mã phân tích |

### 11.3. Luồng dữ liệu gợi ý

```
Chứng từ (Phiếu chi/Hóa đơn Mua hàng, ...)
  │
  ├── Tài khoản Nợ/Có
  ├── Mã phòng ban (chọn từ cây tổ chức)
  ├── Khoản mục chi phí (tùy chọn)
  └── Dự án/Hợp đồng (tùy chọn)
        │
        ▼
  Ghi nhận vào Sổ chi tiết theo phòng ban
        │
        ▼
  Báo cáo:
  - Báo cáo chi phí theo phòng ban (TK + Kỳ)
  - Báo cáo ngân sách phòng ban (thực tế vs dự toán)
  - Báo cáo tổng hợp đa chiều (phòng ban × TK × kỳ)
  - Báo cáo P&L theo phòng ban (nếu có doanh thu riêng)
```

### 11.4. Tài liệu tham khảo

- Luật Kế toán 88/2015/QH13: https://thuvienphapluat.vn/van-ban/Ke-toan-Kiem-toan/Luat-ke-toan-2015-298369.aspx
- TT 53/2006/TT-BTC: https://thuvienphapluat.vn/van-ban/Ke-toan-Kiem-toan/Thong-tu-53-2006-TT-BTC-huong-dan-ap-dung-ke-toan-quan-tri-doanh-nghiep-12534.aspx
- TT 99/2025/TT-BTC: https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Thong-tu-99-2025-TT-BTC-huong-dan-Che-do-ke-toan-doanh-nghiep-565484.aspx
- TT 133/2016/TT-BTC: https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Thong-tu-133-2016-TT-BTC-huong-dan-che-do-ke-toan-doanh-nghiep-nho-va-vua-284997.aspx
- IFRS 8: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-8-operating-segments/
- MISA AMIS: https://amis.misa.vn/39203/phan-mem-ke-toan-quan-tri/
- Bravo ERP: https://www.bravo.com.vn/
- KPMG Financial Management: https://kpmg.com/vn/vi/home/services/consulting/quan-tri-tai-chinh.html
