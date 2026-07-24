import { ConversionType } from '../enums/OpeningBalanceEnums.js';

export interface OpeningBalanceConversionMapping {
  id: number;
  companyId: number;
  oldAccountNumber: string;
  newAccountNumber: string;
  conversionType: ConversionType;
  splitRatio?: number;
  oldAccountName?: string;
  newAccountName?: string;
  createdAt: Date;
}

export function createConversionMapping(data: {
  companyId: number;
  oldAccountNumber: string;
  newAccountNumber: string;
  conversionType: ConversionType;
  splitRatio?: number;
  oldAccountName?: string;
  newAccountName?: string;
}): OpeningBalanceConversionMapping {
  if (data.conversionType === ConversionType.Split && (data.splitRatio == null || data.splitRatio <= 0 || data.splitRatio > 1)) {
    throw new Error('Split conversion requires ratio between 0 and 1');
  }
  return {
    id: 0,
    createdAt: new Date(),
    ...data,
  };
}

export interface ConversionResult {
  oldAccountNumber: string;
  oldBalance: number;
  newAccountNumber: string;
  newBalance: number;
  conversionType: ConversionType;
  splitRatio?: number;
}

export function applyConversion(
  mapping: OpeningBalanceConversionMapping,
  oldBalance: number,
): ConversionResult {
  switch (mapping.conversionType) {
    case ConversionType.Direct:
      return {
        oldAccountNumber: mapping.oldAccountNumber,
        oldBalance,
        newAccountNumber: mapping.newAccountNumber,
        newBalance: oldBalance,
        conversionType: ConversionType.Direct,
      };
    case ConversionType.Split: {
      const ratio = mapping.splitRatio ?? 1;
      return {
        oldAccountNumber: mapping.oldAccountNumber,
        oldBalance,
        newAccountNumber: mapping.newAccountNumber,
        newBalance: Math.round(oldBalance * ratio * 100) / 100,
        conversionType: ConversionType.Split,
        splitRatio: ratio,
      };
    }
    case ConversionType.Merge:
      return {
        oldAccountNumber: mapping.oldAccountNumber,
        oldBalance,
        newAccountNumber: mapping.newAccountNumber,
        newBalance: oldBalance,
        conversionType: ConversionType.Merge,
      };
    case ConversionType.Manual:
      return {
        oldAccountNumber: mapping.oldAccountNumber,
        oldBalance,
        newAccountNumber: mapping.newAccountNumber,
        newBalance: 0,
        conversionType: ConversionType.Manual,
      };
  }
}
