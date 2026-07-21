export interface CompanySettings {
  id: string;
  companyId: string;
  fiscalYearStartMonth: number;
  currencyCode: string;
  decimalPlaces: number;
  accountingRegime: number;
  taxCalculationMethod: number;
  roundingMethod: number;
}
