export interface LegalRepresentative {
  id: string;
  companyId: string;
  fullName: string;
  vneidNumber?: string;
  position: string;
  isPrimary: boolean;
  authorizationScope?: string;
  digitalCertSerial?: string;
  digitalCertProvider?: string;
  digitalCertExpiry?: string;
  vneidVerifiedAt?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export function createLegalRepresentative(
  data: Omit<LegalRepresentative, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean },
): LegalRepresentative {
  return {
    id: crypto.randomUUID(),
    isActive: true,
    createdAt: new Date(),
    ...data,
  };
}
