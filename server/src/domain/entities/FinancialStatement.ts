import type { AccountBalance } from './LedgerEntry.js';

export enum FinancialStatementType {
  B01_DN = 'B01-DN',
  B02_DN = 'B02-DN',
  B03_DN = 'B03-DN',
  B09_DN = 'B09-DN',
}

export interface FinancialStatementLine {
  code: string;
  name: string;
  currentPeriod: number;
  previousPeriod: number;
  isBold?: boolean;
  children?: FinancialStatementLine[];
}

export interface FinancialStatement {
  type: FinancialStatementType;
  companyId: number;
  companyName: string;
  periodLabel: string;
  currency: string;
  lines: FinancialStatementLine[];
  generatedAt: string;
}

export interface StatementMappingRule {
  code: string;
  name: string;
  accountNumbers?: string[];
  sign: number;
  bold?: boolean;
  isFormula?: boolean;
  formula?: string;
  children?: StatementMappingRule[];
  balanceType?: 'net' | 'debit' | 'credit' | 'change' | 'previousPeriod';
}

export function getB01TTSMapping(): StatementMappingRule[] {
  return [
    {
      code: '100', name: 'Tài sản ngắn hạn', sign: 1, bold: true,
      children: [
        { code: '110', name: 'Tiền', accountNumbers: ['111', '112', '113'], sign: 1 },
        { code: '120', name: 'Đầu tư tài chính ngắn hạn', accountNumbers: ['121', '128', '221'], sign: 1 },
        { code: '130', name: 'Các khoản phải thu ngắn hạn', sign: 1, bold: true,
          children: [
            { code: '131', name: 'Phải thu khách hàng', accountNumbers: ['131'], sign: 1 },
            { code: '132', name: 'Trả trước cho người bán', accountNumbers: ['331'], sign: 1, balanceType: 'debit' },
            { code: '136', name: 'Phải thu nội bộ', accountNumbers: ['136'], sign: 1 },
            { code: '138', name: 'Phải thu khác', accountNumbers: ['138', '141'], sign: 1 },
            { code: '139', name: 'Dự phòng phải thu khó đòi', accountNumbers: ['229'], sign: 1, balanceType: 'credit' },
          ],
        },
        { code: '140', name: 'Hàng tồn kho', sign: 1, bold: true,
          children: [
            { code: '141', name: 'Hàng tồn kho', accountNumbers: ['151', '152', '153', '154', '155', '156', '157', '158'], sign: 1 },
            { code: '149', name: 'Dự phòng giảm giá hàng tồn kho', accountNumbers: ['229'], sign: 1, balanceType: 'credit' },
          ],
        },
      ],
    },
    {
      code: '200', name: 'Tài sản dài hạn', sign: 1, bold: true,
      children: [
        { code: '210', name: 'Tài sản cố định hữu hình', accountNumbers: ['211'], sign: 1 },
        { code: '220', name: 'Hao mòn tài sản cố định', accountNumbers: ['214'], sign: 1, balanceType: 'credit' },
        { code: '230', name: 'Tài sản cố định vô hình', accountNumbers: ['213'], sign: 1 },
        { code: '240', name: 'Bất động sản đầu tư', accountNumbers: ['217'], sign: 1 },
        { code: '250', name: 'Tài sản dở dang dài hạn', accountNumbers: ['241'], sign: 1 },
        { code: '260', name: 'Đầu tư tài chính dài hạn', accountNumbers: ['221', '222', '228'], sign: 1 },
      ],
    },
    {
      code: '300', name: 'Nợ phải trả', sign: 1, bold: true,
      children: [
        { code: '310', name: 'Phải trả người bán', accountNumbers: ['331'], sign: 1, balanceType: 'credit' },
        { code: '320', name: 'Thuế và các khoản phải nộp NN', accountNumbers: ['333'], sign: 1, balanceType: 'credit' },
        { code: '330', name: 'Phải trả người lao động', accountNumbers: ['334'], sign: 1, balanceType: 'credit' },
      ],
    },
    {
      code: '400', name: 'Vốn chủ sở hữu', sign: 1, bold: true,
      children: [
        { code: '410', name: 'Vốn đầu tư của chủ sở hữu', accountNumbers: ['411'], sign: 1, balanceType: 'credit' },
        { code: '420', name: 'Thặng dư vốn cổ phần', accountNumbers: ['412'], sign: 1, balanceType: 'credit' },
        { code: '430', name: 'Lợi nhuận sau thuế chưa phân phối', accountNumbers: ['421'], sign: 1, balanceType: 'credit' },
      ],
    },
  ];
}

