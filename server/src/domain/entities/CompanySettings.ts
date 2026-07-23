export interface CompanySettings {
  id: number;
  companyId: number;

  fiscalYearStartMonth: number;
  currencyCode: string;
  decimalPlaces: number;
  accountingRegime: number;
  taxCalculationMethod: number;
  roundingMethod: number;
  inventoryMethod?: number;

  enableMultiCurrency?: boolean;
  enableDepartmentManagement?: boolean;
  defaultExchangeRateSource?: number;
  lastPeriodClosed?: string;
}
