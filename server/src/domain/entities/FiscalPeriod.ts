import { FiscalPeriodStatus } from '../enums/AccountEnums.js';

export interface FiscalPeriod {
  id: string;
  companyId: string;
  year: number;
  month: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
  isOpeningBalancePeriod: boolean;
  closedAt?: string;
  closedByUserId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createFiscalPeriod(data: Partial<FiscalPeriod> & {
  companyId: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
}): FiscalPeriod {
  return {
    id: crypto.randomUUID(),
    periodName: `Tháng ${data.month}/${data.year}`,
    status: FiscalPeriodStatus.Open,
    isOpeningBalancePeriod: false,
    createdAt: new Date(),
    ...data,
  };
}

export function openPeriod(period: FiscalPeriod): FiscalPeriod {
  if (period.status === FiscalPeriodStatus.Open) return period;
  return { ...period, status: FiscalPeriodStatus.Open };
}

export function closePeriod(period: FiscalPeriod, closedByUserId: string): FiscalPeriod {
  if (period.status === FiscalPeriodStatus.Closed) throw new Error('Period already closed');
  if (period.status === FiscalPeriodStatus.Locked) throw new Error('Period is locked');
  return {
    ...period,
    status: FiscalPeriodStatus.Closed,
    closedAt: new Date().toISOString(),
    closedByUserId,
  };
}

export function lockPeriod(period: FiscalPeriod): FiscalPeriod {
  return { ...period, status: FiscalPeriodStatus.Locked };
}
