import { describe, it, expect } from 'vitest';
import {
  AccountCategory, AccountNature, AccountType,
  AccountingRegime,
  getAccountCategoryLabel, getAccountNatureLabel,
  ACCOUNT_CATEGORY_NATURE,
  STANDARD_ACCOUNTS_TT99, STANDARD_ACCOUNTS_TT133,
} from './AccountEnums.js';

describe('AccountEnums', () => {
  describe('AccountingRegime', () => {
    it('has correct values', () => {
      expect(AccountingRegime.TT99).toBe(1);
      expect(AccountingRegime.TT133).toBe(2);
      expect(AccountingRegime.TT58).toBe(3);
    });
  });

  describe('STANDARD_ACCOUNTS_TT99', () => {
    it('has 71 level-1 accounts', () => {
      const level1 = STANDARD_ACCOUNTS_TT99.filter((a) => !a.parent);
      expect(level1.length).toBe(71);
    });

    it('all level-1 accounts are 3 digits', () => {
      const level1 = STANDARD_ACCOUNTS_TT99.filter((a) => !a.parent);
      for (const acc of level1) {
        expect(acc.number.length).toBe(3);
      }
    });

    it('has 101 level-2 accounts', () => {
      const level2 = STANDARD_ACCOUNTS_TT99.filter((a) => a.parent && a.number.length === 4);
      expect(level2.length).toBe(101);
    });

    it('has 10 level-3 accounts', () => {
      const level3 = STANDARD_ACCOUNTS_TT99.filter((a) => a.number.length === 5);
      expect(level3.length).toBe(10);
    });

    it('has 2 level-4 accounts', () => {
      const level4 = STANDARD_ACCOUNTS_TT99.filter((a) => a.number.length === 6);
      expect(level4.length).toBe(2);
    });

    it('total count is 184 (71+101+10+2)', () => {
      expect(STANDARD_ACCOUNTS_TT99.length).toBe(184);
    });

    it('all parent references resolve to existing numbers', () => {
      const numbers = new Set(STANDARD_ACCOUNTS_TT99.map((a) => a.number));
      for (const acc of STANDARD_ACCOUNTS_TT99) {
        if (acc.parent) {
          expect(numbers.has(acc.parent)).toBe(true);
        }
      }
    });

    it('includes TK 215 (new in TT 99)', () => {
      const acc = STANDARD_ACCOUNTS_TT99.find((a) => a.number === '215');
      expect(acc).toBeDefined();
      expect(acc!.name).toBe('Tài sản sinh học');
    });

    it('includes TK 332 (new in TT 99)', () => {
      const acc = STANDARD_ACCOUNTS_TT99.find((a) => a.number === '332');
      expect(acc).toBeDefined();
      expect(acc!.name).toContain('Phải trả cổ tức');
    });

    it('renames TK 112 from TT 200', () => {
      const acc = STANDARD_ACCOUNTS_TT99.find((a) => a.number === '112');
      expect(acc).toBeDefined();
      expect(acc!.name).toBe('Tiền gửi không kỳ hạn');
    });

    it('includes 1281-1288 as level-2 under TK 128', () => {
      const children = STANDARD_ACCOUNTS_TT99.filter((a) => a.parent === '128');
      expect(children.length).toBe(4);
      const nums = children.map((a) => a.number).sort();
      expect(nums).toEqual(['1281', '1282', '1283', '1288']);
    });
  });

  describe('STANDARD_ACCOUNTS_TT133', () => {
    it('has ~50 level-1 accounts', () => {
      const level1 = STANDARD_ACCOUNTS_TT133.filter((a) => !a.parent);
      expect(level1.length).toBeGreaterThanOrEqual(45);
      expect(level1.length).toBeLessThanOrEqual(55);
    });

    it('has TK 642 in expense category', () => {
      const acc = STANDARD_ACCOUNTS_TT133.find((a) => a.number === '642');
      expect(acc).toBeDefined();
      expect(acc!.category).toBe(AccountCategory.ChiPhi);
    });
  });

  describe('ACCOUNT_CATEGORY_NATURE', () => {
    it('maps each category to correct nature', () => {
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.TaiSan]).toBe(AccountNature.DuNo);
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.NoPhaiTra]).toBe(AccountNature.DuCo);
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.VonChuSoHuu]).toBe(AccountNature.DuCo);
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.DoanhThu]).toBe(AccountNature.DuCo);
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.ChiPhi]).toBe(AccountNature.DuNo);
      expect(ACCOUNT_CATEGORY_NATURE[AccountCategory.XacDinhKetQua]).toBe(AccountNature.LuongTinh);
    });
  });
});
