export interface ExchangeRate {
  id: number;
  companyId: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  rateType: ExchangeRateType;
  createdAt: Date;
}

export enum ExchangeRateType {
  Buy = 1,
  Sell = 2,
  Average = 3,
  Reference = 4,
}

export function createExchangeRate(data: Partial<ExchangeRate> & {
  companyId: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
}): ExchangeRate {
  return {
    id: 0,
    rateType: ExchangeRateType.Average,
    createdAt: new Date(),
    ...data,
  };
}
