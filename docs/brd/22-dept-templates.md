# Templates — Dept Module (Cong no — AP/AR)

**Domain:** Cong no (Accounts Payable/Receivable)
**Module:** Dept Management
**Law references:** TT 99/2025/TT-BTC, TT 133/2016/TT-BTC, VAS 01, VAS 10, VAS 18, TT 48/2019/TT-BTC, Luat Ke toan 88/2015

---

## T-01: Customer Master Data Form (Thong tin khach hang)

```
===================================================================
               THONG TIN KHACH HANG (Customer Master Data)
===================================================================

--- THONG TIN CHUNG (GENERAL INFORMATION) ---

Ma khach hang:            _________________________________[auto: KH-YYYYMM-NNNNN]
(Customer code)

Ten khach hang:           _________________________________ (toi da 400 ky tu)
(Customer name in Vietnamese)

Ten giao dich:            _________________________________ (toi da 400 ky tu, khong bat buoc)
(Trading name)

Ma so thue:               ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ - ___ ___ ___
(Tax code)                  (10 hoac 13 chu so, theo Luat Quan ly thue 38/2019)

So dien thoai:            ___________________ (toi da 20 chu so)
(Phone)

Email:                    _________________________________ (toi da 256 ky tu)
(Email)

Dia chi:                  _________________________________ (toi da 500 ky tu)
(Address)                 _________________________________

Tinh/Thanh pho:           [Dropdown: 63 tinh/thanh]
(Province/City)

Nguoi lien he:            _________________________________ (toi da 200 ky tu)
(Contact person)

Chuc vu:                  _________________________________
(Position)

--- DIEU KHOAN THANH TOAN (PAYMENT TERMS) ---

Dieu khoan thanh toan:    [Dropdown: Net 15 | Net 30 | Net 45 | Net 60 | Khac]
(Payment terms)

Han muc tin dung (VND):   _______________ (so duong, 0 = khong gioi han)
(Credit limit)

So ngay duoc gia han:     _______________ ngay
(Grace period days)

--- THONG TIN NGAN HANG (BANK INFORMATION) ---

Ten ngan hang:            _________________________________
(Bank name)

So tai khoan:             _______________________________
(Account number)

Chu tai khoan:            _________________________________
(Account holder)

--- THONG TIN KHAC (OTHER) ---

Ghi chu:                  _________________________________
(Notes)

Khach hang dang hoat dong: [X] Co (Yes)    [ ] Khong (No)
(Customer is active)

Nguoi tao:                _________________________________
(Created by)

Ngay tao:                 ___/___/________
(Created date)

===================================================================
              (Bieu mau nay theo quy dinh tai TT 99/2025/TT-BTC)
===================================================================
```

---

## T-02: Supplier Master Data Form (Thong tin nha cung cap)

```
===================================================================
              THONG TIN NHA CUNG CAP (Supplier Master Data)
===================================================================

--- THONG TIN CHUNG (GENERAL INFORMATION) ---

Ma nha cung cap:          _________________________________[auto: NCC-YYYYMM-NNNNN]
(Supplier code)

Ten nha cung cap:         _________________________________ (toi da 400 ky tu)
(Supplier name)

Ma so thue:               ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ - ___ ___ ___
(Tax code)

So dien thoai:            ___________________
(Phone)

Email:                    _________________________________
(Email)

Dia chi:                  _________________________________ (toi da 500 ky tu)
(Address)

Nguoi lien he:            _________________________________ (toi da 200 ky tu)
(Contact person)

Chuc vu:                  _________________________________
(Position)

--- DIEU KHOAN THANH TOAN (PAYMENT TERMS) ---

Dieu khoan thanh toan:    [Dropdown: Net 15 | Net 30 | Net 45 | Net 60 | Cod | Khac]
(Payment terms)

Chiet khau thanh toan:    ___% neu thanh toan trong vong ___ ngay
(Early payment discount)

--- THONG TIN NGAN HANG (BANK INFORMATION) ---

Ten ngan hang:            _________________________________
(Bank name)

Chi nhanh:                _________________________________
(Branch)

So tai khoan:             _______________________________
(Account number)

Chu tai khoan:            _________________________________
(Account holder)

--- THONG TIN KHAC (OTHER) ---

Loai nha cung cap:        [Dropdown: Trong nuoc (Domestic) | Nuoc ngoai (Foreign)]
(Supplier type)

Ghi chu:                  _________________________________
(Notes)

Hoat dong:                [X] Co (Yes)    [ ] Khong (No)
(Active)

Nguoi tao:                _________________________________
(Created by)

Ngay tao:                 ___/___/________
(Created date)

===================================================================
```

