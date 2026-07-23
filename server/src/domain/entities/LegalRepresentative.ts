export interface LegalRepresentative {
  id: number;
  companyId: number;
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
  data: Omit<LegalRepresentative, 'id' | 'createdAt' | 'isActive'> & { id?: number; isActive?: boolean },
): LegalRepresentative {
  return {
    id: 0,
    isActive: true,
    createdAt: new Date(),
    ...data,
  };
}
