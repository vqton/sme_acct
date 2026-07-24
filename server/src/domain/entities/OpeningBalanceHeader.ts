import { OpeningBalanceStatus, OpeningBalanceImportSource } from '../enums/OpeningBalanceEnums.js';

export interface OpeningBalanceHeader {
  id: number;
  companyId: number;
  periodId: number;
  batchNumber: string;
  entryDate: string;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  status: OpeningBalanceStatus;
  importSource: OpeningBalanceImportSource;
  sourceDbName?: string;
  sourceDbVersion?: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedByUserId?: number;
  createdByUserId: number;
  createdAt: Date;
  updatedAt?: Date;
  approvedByUserId?: number;
  approvedAt?: string;
  rejectionReason?: string;
}

export function createOBHeader(data: {
  companyId: number;
  periodId: number;
  entryDate: string;
  createdByUserId: number;
  totalDebit?: number;
  totalCredit?: number;
  description?: string;
  importSource?: OpeningBalanceImportSource;
  sourceDbName?: string;
  sourceDbVersion?: string;
}): OpeningBalanceHeader {
  return {
    id: 0,
    batchNumber: '',
    totalDebit: 0,
    totalCredit: 0,
    status: OpeningBalanceStatus.Draft,
    isLocked: false,
    createdAt: new Date(),
    ...data,
    importSource: data.importSource ?? OpeningBalanceImportSource.Manual,
  };
}

export function validateOBHeader(header: OpeningBalanceHeader): void {
  if (header.totalDebit < 0) throw new Error('Total debit cannot be negative');
  if (header.totalCredit < 0) throw new Error('Total credit cannot be negative');
}

export function lockOBHeader(header: OpeningBalanceHeader, userId: number): OpeningBalanceHeader {
  if (header.isLocked) throw new Error('Opening balance is already locked');
  if (header.status === OpeningBalanceStatus.PeriodClosed) throw new Error('Period is closed');
  return {
    ...header,
    isLocked: true,
    status: OpeningBalanceStatus.Locked,
    lockedAt: new Date().toISOString(),
    lockedByUserId: userId,
    updatedAt: new Date(),
  };
}

export function unlockOBHeader(header: OpeningBalanceHeader, userId: number): OpeningBalanceHeader {
  if (!header.isLocked) throw new Error('Opening balance is not locked');
  return {
    ...header,
    isLocked: false,
    status: OpeningBalanceStatus.Draft,
    lockedAt: undefined,
    lockedByUserId: undefined,
    updatedAt: new Date(),
  };
}

export function approveOBHeader(header: OpeningBalanceHeader, userId: number): OpeningBalanceHeader {
  if (header.status !== OpeningBalanceStatus.PendingApproval) throw new Error('Cannot approve: not pending approval');
  return {
    ...header,
    status: OpeningBalanceStatus.Approved,
    approvedByUserId: userId,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date(),
  };
}

export function rejectOBHeader(header: OpeningBalanceHeader, userId: number, reason: string): OpeningBalanceHeader {
  if (header.status !== OpeningBalanceStatus.PendingApproval) throw new Error('Cannot reject: not pending approval');
  return {
    ...header,
    status: OpeningBalanceStatus.Draft,
    rejectionReason: reason,
    updatedAt: new Date(),
  };
}

export function submitOBHeaderForApproval(header: OpeningBalanceHeader): OpeningBalanceHeader {
  if (header.isLocked) throw new Error('Cannot submit locked opening balance');
  if (header.status !== OpeningBalanceStatus.Draft) throw new Error('Only draft can be submitted');
  return {
    ...header,
    status: OpeningBalanceStatus.PendingApproval,
    updatedAt: new Date(),
  };
}
