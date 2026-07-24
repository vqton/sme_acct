export enum OpeningBalanceStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Locked = 3,
  PeriodClosed = 4,
}

export enum OpeningBalanceImportSource {
  Manual = 'manual',
  Excel = 'excel',
  CarryForward = 'carry_forward',
  TT99Conversion = 'tt99_conversion',
}

export enum ConversionType {
  Direct = 'direct',
  Split = 'split',
  Merge = 'merge',
  Manual = 'manual',
}

export enum OBAction {
  Created = 'created',
  Updated = 'updated',
  Locked = 'locked',
  Unlocked = 'unlocked',
  Approved = 'approved',
  Rejected = 'rejected',
  Imported = 'imported',
  Converted = 'converted',
}