---

## T-03: Sales Invoice Form (Hoa don ban hang)

```
===================================================================
                  HOA DON BAN HANG (Sales Invoice)
===================================================================

So hoa don:               _______________ [auto: INV-YYYYMM-NNNNN]
(Invoice number)

Ngay lap:                 ___/___/________
(Invoice date)

Ngay den han:             ___/___/________ (tu dong tinh tu dieu khoan thanh toan)
(Due date)

Khach hang:               [Lookup: search by name, code, or tax code]
(Customer)

Ma so thue khach hang:    [Auto-filled from Customer master]
(Tax code)

Dia chi khach hang:       [Auto-filled from Customer master]
(Address)

Nguoi mua:                _________________________________ (toi da 200 ky tu)
(Buyer name)

Loai tien:                [VND / USD / EUR / Khac]    Ty gia: _________
(Currency)                (Exchange rate)

--- CHI TIET HOA DON (INVOICE LINES) ---

STT  Dien giai (Description)        SL (Qty)  Don gia (Price)    Thue suat (Tax%)    Thanh tien (Total)
───  ─────────────────────────────  ─────────  ─────────────────  ──────────────────  ──────────────────
1    _________________________________  _______  _______________  ______%            _______________
2    _________________________________  _______  _______________  ______%            _______________
3    _________________________________  _______  _______________  ______%            _______________
[Add line]

--- TONG CONG (TOTALS) ---

Tong tien hang (SubTotal):                                    _______________ VND
Thue GTGT (VAT):                                              _______________ VND
Tong cong thanh toan (Total):                                 _______________ VND

So tien bang chu: _________________________________________________________________
(Amount in words)

--- PHE DUYET (APPROVAL) ---

Trang thai:               [Draft / Posted / Paid / Partial / Cancelled]

Nguoi lap (Prepared by):  _________________________________  Ngay: ___/___/________
Ke toan truong (Chief Accountant): _________________________________  Ngay: ___/___/________
Nguoi mua (Buyer):        _________________________________  Ngay: ___/___/________

===================================================================
```

---

## T-04: Purchase Invoice Form (Hoa don mua hang)

```
===================================================================
                 HOA DON MUA HANG (Purchase Invoice)
===================================================================

So hoa don noi bo:        _______________ [auto: INV-YYYYMM-NNNNN]
(Internal invoice number)

So hoa don nha cung cap:  _______________
(Supplier invoice number)

Ngay hoa don (Invoice date):    ___/___/________
Ngay nhan (Received date):      ___/___/________
Ngay den han (Due date):        ___/___/________

Nha cung cap:             [Lookup: search by name, code, or tax code]
(Supplier)

Ma so thue NCC:           [Auto-filled from Supplier master]
(Supplier tax code)

Dia chi NCC:              [Auto-filled from Supplier master]
(Supplier address)

Loai tien:                [VND / USD / EUR / Khac]    Ty gia: _________
(Currency)                (Exchange rate)

--- CHI TIET HOA DON (INVOICE LINES) ---

STT  Tai khoan No (Debit)  Dien giai (Description)       SL      Don gia     Thue    Tien
───  ─────────────────────  ───────────────────────────  ──────  ─────────  ──────  ─────────
1    TK _________           _________________________________  _______  _________  ___%  _________
2    TK _________           _________________________________  _______  _________  ___%  _________

--- THUE GTGT DAU VAO (INPUT VAT) ---

Tai khoan Co: TK 133              Thue suat: ___%            Tien thue: _________

--- TONG CONG (TOTALS) ---

Tong tien hang chua thue (SubTotal):                _______________ VND
Thue GTGT (Input VAT):                              _______________ VND
Tong cong thanh toan (Total):                       _______________ VND

--- PHAN BO (ALLOCATION) ---

[N] Hoa don chua duoc thanh toan (Unpaid)
[ ] Da thanh toan mot phan (Partially paid): _______________ VND
[ ] Da thanh toan (Paid): Phieu chi so _______________

--- PHE DUYET (APPROVAL) ---

Trang thai:               [Draft / Posted / Partial / Paid / Cancelled]

Nguoi lap:                _________________________________  Ngay: ___/___/________
Ke toan truong:           _________________________________  Ngay: ___/___/________

===================================================================
```