export function getB02KQHDMapping(): StatementMappingRule[] {
  return [
    { code: '01', name: 'Doanh thu bán hàng và cung cấp dịch vụ', accountNumbers: ['511'], sign: -1 },
    { code: '02', name: 'Các khoản giảm trừ doanh thu', accountNumbers: ['521'], sign: -1 },
    { code: '10', name: 'Doanh thu thuần', isFormula: true, formula: '01+02', sign: 1, bold: true },
    { code: '11', name: 'Giá vốn hàng bán', accountNumbers: ['632'], sign: -1 },
    { code: '20', name: 'Lợi nhuận gộp', isFormula: true, formula: '10+11', sign: 1, bold: true },
    { code: '21', name: 'Doanh thu hoạt động tài chính', accountNumbers: ['515'], sign: -1 },
    { code: '22', name: 'Chi phí tài chính', accountNumbers: ['635'], sign: -1 },
    { code: '23', name: 'Chi phí bán hàng', accountNumbers: ['641'], sign: -1 },
    { code: '24', name: 'Chi phí quản lý doanh nghiệp', accountNumbers: ['642'], sign: -1 },
    { code: '30', name: 'Lợi nhuận thuần từ HĐKD', isFormula: true, formula: '20+21+22+23+24', sign: 1, bold: true },
    { code: '31', name: 'Thu nhập khác', accountNumbers: ['711'], sign: -1 },
    { code: '32', name: 'Chi phí khác', accountNumbers: ['811'], sign: -1 },
    { code: '40', name: 'Lợi nhuận khác', isFormula: true, formula: '31+32', sign: 1 },
    { code: '50', name: 'Tổng lợi nhuận kế toán trước thuế', isFormula: true, formula: '30+40', sign: 1, bold: true },
    { code: '51', name: 'Chi phí thuế TNDN hiện hành', accountNumbers: ['8211', '82111'], sign: -1 },
    { code: '52', name: 'Chi phí thuế TNDN hoãn lại', accountNumbers: ['8212'], sign: -1 },
    { code: '60', name: 'Lợi nhuận sau thuế TNDN', isFormula: true, formula: '50+51+52', sign: 1, bold: true },
  ];
}

