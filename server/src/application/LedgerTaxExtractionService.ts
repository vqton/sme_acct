import type { AccountRepository } from '../domain/repositories/AccountRepository.js';
import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { Account } from '../domain/entities/Account.js';
import { TaxType } from '../domain/enums/TaxEnums.js';

export interface VatExtractionResult {
  outputVat: number;
  inputVat: number;
  vatPayable: number;
}

export interface CitExtractionResult {
  revenue: number;
  expenses: number;
  netIncome: number;
}

export interface TaxExtractionResult {
  taxType: TaxType;
  vat?: VatExtractionResult;
  cit?: CitExtractionResult;
}

/**
 * VAT accounts per Vietnamese chart of accounts (TT99/TT133):
 * - 133: Input VAT (debit side = deductible)
 * - 3331: Output VAT (credit side = payable)
 *
 * CIT accounts:
 * - 511: Revenue (credit side)
 * - 632, 641, 642: Expenses (debit side)
 * - 821: CIT expense
 * - 3334: CIT payable
 */
const VAT_INPUT_PREFIXES = ['133'];
const VAT_OUTPUT_PREFIXES = ['3331'];
const REVENUE_PREFIXES = ['511', '515', '711'];
const EXPENSE_PREFIXES = ['632', '635', '641', '642', '811'];

export class LedgerTaxExtractionService {
  constructor(
    private accountRepo: AccountRepository,
    private ledgerRepo: LedgerRepository,
  ) {}

  findAccountsByPrefix(companyId: number, prefix: string): Account[] {
    const all = this.accountRepo.findByCompanyId(companyId);
    return all.filter(a => a.accountNumber.startsWith(prefix) && a.isActive);
  }

  extractVatForPeriod(companyId: number, periodId: number): VatExtractionResult {
    const balances = this.ledgerRepo.getAccountBalances(companyId, periodId);
    if (!balances) return { outputVat: 0, inputVat: 0, vatPayable: 0 };

    const inputVatAccounts = balances.filter(b =>
      VAT_INPUT_PREFIXES.some(p => b.accountNumber.startsWith(p))
    );
    const outputVatAccounts = balances.filter(b =>
      VAT_OUTPUT_PREFIXES.some(p => b.accountNumber.startsWith(p))
    );

    const inputVat = inputVatAccounts.reduce((s, b) => {
      // Input VAT lives on debit side (closingDebit = debit balance)
      return s + b.closingDebit;
    }, 0);

    const outputVat = outputVatAccounts.reduce((s, b) => {
      // Output VAT lives on credit side (closingCredit = credit balance)
      return s + b.closingCredit;
    }, 0);

    const net = outputVat - inputVat;
    return {
      outputVat,
      inputVat,
      vatPayable: Math.max(0, net),
    };
  }

  extractCitForPeriod(companyId: number, periodId: number): CitExtractionResult {
    const balances = this.ledgerRepo.getAccountBalances(companyId, periodId);
    if (!balances) return { revenue: 0, expenses: 0, netIncome: 0 };

    const revenue = balances
      .filter(b => REVENUE_PREFIXES.some(p => b.accountNumber.startsWith(p)))
      .reduce((s, b) => s + b.closingCredit, 0);

    const expenses = balances
      .filter(b => EXPENSE_PREFIXES.some(p => b.accountNumber.startsWith(p)))
      .reduce((s, b) => s + b.closingDebit, 0);

    return {
      revenue,
      expenses,
      netIncome: revenue - expenses,
    };
  }

  extractTaxData(companyId: number, periodId: number, taxType: TaxType): TaxExtractionResult {
    switch (taxType) {
      case TaxType.VAT:
        return { taxType, vat: this.extractVatForPeriod(companyId, periodId) };
      case TaxType.CIT:
        return { taxType, cit: this.extractCitForPeriod(companyId, periodId) };
      default:
        return { taxType };
    }
  }
}
