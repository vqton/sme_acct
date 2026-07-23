import type { LedgerRepository } from '../domain/repositories/LedgerRepository.js';
import type { AccountRepository } from '../domain/repositories/AccountRepository.js';

export interface RevaluationInput {
  accountId: number;
  currency: string;
  originalVndRate: number;
  currentVndRate: number;
}

export interface RevaluationLine {
  accountId: number;
  accountNumber: string;
  currency: string;
  debitBalance: number;
  creditBalance: number;
  fxGainLoss: number;
  isGain: boolean;
}

export interface RevaluationResult {
  periodId: number;
  companyId: number;
  lines: RevaluationLine[];
  totalGain: number;
  totalLoss: number;
}

export class FxRevaluationService {
  constructor(
    private readonly ledgerRepo: LedgerRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  previewRevaluation(
    companyId: number,
    periodId: number,
    currentRates: Record<string, number>,
    bookingRates?: Record<string, number>,
  ): RevaluationResult {
    const accounts = this.accountRepo.findByCompanyId(companyId)
      .filter((a) => a.currency && a.currency !== 'VND' && a.currency !== '');

    const balances = this.ledgerRepo.getAccountBalances(companyId, periodId);

    const lines: RevaluationLine[] = [];
    let totalGain = 0;
    let totalLoss = 0;

    for (const acct of accounts) {
      const bal = balances.find((b) => b.accountId === acct.id);
      if (!bal) continue;
      if (bal.closingDebit === 0 && bal.closingCredit === 0) continue;

      const currentRate = currentRates[acct.currency];
      if (!currentRate) continue;

      const bookingRate = bookingRates?.[acct.currency] ?? 1;
      const netVndBalance = bal.closingDebit - bal.closingCredit;
      const netForeignCurrency = netVndBalance / bookingRate;
      const revaluedVndBalance = Math.round(netForeignCurrency * currentRate);
      const fxGainLoss = revaluedVndBalance - netVndBalance;

      lines.push({
        accountId: acct.id,
        accountNumber: acct.accountNumber,
        currency: acct.currency,
        debitBalance: bal.closingDebit,
        creditBalance: bal.closingCredit,
        fxGainLoss: Math.abs(fxGainLoss),
        isGain: fxGainLoss > 0,
      });

      if (fxGainLoss > 0) {
        const naturalDebit = acct.nature === 1;
        if (naturalDebit) totalGain += fxGainLoss;
        else totalLoss += fxGainLoss;
      } else {
        const naturalDebit = acct.nature === 1;
        if (naturalDebit) totalLoss += Math.abs(fxGainLoss);
        else totalGain += Math.abs(fxGainLoss);
      }
    }

    return {
      periodId,
      companyId,
      lines,
      totalGain: Math.round(totalGain),
      totalLoss: Math.round(totalLoss),
    };
  }

  getForeignCurrencyAccounts(companyId: number): Array<{ id: number; accountNumber: string; name: string; currency: string }> {
    return this.accountRepo.findByCompanyId(companyId)
      .filter((a) => a.currency && a.currency !== 'VND' && a.currency !== '')
      .map((a) => ({ id: a.id, accountNumber: a.accountNumber, name: a.name, currency: a.currency }));
  }
}