export function getB03LCTTMapping(): StatementMappingRule[] {
  return [
    { code: '01', name: 'Lợi nhuận kế toán trước thuế', accountNumbers: ['511', '515', '711', '632', '635', '641', '642', '811', '821'], sign: -1 },
    { code: '02', name: 'Điều chỉnh cho các khoản', sign: 1, bold: true, children: [
      { code: '03', name: 'Khấu hao TSCĐ', accountNumbers: ['214'], sign: -1, balanceType: 'change' },
      { code: '04', name: 'Các khoản dự phòng', accountNumbers: ['229'], sign: -1, balanceType: 'change' },
      { code: '05', name: 'Lãi/lỗ chênh lệch tỷ giá', accountNumbers: ['413'], sign: -1, balanceType: 'change' },
      { code: '06', name: 'Lãi/lỗ từ hoạt động đầu tư', accountNumbers: ['515', '635'], sign: -1, balanceType: 'change' },
      { code: '07', name: 'Chi phí lãi vay', accountNumbers: ['635'], sign: -1, balanceType: 'change' },
    ]},
    { code: '08', name: 'Lợi nhuận từ HĐKD trước thay đổi VLĐ', isFormula: true, formula: '01+02', sign: 1, bold: true },
    { code: '09', name: 'Thay đổi khoản phải thu', accountNumbers: ['131', '136', '138', '141'], sign: -1, balanceType: 'change' },
    { code: '10', name: 'Thay đổi hàng tồn kho', accountNumbers: ['151', '152', '153', '154', '155', '156', '157', '158'], sign: -1, balanceType: 'change' },
    { code: '11', name: 'Thay đổi khoản phải trả', accountNumbers: ['331', '333', '334', '338'], sign: -1, balanceType: 'change' },
    { code: '12', name: 'Thay đổi chi phí trả trước', accountNumbers: ['242'], sign: -1, balanceType: 'change' },
    { code: '13', name: 'Tiền lãi vay đã trả', accountNumbers: ['635'], sign: -1, balanceType: 'change' },
    { code: '14', name: 'Thuế TNDN đã nộp', accountNumbers: ['3334'], sign: 1, balanceType: 'change' },
    { code: '20', name: 'Lưu chuyển tiền thuần từ HĐKD', isFormula: true, formula: '08+09+10+11+12+13+14', sign: 1, bold: true },
    { code: '21', name: 'Mua sắm TSCĐ', accountNumbers: ['211', '213', '217', '241'], sign: -1, balanceType: 'change' },
    { code: '22', name: 'Thu thanh lý TSCĐ', accountNumbers: ['711', '811'], sign: -1, balanceType: 'change' },
    { code: '25', name: 'Đầu tư góp vốn đơn vị khác', accountNumbers: ['121', '128', '221', '222', '228'], sign: -1, balanceType: 'change' },
    { code: '27', name: 'Thu lãi tiền gửi, cổ tức', accountNumbers: ['515'], sign: -1, balanceType: 'change' },
    { code: '30', name: 'Lưu chuyển tiền thuần từ HĐĐT', isFormula: true, formula: '21+22+25+27', sign: 1, bold: true },
    { code: '31', name: 'Nhận vốn góp CSH', accountNumbers: ['411', '412'], sign: -1, balanceType: 'change' },
    { code: '33', name: 'Vay nhận được', accountNumbers: ['341'], sign: -1, balanceType: 'change' },
    { code: '34', name: 'Trả nợ vay', accountNumbers: ['341'], sign: 1, balanceType: 'change' },
    { code: '36', name: 'Cổ tức đã trả', accountNumbers: ['421'], sign: -1, balanceType: 'change' },
    { code: '40', name: 'Lưu chuyển tiền thuần từ HĐTC', isFormula: true, formula: '31+33+34+36', sign: 1, bold: true },
    { code: '50', name: 'Lưu chuyển tiền thuần trong kỳ', isFormula: true, formula: '20+30+40', sign: 1, bold: true },
    { code: '51', name: 'Tiền và tương đương tiền đầu kỳ', accountNumbers: ['111', '112'], sign: 1, balanceType: 'previousPeriod' },
    { code: '52', name: 'Ảnh hưởng của tỷ giá hối đoái', accountNumbers: ['413'], sign: -1, balanceType: 'change' },
    { code: '60', name: 'Tiền và tương đương tiền cuối kỳ', isFormula: true, formula: '50+51+52', sign: 1, bold: true },
  ];
}

function balanceValue(bal: AccountBalance, rule: StatementMappingRule): number {
  if (rule.balanceType === 'debit') return bal.closingDebit;
  if (rule.balanceType === 'credit') return bal.closingCredit;
  return bal.closingDebit - bal.closingCredit;
}

export function generateFinancialStatementLine(
  rule: StatementMappingRule,
  balances: AccountBalance[],
  prevBalances: AccountBalance[],
): FinancialStatementLine {
  if (rule.isFormula && rule.formula) {
    return {
      code: rule.code,
      name: rule.name,
      currentPeriod: 0,
      previousPeriod: 0,
      isBold: rule.bold,
    };
  }

  const current = (rule.accountNumbers ?? []).reduce((sum, acct) => {
    const bal = balances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
    if (!bal) return sum;
    return sum + balanceValue(bal, rule) * rule.sign;
  }, 0);

  const previous = (rule.accountNumbers ?? []).reduce((sum, acct) => {
    const bal = prevBalances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
    if (!bal) return sum;
    return sum + balanceValue(bal, rule) * rule.sign;
  }, 0);

  return {
    code: rule.code,
    name: rule.name,
    currentPeriod: Math.round(current),
    previousPeriod: Math.round(previous),
    isBold: rule.bold,
    children: rule.children?.map((c) => generateFinancialStatementLine(c, balances, prevBalances)),
  };
}