---

## T-05: Receipt Voucher (Phieu thu)

```
===================================================================
                         PHIEU THU (Receipt Voucher)
===================================================================

So phieu thu:             _______________ [auto: REC-YYYYMM-NNNNN]
(Voucher number)

Ngay thu:                 ___/___/________
(Receipt date)

Khach hang:               [Lookup: search by name, code, or tax code]
(Customer)

Ma so thue:               [Auto-filled from Customer master]
(Tax code)

Dia chi:                  [Auto-filled from Customer master]
(Address)

Ly do thu:                ________________________________________________________
(Reason)                 ________________________________________________________

So tien:                  _______________ VND
(Amount)

So tien bang chu:         _______________________________________________________
(Amount in words)

Hinh thuc thanh toan:     [Dropdown: Tien mat (Cash) | Chuyen khoan (Bank transfer)
(Payment method)           | Sec (Cheque) | The (Credit card)]

Tai khoan No:             TK _______________ (111/112)
(Debit account)

Ngan hang/Quy:            _________________________________
(Bank/Cash account)

--- PHAN BO THANH TOAN (PAYMENT ALLOCATION) ---

STT  So hoa don (Invoice)  Ngay hoa don    So tien hoa don    Da thu    Phan bo lan nay
───  ─────────────────────  ─────────────  ─────────────────  ────────  ───────────────
1    _______________        ___/___/____   _______________    ________  _______________
2    _______________        ___/___/____   _______________    ________  _______________
[Tong cong phan bo (Total allocated):                             _______________]

--- PHE DUYET (APPROVAL) ---

Nguoi lap:                _________________________________  Ngay: ___/___/________
(Prepared by)

Thu quy:                  _________________________________  Ngay: ___/___/________
(Cashier)

Nguoi nop tien:           _________________________________  Ngay: ___/___/________
(Payer)

Ke toan truong:           _________________________________  Ngay: ___/___/________
(Chief Accountant)

===================================================================
```

---

## T-06: Payment Voucher (Phieu chi)

```
===================================================================
                        PHIEU CHI (Payment Voucher)
===================================================================

So phieu chi:             _______________ [auto: PAY-YYYYMM-NNNNN]
(Voucher number)

Ngay chi:                 ___/___/________
(Payment date)

Nha cung cap:             [Lookup: search by name, code, or tax code]
(Supplier)

Ma so thue:               [Auto-filled from Supplier master]
(Tax code)

Dia chi:                  [Auto-filled from Supplier master]
(Address)

Ly do chi:                ________________________________________________________
(Reason)                 ________________________________________________________

So tien:                  _______________ VND
(Amount)

So tien bang chu:         _______________________________________________________
(Amount in words)

Hinh thuc thanh toan:     [Dropdown: Tien mat (Cash) | Chuyen khoan (Bank transfer)
(Payment method)           | Sec (Cheque) | The tin dung (Credit card)]

Tai khoan Co:             TK _______________ (111/112)
(Credit account)

Ngan hang/Quy:            _________________________________
(Bank/Cash)

--- PHAN BO THANH TOAN (PAYMENT ALLOCATION) ---

STT  So hoa don NCC       Ngay hoa don    So tien         Da tra        Tra lan nay
───  ───────────────────  ─────────────  ──────────────  ────────────  ──────────────
1    _______________      ___/___/____   _______________  __________    _____________
2    _______________      ___/___/____   _______________  __________    _____________
[Tong cong phan bo (Total allocated):                           _____________]

--- PHE DUYET (APPROVAL) ---

Nguoi de nghi (Requestor):   _________________________________  Ngay: ___/___/________
Ke toan truong:              _________________________________  Ngay: ___/___/________
Giam doc (Director):         _________________________________  Ngay: ___/___/________
(if amount > approval threshold)

Thu quy (Cashier):           _________________________________  Ngay: ___/___/________
Nguoi nhan tien (Receiver):  _________________________________  Ngay: ___/___/________

===================================================================
```

---

## T-07: AR Aging Report (Bang tuoi no phai thu)

