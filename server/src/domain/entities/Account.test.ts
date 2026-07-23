import { describe, it, expect } from 'vitest';
import { createAccount, isAccountNumberValid, getAccountCategoryNature } from './Account.js';
import { AccountCategory, AccountNature, AccountType } from '../enums/AccountEnums.js';

describe('Account', () => {
  describe('createAccount', () => {
    it('creates account with required fields', () => {
      const acc = createAccount({
        companyId: 1,
        accountNumber: '1111',
        name: 'Tiền mặt VNĐ',
        category: AccountCategory.TaiSan,
        nature: AccountNature.DuNo,
      });

      expect(acc.id).toBeDefined();
      expect(acc.companyId).toBe(1);
      expect(acc.accountNumber).toBe('1111');
      expect(acc.name).toBe('Tiền mặt VNĐ');
      expect(acc.category).toBe(AccountCategory.TaiSan);
      expect(acc.nature).toBe(AccountNature.DuNo);
    });

    it('sets defaults', () => {
      const acc = createAccount({
        companyId: 1,
        accountNumber: '1111',
        name: 'Tiền mặt',
        category: AccountCategory.TaiSan,
        nature: AccountNature.DuNo,
      });

      expect(acc.isActive).toBe(true);
      expect(acc.isSystem).toBe(false);
      expect(acc.allowTransactions).toBe(true);
      expect(acc.openingDebit).toBe(0);
      expect(acc.openingCredit).toBe(0);
      expect(acc.type).toBe(AccountType.TaiKhoanMe);
    });

    it('sets type to chi tiet when parentId provided', () => {
      const acc = createAccount({
        companyId: 1,
        accountNumber: '1111',
        name: 'Tiền mặt',
        category: AccountCategory.TaiSan,
        nature: AccountNature.DuNo,
        parentId: 2,
      });

      expect(acc.type).toBe(AccountType.TaiKhoanChiTiet);
    });
  });

  describe('isAccountNumberValid', () => {
    it('validates account numbers', () => {
      expect(isAccountNumberValid('111')).toBe(true);
      expect(isAccountNumberValid('1111')).toBe(true);
      expect(isAccountNumberValid('')).toBe(false);
    });

    it('strips non-numeric characters', () => {
      expect(isAccountNumberValid('111-A')).toBe(true);
    });
  });

  describe('getAccountCategoryNature', () => {
    it('returns correct nature for each category', () => {
      expect(getAccountCategoryNature(AccountCategory.TaiSan)).toBe(AccountNature.DuNo);
      expect(getAccountCategoryNature(AccountCategory.NoPhaiTra)).toBe(AccountNature.DuCo);
      expect(getAccountCategoryNature(AccountCategory.DoanhThu)).toBe(AccountNature.DuCo);
      expect(getAccountCategoryNature(AccountCategory.ChiPhi)).toBe(AccountNature.DuNo);
      expect(getAccountCategoryNature(AccountCategory.XacDinhKetQua)).toBe(AccountNature.LuongTinh);
    });
  });
});
