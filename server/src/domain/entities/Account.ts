import { AccountCategory, AccountNature, AccountType } from '../enums/AccountEnums.js';

export interface Account {
  id: number;
  companyId: number;
  accountNumber: string;
  name: string;
  nameEnglish?: string;
  category: AccountCategory;
  nature: AccountNature;
  type: AccountType;
  parentId?: number;
  isActive: boolean;
  isSystem: boolean;
  allowTransactions: boolean;
  openingDebit?: number;
  openingCredit?: number;
  debitAmount?: number;
  creditAmount?: number;
  closingDebit?: number;
  closingCredit?: number;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createAccount(data: Partial<Account> & {
  companyId: number;
  accountNumber: string;
  name: string;
  category: AccountCategory;
  nature: AccountNature;
}): Account {
  return {
    id: 0,
    isActive: true,
    isSystem: false,
    allowTransactions: true,
    type: data.parentId ? AccountType.TaiKhoanChiTiet : AccountType.TaiKhoanMe,
    openingDebit: 0,
    openingCredit: 0,
    debitAmount: 0,
    creditAmount: 0,
    closingDebit: 0,
    closingCredit: 0,
    createdAt: new Date(),
    ...data,
  };
}

export function isAccountNumberValid(number: string): boolean {
  const cleaned = number.replace(/[^0-9]/g, '');
  return cleaned.length >= 1 && cleaned.length <= 7;
}

export function getAccountCategoryNature(category: AccountCategory): AccountNature {
  const map: Record<AccountCategory, AccountNature> = {
    [AccountCategory.TaiSan]: AccountNature.DuNo,
    [AccountCategory.NoPhaiTra]: AccountNature.DuCo,
    [AccountCategory.VonChuSoHuu]: AccountNature.DuCo,
    [AccountCategory.DoanhThu]: AccountNature.DuCo,
    [AccountCategory.ChiPhi]: AccountNature.DuNo,
    [AccountCategory.XacDinhKetQua]: AccountNature.LuongTinh,
  };
  return map[category];
}
