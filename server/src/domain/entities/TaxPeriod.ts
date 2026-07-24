import { TaxPeriodStatus, VATMethod } from '../enums/TaxEnums.js';

export interface TaxPeriod {
  id: number;
  companyId: number;
  type: string;
  year: number;
  month?: number;
  quarter?: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: TaxPeriodStatus;
  vatMethod: VATMethod;
  citRate: number;
  isLockable: boolean;
  lockedAt?: string;
  lockedByUserId?: number;
  finalizedAt?: string;
  finalizedByUserId?: number;
  unlockReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaxPeriodInput {
  companyId: number;
  year: number;
  month?: number;
  quarter?: number;
  startDate: string;
  endDate: string;
  type: string;
  vatMethod: VATMethod;
  citRate?: number;
}

export function createTaxPeriod(data: TaxPeriodInput): TaxPeriod {
  const periodName = data.type === 'yearly'
    ? `Năm ${data.year}`
    : data.type === 'quarterly'
      ? `Quý ${data.quarter}/${data.year}`
      : `Tháng ${data.month}/${data.year}`;

  return {
    id: 0,
    status: TaxPeriodStatus.Open,
    citRate: data.citRate ?? 20,
    isLockable: false,
    createdAt: new Date(),
    ...data,
    periodName,
  };
}

export function openTaxPeriod(period: TaxPeriod): TaxPeriod {
  if (period.status === TaxPeriodStatus.Open) return period;
  return { ...period, status: TaxPeriodStatus.Open };
}

export function lockTaxPeriod(period: TaxPeriod, lockedByUserId?: number): TaxPeriod {
  if (period.status === TaxPeriodStatus.Locked) throw new Error('Period already locked');
  if (period.status === TaxPeriodStatus.Finalized) throw new Error('Period already finalized');
  return {
    ...period,
    status: TaxPeriodStatus.Locked,
    lockedAt: new Date().toISOString(),
    lockedByUserId,
    isLockable: true,
  };
}

export function finalizeTaxPeriod(period: TaxPeriod, finalizedByUserId: number): TaxPeriod {
  if (period.status === TaxPeriodStatus.Finalized) throw new Error('Period already finalized');
  if (period.status !== TaxPeriodStatus.Locked) throw new Error('Period must be locked before finalizing');
  return {
    ...period,
    status: TaxPeriodStatus.Finalized,
    finalizedAt: new Date().toISOString(),
    finalizedByUserId,
  };
}

export function unlockTaxPeriod(period: TaxPeriod, unlockedByUserId: number, reason: string): TaxPeriod {
  return {
    ...period,
    status: TaxPeriodStatus.Amended,
    unlockReason: reason,
    updatedAt: new Date(),
  };
}
