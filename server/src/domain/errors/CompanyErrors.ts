export const LEGALLY_SIGNIFICANT_FIELDS = [
  'taxCode',
  'enterpriseCode',
  'name',
  'nameVietnamese',
  'nameEnglish',
  'charterCapital',
  'legalRepresentatives',
] as const;

export type LegallySignificantField = typeof LEGALLY_SIGNIFICANT_FIELDS[number];

export const CORRECTION_REASON_CODES = {
  TYPING_ERROR: 'TYPING_ERROR',
  LEGAL_CHANGE: 'LEGAL_CHANGE',
  REGULATORY_UPDATE: 'REGULATORY_UPDATE',
  MERGER_ACQUISITION: 'MERGER_ACQUISITION',
  DATA_MIGRATION: 'DATA_MIGRATION',
  OTHER: 'OTHER',
} as const;

export type CorrectionReasonCode = keyof typeof CORRECTION_REASON_CODES;

export function isLegallySignificant(fieldName: string): boolean {
  return (LEGALLY_SIGNIFICANT_FIELDS as readonly string[]).includes(fieldName);
}

export class CorrectionRequiredError extends Error {
  constructor(fieldName: string) {
    super(`Correction reason required for legally significant field: ${fieldName}`);
    this.name = 'CorrectionRequiredError';
  }
}

export function assertCorrectionReason(fieldName: string, reasonCode?: string, reasonDetail?: string): void {
  if (isLegallySignificant(fieldName)) {
    if (!reasonCode) {
      throw new CorrectionRequiredError(fieldName);
    }
    if (!Object.values(CORRECTION_REASON_CODES).includes(reasonCode as any)) {
      throw new Error(`Invalid correction reason code: ${reasonCode}`);
    }
  }
}