```
===================================================================
          BANG TUOI NO PHAI THU (AR Aging Report)
===================================================================

Don vi: [Company Name]                                     Mau so: S03b-DN
Dia chi: [Company Address]                                 (Ban hanh theo TT 99/2025/TT-BTC)

Ngay lap:  ___/___/________
Nguoi lap: _________________________

--- TONG HOP THEO DOANH SO (Summary by Bucket) ---

                       So du      0-30 ngay   31-60 ngay   61-90 ngay   91-180 ngay   Tren 180    Tong cong
Khach hang            dau ky      (chua qua)  (qua han)    (qua han)    (qua han)    ngay        (Total)
───────────────       ──────────  ──────────  ──────────  ───────────  ───────────  ──────────  ──────────
Cong ty A             50,000,000  20,000,000  10,000,000   5,000,000           0           0   85,000,000
Cong ty B             30,000,000           0           0           0   15,000,000  10,000,000  55,000,000
Cong ty C            100,000,000  80,000,000           0           0           0           0  180,000,000
[Other customers...]

TONG CONG            180,000,000 100,000,000  10,000,000   5,000,000  15,000,000  10,000,000  320,000,000
(Total)

--- TY LE THEO BUCKET (Percentage by Bucket) ---

0-30 ngay:     _______________  (_____%)
31-60 ngay:    _______________  (_____%)
61-90 ngay:    _______________  (_____%)
91-180 ngay:   _______________  (_____%)
Tren 180 ngay: _______________  (_____%)

--- CHI TIET QUA HAN TREN 90 NGAY (Detail: Overdue > 90 days) ---

Khach hang     So hoa don    Ngay hoa don     Ngay den han       So tien      So ngay qua han
──────────     ────────────  ───────────────  ────────────────  ────────────  ───────────────
[Detail rows for high-risk overdue items]

Ngay lap bao cao:  ___/___/________
Nguoi lap:         _________________________________  (Ky)
Ke toan truong:    _________________________________  (Ky)

===================================================================
```

---

## T-08: AP Aging Report (Bang tuoi no phai tra)

```
===================================================================
          BANG TUOI NO PHAI TRA (AP Aging Report)
===================================================================

Don vi: [Company Name]                                     Mau so: S04-DN
Dia chi: [Company Address]                                 (Ban hanh theo TT 99/2025/TT-BTC)

Ngay lap:       ___/___/________
Nguoi lap:      _________________________

--- TONG HOP (Summary by Supplier) ---

Nha cung cap    Chua den han   0-30 ngay   31-60 ngay    61-90 ngay   91-180 ngay  Tren 180    Tong cong
(Supplier)      (Not yet due)                            (Overdue)    (Overdue)    ngay        (Total)
──────────────  ─────────────  ──────────  ────────────  ───────────  ───────────  ──────────  ──────────
NCC A            20,000,000    50,000,000          0              0           0          0    70,000,000
NCC B                     0             0   15,000,000     10,000,000           0          0    25,000,000
NCC C            30,000,000             0           0              0           0          0    30,000,000

TONG CONG        50,000,000    50,000,000  15,000,000     10,000,000           0          0   125,000,000

--- SO NO CAN TRA THEO TUAN (Payment Schedule) ---

Tuan/Tuan     So tien den han      So tien den han      So tien den han
              (Week 1-2)           (Week 3-4)           (Week 5-8)
──────────    ───────────────────  ───────────────────  ───────────────────
NCC A            50,000,000                0                     0
NCC B            10,000,000           15,000,000                 0

--- KHUYEN NGHI THANH TOAN (Payment Recommendations) ---

Nha cung cap    So tien        Ngay den han som nhat    Muc do uu tien
──────────────  ────────────   ───────────────────────  ───────────────
NCC B           15,000,000     15/07/2026 (31-60 ngay)  Cao (High)

Ngay lap bao cao:  ___/___/________
Nguoi lap:         _________________________________  (Ky)
Ke toan truong:    _________________________________  (Ky)

===================================================================
```

---

## T-09: Customer Statement (So chi tiet cong no phai thu)