export function generateCashFlowStatementLine(
  rule: StatementMappingRule,
  balances: AccountBalance[],
  prevBalances: AccountBalance[],
  incomeStatementLines?: FinancialStatementLine[],
): FinancialStatementLine {
  if (rule.isFormula && rule.formula) {
    return {
      code: rule.code,
      name: rule.name,
      currentPeriod: 0,
      previousPeriod: 0,
      isBold: rule.bold,
    };
  }

  if (rule.balanceType === 'change') {
    let currentPeriod = 0;
    for (const acct of rule.accountNumbers ?? []) {
      const bal = balances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
      const prev = prevBalances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
      const curVal = bal ? bal.closingDebit - bal.closingCredit : 0;
      const prevVal = prev ? prev.closingDebit - prev.closingCredit : 0;
      currentPeriod += (curVal - prevVal) * rule.sign;
    }
    return {
      code: rule.code,
      name: rule.name,
      currentPeriod: Math.round(currentPeriod),
      previousPeriod: 0,
      isBold: rule.bold,
      children: rule.children?.map((c) => generateCashFlowStatementLine(c, balances, prevBalances, incomeStatementLines)),
    };
  }

  if (rule.balanceType === 'previousPeriod') {
    let currentPeriod = 0;
    for (const acct of rule.accountNumbers ?? []) {
      const prev = prevBalances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
      if (prev) {
        currentPeriod += (prev.closingDebit - prev.closingCredit) * rule.sign;
      }
    }
    return {
      code: rule.code,
      name: rule.name,
      currentPeriod: Math.round(currentPeriod),
      previousPeriod: 0,
      isBold: rule.bold,
    };
  }

  let currentPeriod = 0;
  for (const acct of rule.accountNumbers ?? []) {
    const bal = balances.find((b) => b.accountNumber === acct || b.accountNumber.startsWith(acct));
    if (bal) currentPeriod += (bal.closingDebit - bal.closingCredit) * rule.sign;
  }
  return {
    code: rule.code,
    name: rule.name,
    currentPeriod: Math.round(currentPeriod),
    previousPeriod: 0,
    isBold: rule.bold,
    children: rule.children?.map((c) => generateCashFlowStatementLine(c, balances, prevBalances, incomeStatementLines)),
  };
}

export function resolveFormulaLines(lines: FinancialStatementLine[], type?: FinancialStatementType): FinancialStatementLine[] {
  const map = new Map(lines.map((l) => [l.code, l]));

  const resolve = (code: string): number => {
    const line = map.get(code);
    if (!line) return 0;
    return line.currentPeriod;
  };

  const resolvePrev = (code: string): number => {
    const line = map.get(code);
    if (!line) return 0;
    return line.previousPeriod;
  };

  const rules = type === FinancialStatementType.B03_DN
    ? getB03LCTTMapping()
    : [...getB02KQHDMapping(), ...getB01TTSMapping()];

  for (const line of lines) {
    const rule = rules.find((r) => r.code === line.code);
    if (rule?.isFormula && rule.formula && line.currentPeriod === 0 && line.previousPeriod === 0) {
      const parts = rule.formula.split(/([+-])/);
      let current = 0;
      let prev = 0;
      let op = '+';
      for (const p of parts) {
        if (p === '+' || p === '-') { op = p; continue; }
        const val = resolve(p.trim());
        const valPrev = resolvePrev(p.trim());
        current = op === '+' ? current + val : current - val;
        prev = op === '+' ? prev + valPrev : prev - valPrev;
      }
      line.currentPeriod = current;
      line.previousPeriod = prev;
    }
    if (line.children) {
      line.children = resolveFormulaLines(line.children, type);
    }
  }
  return lines;
}

export function generateAllLines(
  type: FinancialStatementType,
  balances: AccountBalance[],
  prevBalances: AccountBalance[],
  companyName: string,
  periodLabel: string,
): FinancialStatement {
  let rules: StatementMappingRule[];
  let lineGenerator: (rule: StatementMappingRule) => FinancialStatementLine;
  if (type === FinancialStatementType.B03_DN) {
    rules = getB03LCTTMapping();
    lineGenerator = (r) => generateCashFlowStatementLine(r, balances, prevBalances);
  } else if (type === FinancialStatementType.B02_DN) {
    rules = getB02KQHDMapping();
    lineGenerator = (r) => generateFinancialStatementLine(r, balances, prevBalances);
  } else {
    rules = getB01TTSMapping();
    lineGenerator = (r) => generateFinancialStatementLine(r, balances, prevBalances);
  }

  const raw = rules.map(lineGenerator);
  const resolved = resolveFormulaLines(raw, type);

  return {
    type,
    companyId: balances[0]?.companyId ?? 0,
    companyName,
    periodLabel,
    currency: 'VND',
    lines: resolved,
    generatedAt: new Date().toISOString(),
  };
}