```
===================================================================
        SO CHI TIET CONG NO PHAI THU (Customer Statement)
===================================================================

Don vi: [Company Name]                                     Mau so: S03b-DN
                                                            (TT 99/2025/TT-BTC)

Khach hang:    _________________________________   Ma so thue: _______________
Dia chi:       _________________________________
               _________________________________

Ky bao cao:    Tu ___/___/________ den ___/___/________
(Period)

--- CHI TIET PHAT SINH (Transaction Details) ---

Ngay thang    Chung tu         Dien giai                    So tien         So du
(Date)        (Ref#)           (Description)                (Amount)        (Balance)
────────────  ───────────────  ───────────────────────────  ──────────────  ──────────────
              [Opening Balance]                                             _______________
___/___/___   INV-___________  [Invoice description]        _____________  _______________
___/___/___   INV-___________  [Invoice description]        _____________  _______________
___/___/___   REC-__________  [Payment received]           -_____________  _______________
___/___/___   ADJ-___________  [Adjustment/Credit note]     _____________  _______________
              [Closing Balance]                                             _______________

--- CHI TIET CONG NO DEN NGAY (Aging Detail as of Period End) ---

Tong cong so du cuoi ky:       _______________ VND
  - Chua den han:               _______________ VND (_____%)
  - Qua han 0-30 ngay:          _______________ VND (_____%)
  - Qua han 31-60 ngay:         _______________ VND (_____%)
  - Qua han 61-90 ngay:         _______________ VND (_____%)
  - Qua han 91-180 ngay:        _______________ VND (_____%)
  - Qua han tren 180 ngay:      _______________ VND (_____%)

Ngay lap:       ___/___/________
Nguoi lap:      _________________________________  (Ky, ghi ro ho ten)
Ke toan truong: _________________________________  (Ky, ghi ro ho ten)

===================================================================
```

---

## T-10: Debt Provision Calculation Sheet (Bang trich lap du phong)

```
===================================================================
    BANG TRICH LAP DU PHONG PHAI THU KHO DOI
    (Bad Debt Provision Calculation Sheet)
===================================================================

Don vi: [Company Name]
Dia chi: [Company Address]

Ky trich lap:    ___/___/________ (Period end date)
Ngay lap bang:   ___/___/________
Nguoi lap:       _________________________________

Can cu phap ly (Legal basis):
  - Thong tu 48/2019/TT-BTC ngay 08/4/2019 cua Bo Tai chinh
  - Chuan muc ke toan so 18 (VAS 18) — Du phong phai thu kho doi
  - Quyet dinh cua Giam doc ve trich lap du phong nam tai chinh

--- CHI TIET TRICH LAP THEO KHACH HANG (Per-Customer Provision Detail) ---

STT  Khach hang      Tong no       0-30 ngay    31-60 ngay   61-90 ngay   91-180 ngay  181-365      >365 ngay    Du phong
                     phai thu      (0%)         (5%)         (10%)        (20%)        ngay (50%)  (100%)       trich lap
───  ────────────    ────────────  ───────────  ───────────  ───────────  ───────────  ──────────  ──────────  ──────────
1    Cong ty A        50,000,000   20,000,000   10,000,000    5,000,000           0           0           0     1,000,000
                                                           (0)          (500,000)    (500,000)
2    Cong ty B        30,000,000            0            0            0   15,000,000  10,000,000   5,000,000  8,000,000
                                                                        (3,000,000) (5,000,000) (0)

TONG CONG (Total)   320,000,000                                                           9,000,000
                                                                                          (Du phong)

--- CAC KHOAN LOAI TRU (Exclusions per TT 48 Dien 6 Khoan 2) ---

Khoan muc (Item)                                        So tien (Amount)    Ly do (Reason)
──────────────────────────────────────────────────────  ──────────────────  ───────────────
Khach hang co du co (Credit balance customers)            _______________   [Reason]
No noi bo (Inter-company balances)                        _______________   [Reason]
No co bao dam (Secured debts)                             _______________   [Reason]

--- TONG HOP VA DIEU CHINH (Summary and Adjustment) ---

1.  Du phong yeu cau (Required provision):                            _______________ VND
2.  Du phong hien tai (Existing balance TK 2293):                     _______________ VND
3.  Chenh lech (Adjustment required):                                 _______________ VND

    Neu (3) > 0: Ghi tang du phong: No TK 6426 / Co TK 2293
    Neu (3) < 0: Ghi giam du phong: No TK 2293 / Co TK 6426
    Neu (3) = 0: Khong can ghi so

--- XAC NHAN (Approval) ---

Nguoi lap bang:        _________________________________  Ngay: ___/___/________
  (Preparer)

Ke toan truong:        _________________________________  Ngay: ___/___/________
  (Chief Accountant)

Giam doc:              _________________________________  Ngay: ___/___/________
  (Director)

===================================================================
```
